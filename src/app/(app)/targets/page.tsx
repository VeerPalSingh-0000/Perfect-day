"use client";

import React, { useState, useEffect, useRef } from "react";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTargetStore, getTargetAnalysis } from "@/stores/useTargetStore";
import { LearningTarget, DayStep, TargetCategory } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { useTrackerStore } from "@/stores/useTrackerStore";

import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_EMOJIS: Record<TargetCategory, string> = {
  learning: "🧠",
  fitness: "💪",
  career: "🚀",
  creative: "🎨",
  discipline: "⚔️",
  custom: "🎯",
};

export default function TargetsPage() {
  const user = useAuthStore((s) => s.user);
  const targets = useTargetStore((s) => s.targets);
  const activeTargetId = useTargetStore((s) => s.activeTargetId);
  const {
    addTarget,
    removeTarget,
    toggleDayCompletion,
    setActiveTarget,
    addNote,
    updateTarget,
  } = useTargetStore.getState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTargetTitle, setNewTargetTitle] = useState("");
  const [newTargetCategory, setNewTargetCategory] =
    useState<TargetCategory>("learning");
  const [newTargetDays, setNewTargetDays] = useState(30);
  const [newTargetPlan, setNewTargetPlan] = useState("");
  const [editingDayNote, setEditingDayNote] = useState<{
    dayIndex: number;
    text: string;
  } | null>(null);

  // TrackIT Linking
  const { isLinked, projects, topics } = useTrackerStore();
  const [selectedTrackItIds, setSelectedTrackItIds] = useState<string[]>([]);

  // Re-run analysis safely to prevent stale values
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTarget =
    targets.find((t) => t.id === activeTargetId) || targets[0];
  const analysis = activeTarget ? getTargetAnalysis(activeTarget) : null;

  const handleCreateTarget = () => {
    if (!user || !newTargetTitle) return;

    const lines = newTargetPlan.split("\n").filter((l) => l.trim());
    const totalDays = Number(newTargetDays);
    const plan: DayStep[] = [];

    for (let i = 1; i <= totalDays; i++) {
      const line = lines[i - 1];

      let titleCleaned = "";
      let isMilestoneLine = false;

      if (line) {
        isMilestoneLine =
          line.includes("[M]") || line.toLowerCase().includes("milestone");
        titleCleaned = line.replace(/(\[M\]|milestone:?)/gi, "").trim();
        // Nanosmart regex to strip any user prefix like 'Day 1:', 'Day 1 -'
        titleCleaned = titleCleaned.replace(/^Day\s*\d+[:\-]?\s*/i, "").trim();
        titleCleaned = titleCleaned || `Focus on ${newTargetTitle}`;
      } else {
        titleCleaned = `Focus on ${newTargetTitle}`;
      }

      plan.push({
        day: i,
        title: titleCleaned,
        description: `Execute mission parameters.`,
        isCompleted: false,
        isMilestone:
          isMilestoneLine || i === totalDays || i === Math.floor(totalDays / 2),
      });
    }

    const newTarget: LearningTarget = {
      id: Math.random().toString(36).substring(2, 11),
      userId: user.uid,
      title: newTargetTitle,
      category: newTargetCategory,
      totalDays,
      plan,
      completedDays: [],
      createdAt: Date.now(),
      startDate: new Date().toISOString().split("T")[0],
      status: "active",
      emoji: CATEGORY_EMOJIS[newTargetCategory],
      bestStreak: 0,
      currentStreak: 0,
      linkedTrackItIds: selectedTrackItIds.length > 0 ? selectedTrackItIds : undefined,
    };

    addTarget(newTarget);
    setActiveTarget(newTarget.id);
    setIsModalOpen(false);

    // Reset
    setNewTargetTitle("");
    setNewTargetCategory("learning");
    setNewTargetDays(30);
    setNewTargetPlan("");
    setSelectedTrackItIds([]);
  };

  const handleNoteSave = () => {
    if (editingDayNote !== null && activeTarget) {
      addNote(activeTarget.id, editingDayNote.dayIndex, editingDayNote.text);
      setEditingDayNote(null);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const todayIndex = analysis ? analysis.currentDay - 1 : 0;
  const todayStep = activeTarget?.plan[todayIndex];

  // Guard against ending the target dates
  const isPastEnd = analysis && analysis.currentDay > activeTarget!.totalDays;
  const isCompletedTarget = activeTarget?.status === "completed";

  return (
    <div className="min-h-screen bg-black text-[#E2E2E2] pb-24">
      <TopAppBar variant="title" title="Targets" />

      <main className="mx-auto w-full max-w-4xl md:max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28">
        {/* TARGET SELECTOR BAR (Mobile Only) */}
        {targets.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none snap-x mb-2 md:hidden">
            {targets.map((t) => (
              <div key={t.id} className="relative snap-center">
                <button
                  onClick={() => setActiveTarget(t.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap snap-center transition-all group",
                    activeTargetId === t.id ||
                      (!activeTargetId && targets[0].id === t.id)
                      ? "bg-[#4F44E2]/20 border-[#4F44E2] text-white shadow-[0_0_15px_rgba(79,68,226,0.3)]"
                      : "bg-[#0A0A0A] border-[#464555]/30 text-[#8E8D99] hover:bg-[#111111]",
                  )}
                >
                  <span>
                    {t.emoji || CATEGORY_EMOJIS[t.category || "learning"]}
                  </span>
                  <span className="text-xs font-bold font-headline tracking-widest uppercase">
                    {t.title}
                  </span>
                </button>
              </div>
            ))}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-[#464555]/50 hover:border-white/50 text-[#8E8D99] hover:text-white transition-all bg-transparent"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span className="text-xs font-bold uppercase tracking-widest">
                New
              </span>
            </button>
          </div>
        )}

        {!activeTarget || !analysis ? (
          <div className="flex flex-col items-center justify-center py-20 text-center mt-10 border border-[#464555]/20 rounded-3xl bg-[#0A0A0A]">
            <div className="h-24 w-24 rounded-full bg-[#4F44E2]/10 border border-[#4F44E2]/20 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-[#4F44E2]">
                flag
              </span>
            </div>
            <h2 className="text-xl font-headline font-black mb-2 uppercase tracking-widest">
              No Active Initiatives
            </h2>
            <p className="text-[#8E8D99] max-w-sm mb-8 text-sm">
              Deploy a new targeted learning protocol and auto-track your
              mission progress day-by-day.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              Initialize Protocol
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Hero Mission Directive and Timeline */}
            <div className="md:col-span-7 lg:col-span-8 space-y-6 sm:space-y-8">
              {/* HERO: TODAY'S MISSION */}
              {!isCompletedTarget && todayStep && !isPastEnd && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl border border-[#4F44E2]/30 bg-linear-to-br from-[#0A0A0A] to-[#14141A] p-6 sm:p-8"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none scale-150 transform translate-x-1/4 -translate-y-1/4">
                    <span className="text-9xl">
                      {activeTarget.emoji ||
                        CATEGORY_EMOJIS[activeTarget.category || "learning"]}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-[#4F44E2]/20 text-[#C4C0FF] rounded-full text-[10px] font-black tracking-widest uppercase">
                        Current Directive
                      </span>
                      <span className="text-[10px] text-[#8E8D99] font-bold uppercase tracking-[0.2em]">
                        Day {todayStep.day} of {activeTarget.totalDays}
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-headline font-black text-white mb-2 leading-tight">
                      {todayStep.title}
                    </h1>
                    <p className="text-[#8E8D99] mb-8 max-w-lg text-sm leading-relaxed">
                      {todayStep.description}
                    </p>

                    <button
                      onClick={() =>
                        toggleDayCompletion(activeTarget.id, todayStep)
                      }
                      className={cn(
                        "w-full sm:w-auto px-8 py-4 rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-all",
                        todayStep.isCompleted
                          ? "bg-[#111111] text-[#464555] border border-[#464555]/30 hover:bg-[#1A1A1A]"
                          : "bg-[#E2E2E2] text-black hover:bg-white hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]",
                      )}
                    >
                      {todayStep.isCompleted ? (
                        <>
                          <span className="material-symbols-outlined text-xl">
                            done_all
                          </span>
                          Directive Completed
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-xl">
                            bolt
                          </span>
                          Execute Directive
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {isCompletedTarget && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative overflow-hidden rounded-3xl border border-[#7cf6ec]/30 bg-linear-to-br from-[#0A0A0A] to-[#0A1A1A] p-8 text-center"
                >
                  <span className="text-6xl mb-4 block">🏆</span>
                  <h1 className="text-3xl sm:text-4xl font-headline font-black text-white mb-2 uppercase tracking-widest text-glow">
                    Mission Accomplished
                  </h1>
                  <p className="text-[#7cf6ec] mb-6 tracking-widest uppercase text-xs font-bold">
                    All {activeTarget.totalDays} directives executed
                  </p>
                  <button
                    onClick={() => removeTarget(activeTarget.id)}
                    className="px-6 py-2 bg-[#1A1A1A] border border-[#464555]/30 rounded-full text-xs font-bold text-[#8E8D99] uppercase tracking-widest hover:text-white"
                  >
                    Archive Protocol
                  </button>
                </motion.div>
              )}

              {/* TIMELINE LIST */}
              <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8D99]">
                    Timeline
                  </h2>
                </div>

                <div className="space-y-3 relative">
                  {/* Connecting Line */}
                  <div className="absolute left-6 top-6 bottom-6 w-px bg-linear-to-b from-transparent via-[#464555]/30 to-transparent z-0" />

                  {activeTarget.plan.map((step, idx) => {
                    const isCompleted = activeTarget.completedDays.includes(idx);
                    const isPast = idx < todayIndex;
                    const isToday = idx === todayIndex;
                    const isFuture = idx > todayIndex;
                    const isMissed = isPast && !isCompleted;

                    // Determine display state
                    let cardBg = "bg-[#0A0A0A]";
                    let cardBorder = "border-white/5";
                    let iconColor = "text-[#464555]";
                    let iconName = "radio_button_unchecked";
                    let titleColor = "text-[#E2E2E2]";

                    if (isCompleted) {
                      cardBg = "bg-[#0A0A0A]/50";
                      titleColor = "text-[#464555] line-through";
                      iconColor = "text-[#4F44E2]";
                      iconName = "check_circle";
                    } else if (isToday) {
                      cardBg = "bg-[#111111]";
                      cardBorder =
                        "border-[#4F44E2]/40 shadow-[0_0_30px_rgba(79,68,226,0.05)]";
                      iconColor = "text-[#4F44E2]";
                      iconName = "radio_button_checked";
                    } else if (isFuture) {
                      cardBg = "bg-transparent";
                      titleColor = "text-[#464555]";
                      iconColor = "text-[#1A1A1A]";
                      iconName = "lock";
                    } else if (isMissed) {
                      cardBg = "bg-red-950/10";
                      cardBorder = "border-red-900/30";
                      titleColor = "text-[#E2E2E2]";
                      iconColor = "text-red-500/50";
                      iconName = "cancel";
                    }

                    if (step.isMilestone && !isCompleted && !isMissed) {
                      cardBorder = isToday
                        ? "border-yellow-500/50"
                        : "border-yellow-500/20";
                      iconColor = "text-yellow-500";
                      iconName = "workspace_premium";
                    }

                    return (
                      <motion.div
                        key={step.day}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className={cn(
                          "relative z-10 w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left",
                          cardBg,
                          cardBorder,
                        )}
                      >
                        <div className="flex flex-col items-center mt-1 shrink-0 bg-black rounded-full">
                          <span
                            className={cn(
                              "material-symbols-outlined text-xl bg-black rounded-full",
                              iconColor,
                              isToday && !isCompleted ? "animate-pulse" : "",
                            )}
                          >
                            {iconName}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                isToday
                                  ? "text-[#4F44E2]"
                                  : isMissed
                                    ? "text-red-400"
                                    : "text-[#464555]",
                              )}
                            >
                              Day {step.day}
                            </span>
                            {step.isMilestone && (
                              <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20 text-[8px] font-bold uppercase tracking-widest">
                                Milestone
                              </span>
                            )}
                            {isMissed && (
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded border border-red-500/20 text-[8px] font-bold uppercase tracking-widest">
                                Missed
                              </span>
                            )}
                          </div>

                          <h3
                            className={cn(
                              "text-sm sm:text-base font-bold mb-1",
                              titleColor,
                            )}
                          >
                            {step.title}
                          </h3>

                          {(isToday || isCompleted || isMissed) &&
                            step.description && (
                              <p className="text-xs text-[#8E8D99] leading-relaxed mb-3">
                                {step.description}
                              </p>
                            )}

                          {/* Day Notes Section */}
                          {(isCompleted || isMissed) && (
                            <div className="mt-2 text-xs">
                              {editingDayNote?.dayIndex === idx ? (
                                <div className="flex flex-col gap-2 mt-2">
                                  <textarea
                                    autoFocus
                                    value={editingDayNote.text}
                                    onChange={(e) =>
                                      setEditingDayNote({
                                        ...editingDayNote,
                                        text: e.target.value,
                                      })
                                    }
                                    placeholder="Add debrief or reflection..."
                                    className="w-full bg-[#050505] border border-[#464555]/30 rounded-lg p-3 text-[#E2E2E2] placeholder:text-[#464555] focus:border-[#4F44E2] focus:outline-none resize-none text-xs"
                                    rows={3}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => setEditingDayNote(null)}
                                      className="px-3 py-1 text-[10px] uppercase font-bold text-[#8E8D99] hover:text-white"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleNoteSave}
                                      className="px-3 py-1 text-[10px] uppercase font-bold bg-[#4F44E2]/20 text-[#C4C0FF] hover:bg-[#4F44E2]/40 rounded"
                                    >
                                      Save Note
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  onClick={() =>
                                    setEditingDayNote({
                                      dayIndex: idx,
                                      text: step.notes || "",
                                    })
                                  }
                                  className="group flex gap-2 items-start py-2 px-3 rounded-lg bg-[#050505] border border-transparent hover:border-[#464555]/20 cursor-pointer transition-all"
                                >
                                  <span className="material-symbols-outlined text-sm text-[#464555] mt-0.5 group-hover:text-[#4F44E2]">
                                    edit_note
                                  </span>
                                  <p
                                    className={cn(
                                      "flex-1",
                                      step.notes
                                        ? "text-[#8E8D99] italic"
                                        : "text-[#464555] italic",
                                    )}
                                  >
                                    {step.notes || "Add reflection note..."}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Interaction: Mark missed as done anyway */}
                        {isToday && (
                          <button
                            onClick={() =>
                              toggleDayCompletion(activeTarget.id, step)
                            }
                            className="shrink-0 p-2 rounded-full bg-[#111111] border border-[#464555]/30 hover:bg-[#1A1A1A] hover:border-white/20 transition-all text-[#E2E2E2]"
                          >
                            <span className="material-symbols-outlined text-base">
                              {isCompleted ? "undo" : "done"}
                            </span>
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right Column: Sticky Sidebar containing selectors, stats, execution matrix */}
            <div className="md:col-span-5 lg:col-span-4 md:sticky md:top-24 space-y-6 self-start">
              {/* Desktop Target Selector */}
              <div className="hidden md:flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#464555] mb-2 px-1">
                  Active Protocols
                </span>
                {targets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTarget(t.id)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl border whitespace-nowrap transition-all text-left group",
                      activeTargetId === t.id ||
                        (!activeTargetId && targets[0].id === t.id)
                        ? "bg-[#4F44E2]/20 border-[#4F44E2] text-white shadow-[0_0_15px_rgba(79,68,226,0.3)] font-bold"
                        : "bg-[#0A0A0A] border-[#464555]/15 text-[#8E8D99] hover:bg-[#111111]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span>
                        {t.emoji || CATEGORY_EMOJIS[t.category || "learning"]}
                      </span>
                      <span className="text-xs font-bold font-headline tracking-widest uppercase truncate max-w-[150px]">
                        {t.title}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-50 group-hover:opacity-100 transition-opacity text-[#8E8D99] group-hover:text-white">
                      arrow_forward_ios
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-[#464555]/50 hover:border-white/50 text-[#8E8D99] hover:text-white transition-all bg-transparent text-left"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Initialize Protocol
                  </span>
                </button>
              </div>

              {/* DASHBOARD GRID */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#464555]/15 flex flex-col justify-between h-28 relative overflow-hidden">
                  <span className="material-symbols-outlined text-[#464555] absolute -right-2 -bottom-2 text-6xl opacity-10">
                    speed
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#8E8D99]">
                    Velocity
                  </p>
                  <div>
                    <p className="text-2xl font-headline font-black text-white">
                      {Math.round(analysis.velocity)}%
                    </p>
                    <p className="text-[8px] uppercase tracking-widest text-[#4F44E2]">
                      Hit Rate
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#464555]/15 flex flex-col justify-between h-28 relative overflow-hidden">
                  <span className="material-symbols-outlined text-[#464555] absolute -right-2 -bottom-2 text-6xl opacity-10">
                    local_fire_department
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#8E8D99]">
                    Streak
                  </p>
                  <div>
                    <p className="text-2xl font-headline font-black text-white">
                      {analysis.streak}
                    </p>
                    <p className="text-[8px] uppercase tracking-widest text-orange-400">
                      Consecutive
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#464555]/15 flex flex-col justify-between h-28 relative overflow-hidden">
                  <span className="material-symbols-outlined text-[#464555] absolute -right-2 -bottom-2 text-6xl opacity-10">
                    emoji_events
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#8E8D99]">
                    Best Run
                  </p>
                  <div>
                    <p className="text-2xl font-headline font-black text-white">
                      {activeTarget.bestStreak || analysis.streak}
                    </p>
                    <p className="text-[8px] uppercase tracking-widest text-yellow-400">
                      All Time Record
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#464555]/15 flex flex-col justify-between h-28 relative overflow-hidden">
                  <span className="material-symbols-outlined text-[#464555] absolute -right-2 -bottom-2 text-6xl opacity-10">
                    event_available
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#8E8D99]">
                    ETA
                  </p>
                  <div>
                    <p className="text-lg font-headline font-black text-white">
                      {activeTarget.completedDays.length === 0
                        ? "TBD"
                        : analysis.projectedCompletion.toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                    </p>
                    <p className="text-[8px] uppercase tracking-widest text-green-400">
                      At Current Pace
                    </p>
                  </div>
                </div>
              </div>

              {/* PROGRESS VISUALIZATION - HEATMAP */}
              <section className="bg-[#0A0A0A] border border-[#464555]/15 p-6 rounded-3xl w-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#E2E2E2] mb-1">
                      Execution Matrix
                    </h3>
                    <p className="text-[10px] text-[#8E8D99] uppercase tracking-widest">
                      {activeTarget.completedDays.length} /{" "}
                      {activeTarget.totalDays} Days Captured
                    </p>
                  </div>
                  {/* Mini Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#141414] stroke-current"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#4F44E2] stroke-current transition-all duration-1000"
                        strokeWidth="3"
                        strokeDasharray={`${Math.round((activeTarget.completedDays.length / activeTarget.totalDays) * 100)}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[9px] font-bold">
                      {Math.round(
                        (activeTarget.completedDays.length /
                          activeTarget.totalDays) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                </div>

                {/* Heatmap Grid */}
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {activeTarget.plan.map((step, idx) => {
                    const isCompleted = activeTarget.completedDays.includes(idx);
                    const isPast = idx < todayIndex;
                    const isToday = idx === todayIndex;
                    const isMissed = isPast && !isCompleted;

                    let bgColor = "bg-[#1A1A1A]";
                    let borderColor = "border-[#464555]/20";
                    let animation = "";

                    if (isCompleted) {
                      bgColor = "bg-[#4F44E2]";
                      borderColor = "border-[#4F44E2]";
                    } else if (isMissed) {
                      bgColor = "bg-red-500/20";
                      borderColor = "border-red-500/30";
                    } else if (isToday && !isCompleted) {
                      bgColor = "bg-[#4F44E2]/20";
                      borderColor = "border-[#4F44E2]";
                      animation = "animate-pulse";
                    }

                    return (
                      <div
                        key={step.day}
                        className={cn(
                          "w-4 h-4 sm:w-5 sm:h-5 rounded-sm sm:rounded-md border shrink-0 transition-colors",
                          bgColor,
                          borderColor,
                          animation,
                        )}
                        title={`Day ${step.day}: ${step.title} ${isCompleted ? "(Done)" : isMissed ? "(Missed)" : ""}`}
                      />
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Target Genesis Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="INITIALIZE PROTOCOL"
        className="max-w-xl"
      >
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[#464555] block mb-3">
              Protocol Designation
            </label>
            <input
              type="text"
              value={newTargetTitle}
              onChange={(e) => setNewTargetTitle(e.target.value)}
              placeholder="e.g. Learn Machine Learning"
              className="w-full bg-[#111111] border border-white/10 rounded-xl px-5 py-4 font-bold text-white placeholder:text-[#464555] focus:border-[#4F44E2] focus:ring-1 focus:ring-[#4F44E2] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#464555] block mb-3">
                Category
              </label>
              <select
                value={newTargetCategory}
                onChange={(e) =>
                  setNewTargetCategory(e.target.value as TargetCategory)
                }
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-5 py-4 font-bold text-white focus:border-[#4F44E2] outline-none transition-all appearance-none"
              >
                <option value="learning">🧠 Learning</option>
                <option value="fitness">💪 Fitness</option>
                <option value="career">🚀 Career</option>
                <option value="creative">🎨 Creative</option>
                <option value="discipline">⚔️ Discipline</option>
                <option value="custom">🎯 Custom</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#464555] block mb-3">
                Duration (Days)
              </label>
              <input
                type="number"
                value={newTargetDays}
                onChange={(e) =>
                  setNewTargetDays(Math.max(1, Number(e.target.value)))
                }
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-5 py-4 font-bold text-white focus:border-[#4F44E2] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[#464555] block mb-3">
              Strategic Blueprint
            </label>
            <textarea
              value={newTargetPlan}
              onChange={(e) => setNewTargetPlan(e.target.value)}
              placeholder="Day 1: Intro to concepts&#10;Day 2: Setup environment&#10;[M] Day 3: First project milestone"
              rows={6}
              className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 font-medium text-sm text-white placeholder:text-[#464555] focus:border-[#4F44E2] outline-none transition-all resize-none"
            />
            <p className="text-[9px] font-bold text-[#8E8D99] mt-2 italic px-1">
              Tip: Add [M] before a line to mark it as a milestone day. The
              system will auto-sequence to your duration.
            </p>
          </div>

          {isLinked && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#4F44E2]">
                  Link FocusFlow
                </label>
                <span className="text-[9px] font-medium text-[#464555]">Auto-complete directives when tracked in FocusFlow</span>
              </div>
              
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                {projects.map((p: any) => (
                  <button
                    key={`proj-${p.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedTrackItIds(prev => 
                        prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                      );
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold transition-all",
                      selectedTrackItIds.includes(p.id)
                        ? "border-[#4F44E2] bg-[#4F44E2]/20 text-white shadow-[0_0_10px_rgba(79,68,226,0.1)]"
                        : "border-[#464555]/20 bg-[#0A0A0A] text-[#464555] hover:border-[#464555]/40"
                    )}
                  >
                    <span className="material-symbols-outlined text-[12px]">folder</span>
                    {p.name}
                  </button>
                ))}
                
                {topics.map((t: any) => (
                  <button
                    key={`topic-${t.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedTrackItIds(prev => 
                        prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id]
                      );
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold transition-all",
                      selectedTrackItIds.includes(t.id)
                        ? "border-[#4F44E2] bg-[#4F44E2]/20 text-white shadow-[0_0_10px_rgba(79,68,226,0.1)]"
                        : "border-[#464555]/20 bg-[#0A0A0A] text-[#464555] hover:border-[#464555]/40"
                    )}
                  >
                    <span className="material-symbols-outlined text-[12px]">topic</span>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={handleCreateTarget}
              disabled={!newTargetTitle}
              className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all hover:bg-white/90 active:scale-95 disabled:opacity-50 disabled:grayscale shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Deploy Protocol
            </button>
          </div>
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}
