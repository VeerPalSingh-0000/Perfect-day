"use client";

import React, { useState, useEffect } from "react";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTargetStore } from "@/stores/useTargetStore";
import { LearningTarget, DayStep } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

import { motion, AnimatePresence } from "framer-motion";

export default function TargetsPage() {
  const user = useAuthStore((s) => s.user);
  const targets = useTargetStore((s) => s.targets);
  const activeTargetId = useTargetStore((s) => s.activeTargetId);
  const { addTarget, removeTarget, toggleDayCompletion, setActiveTarget } =
    useTargetStore.getState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTargetTitle, setNewTargetTitle] = useState("");
  const [newTargetDays, setNewTargetDays] = useState(30);
  const [newTargetPlan, setNewTargetPlan] = useState("");

  const activeTarget =
    targets.find((t) => t.id === activeTargetId) || targets[0];

  const handleCreateTarget = () => {
    if (!user || !newTargetTitle) return;

    // Split user-provided plan by newlines or markers
    const lines = newTargetPlan.split("\n").filter((l) => l.trim());
    const totalDays = Number(newTargetDays);
    const plan: DayStep[] = [];

    for (let i = 1; i <= totalDays; i++) {
      const line =
        lines[i - 1] || `Day ${i}: Progress towards ${newTargetTitle}`;
      plan.push({
        day: i,
        title: line.startsWith(`Day ${i}:`)
          ? line.split(":")[1].trim()
          : line.trim(),
        description: `Continue your ${newTargetTitle} journey.`,
        isCompleted: false,
      });
    }

    const newTarget: LearningTarget = {
      id: Math.random().toString(36).substring(2, 11),
      userId: user.uid,
      title: newTargetTitle,
      totalDays,
      plan,
      completedDays: [],
      createdAt: Date.now(),
      startDate: new Date().toISOString().split("T")[0],
    };

    addTarget(newTarget);
    setActiveTarget(newTarget.id);
    setIsModalOpen(false);
    setNewTargetTitle("");
    setNewTargetDays(30);
    setNewTargetPlan("");
  };

  const calculatePercentage = (target: LearningTarget) => {
    if (target.totalDays === 0) return 0;
    return Math.round((target.completedDays.length / target.totalDays) * 100);
  };

  return (
    <div className="min-h-screen bg-black text-[#E2E2E2]">
      <TopAppBar variant="title" title="Targets" />

      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-20">
        {!activeTarget ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-24 w-24 rounded-full bg-[#4F44E2]/10 border border-[#4F44E2]/20 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-[#4F44E2]">
                flag
              </span>
            </div>
            <h2 className="text-xl font-bold mb-2">No Active Targets</h2>
            <p className="text-[#464555] max-w-sm mb-8">
              Start a new learning journey today. Set a duration and daily plan
              to stay on track.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#E2E2E2] text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Initialize New Target
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Header: Progress Ring */}
            <section className="flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-[#0A0A0A] p-8 rounded-2xl border border-[#464555]/15">
              <div className="relative flex items-center justify-center">
                <svg
                  className="h-40 w-40 sm:h-48 sm:w-48 -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    className="text-[#141414]"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <motion.circle
                    initial={{ strokeDashoffset: 282.7 }}
                    animate={{
                      strokeDashoffset:
                        282.7 -
                        (calculatePercentage(activeTarget) / 100) * 282.7,
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-[#4F44E2] drop-shadow-[0_0_8px_rgba(79,68,226,0.6)]"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="282.7"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-headline font-black text-white">
                    {calculatePercentage(activeTarget)}%
                  </span>
                  <span className="text-[8px] sm:text-[10px] font-bold text-[#464555] uppercase tracking-widest">
                    Completion
                  </span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <span className="material-symbols-outlined text-[#4F44E2] text-sm">
                      flag
                    </span>
                    <span className="text-[10px] font-bold text-[#464555] uppercase tracking-widest">
                      Active Pursuit
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-headline font-black tracking-tight text-white uppercase italic">
                    {activeTarget.title}
                  </h1>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                  <div>
                    <p className="text-[8px] font-black text-[#464555] uppercase tracking-widest mb-1">
                      Daily Step
                    </p>
                    <p className="text-lg font-bold text-[#E2E2E2]">
                      Day {activeTarget.completedDays.length + 1}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-[#464555] uppercase tracking-widest mb-1">
                      Total Cycle
                    </p>
                    <p className="text-lg font-bold text-[#E2E2E2]">
                      {activeTarget.totalDays} Days
                    </p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-[8px] font-black text-[#464555] uppercase tracking-widest mb-1">
                      Status
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-sm font-bold text-green-500 uppercase tracking-widest">
                        Ongoing
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 justify-center md:justify-start">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    New Target
                  </button>
                  <button
                    onClick={() => removeTarget(activeTarget.id)}
                    className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    Abandon Target
                  </button>
                </div>
              </div>
            </section>

            {/* Plan Timeline */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#464555]">
                  Operational Timeline
                </h2>
                <span className="text-[10px] font-bold text-[#464555] italic">
                  {calculatePercentage(activeTarget)}% Synced
                </span>
              </div>

              <div className="space-y-4 relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-4 bottom-4 w-px bg-linear-to-b from-[#4F44E2]/40 via-[#4F44E2]/20 to-transparent z-0" />

                {activeTarget.plan.map((step) => {
                  const isCompleted = activeTarget.completedDays.includes(
                    step.day - 1,
                  );
                  const isNextStep =
                    !isCompleted &&
                    activeTarget.completedDays.length === step.day - 1;

                  return (
                    <motion.button
                      key={step.day}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      onClick={() => toggleDayCompletion(activeTarget.id, step)}
                      className={cn(
                        "w-full flex items-start gap-6 p-4 rounded-xl border transition-all text-left relative z-10",
                        isCompleted
                          ? "bg-[#0A0A0A]/40 border-white/5 opacity-50"
                          : isNextStep
                            ? "bg-[#4F44E2]/5 border-[#4F44E2]/30 shadow-[0_0_30px_rgba(79,68,226,0.05)]"
                            : "bg-black border-white/5",
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center transition-all",
                          isCompleted
                            ? "bg-[#4F44E2] border-[#4F44E2]"
                            : isNextStep
                              ? "border-[#4F44E2] animate-pulse"
                              : "border-[#464555]/40",
                        )}
                      >
                        {isCompleted && (
                          <span className="material-symbols-outlined text-[10px] text-white font-black">
                            check
                          </span>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              isCompleted
                                ? "text-[#464555]"
                                : isNextStep
                                  ? "text-[#4F44E2]"
                                  : "text-[#8E8D99]",
                            )}
                          >
                            Day {step.day}
                          </p>
                        </div>
                        <h3
                          className={cn(
                            "text-base font-bold",
                            isCompleted
                              ? "text-[#464555] line-through"
                              : "text-[#E2E2E2]",
                          )}
                        >
                          {step.title}
                        </h3>
                        <p className="text-xs text-[#464555] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Target Genesis Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="TARGET GENESIS"
        className="max-w-xl"
      >
        <div className="space-y-8">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#464555] block mb-3">
                Objective Designation
              </label>
              <input
                type="text"
                value={newTargetTitle}
                onChange={(e) => setNewTargetTitle(e.target.value)}
                placeholder="e.g. AI/ML Mastery"
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-5 py-4 font-bold text-white placeholder:text-[#464555] focus:border-[#4F44E2] focus:ring-1 focus:ring-[#4F44E2] outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#464555] block mb-3">
                  Time Horizon (Days)
                </label>
                <input
                  type="number"
                  value={newTargetDays}
                  onChange={(e) => setNewTargetDays(Number(e.target.value))}
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-5 py-4 font-bold text-white focus:border-[#4F44E2] outline-none transition-all"
                />
              </div>
              <div className="flex items-end">
                <div className="w-full p-4 rounded-xl bg-[#4F44E2]/10 border border-[#4F44E2]/20 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[#4F44E2] text-sm">
                    schedule
                  </span>
                  <p className="text-[10px] font-black uppercase text-[#4F44E2]">
                    Auto-Seq Enabled
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#464555] block mb-3">
                Strategic Blueprint (Paste Plan)
              </label>
              <textarea
                value={newTargetPlan}
                onChange={(e) => setNewTargetPlan(e.target.value)}
                placeholder="Day 1: Intro to Linear Algebra&#10;Day 2: Calculus for Data Science&#10;Day 3: Statistics Foundations..."
                rows={6}
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-5 py-4 font-bold text-white placeholder:text-[#464555] focus:border-[#4F44E2] outline-none transition-all resize-none"
              />
              <p className="text-[8px] font-bold text-[#464555] uppercase mt-2 italic px-1">
                Tip: Each newline designates a specific day objective.
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateTarget}
            disabled={!newTargetTitle}
            className="w-full bg-white text-black py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all hover:bg-white/90 active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            Execute Target Initialization
          </button>
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}
