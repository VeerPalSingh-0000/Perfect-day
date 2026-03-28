import { create } from 'zustand';
import { Task } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: true,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
  toggleTaskCompletion: (id) => set((state) => {
    const now = Date.now();
    return {
      tasks: state.tasks.map(t => 
        t.id === id 
          ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? now : undefined } 
          : t
      )
    };
  }),
  setLoading: (isLoading) => set({ isLoading }),
}));
