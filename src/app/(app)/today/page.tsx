"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDataStore, isHabitValidForDate } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useTargetStore } from "@/stores/useTargetStore";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Reorder } from "framer-motion";

import { AddTaskModal } from "@/components/ui/AddTaskModal";
import { TaskTimer } from "@/components/ui/TaskTimer";
import { useTrackerStore } from "@/stores/useTrackerStore";
import { trackerDb } from "@/lib/tracker-db";
import {
  collection,
  query as fsQuery,
  where as fsWhere,
  onSnapshot,
} from "firebase/firestore";
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
  calculateCompletionPercentage,
} from "@/lib/utils";
import { getQuoteOfDay } from "@/lib/quotes";
import { useAchievementStore } from "@/stores/useAchievementStore";
import { AchievementCelebration } from "@/components/ui/AchievementCelebration";

export default function TodayPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.displayName?.split(" ")[0] || "User";

  const tasks = useDataStore((s) => s.tasks);
  const records = useDataStore((s) => s.records);
  const todayFocus = useDataStore((s) => s.todayFocus);
  const {
    addTask,
    deleteTask,
    toggleTaskCompletion,
    setTodayFocus,
    reorderTasks,
  } = useDataStore.getState();
  const unlockAchievement = useAchievementStore((s) => s.unlockAchievement);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    taskId: string;
  } | null>(null);

  // FocusFlow live durations map
  const [durationMap, setDurationMap] = useState<Record<string, number>>({});

  // Hold-to-drag state
  const [dragEnabledTaskId, setDragEnabledTaskId] = useState<string | null>(
    null,
  );
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdingTaskRef = useRef<string | null>(null);

  const todayDateStr = getTodayDateString();
  const todayDisplay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const greeting = getTimeBasedGreeting();
  const quote = getQuoteOfDay();
  const [localFocus, setLocalFocus] = useState(todayFocus);

  // Ref to always have latest tasks in the FocusFlow background listener without dependency loops
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const priorityMode = useSettingsStore((s) => s.priorityMode);

  // Derived state
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const totalTasks = tasks.length;
  const completionPercentage = calculateCompletionPercentage(
    tasks,
    priorityMode,
  );

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

  // --- 3A. Achievement Monitoring ---
  useEffect(() => {
    // 1. One Hundred Club
    const totalLifetimeTasks =
      records.reduce((acc, r) => acc + r.completedTasks, 0) + completedTasks;
    if (totalLifetimeTasks >= 100) {
      unlockAchievement({
        id: "tasks_100",
        title: "Century Club",
        description:
          "You've crushed 100 tasks. Consistency is your middle name.",
        icon: "🏆",
        type: "stat",
      });
    }

    // 2. Early Bird (All tasks done before noon)
    if (totalTasks > 0 && completionPercentage === 100) {
      const allDoneBeforeNoon = tasks.every((t) => {
        if (!t.completedAt) return false;
        const hour = new Date(t.completedAt).getHours();
        return hour < 12;
      });
      if (allDoneBeforeNoon) {
        unlockAchievement({
          id: "early_bird",
          title: "Early Bird",
          description: "Finished your entire day before noon? Incredible.",
          icon: "🐦",
          type: "milestone",
        });
      }
    }

    // 3. Streaks
    if (displayStreak >= 7) {
      unlockAchievement({
        id: "streak_7",
        title: "Relentless Week",
        description: "A full week of 80%+ performance. You're on fire.",
        icon: "🔥",
        type: "streak",
      });
    }
    if (displayStreak >= 30) {
      unlockAchievement({
        id: "streak_30",
        title: "Unstoppable Month",
        description:
          "30 days of excellence. This isn't a fluke, it's a lifestyle.",
        icon: "💎",
        type: "streak",
      });
    }

    // 4. First Perfect Day
    if (completionPercentage === 100) {
      unlockAchievement({
        id: "first_perfect",
        title: "The Perfect Day",
        description:
          "You finished every single task on your list. 100% absolute power.",
        icon: "🌟",
        type: "milestone",
      });
    }
  }, [
    completionPercentage,
    completedTasks,
    totalTasks,
    displayStreak,
    records,
    tasks,
    unlockAchievement,
  ]);

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
        focusWord: localFocus,
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
    localFocus,
  ]);

  const handleFocusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFocus(e.target.value);
    setTodayFocus(e.target.value);
  };

  const handleSubmitTask = async (
    taskData: Partial<Task> & { id?: string },
  ) => {
    if (!user) return;

    if (taskData.id) {
      // Edit mode
      const updates: any = {
        title: taskData.title,
        category: taskData.category,
        isHabit: taskData.isHabit,
      };

      if (taskData.priority) {
        updates.priority = taskData.priority;
      }

      if ("targetTime" in taskData) {
        if (taskData.targetTime) {
          updates.targetTime = taskData.targetTime;
        } else {
          updates.targetTime = deleteField();
        }
      }

      if (taskData.isHabit && taskData.frequency) {
        updates.frequency = taskData.frequency;
      } else {
        updates.frequency = deleteField();
      }

      if (taskData.linkedTrackItIds) {
        updates.linkedTrackItIds = taskData.linkedTrackItIds;
      } else {
        updates.linkedTrackItIds = [];
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
          tasks: state.tasks.map((t) =>
            t.id === taskData.id ? { ...t, ...updates } : t,
          ),
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

      if (taskData.priority) {
        newTask.priority = taskData.priority;
      }
      if (taskData.targetTime) {
        newTask.targetTime = taskData.targetTime;
      }

      if (taskData.isHabit && taskData.frequency) {
        newTask.frequency = taskData.frequency;
      }

      if (taskData.linkedTrackItIds) {
        newTask.linkedTrackItIds = taskData.linkedTrackItIds;
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

  // Hold-to-drag handlers
  const handleDragHoldStart = (taskId: string) => {
    // Only on mobile devices
    if (typeof window !== "undefined" && window.innerWidth > 640) return;

    holdingTaskRef.current = taskId;
    holdTimerRef.current = setTimeout(() => {
      setDragEnabledTaskId(taskId);
      // Haptic feedback if available
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(50);
      }
    }, 1000); // 1 second hold
  };

  const handleDragHoldEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    holdingTaskRef.current = null;
  };

  const handleDragStart = (taskId: string) => {
    // Only allow drag if hold was completed (or on desktop)
    if (typeof window !== "undefined" && window.innerWidth <= 640) {
      if (dragEnabledTaskId !== taskId) {
        return false; // Prevent drag
      }
    }
  };

  const handleDragEnd = () => {
    setDragEnabledTaskId(null);
    handleDragHoldEnd();
  };

  // 1. FocusFlow Background Tracker Sync - Listener only
  const trackerStore = useTrackerStore();
  useEffect(() => {
    if (typeof window !== "undefined") {
      trackerStore.initTrackerAuth();
    }
  }, []);

  useEffect(() => {
    if (!trackerStore.isLinked || !trackerStore.trackerUser || !user) return;

    const q = fsQuery(
      collection(trackerDb, "sessions"),
      fsWhere("userId", "==", trackerStore.trackerUser.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allSessions = snapshot.docs.map((d) => d.data());
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayMs = startOfToday.getTime();

        const todaySessions = allSessions.filter((s) => {
          const t = s.createdAt?.toMillis() || s.startTime || 0;
          return t >= todayMs;
        });

        const newDurationMap: Record<string, number> = {};
        todaySessions.forEach((s) => {
          const durationMin = (s.duration || 0) / 60000;
          const ids = [s.projectId, s.topicId, s.subTopicId].filter(Boolean);
          ids.forEach((id) => {
            newDurationMap[id] = (newDurationMap[id] || 0) + durationMin;
          });
        });

        setDurationMap(newDurationMap);

        // Aggregate total focus time today across all unique sessions
        const sessionKeysProcessed = new Set<string>();
        let totalFocusMinutes = 0;

        todaySessions.forEach((s) => {
          const skey = s.id || `${s.projectName}_${s.startTime || s.createdAt?.toMillis()}_${s.duration}`;
          if (!sessionKeysProcessed.has(skey)) {
            sessionKeysProcessed.add(skey);
            totalFocusMinutes += (s.duration || 0) / 60000;
          }
        });

        console.log(`[FocusFlow Sync] Total Combined Minutes:`, totalFocusMinutes.toFixed(2));

        if (totalFocusMinutes > 0) {
          const recordId = `${user.uid}_${todayDateStr}`;
          const currentTasksList = tasksRef.current;
          const totalTasksCount = currentTasksList.length;
          const completedTasksCount = currentTasksList.filter(t => t.isCompleted).length;
          const percentage = totalTasksCount === 0 ? 0 : Math.round((completedTasksCount / totalTasksCount) * 100);

          const record: DayRecord = {
            id: recordId,
            userId: user.uid,
            date: todayDateStr,
            totalTasks: totalTasksCount,
            completedTasks: completedTasksCount,
            completionPercentage: percentage,
            rating: calculateDayRating(percentage),
            tasks: currentTasksList,
            createdAt: Date.now(),
            totalFocusTime: totalFocusMinutes,
          };
          saveDayRecord(record).catch(() => {});
        }
      },
      (error) => console.error("FocusFlow Sync Error:", error),
    );
    return () => unsubscribe();
  }, [trackerStore.isLinked, trackerStore.trackerUser, user]);

  // 2. FocusFlow Auto-completion Logic (Reacts to durationMap + tasks + targets)
  const targets = useTargetStore(s => s.targets);
  const toggleDayCompletion = useTargetStore(s => s.toggleDayCompletion);

  useEffect(() => {
    if (Object.keys(durationMap).length === 0) return;

    // A. Tasks & Habits Auto-complete
    tasks.forEach((task) => {
      if (task.isCompleted || !task.linkedTrackItIds?.length) return;

      let maxDuration = 0;
      task.linkedTrackItIds.forEach((id) => {
        if (durationMap[id] > maxDuration) maxDuration = durationMap[id];
      });

      const targetMinutes = task.targetTime || 0;
      if (maxDuration > 0 && (targetMinutes === 0 || maxDuration >= targetMinutes)) {
        console.log(`[FocusFlow Sync] ✅ Auto-completing Task: "${task.title}"`);
        // One-way set to completed
        toggleTaskCompletion(task.id);
        updateTask(user!.uid, task.id, {
          isCompleted: true,
          completedAt: Date.now(),
        }).catch(console.error);
      }
    });

    // B. Learning Targets Auto-complete
    targets.forEach((target) => {
      if (target.status !== 'active' || !target.linkedTrackItIds?.length) return;

      const [year, month, day] = target.startDate.split('-').map(Number);
      const start = new Date(year, month - 1, day);
      start.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const todayIndex = diffDays;

      if (todayIndex < 0 || todayIndex >= target.totalDays) return;
      
      const todayStep = target.plan[todayIndex];
      if (!todayStep || todayStep.isCompleted) return;

      let hasFocusToday = false;
      target.linkedTrackItIds.forEach(id => {
        if (durationMap[id] > 0) hasFocusToday = true;
      });

      if (hasFocusToday) {
        console.log(`[FocusFlow Sync] 🎯 Auto-completing Mission Directive: "${todayStep.title}" for target "${target.title}"`);
        toggleDayCompletion(target.id, todayStep);
      }
    });
  }, [durationMap, tasks, targets, user]);

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
        <section className="relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="mb-1 font-headline text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter text-[#E2E2E2]">
                {greeting}, {firstName}
              </h1>
              <p className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.2em] text-[#464555]">
                {todayDisplay}
              </p>
            </div>
          </div>

          {/* 3D. Daily Focus Intention */}
          <div className="mt-6 sm:mt-8 relative group">
            <input
              type="text"
              value={localFocus}
              onChange={handleFocusChange}
              placeholder="Set your daily intention..."
              className="w-full bg-transparent border-none p-0 font-headline text-lg sm:text-2xl font-bold text-[#C4C0FF] placeholder:text-[#464555] focus:outline-none focus:ring-0"
            />
            <div className="h-px w-full bg-[#464555]/20 group-focus-within:bg-[#C4C0FF]/50 transition-all mt-1" />
          </div>

          {/* 3B. Motivational Quote */}
          <div className="mt-8 rounded-xl border border-[rgba(70,69,85,0.15)] bg-[#0A0A0A] p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-4xl">
                format_quote
              </span>
            </div>
            <p className="font-medium text-xs sm:text-sm text-[#8E8D99] italic leading-relaxed">
              {quote}
            </p>
          </div>
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
              <Reorder.Group
                axis="y"
                values={tasks}
                onReorder={reorderTasks}
                className="space-y-2 sm:space-y-3"
              >
                {tasks.map((task) => (
                  <Reorder.Item
                    key={task.id}
                    value={task}
                    className={`group w-full flex items-center gap-3 sm:gap-4 rounded-lg border border-[rgba(70,69,85,0.15)] bg-[#0A0A0A] p-3 sm:p-4 text-left transition-colors hover:bg-[#111111] ${task.isCompleted ? "opacity-50" : ""}`}
                    whileDrag={{
                      scale: 1.02,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      zIndex: 10,
                    }}
                    onDragStart={() => handleDragStart(task.id)}
                    onDragEnd={handleDragEnd}
                    drag={
                      typeof window !== "undefined" && window.innerWidth <= 640
                        ? dragEnabledTaskId === task.id
                        : true
                    }
                  >
                    <div
                      className={`touch-none flex items-center opacity-30 active:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 cursor-grab active:cursor-grabbing text-[#464555] shrink-0 ${dragEnabledTaskId === task.id ? "opacity-100 text-[#4F44E2]" : ""}`}
                      onPointerDown={() => handleDragHoldStart(task.id)}
                      onPointerUp={handleDragHoldEnd}
                      onPointerLeave={handleDragHoldEnd}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        drag_indicator
                      </span>
                    </div>

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
                      className="grow min-w-0 flex flex-col gap-1 cursor-pointer"
                      onClick={() => handleToggleTask(task)}
                    >
                      <div className="flex items-start gap-2">
                        {priorityMode === "advanced" && (
                          <span
                            className="text-xs shrink-0 mt-[2px]"
                            title={`${task.priority || "medium"} priority`}
                          >
                            {task.priority === "critical"
                              ? "🔴"
                              : task.priority === "high"
                                ? "🟠"
                                : task.priority === "low"
                                  ? "🔵"
                                  : "🟡"}
                          </span>
                        )}
                        <p
                          className={`font-medium text-sm transition-all wrap-break-word min-w-0 leading-tight ${task.isCompleted ? "text-[#E2E2E2] line-through decoration-[#464555]/40" : "text-[#E2E2E2]"}`}
                        >
                          {task.title}
                        </p>
                      </div>
                      
                      {/* Badges row displayed cleanly under the title on mobile */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {task.isHabit && (
                          <span className="rounded border border-[#4F44E2]/20 bg-[#4F44E2]/10 px-1.5 py-0.5 text-[7px] sm:text-[9px] font-bold uppercase tracking-widest text-[#C4C0FF] shrink-0">
                            Habit
                          </span>
                        )}
                        <span className="rounded border border-[#464555]/20 bg-black px-1.5 py-0.5 text-[7px] sm:text-[9px] font-bold uppercase tracking-widest text-[#464555] shrink-0">
                          {task.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all ml-1 sm:ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTask(task);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 sm:p-2 rounded-lg text-[#464555] hover:text-[#4F44E2] hover:bg-[#4F44E2]/10 active:scale-95 shrink-0 transition-colors"
                        aria-label={`Edit task: ${task.title}`}
                      >
                        <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
                            handleDeleteTask(task);
                          }
                        }}
                        disabled={deletingTaskId === task.id}
                        className="p-1.5 sm:p-2 rounded-lg text-[#464555] hover:text-red-400 hover:bg-red-400/10 active:scale-95 shrink-0 transition-colors"
                        aria-label={`Delete task: ${task.title}`}
                      >
                        <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                          {deletingTaskId === task.id ? 'hourglass_empty' : 'delete'}
                        </span>
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>
        </section>
      </main>

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
      <AchievementCelebration />
    </div>
  );
}
