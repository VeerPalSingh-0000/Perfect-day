"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDataStore } from "@/stores/useDataStore";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { StealthFooter } from "@/components/layout/StealthFooter";
import { AddTaskModal } from "@/components/ui/AddTaskModal";
import {
  addTask as dbAddTask,
  updateTask,
  deleteTask as dbDeleteTask,
  saveDayRecord,
} from "@/lib/db";
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
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

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

  const rating = calculateDayRating(totalTasks === 0 ? 0 : completionPercentage);
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
      saveDayRecord(record).catch(() => {});
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [tasks, user, todayDateStr, totalTasks, completedTasks, completionPercentage]);

  const handleAddTask = async (taskData: Partial<Task>) => {
    if (!user) return;
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
    addTask(newTask);
    dbAddTask(newTask).catch(() => {});
  };

  const handleToggleTask = async (task: Task) => {
    if (!user) return;
    toggleTaskCompletion(task.id);
    updateTask(user.uid, task.id, {
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? Date.now() : undefined,
    }).catch(() => {});
  };

  const handleDeleteTask = async (task: Task) => {
    if (!user) return;
    setDeletingTaskId(task.id);
    deleteTask(task.id);
    dbDeleteTask(user.uid, task.id).catch(() => {}).finally(() => setDeletingTaskId(null));
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
              <span className="mb-2 text-2xl sm:text-3xl">{ratingInfo.emoji}</span>
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
              <svg className="h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 -rotate-90" viewBox="0 0 96 96">
                <circle className="text-[#141414]" cx="48" cy="48" r="42" fill="transparent" stroke="currentColor" strokeWidth="6" />
                <circle
                  className={`transition-all duration-1000 ${completionPercentage === 100 ? "text-[#FFFFFF]" : "text-[#C4C0FF]"}`}
                  cx="48" cy="48" r="42" fill="transparent" stroke="currentColor" strokeWidth="6"
                  strokeDasharray="263.89" strokeDashoffset={263.89 - (completionPercentage / 100) * 263.89} strokeLinecap="round"
                />
              </svg>
              <span className={`absolute font-headline text-sm sm:text-base md:text-lg font-bold ${completionPercentage === 100 ? "text-white text-glow" : "text-[#E2E2E2]"}`}>
                {completionPercentage}%
              </span>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-3 sm:gap-4 rounded-lg border border-[rgba(70,69,85,0.15)] bg-linear-to-r from-[#0A0A0A] to-[#111111] p-4 sm:p-5">
            <div className={`flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-full border border-[#4F44E2]/20 shrink-0 ${displayStreak > 0 ? "bg-[#4F44E2]/10" : "bg-[#1A1A1A]"}`}>
              <span className={`material-symbols-outlined text-lg sm:text-xl ${displayStreak > 0 ? "text-[#C4C0FF]" : "text-[#464555]"}`} style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`font-headline text-2xl sm:text-3xl font-bold tracking-tighter ${displayStreak > 0 ? "text-[#E2E2E2]" : "text-[#464555]"}`}>{displayStreak}</span>
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#464555]">Day Streak</span>
            </div>
          </div>

          {/* Perfect Days */}
          <div className="flex items-center gap-3 sm:gap-4 rounded-lg border border-[rgba(70,69,85,0.15)] bg-linear-to-r from-[#0A0A0A] to-[#111111] p-4 sm:p-5">
            <div className={`flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-full border border-[#7cf6ec]/20 shrink-0 ${displayPerfectDays > 0 ? "bg-[#7cf6ec]/10" : "bg-[#1A1A1A]"}`}>
              <span className={`material-symbols-outlined text-lg sm:text-xl ${displayPerfectDays > 0 ? "text-[#7cf6ec]" : "text-[#464555]"}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`font-headline text-2xl sm:text-3xl font-bold tracking-tighter ${displayPerfectDays > 0 ? "text-[#E2E2E2]" : "text-[#464555]"}`}>{displayPerfectDays}</span>
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#464555]">Perfect Days</span>
            </div>
          </div>
        </section>

        {/* Tasks */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
            <h3 className="font-headline text-lg sm:text-xl font-bold text-[#E2E2E2]">Tasks</h3>
            <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#E2E2E2] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-black transition-all hover:opacity-90 active:scale-95">
              <span className="material-symbols-outlined text-base sm:text-lg">add</span>
              <span>New Task</span>
            </button>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-[rgba(70,69,85,0.15)] bg-[#0A0A0A] text-center">
                <span className="material-symbols-outlined text-4xl text-[#464555] mb-2">fact_check</span>
                <p className="text-sm font-medium text-[#8E8D99]">Your day is a blank canvas.</p>
                <p className="text-xs text-[#464555] mt-1">Add tasks above to start planning.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className={`group w-full flex items-center gap-3 sm:gap-4 rounded-lg border border-[rgba(70,69,85,0.15)] bg-[#0A0A0A] p-3 sm:p-4 text-left transition-all hover:bg-[#111111] ${task.isCompleted ? "opacity-50" : ""}`}>
                  <button onClick={() => handleToggleTask(task)} className={`flex h-5 sm:h-6 w-5 sm:w-6 items-center justify-center rounded-full border shrink-0 transition-colors ${task.isCompleted ? "border-[#C4C0FF]/30 bg-[#C4C0FF]/20" : "border-[#464555]/30 bg-transparent hover:border-[#C4C0FF]/50"}`}>
                    {task.isCompleted ? (<span className="material-symbols-outlined text-sm font-bold text-[#C4C0FF]">done</span>) : (<div className="h-2 w-2 rounded-full bg-[#464555]/50 flex-shrink-0" />)}
                  </button>
                  <div className="grow min-w-0 cursor-pointer" onClick={() => handleToggleTask(task)}>
                    <p className={`font-medium text-sm transition-all ${task.isCompleted ? "text-[#E2E2E2] line-through decoration-[#464555]/40" : "text-[#E2E2E2]"}`}>{task.title}</p>
                  </div>
                  {task.isHabit && (<span className="rounded border border-[#4F44E2]/20 bg-[#4F44E2]/10 px-1.5 py-0.5 text-[7px] sm:text-[9px] font-bold uppercase tracking-widest text-[#C4C0FF] shrink-0">Habit</span>)}
                  <span className="rounded border border-[#464555]/20 bg-black px-2 py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#464555] shrink-0">{task.category}</span>
                  <button onClick={() => handleDeleteTask(task)} disabled={deletingTaskId === task.id} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-[#464555] hover:text-red-400 hover:bg-red-400/10 shrink-0" aria-label={`Delete task: ${task.title}`}>
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <StealthFooter />
      </main>

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddTask} />
      <BottomNav />
    </div>
  );
}
