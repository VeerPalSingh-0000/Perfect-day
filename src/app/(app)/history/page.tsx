"use client";

import React, { useState, useMemo } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function HistoryPage() {
  const records = useDataStore((s) => s.records);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedDate, setExpandedDate] = useState<string | null>(
    new Date().toLocaleDateString("en-CA"),
  );

  const availableMonths = useMemo(() => {
    const map = new Map<
      string,
      { month: number; year: number; label: string }
    >();
    if (records.length === 0) {
      const d = new Date();
      return [
        {
          month: d.getMonth(),
          year: d.getFullYear(),
          label: d.toLocaleDateString("en-US", { month: "short" }),
        },
      ];
    }
    records.forEach((r) => {
      const [y, m] = r.date.split("-");
      const key = `${y}-${m}`;
      if (!map.has(key)) {
        const d = new Date(parseInt(y), parseInt(m) - 1, 1);
        map.set(key, {
          month: parseInt(m) - 1,
          year: parseInt(y),
          label: d.toLocaleDateString("en-US", { month: "short" }),
        });
      }
    });
    return Array.from(map.values()).reverse();
  }, [records]);

  const filteredRecords = records.filter((r) => {
    const [y, m] = r.date.split("-");
    return parseInt(y) === selectedYear && parseInt(m) - 1 === selectedMonth;
  });

  return (
    <div className="min-h-screen bg-black text-[#E2E2E2]">
      <TopAppBar variant="brand" />
      <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-4">
        <div className="mb-6 sm:mb-10">
          <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold tracking-tighter text-[#E2E2E2]">
            History
          </h2>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium uppercase tracking-widest text-[#464555]">
            Performance Log
          </p>
        </div>

        <div className="no-scrollbar mb-8 sm:mb-12 flex gap-2 overflow-x-auto pb-2">
          {availableMonths.map((m) => {
            const isActive =
              m.month === selectedMonth && m.year === selectedYear;
            return (
              <button
                key={`${m.year}-${m.month}`}
                onClick={() => {
                  setSelectedMonth(m.month);
                  setSelectedYear(m.year);
                }}
                className={`rounded-full px-3 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs uppercase tracking-widest shrink-0 transition-colors ${isActive ? "bg-white font-black text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]" : "border border-[#464555]/30 font-bold text-[#464555] hover:border-white/20"}`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          {filteredRecords.length === 0 && (
            <div className="p-8 text-center text-[#464555] font-medium text-sm">
              No data recorded for this month.
            </div>
          )}
          {filteredRecords.map((record) => {
            const [y, m, d] = record.date.split("-");
            const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
            const dayNumStr = d.padStart(2, "0");
            const dayNameStr = dateObj.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const isExpanded = expandedDate === record.date;

            let ratingLabel = "Neutral";
            let colorClassText = "text-[#464555]";
            let colorClassCircle = "text-[#464555]";
            let containerClass =
              "bg-[#0E0E0E] hover:bg-[#161616] border-[rgba(70,69,85,0.15)]";

            if (record.rating === "perfect") {
              ratingLabel = "Perfect Day";
              colorClassText = "text-white";
              colorClassCircle = "text-[#E2E2E2]";
              containerClass = "bg-[#0E0E0E] hover:bg-[#161616] border-white/5";
            } else if (record.rating === "great") {
              ratingLabel = "High Output";
              colorClassText = "text-white";
              colorClassCircle = "text-[#4F44E2]";
              containerClass = isExpanded
                ? "bg-[#0E0E0E] border-white/10 shadow-[0_0_20px_rgba(79,68,226,0.15)]"
                : "bg-[#0E0E0E] hover:bg-[#161616] border-white/5";
            } else if (record.rating === "good") {
              ratingLabel = "Standard";
            } else if (record.rating === "okay") {
              ratingLabel = "Moderate";
            } else {
              ratingLabel = "Light";
            }

            return (
              <div
                key={record.id}
                onClick={() => setExpandedDate(isExpanded ? null : record.date)}
                className={`rounded-lg border p-4 sm:p-6 transition-all cursor-pointer ${containerClass}`}
              >
                <div
                  className={`flex items-center justify-between ${isExpanded ? "mb-6 sm:mb-8" : ""}`}
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex min-w-12 flex-col">
                      <span className="text-base sm:text-lg font-bold text-[#E2E2E2] whitespace-nowrap">
                        {dateObj.toLocaleDateString("en-US", {
                          month: "short",
                        })}{" "}
                        {dayNumStr}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#464555]">
                        {dayNameStr}
                      </span>
                    </div>
                    <div className="h-10 w-px bg-[#464555]/20" />
                    <div className="flex flex-col">
                      <span
                        className={`text-xs sm:text-sm font-bold uppercase tracking-tight ${colorClassText}`}
                      >
                        {ratingLabel}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#464555]">
                        {record.completedTasks}/{record.totalTasks} Task
                        Clearance
                      </span>
                    </div>
                  </div>
                  <div
                    className={`relative flex items-center justify-center shrink-0 ${isExpanded ? "h-14 w-14" : "h-10 sm:h-12 w-10 sm:w-12"}`}
                  >
                    <svg
                      className="h-full w-full -rotate-90"
                      viewBox="0 0 56 56"
                    >
                      <circle
                        className="text-[#464555]/20"
                        cx="28"
                        cy="28"
                        r="24"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle
                        className={colorClassCircle}
                        cx="28"
                        cy="28"
                        r="24"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="150.7"
                        strokeDashoffset={
                          150.7 * (1 - record.completionPercentage / 100)
                        }
                        strokeLinecap="round"
                      />
                    </svg>
                    <span
                      className={`absolute font-black ${colorClassText} text-[10px] sm:text-xs`}
                    >
                      {record.completionPercentage}
                    </span>
                  </div>
                </div>
                {isExpanded && record.tasks && record.tasks.length > 0 && (
                  <div className="space-y-4 border-t border-[#464555]/15 pt-6 mt-6">
                    {record.tasks.map((task, idx) => {
                      const done = task.isCompleted;
                      const timeStr =
                        done && task.completedAt
                          ? new Date(task.completedAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              },
                            )
                          : !done
                            ? "Miss"
                            : "Done";
                      return (
                        <div
                          key={task.id || idx}
                          className={`group flex items-center justify-between ${!done ? "opacity-40" : ""}`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${done ? "border-[#4F44E2] text-[#4F44E2]" : "border-[#464555]"}`}
                            >
                              {done && (
                                <span
                                  className="material-symbols-outlined text-xs"
                                  style={{
                                    fontVariationSettings: "'wght' 700",
                                  }}
                                >
                                  check
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-sm font-medium ${done ? "text-[#E2E2E2]" : "text-[#464555] line-through"}`}
                            >
                              {task.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#464555]">
                            {timeStr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
