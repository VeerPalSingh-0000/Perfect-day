import { create } from "zustand";
import { DayRecord, Task } from "@/types";
import { getTasksByDate, getDayRecords, getHabitTasks } from "@/lib/db";

interface DataState {
  // Data
  tasks: Task[];
  records: DayRecord[];
  
  // Loading
  isDataLoaded: boolean;
  isRefreshing: boolean;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  setRecords: (records: DayRecord[]) => void;
  
  // Fetch all data once
  fetchAll: (userId: string, todayDateStr: string) => Promise<void>;
  refreshTasks: (userId: string, todayDateStr: string) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  tasks: [],
  records: [],
  isDataLoaded: false,
  isRefreshing: false,

  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  deleteTask: (taskId) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) })),
  
  toggleTaskCompletion: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    })),

  setRecords: (records) => set({ records }),

  // Fetch ALL data in one go — called once from app layout
  fetchAll: async (userId, todayDateStr) => {
    if (get().isDataLoaded) return; // Already loaded, skip
    
    // Safety fallback: if Firebase is slow, unblock the UI after 800ms
    // so the user never gets an infinite loading screen.
    const fallbackTimer = setTimeout(() => {
      if (!get().isDataLoaded) set({ isDataLoaded: true });
    }, 800);

    try {
      const [tasks, records] = await Promise.all([
        getTasksByDate(userId, todayDateStr),
        getDayRecords(userId, 365),
      ]);

      clearTimeout(fallbackTimer);

      // Seed habits in background (don't block)
      getHabitTasks(userId).then((habits) => {
        const existingTitles = new Set(tasks.map((t) => `${t.title}__${t.category}`));
        const newHabits = habits.filter(
          (h) => !existingTitles.has(`${h.title}__${h.category}`)
        );
        if (newHabits.length > 0) {
          // Import addTask dynamically to avoid circular deps
          import("@/lib/db").then(({ addTask: dbAddTask }) => {
            const newTasks: Task[] = newHabits.map((habit, i) => ({
              id: Date.now().toString(36) + Math.random().toString(36).substring(2) + i,
              userId,
              title: habit.title,
              category: habit.category,
              isCompleted: false,
              isHabit: true,
              date: todayDateStr,
              order: tasks.length + i,
              createdAt: Date.now(),
            }));
            
            newTasks.forEach((t) => dbAddTask(t).catch(() => {}));
            set((state) => ({ tasks: [...state.tasks, ...newTasks] }));
          });
        }
      }).catch(() => {});

      set({
        tasks,
        records: records.sort((a, b) => b.date.localeCompare(a.date)),
        isDataLoaded: true,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      clearTimeout(fallbackTimer);
      set({ isDataLoaded: true }); // Don't block the UI
    }
  },

  // Lightweight refresh for just today's tasks
  refreshTasks: async (userId, todayDateStr) => {
    set({ isRefreshing: true });
    try {
      const tasks = await getTasksByDate(userId, todayDateStr);
      set({ tasks, isRefreshing: false });
    } catch {
      set({ isRefreshing: false });
    }
  },
}));
