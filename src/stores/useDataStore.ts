// src/stores/useDataStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DayRecord, Task } from "@/types";
import {
  addTask as dbAddTask,
  getHabitTasks,
  listenToTasksByDate,
  listenToDayRecords,
  migrateUserDataByEmail,
  rebuildDayRecordsFromTasks,
  listenToTrackItSessions,
  updateTask as dbUpdateTask,
  reorderTasks as dbReorderTasks,
} from "@/lib/db";

export const isHabitValidForDate = (habit: Task, dateStr: string) => {
  if (!habit.frequency || habit.frequency === "daily") return true;

  const [year, month, day] = dateStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  if (habit.frequency === "mon-sat") return dayOfWeek >= 1 && dayOfWeek <= 6;
  if (habit.frequency === "weekdays") return dayOfWeek >= 1 && dayOfWeek <= 5;
  if (habit.frequency === "weekends") return dayOfWeek === 0 || dayOfWeek === 6;
  if (habit.frequency === "alternate") {
    const createdDate = new Date(habit.createdAt || Date.now());
    const createdUTC = Date.UTC(
      createdDate.getFullYear(),
      createdDate.getMonth(),
      createdDate.getDate(),
    );
    const targetUTC = Date.UTC(year, month - 1, day);
    const diffTime = Math.abs(targetUTC - createdUTC);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays % 2 === 0;
  }

  return true;
};

interface DataState {
  // Data
  tasks: Task[];
  records: DayRecord[];

  // Loading
  isDataLoaded: boolean;
  isRefreshing: boolean;
  todayFocus: string; // 3D. Daily Intention
  currentDateStr: string | null;

  // Subscriptions
  unsubTasks: (() => void) | null;
  unsubRecords: (() => void) | null;
  unsubTracker: (() => void) | null;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  setRecords: (records: DayRecord[]) => void;
  setTodayFocus: (word: string) => void;
  reorderTasks: (tasks: Task[]) => void;
  reset: () => void;

  // Listeners
  fetchAll: (
    userId: string,
    todayDateStr: string,
    email?: string | null,
    forceResubscribe?: boolean,
  ) => Promise<void>;
  refreshTasks: (userId: string, todayDateStr: string) => Promise<void>;
  startTrackerSync: (userId: string, trackerUid: string) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      tasks: [],
      records: [],
      isDataLoaded: false,
      isRefreshing: false,
      todayFocus: "",
      currentDateStr: null,
      unsubTasks: null,
      unsubRecords: null,
      unsubTracker: null,

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

      deleteTask: (taskId) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) })),

      toggleTaskCompletion: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t,
          ),
        })),

      setRecords: (records) => set({ records }),

      setTodayFocus: (word) => set({ todayFocus: word }),

      reorderTasks: (reorderedTasks) => {
        set({ tasks: reorderedTasks });
        const userId = reorderedTasks[0]?.userId;
        if (userId) {
          const taskOrders = reorderedTasks.map((t, index) => ({
            id: t.id,
            order: index,
          }));
          dbReorderTasks(userId, taskOrders).catch((error) =>
            console.error("Failed to reorder tasks in db", error),
          );
        }
      },

      reset: () => {
        const { unsubTasks, unsubRecords, unsubTracker } = get();
        if (unsubTasks) unsubTasks();
        if (unsubRecords) unsubRecords();
        if (unsubTracker) unsubTracker();
        set({
          tasks: [],
          records: [],
          isDataLoaded: false,
          isRefreshing: false,
          currentDateStr: null,
          unsubTasks: null,
          unsubRecords: null,
          unsubTracker: null,
        });
      },

      // Now implemented via real-time listeners for instant offline-first rendering
      fetchAll: async (
        userId,
        todayDateStr,
        email,
        forceResubscribe = false,
      ) => {
        const { unsubTasks, unsubRecords, currentDateStr } = get();

        // Prevent double subscription for the same date
        if (unsubTasks && currentDateStr === todayDateStr && !forceResubscribe)
          return;

        // If date changed (or stale listeners exist), clean up and resubscribe.
        if (unsubTasks) unsubTasks();
        if (unsubRecords) unsubRecords();
        // unsubTracker is user-based, not date-based, but we'll reset it to be safe
        // if this is a force reload.
        if (forceResubscribe && get().unsubTracker) get().unsubTracker?.();

        set({
          isDataLoaded: false,
          unsubTasks: null,
          unsubRecords: null,
          currentDateStr: todayDateStr,
        });

        let tasksLoaded = false;
        let recordsLoaded = false;
        let migrationAttempted = false;

        // Helper to unblock UI when both initial cache hits are done
        const checkLoaded = () => {
          if (tasksLoaded && recordsLoaded && !get().isDataLoaded) {
            set({ isDataLoaded: true });

            // Run one-time recovery when initial snapshot confirms missing records.
            if (!migrationAttempted && get().records.length === 0) {
              migrationAttempted = true;
              migrateUserDataByEmail(userId, email)
                .then(() => rebuildDayRecordsFromTasks(userId))
                .catch(() => {});
            }

            // Background: Seed habits only after initial cache load
            getHabitTasks(userId)
              .then((habits) => {
                const currentTasks = get().tasks;
                const existingTitles = new Set(
                  currentTasks.map((t) => `${t.title}__${t.category}`),
                );
                const newHabits = habits.filter(
                  (h) =>
                    !h.isPaused &&
                    !existingTitles.has(`${h.title}__${h.category}`) &&
                    isHabitValidForDate(h, todayDateStr),
                );
                if (newHabits.length > 0) {
                  const newTasks: Task[] = newHabits.map((habit, i) => {
                    const task: Task = {
                      id:
                        Date.now().toString(36) +
                        Math.random().toString(36).substring(2) +
                        i,
                      userId,
                      title: habit.title,
                      category: habit.category,
                      isCompleted: false,
                      isHabit: true,
                      date: todayDateStr,
                      order: currentTasks.length + i,
                      createdAt: Date.now(),
                    };
                    if (habit.frequency) task.frequency = habit.frequency;
                    if (habit.priority) task.priority = habit.priority;
                    return task;
                  });
                  newTasks.forEach((t) => dbAddTask(t).catch(() => {}));
                }
              })
              .catch(() => {});
          }
        };

        // 1. Listen to tasks (returns instantly from local IndexedDB cache)
        const nextUnsubTasks = listenToTasksByDate(
          userId,
          todayDateStr,
          (tasks) => {
            // Filter inactive tasks and deduplicate
            const seenKeys = new Set<string>();
            const activeTasks = tasks.filter((t) => {
              // Only keep tasks that are not paused OR are completed
              const isActive = !t.isPaused || t.isCompleted;
              if (!isActive) return false;

              // Deduplicate by title+category for habits, by id for others
              const key = t.isHabit ? `${t.title}__${t.category}` : t.id;
              if (seenKeys.has(key)) return false;
              seenKeys.add(key);
              return true;
            });
            set({ tasks: activeTasks });
            tasksLoaded = true;
            checkLoaded();
          },
        );

        // 2. Listen to records (returns instantly from local IndexedDB cache)
        const nextUnsubRecords = listenToDayRecords(userId, (records) => {
          set({ records });
          recordsLoaded = true;
          checkLoaded();
        });

        // Save unsubs in state
        set({ unsubTasks: nextUnsubTasks, unsubRecords: nextUnsubRecords });

        // Safety fallback: If cache fails to trigger, unblock UI anyway
        setTimeout(() => {
          if (!get().isDataLoaded) set({ isDataLoaded: true });
        }, 1500);
      },

      refreshTasks: async () => {}, // Handled automatically by listeners now

      startTrackerSync: (userId, trackerUid) => {
        const { unsubTracker } = get();
        if (unsubTracker) unsubTracker();

        console.log("Starting TrackIT Sync for UID:", trackerUid);

        const nextUnsubTracker = listenToTrackItSessions(
          trackerUid,
          (session) => {
            const currentTasks = get().tasks;

            // Collect ALL IDs from the session (a session has projectId, topicId, subTopicId)
            const sessionIds = [
              session.projectId,
              session.topicId,
              session.subTopicId,
            ].filter(Boolean);

            // Find any SIRA task whose linkedTrackItIds overlaps with ANY session ID
            const matchingTasks = currentTasks.filter(
              (t) =>
                !t.isCompleted &&
                t.linkedTrackItIds?.some((id: string) =>
                  sessionIds.includes(id),
                ),
            );

            matchingTasks.forEach((task) => {
              const sessionDurationMinutes = (session.duration || 0) / 60000;
              const targetMinutes = task.targetTime || 0;

              console.log(
                `Checking Goal for "${task.title}": Focus was ${Math.round(sessionDurationMinutes)}m, Target is ${targetMinutes}m`,
              );

              // Only auto-complete if session meets or exceeds target (if a target is set)
              if (
                targetMinutes === 0 ||
                sessionDurationMinutes >= targetMinutes
              ) {
                console.log(
                  "Auto-completing SIRA Task:",
                  task.title,
                  "due to FocusFlow session",
                );
                get().toggleTaskCompletion(task.id);
                dbUpdateTask(userId, task.id, {
                  isCompleted: true,
                  completedAt: Date.now(),
                }).catch((e) => console.error("Auto-complete failed:", e));
              } else {
                console.log(
                  `Session too short for "${task.title}". Required ${targetMinutes}m, got ${Math.round(sessionDurationMinutes)}m.`,
                );
              }
            });
          },
        );

        set({ unsubTracker: nextUnsubTracker });
      },
    }),
    {
      name: "perfect-day-data-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        todayFocus: state.todayFocus,
      }),
    },
  ),
);
