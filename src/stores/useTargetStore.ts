import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LearningTarget, DayStep, TargetStatus } from "@/types";
import {
  saveTarget,
  removeTargetFromCloud,
  updateTargetInCloud,
  listenToTargets,
} from "@/lib/db";

interface TargetState {
  targets: LearningTarget[];
  activeTargetId: string | null;

  // Actions
  addTarget: (target: LearningTarget) => void;
  removeTarget: (targetId: string) => void;
  updateTarget: (targetId: string, updates: Partial<LearningTarget>) => void;
  toggleDayCompletion: (targetId: string, dayStep: DayStep) => void;
  setActiveTarget: (targetId: string | null) => void;
  addNote: (targetId: string, dayIndex: number, note: string) => void;

  // Real-time synchronization
  unsubTargets: (() => void) | null;
  initSync: (userId: string) => void;
}

// Helpers
export const getTargetAnalysis = (target: LearningTarget) => {
  if (!target) return null;
  const start = new Date(target.startDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Current calendar day (1-indexed based on dates, not capped)
  const currentDay = diffDays + 1;
  const daysElapsed = Math.min(currentDay, target.totalDays);

  const completedCount = target.completedDays.length;
  const targetCompletedCount = Math.min(daysElapsed, target.totalDays);
  const velocity = daysElapsed > 0 ? (completedCount / daysElapsed) * 100 : 0;

  const daysRemaining = Math.max(0, target.totalDays - completedCount);

  let projectedCompletion = new Date();
  if (velocity > 0) {
    const daysToFinish = daysRemaining / (velocity / 100);
    projectedCompletion = new Date(
      now.getTime() + daysToFinish * 24 * 60 * 60 * 1000,
    );
  }

  // Calculate Streak working backwards from today
  let streak = 0;
  for (let i = currentDay - 1; i >= 0; i--) {
    if (target.completedDays.includes(i)) {
      streak++;
    } else {
      break;
    }
  }

  return {
    currentDay,
    daysElapsed,
    velocity,
    daysRemaining,
    projectedCompletion,
    streak,
  };
};

export const useTargetStore = create<TargetState>()(
  persist(
    (set) => ({
      targets: [],
      activeTargetId: null,
      unsubTargets: null,

      initSync: (userId) => {
        if (!userId) return;

        console.log("🔄 Initializing target sync for user:", userId);
        const unsub = listenToTargets(userId, (cloudTargets) => {
          console.log("☁️ Received targets from cloud:", cloudTargets.length);
          // Ensure all targets have userId set (safety check)
          const targetsWithUserId = cloudTargets.map((t) => ({
            ...t,
            userId: userId,
          }));
          set({ targets: targetsWithUserId });
        });
        set({ unsubTargets: unsub });
      },

      addTarget: (target) => {
        // Ensure userId is always set before saving
        const targetWithUserId = { ...target };
        if (!targetWithUserId.userId) {
          console.warn(
            "⚠️ Target missing userId, cannot sync to cloud:",
            target,
          );
          return;
        }

        console.log(
          "💾 Saving target to cloud:",
          targetWithUserId.title,
          "for user:",
          targetWithUserId.userId,
        );
        saveTarget(targetWithUserId).catch((error) => {
          console.error("❌ Failed to save target:", error);
        });

        set((state) => ({
          targets: [...state.targets, targetWithUserId],
        }));
      },

      removeTarget: (targetId) => {
        set((state) => {
          const target = state.targets.find((t) => t.id === targetId);
          if (target && target.userId) {
            console.log("🗑️ Removing target from cloud:", targetId);
            removeTargetFromCloud(target.userId, targetId).catch((error) => {
              console.error("❌ Failed to remove target:", error);
            });
          } else {
            console.warn("⚠️ Cannot remove target - missing userId:", targetId);
          }
          return {
            targets: state.targets.filter((t) => t.id !== targetId),
            activeTargetId:
              state.activeTargetId === targetId ? null : state.activeTargetId,
          };
        });
      },

      updateTarget: (targetId, updates) => {
        set((state) => {
          const t = state.targets.find((t) => t.id === targetId);
          if (t && t.userId) {
            console.log("✏️ Updating target in cloud:", targetId, updates);
            updateTargetInCloud(t.userId, targetId, updates).catch((error) => {
              console.error("❌ Failed to update target:", error);
            });
          } else {
            console.warn("⚠️ Cannot update target - missing userId:", targetId);
          }
          return {
            targets: state.targets.map((t) =>
              t.id === targetId ? { ...t, ...updates } : t,
            ),
          };
        });
      },

      toggleDayCompletion: (targetId, dayStep) =>
        set((state) => {
          return {
            targets: state.targets.map((t) => {
              if (t.id !== targetId) return t;

              const isAlreadyCompleted = t.completedDays.includes(
                dayStep.day - 1,
              );
              let nextCompletedDays: number[];

              if (isAlreadyCompleted) {
                nextCompletedDays = t.completedDays.filter(
                  (d) => d !== dayStep.day - 1,
                );
              } else {
                nextCompletedDays = [...t.completedDays, dayStep.day - 1];
              }

              // Update the plan specifically
              const nextPlan = t.plan.map((step) => {
                if (step.day === dayStep.day) {
                  return {
                    ...step,
                    isCompleted: !step.isCompleted,
                    completedAt: !step.isCompleted ? Date.now() : undefined,
                  };
                }
                return step;
              });

              // Status check
              let nextStatus = t.status;
              if (nextCompletedDays.length === t.totalDays) {
                nextStatus = "completed";
              } else if (nextStatus === "completed") {
                nextStatus = "active"; // REVERT
              }

              // Analysis logic
              const start = new Date(t.startDate);
              start.setHours(0, 0, 0, 0);
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const diffTime = Math.abs(now.getTime() - start.getTime());
              const currentDayIndex = Math.floor(
                diffTime / (1000 * 60 * 60 * 24),
              );

              let currentStreak = 0;
              for (let i = currentDayIndex; i >= 0; i--) {
                if (nextCompletedDays.includes(i)) {
                  currentStreak++;
                } else if (i < currentDayIndex) {
                  // It's okay if today isn't done yet, but past missed breaks it if today is also not done yet or maybe just standard logic
                  break;
                }
              }

              const nextTarget = {
                ...t,
                completedDays: nextCompletedDays,
                plan: nextPlan,
                status: nextStatus,
                currentStreak: currentStreak,
                bestStreak: Math.max(t.bestStreak || 0, currentStreak),
              };

              saveTarget(nextTarget).catch(console.error);
              return nextTarget;
            }),
          };
        }),

      addNote: (targetId, dayIndex, note) =>
        set((state) => ({
          targets: state.targets.map((t) => {
            if (t.id !== targetId) return t;
            const nextPlan = [...t.plan];
            if (nextPlan[dayIndex]) {
              nextPlan[dayIndex] = { ...nextPlan[dayIndex], notes: note };
            }
            const nextTarget = { ...t, plan: nextPlan };
            saveTarget(nextTarget).catch(console.error);
            return nextTarget;
          }),
        })),

      setActiveTarget: (targetId) => set({ activeTargetId: targetId }),
    }),
    {
      name: "perfect-day-target-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
