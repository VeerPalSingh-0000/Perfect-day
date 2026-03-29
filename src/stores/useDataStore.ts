import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DayRecord, Task } from "@/types";
import {
  getHabitTasks,
  listenToTasksByDate,
  listenToDayRecords,
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
    const createdObj = new Date(
      createdDate.getFullYear(),
      createdDate.getMonth(),
      createdDate.getDate(),
    );
    const diffTime = Math.abs(dateObj.getTime() - createdObj.getTime());
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

  // Subscriptions
  unsubTasks: (() => void) | null;
  unsubRecords: (() => void) | null;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  setRecords: (records: DayRecord[]) => void;
  reset: () => void;

  // Listeners
  fetchAll: (
    userId: string,
    todayDateStr: string,
    email?: string | null,
  ) => Promise<void>;
  refreshTasks: (userId: string, todayDateStr: string) => Promise<void>;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      tasks: [],
      records: [],
      isDataLoaded: false,
      isRefreshing: false,
      unsubTasks: null,
      unsubRecords: null,

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

      reset: () => {
        const { unsubTasks, unsubRecords } = get();
        if (unsubTasks) unsubTasks();
        if (unsubRecords) unsubRecords();
        set({
          tasks: [],
          records: [],
          isDataLoaded: false,
          isRefreshing: false,
          unsubTasks: null,
          unsubRecords: null,
        });
      },

      // Now implemented via real-time listeners for instant offline-first rendering
      fetchAll: async (userId, todayDateStr, email) => {
        // Prevent double subscription
        if (get().unsubTasks) return;

        let tasksLoaded = false;
        let recordsLoaded = false;

        // Helper to unblock UI when both initial cache hits are done
        const checkLoaded = () => {
          if (tasksLoaded && recordsLoaded && !get().isDataLoaded) {
            set({ isDataLoaded: true });

            // Background: Seed habits only after initial cache load
            getHabitTasks(userId)
              .then((habits) => {
                const currentTasks = get().tasks;
                const existingTitles = new Set(
                  currentTasks.map((t) => `${t.title}__${t.category}`),
                );
                const newHabits = habits.filter(
                  (h) => !existingTitles.has(`${h.title}__${h.category}`) && isHabitValidForDate(h, todayDateStr),
                );
                if (newHabits.length > 0) {
                  import("@/lib/db").then(({ addTask: dbAddTask }) => {
                    const newTasks: Task[] = newHabits.map((habit, i) => ({
                      id:
                        Date.now().toString(36) +
                        Math.random().toString(36).substring(2) +
                        i,
                      userId,
                      title: habit.title,
                      category: habit.category,
                      isCompleted: false,
                      isHabit: true,
                      frequency: habit.frequency,
                      date: todayDateStr,
                      order: currentTasks.length + i,
                      createdAt: Date.now(),
                    }));
                    newTasks.forEach((t) => dbAddTask(t).catch(() => {}));
                  });
                }
              })
              .catch(() => {});
          }
        };

        // 1. Listen to tasks (returns instantly from local IndexedDB cache)
        const unsubTasks = listenToTasksByDate(
          userId,
          todayDateStr,
          (tasks) => {
            set({ tasks });
            tasksLoaded = true;
            checkLoaded();
          },
        );

        // 2. Listen to records (returns instantly from local IndexedDB cache)
        const unsubRecords = listenToDayRecords(userId, (records) => {
          set({ records });
          recordsLoaded = true;
          checkLoaded();
        });

        // Save unsubs in state
        set({ unsubTasks, unsubRecords });

        // If history is unexpectedly empty, attempt one-time recovery from tasks.
        setTimeout(() => {
          if (get().records.length === 0) {
            import("@/lib/db").then(
              ({ rebuildDayRecordsFromTasks, migrateUserDataByEmail }) => {
                migrateUserDataByEmail(userId, email)
                  .then(() => rebuildDayRecordsFromTasks(userId))
                  .catch(() => {});
              },
            );
          }
        }, 2500);

        // Safety fallback: If cache fails to trigger, unblock UI anyway
        setTimeout(() => {
          if (!get().isDataLoaded) set({ isDataLoaded: true });
        }, 1500);
      },

      refreshTasks: async () => {}, // Handled automatically by listeners now
    }),
    {
      name: "perfect-day-data-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        records: state.records,
      }),
    },
  ),
);
