"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDataStore, isHabitValidForDate } from "@/stores/useDataStore";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";

import { AddTaskModal } from "@/components/ui/AddTaskModal";
import {
  addTask as dbAddTask,
  updateTask,
  deleteTask as dbDeleteTask,
  saveDayRecord,
} from "@/lib/db";
import { deleteField } from "firebase/firestore";
import { Task, DayRecord } from "@/types";
import {
  calculateDayRating,
  getRatingDetails,
  getTimeBasedGreeting,
  getTodayDateString,
} from "@/lib/utils";

export default function TodayPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.displayName?.split(" ")[0] || "User";

  const tasks = useDataStore((s) => s.tasks);
  const records = useDataStore((s) => s.records);
  const { addTask, deleteTask, toggleTaskCompletion } = useDataStore.getState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    taskId: string;
    taskTitle: string;
  } | null>(null);

  const todayDateStr = getTodayDateString();
  const todayDisplay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const greeting = getTimeBasedGreeting();

  // Derived state
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const totalTasks = tasks.length;
  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const rating = calculateDayRating(
    totalTasks === 0 ? 0 : completionPercentage,
  );
  const ratingInfo = getRatingDetails(totalTasks === 0 ? "none" : rating);

  // Streak calculation from records (already in memory)
  let streak = 0;
  let perfectDays = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(today);
  checkDate.setDate(checkDate.getDate() - 1);

  records.forEach((r) => {
    if (r.completionPercentage === 100) perfectDays++;
  });

  let checking = true;
  while (checking) {
    const dateStr = checkDate.toLocaleDateString("en-CA");
    const record = records.find((r) => r.date === dateStr);
    if (record && record.completionPercentage >= 80) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checking = false;
    }
  }

  const displayStreak = completionPercentage >= 80 ? streak + 1 : streak;
  const displayPerfectDays =
    completionPercentage === 100 ? perfectDays + 1 : perfectDays;

  // Debounced auto-save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!user || totalTasks === 0) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const record: DayRecord = {
        id: `${user.uid}_${todayDateStr}`,
        userId: user.uid,
        date: todayDateStr,
        totalTasks,
        completedTasks,
        completionPercentage,
        rating: calculateDayRating(completionPercentage),
        tasks,
        createdAt: Date.now(),
      };
      saveDayRecord(record).catch((error) => {
        console.error("Failed to save day record:", error);
      });
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    tasks,
    user,
    todayDateStr,
    totalTasks,
    completedTasks,
    completionPercentage,
  ]);

  const handleSubmitTask = async (taskData: Partial<Task> & { id?: string }) => {
    if (!user) return;
    
    if (taskData.id) {
      // Edit mode
      const updates: any = {
        title: taskData.title,
        category: taskData.category,
        isHabit: taskData.isHabit,
      };

      if (taskData.isHabit && taskData.frequency) {
        updates.frequency = taskData.frequency;
      } else {
        updates.frequency = deleteField();
      }

      const originalTask = tasks.find((t) => t.id === taskData.id);
      let newDateStr = todayDateStr;

      if (updates.isHabit && originalTask) {
        const mergedTask = { ...originalTask, ...updates } as Task;
        // Check if the modified habit is not valid for today
        if (!isHabitValidForDate(mergedTask, todayDateStr)) {
          let diff = 1;
          while (diff <= 14) {
            const checkDate = new Date();
            checkDate.setDate(checkDate.getDate() + diff);
            const candidateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;

            if (isHabitValidForDate(mergedTask, candidateStr)) {
              newDateStr = candidateStr;
              break;
            }
            diff++;
          }
        }
      }

      if (newDateStr !== todayDateStr) {
        updates.date = newDateStr;
        useDataStore.setState((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskData.id),
        }));
      } else {
        useDataStore.setState((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskData.id ? { ...t, ...updates } : t)),
        }));
      }

      try {
        await updateTask(user.uid, taskData.id, updates);
      } catch (error) {
        console.error("Failed to edit task:", error);
      }
    } else {
      // Add mode
      const newTask: Task = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        userId: user.uid,
        title: taskData.title || "",
        category: taskData.category || "work",
        isCompleted: false,
        isHabit: taskData.isHabit || false,
        date: todayDateStr,
        order: tasks.length,
        createdAt: Date.now(),
      };

      if (taskData.isHabit && taskData.frequency) {
        newTask.frequency = taskData.frequency;
      }
      
      let newDateStr = todayDateStr;
      if (newTask.isHabit) {
        if (!isHabitValidForDate(newTask, todayDateStr)) {
          let diff = 1;
          while (diff <= 14) {
            const checkDate = new Date();
            checkDate.setDate(checkDate.getDate() + diff);
            const candidateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;

            if (isHabitValidForDate(newTask, candidateStr)) {
              newDateStr = candidateStr;
              break;
            }
            diff++;
          }
        }
      }
      
      if (newDateStr !== todayDateStr) {
         newTask.date = newDateStr;
      } else {
         addTask(newTask);
      }

      dbAddTask(newTask).catch((error) => {
        console.error("Failed to add task:", error);
        if (newDateStr === todayDateStr) deleteTask(newTask.id);
      });
    }
  };

  const handleToggleTask = async (task: Task) => {
    if (!user) return;
    const newCompletedState = !task.isCompleted;
    toggleTaskCompletion(task.id);

    try {
      const updates: any = { isCompleted: newCompletedState };
      if (newCompletedState) {
        updates.completedAt = Date.now();
      }

      await updateTask(user.uid, task.id, updates);
    } catch (error) {
      console.error("Failed to update task:", error);
      toggleTaskCompletion(task.id);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!user) return;
    setDeletingTaskId(task.id);
    deleteTask(task.id);

    try {
      await dbDeleteTask(user.uid, task.id);
    } catch (error) {
      console.error("Failed to delete task:", error);
      addTask(task);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;
    handleDeleteTask({
      id: deleteConfirmation.taskId,
    } as Task);
    setDeleteConfirmation(null);
  };

  return (
    <div className="min-h-screen bg-black text-[#E2E2E2]">
      <TopAppBar variant="brand" />

      <main className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-8 md:space-y-10 px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-4">
        <section>
          <h1 className="mb-1 font-headline text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#E2E2E2]">
            {greeting}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm md:text-base font-medium uppercase tracking-wide text-[#464555]">
            {todayDisplay}
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Day Status Card */}
          <div className="flex flex-col md:flex-row md:col-span-2 items-center justify-between rounded-lg md:rounded-xl border border-[rgba(70,69,85,0.15)] bg-[#0A0A0A] p-4 sm:p-6 md:p-8 gap-4 shadow-[#000000] shadow-[0_10px_30px]">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <span className="mb-2 text-2xl sm:text-3xl">
                {ratingInfo.emoji}
              </span>
              <h2 className="font-headline text-lg sm:text-xl md:text-2xl font-bold text-[#E2E2E2]">
                {ratingInfo.label}
              </h2>
              <p className="text-xs sm:text-sm md:text-base font-medium text-[#464555]">
                {totalTasks === 0
                  ? "No tasks scheduled for today"
                  : `${completedTasks} of ${totalTasks} tasks completed`}
              </p>
            </div>
            <div className="relative flex items-center justify-center shrink-0">
              <svg
                className="h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 -rotate-90"
                viewBox="0 0 96 96"
              >
                <circle
                  className="text-[#141414]"
                  cx="48"
                  cy="48"
                  r="42"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <circle
                  className={`transition-all duration-1000 ${completionPercentage === 100 ? "text-[#FFFFFF]" : "text-[#C4C0FF]"}`}
                  cx="48"
                  cy="48"
                  r="42"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray="263.89"
                  strokeDashoffset={
                    263.89 - (completionPercentage / 100) * 263.89
                  }
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`absolute font-headline text-sm sm:text-base md:text-lg font-bold ${completionPercentage === 100 ? "text-white text-glow" : "text-[#E2E2E2]"}`}
              >
                {completionPercentage}%
              </span>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-3 sm:gap-4 rounded-lg border border-[rgba(70,69,85,0.15)] bg-linear-to-r from-[#0A0A0A] to-[#111111] p-4 sm:p-5">
            <div
              className={`flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-full border border-[#4F44E2]/20 shrink-0 ${displayStreak > 0 ? "bg-[#4F44E2]/10" : "bg-[#1A1A1A]"}`}
            >
              <span
                className={`material-symbols-outlined text-lg sm:text-xl ${displayStreak > 0 ? "text-[#C4C0FF]" : "text-[#464555]"}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={`font-headline text-2xl sm:text-3xl font-bold tracking-tighter ${displayStreak > 0 ? "text-[#E2E2E2]" : "text-[#464555]"}`}
              >
                {displayStreak}
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#464555]">
                Day Streak
              </span>
            </div>
          </div>

          {/* Perfect Days */}
          <div className="flex items-center gap-3 sm:gap-4 rounded-lg border border-[rgba(70,69,85,0.15)] bg-linear-to-r from-[#0A0A0A] to-[#111111] p-4 sm:p-5">
            <div
              className={`flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-full border border-[#7cf6ec]/20 shrink-0 ${displayPerfectDays > 0 ? "bg-[#7cf6ec]/10" : "bg-[#1A1A1A]"}`}
            >
              <span
                className={`material-symbols-outlined text-lg sm:text-xl ${displayPerfectDays > 0 ? "text-[#7cf6ec]" : "text-[#464555]"}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={`font-headline text-2xl sm:text-3xl font-bold tracking-tighter ${displayPerfectDays > 0 ? "text-[#E2E2E2]" : "text-[#464555]"}`}
              >
                {displayPerfectDays}
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#464555]">
                Perfect Days
              </span>
            </div>
          </div>
        </section>

        {/* Tasks */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
            <h3 className="font-headline text-lg sm:text-xl font-bold text-[#E2E2E2]">
              Tasks
            </h3>
            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#E2E2E2] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-black transition-all hover:opacity-90 active:scale-95"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">
                add
              </span>
              <span>New Task</span>
            </button>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-[rgba(70,69,85,0.15)] bg-[#0A0A0A] text-center">
                <span className="material-symbols-outlined text-4xl text-[#464555] mb-2">
                  fact_check
                </span>
                <p className="text-sm font-medium text-[#8E8D99]">
                  Your day is a blank canvas.
                </p>
                <p className="text-xs text-[#464555] mt-1">
                  Add tasks above to start planning.
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`group w-full flex items-center gap-3 sm:gap-4 rounded-lg border border-[rgba(70,69,85,0.15)] bg-[#0A0A0A] p-3 sm:p-4 text-left transition-all hover:bg-[#111111] ${task.isCompleted ? "opacity-50" : ""}`}
                >
                  <button
                    onClick={() => handleToggleTask(task)}
                    className={`flex h-5 sm:h-6 w-5 sm:w-6 items-center justify-center rounded-full border shrink-0 transition-colors ${task.isCompleted ? "border-[#C4C0FF]/30 bg-[#C4C0FF]/20" : "border-[#464555]/30 bg-transparent hover:border-[#C4C0FF]/50"}`}
                  >
                    {task.isCompleted ? (
                      <span className="material-symbols-outlined text-sm font-bold text-[#C4C0FF]">
                        done
                      </span>
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-[#464555]/50 shrink-0" />
                    )}
                  </button>
                  <div
                    className="grow min-w-0 cursor-pointer"
                    onClick={() => handleToggleTask(task)}
                  >
                    <p
                      className={`font-medium text-sm transition-all ${task.isCompleted ? "text-[#E2E2E2] line-through decoration-[#464555]/40" : "text-[#E2E2E2]"}`}
                    >
                      {task.title}
                    </p>
                  </div>
                  {task.isHabit && (
                    <span className="rounded border border-[#4F44E2]/20 bg-[#4F44E2]/10 px-1.5 py-0.5 text-[7px] sm:text-[9px] font-bold uppercase tracking-widest text-[#C4C0FF] shrink-0">
                      Habit
                    </span>
                  )}
                  <span className="rounded border border-[#464555]/20 bg-black px-2 py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#464555] shrink-0">
                    {task.category}
                  </span>

                  <button
                    onClick={() =>
                      setDeleteConfirmation({
                        taskId: task.id,
                        taskTitle: task.title,
                      })
                    }
                    disabled={deletingTaskId === task.id}
                    className="opacity-20 active:opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all p-1 sm:p-1.5 rounded-lg text-[#464555] hover:text-red-400 hover:bg-red-400/10 active:scale-95 shrink-0"
                    aria-label={`Delete task: ${task.title}`}
                  >
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                      delete
                    </span>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="mx-4 rounded-lg border border-[rgba(70,69,85,0.15)] bg-[#0A0A0A] p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <h2 className="font-headline text-lg sm:text-xl font-bold text-[#E2E2E2] mb-2">
              Delete Task?
            </h2>
            <p className="text-sm text-[#8E8D99] mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#C4C0FF]">
                "{deleteConfirmation.taskTitle}"
              </span>
              ?
            </p>
            <p className="text-xs text-[#464555] mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 rounded-lg border border-[rgba(70,69,85,0.15)] bg-[#111111] px-4 py-2 sm:py-2.5 text-sm font-semibold text-[#E2E2E2] hover:bg-[#1A1A1A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 sm:py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmitTask}
        initialData={editingTask}
      />
      <BottomNav />
    </div>
  );
}
