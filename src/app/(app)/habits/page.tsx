"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { getHabitTasks, updateTask } from "@/lib/db";
import { Task } from "@/types";
import { AddTaskModal } from "@/components/ui/AddTaskModal";
import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";
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
    if (!confirm(`Are you sure you want to stop the habit: ${habit.title}? It will no longer repeat.`)) return;

    setDeletingHabitId(habit.id);
    try {
      const q = query(
        collection(db, "users", user.uid, "tasks"),
        where("title", "==", habit.title),
        where("category", "==", habit.category),
        where("isHabit", "==", true)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach((docSnap) => {
        batch.update(docSnap.ref, { isHabit: false });
      });
      await batch.commit();

      setHabits((prev) => prev.filter((h) => h.id !== habit.id));
    } catch (error) {
      console.error("Failed to delete habit:", error);
    } finally {
      setDeletingHabitId(null);
    }
  };

  const handleEditSubmit = async (taskData: Partial<Task> & { id?: string }) => {
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

      await updateTask(user.uid, taskData.id, updates);
      await loadHabits();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black pb-20 md:pb-0">
      <TopAppBar variant="title" title="Habit Manager" />

      <main className="flex-1 space-y-6 px-4 sm:px-6 pt-20 sm:pt-24 max-w-2xl mx-auto w-full">
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
              <div key={i} className="h-16 w-full bg-[#111111] rounded-xl border border-white/5" />
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
              Create a repeating habit from your Focus page, and it will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-6">
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
                  </div>
                </div>

                <div className="flex items-center">
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
