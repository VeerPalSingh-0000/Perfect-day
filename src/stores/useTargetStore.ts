import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LearningTarget, DayStep } from "@/types";

interface TargetState {
  targets: LearningTarget[];
  activeTargetId: string | null;

  // Actions
  addTarget: (target: LearningTarget) => void;
  removeTarget: (targetId: string) => void;
  toggleDayCompletion: (targetId: string, dayStep: DayStep) => void;
  setActiveTarget: (targetId: string | null) => void;
}

export const useTargetStore = create<TargetState>()(
  persist(
    (set) => ({
      targets: [],
      activeTargetId: null,

      addTarget: (target) =>
        set((state) => ({
          targets: [...state.targets, target],
        })),

      removeTarget: (targetId) =>
        set((state) => ({
          targets: state.targets.filter((t) => t.id !== targetId),
          activeTargetId: state.activeTargetId === targetId ? null : state.activeTargetId,
        })),

      toggleDayCompletion: (targetId, dayStep) =>
        set((state) => ({
          targets: state.targets.map((t) => {
            if (t.id !== targetId) return t;

            const isAlreadyCompleted = t.completedDays.includes(dayStep.day - 1);
            let nextCompletedDays: number[];

            if (isAlreadyCompleted) {
              nextCompletedDays = t.completedDays.filter((d) => d !== dayStep.day - 1);
            } else {
              nextCompletedDays = [...t.completedDays, dayStep.day - 1];
            }

            return {
              ...t,
              completedDays: nextCompletedDays,
              plan: t.plan.map((step) =>
                step.day === dayStep.day ? { ...step, isCompleted: !step.isCompleted } : step
              ),
            };
          }),
        })),

      setActiveTarget: (targetId) => set({ activeTargetId: targetId }),
    }),
    {
      name: "perfect-day-target-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
