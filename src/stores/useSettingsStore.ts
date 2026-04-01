import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PriorityMode = 'basic' | 'advanced';

interface SettingsState {
  priorityMode: PriorityMode;
  setPriorityMode: (mode: PriorityMode) => void;
  togglePriorityMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      priorityMode: 'basic',
      setPriorityMode: (mode) => set({ priorityMode: mode }),
      togglePriorityMode: () => set((state) => ({ priorityMode: state.priorityMode === 'basic' ? 'advanced' : 'basic' })),
    }),
    {
      name: "perfect-day-settings-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
