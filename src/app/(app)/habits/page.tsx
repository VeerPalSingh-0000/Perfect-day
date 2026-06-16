"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDataStore } from "@/stores/useDataStore";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { getHabitTasks, updateTask } from "@/lib/db";
import { Task } from "@/types";
import { AddTaskModal } from "@/components/ui/AddTaskModal";

import {
  collection,
  query,
  where,
  getDocs,
  getDocsFromServer,
  writeBatch,
  deleteField,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HabitsPage() {
  const user = useAuthStore((s) => s.user);
  const [habits, setHabits] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingHabit, setEditingHabit] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadHabits();
    }
  }, [user]);

  const loadHabits = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const allHabits = await getHabitTasks(user.uid);
      setHabits(allHabits);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHabit = async (habit: Task) => {
    if (!user) return;
    if (
      !confirm(
        `Are you sure you want to stop the habit: ${habit.title}? It will no longer repeat.`,
      )
    )
      return;

    setDeletingHabitId(habit.id);
    try {
      const q = query(
        collection(db, "users", user.uid, "tasks"),
        where("title", "==", habit.title),
        where("category", "==", habit.category),
        where("isHabit", "==", true),
      );
      const snap = await getDocs(q);
      const batches = [];
      let currentBatch = writeBatch(db);
      let opCount = 0;

      snap.forEach((docSnap) => {
        const taskData = docSnap.data();
        if (!taskData.isCompleted) {
          currentBatch.delete(docSnap.ref);
        } else {
          currentBatch.update(docSnap.ref, { isHabit: false });
        }

        opCount++;
        if (opCount === 500) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          opCount = 0;
        }
      });

      if (opCount > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);

      setHabits((prev) => prev.filter((h) => h.id !== habit.id));
    } catch (error) {
      console.error("Failed to delete habit:", error);
    } finally {
      setDeletingHabitId(null);
    }
  };

  const handleTogglePause = async (habit: Task) => {
    if (!user) return;
    const newPausedState = !habit.isPaused;

    // Optimistically update local state
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id ? { ...h, isPaused: newPausedState } : h,
      ),
    );

    try {
      const q = query(
        collection(db, "users", user.uid, "tasks"),
        where("title", "==", habit.title),
        where("category", "==", habit.category),
        where("isHabit", "==", true),
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach((docSnap) => {
        batch.update(docSnap.ref, { isPaused: newPausedState });
      });
      await batch.commit();

      // Refresh the today page to immediately reflect the pause state change
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      await useDataStore.getState().fetchAll(user.uid, dateStr, null, true);
    } catch (error) {
      console.error("Failed to toggle habit pause state:", error);
      // Revert optimistic update on failure
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habit.id ? { ...h, isPaused: habit.isPaused } : h,
        ),
      );
    }
  };

  const handleEditSubmit = async (
    taskData: Partial<Task> & { id?: string },
  ) => {
    if (!user || !taskData.id || !editingHabit) return;

    if (!taskData.isHabit) {
      await handleDeleteHabit(editingHabit);
      setIsModalOpen(false);
      return;
    }

    try {
      const updates: any = {
        title: taskData.title,
        category: taskData.category,
        isHabit: true,
        frequency: taskData.frequency,
      };

      if (taskData.priority !== undefined) {
        updates.priority = taskData.priority;
      }

      if ("targetTime" in taskData) {
        if (taskData.targetTime) {
          updates.targetTime = taskData.targetTime;
        } else {
          updates.targetTime = deleteField();
        }
      }

      if ("linkedTrackItIds" in taskData) {
        if (taskData.linkedTrackItIds && taskData.linkedTrackItIds.length > 0) {
          updates.linkedTrackItIds = taskData.linkedTrackItIds;
        } else {
          updates.linkedTrackItIds = deleteField();
        }
      }

      const q = query(
        collection(db, "users", user.uid, "tasks"),
        where("title", "==", editingHabit.title),
        where("category", "==", editingHabit.category),
        where("isHabit", "==", true),
      );

      // Use server-first fetch to ensure we find ALL habit instances,
      // not just what's in the local cache for today's date.
      let snap;
      try {
        snap = await getDocsFromServer(q);
      } catch {
        snap = await getDocs(q);
      }
      const batches = [];
      let currentBatch = writeBatch(db);
      let opCount = 0;

      snap.forEach((docSnap) => {
        currentBatch.update(docSnap.ref, updates);
        opCount++;
        if (opCount === 500) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          opCount = 0;
        }
      });

      if (opCount > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);

      console.log(
        `[Habit Edit] Updated ${snap.size} instances of "${taskData.title}" with:`,
        { targetTime: updates.targetTime, linkedTrackItIds: updates.linkedTrackItIds },
      );

      await loadHabits();
      // Assuming today's date is needed for fetching. Since habits page doesn't directly
      // have `todayDateStr` like the today page, we'll construct it in the client timezone.
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      await useDataStore.getState().fetchAll(user.uid, dateStr, null, true);
      setIsModalOpen(false);
    } catch (e) {
      console.error("Failed to update habit:", e);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black pb-20 md:pb-0">
      <TopAppBar variant="title" title="Habit Manager" />

      <main className="flex-1 space-y-6 px-4 sm:px-6 pt-20 sm:pt-24 max-w-2xl md:max-w-6xl mx-auto w-full">
        <div className="flex flex-col gap-2">
          <h2 className="font-headline text-2xl sm:text-3xl font-black tracking-tighter text-[#E2E2E2] uppercase">
            All Habits
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#464555]">
            View and completely manage all your repeating habits.
          </p>
        </div>

        {loading ? (
          <div className="animate-pulse flex flex-col gap-4 mt-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 w-full bg-[#111111] rounded-xl border border-white/5"
              />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0A0A0A] p-8 text-center drop-shadow-xl">
            <span className="material-symbols-outlined mb-4 text-4xl text-[#464555]">
              event_busy
            </span>
            <p className="mb-2 font-headline font-bold uppercase tracking-widest text-[#E2E2E2]">
              No Active Habits
            </p>
            <p className="text-xs text-[#464555]">
              Create a repeating habit from your Focus page, and it will appear
              here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="group flex items-center gap-3 sm:gap-4 rounded-xl border border-white/5 bg-[#0A0A0A] p-4 text-left transition-all hover:bg-white/5 hover:border-white/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4F44E2]/10 text-[#4F44E2]">
                  <span className="material-symbols-outlined text-xl">
                    event_repeat
                  </span>
                </div>
                <div className="grow min-w-0">
                  <p className="font-medium text-sm text-[#E2E2E2] truncate">
                    {habit.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#464555]">
                      {habit.frequency || "daily"}
                    </span>
                    <span className="h-1 w-1 shrink-0 rounded-full bg-[#464555]/50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#464555]">
                      {habit.category}
                    </span>
                    {habit.isPaused && (
                      <>
                        <span className="h-1 w-1 shrink-0 rounded-full bg-[#464555]/50" />
                        <span className="rounded border border-[#464555]/20 bg-black px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-orange-400">
                          Paused
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => handleTogglePause(habit)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${!habit.isPaused ? "bg-[#4F44E2]" : "bg-[#464555]/50"}`}
                    role="switch"
                    aria-checked={!habit.isPaused}
                    aria-label={`Toggle pause state for ${habit.title}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${!habit.isPaused ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </button>
                  <div className="w-px h-6 bg-white/5 mx-1" />
                  <button
                    onClick={() => {
                      setEditingHabit(habit);
                      setIsModalOpen(true);
                    }}
                    className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg text-[#464555] hover:text-[#4F44E2] hover:bg-[#4F44E2]/10 active:scale-95 shrink-0"
                    aria-label={`Edit habit: ${habit.title}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      edit
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteHabit(habit)}
                    disabled={deletingHabitId === habit.id}
                    className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg text-[#464555] hover:text-red-400 hover:bg-red-400/10 active:scale-95 shrink-0"
                    aria-label={`Delete habit: ${habit.title}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        onSubmit={handleEditSubmit}
        initialData={editingHabit}
      />
      <BottomNav />
    </div>
  );
}
