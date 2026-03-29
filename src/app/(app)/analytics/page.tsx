"use client";

import React, { useState } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AnalyticsPage() {
  const records = useDataStore((s) => s.records);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- Stats (all computed from in-memory data) ---
  const totalTasksDone = records.reduce((acc, r) => acc + r.completedTasks, 0);
  const perfectDaysCount = records.filter(
    (r) => r.completionPercentage === 100,
  ).length;
  const avgCompletion =
    records.length > 0
      ? Math.round(
          records.reduce((acc, r) => acc + r.completionPercentage, 0) /
            records.length,
        )
      : 0;

  // Streak
  let streak = 0;
  const checkDate = new Date(today);
  const todayStr = checkDate.toLocaleDateString("en-CA");
  if (
    !records.find((r) => r.date === todayStr && r.completionPercentage >= 80)
  ) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  let checking = true;
  while (checking) {
    const dateStr = checkDate.toLocaleDateString("en-CA");
    const rec = records.find((r) => r.date === dateStr);
    if (rec && rec.completionPercentage >= 80) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checking = false;
    }
  }

  // Weekly chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const weeklyData = last7Days.map((date) => {
    const rec = records.find(
      (r) => r.date === date.toLocaleDateString("en-CA"),
    );
    return {
      date,
      dayShort: date
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase(),
      completion: rec ? rec.completionPercentage : 0,
    };
  });
  const weekStartStr = last7Days[0].toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
  const weekEndStr = last7Days[6].toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });

  // Last 30 days ratings
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toLocaleDateString("en-CA");
  const last30Records = records.filter((r) => r.date >= thirtyDaysAgoStr);
  const ratingsCount = {
    perfect: last30Records.filter((r) => r.rating === "perfect").length,
    great: last30Records.filter((r) => r.rating === "great").length,
    good: last30Records.filter((r) => r.rating === "good").length,
    okay: last30Records.filter((r) => r.rating === "okay").length,
    rough: last30Records.filter((r) => r.rating === "rough").length,
    none: Math.max(0, 30 - last30Records.length),
  };

  // Monthly heatmap
  const handlePrevMonth = () =>
    setCurrentMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  const handleNextMonth = () =>
    setCurrentMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  const monthName = currentMonthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++)
    calendarDays.push(new Date(year, month, i));

  return (
    <div className="min-h-screen bg-black text-[#E2E2E2]">
      <TopAppBar variant="brand" />
      <main className="mx-auto w-full max-w-2xl space-y-6 sm:space-y-8 px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-4">
        {/* 2×2 Stats */}
        <section className="grid grid-cols-2 gap-2 sm:gap-4">
          {[
            [
              `${avgCompletion}%`,
              "trending_up",
              "text-[#C4C0FF] text-glow",
              "Avg. Completion",
            ],
            [
              `${streak}`,
              "local_fire_department",
              "text-[#ff9dd0]",
              "Current Streak",
            ],
            [`${perfectDaysCount}`, "star", "text-[#7cf6ec]", "Perfect Days"],
            [
              `${totalTasksDone}`,
              "task_alt",
              "text-[#E2E2E2]",
              "Total Tasks Done",
            ],
          ].map((item) => (
            <div
              key={item[3]}
              className="flex h-24 sm:h-32 flex-col justify-between rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[rgba(14,14,14,0.8)] p-3 sm:p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`font-headline text-2xl sm:text-3xl font-extrabold ${item[2]}`}
                >
                  {item[0]}
                </span>
                <span
                  className="material-symbols-outlined text-xs sm:text-base shrink-0 opacity-80"
                  style={
                    item[1] === "local_fire_department" || item[1] === "star"
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {item[1]}
                </span>
              </div>
              <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#8E8D99]">
                {item[3]}
              </p>
            </div>
          ))}
        </section>

        {/* Weekly Chart */}
        <section className="rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[rgba(14,14,14,0.8)] p-4 sm:p-8">
          <h3 className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 font-headline text-xs sm:text-sm font-bold uppercase tracking-widest">
            Weekly Completion
            <span className="text-[8px] sm:text-[10px] font-medium text-[#8E8D99] tracking-normal">
              {weekStartStr} - {weekEndStr}
            </span>
          </h3>
          <div className="flex h-32 sm:h-48 items-end justify-between gap-2 sm:gap-3">
            {weeklyData.map((d, i) => (
              <div
                key={i}
                className="flex flex-1 flex-col items-center gap-2 sm:gap-3"
              >
                <div className="relative h-24 sm:h-32 w-full overflow-hidden rounded-full bg-[#111111]">
                  <div
                    className="absolute bottom-0 w-full rounded-t-full bg-[linear-gradient(180deg,#C4C0FF_0%,#7cf6ec_100%)] shadow-[0_0_15px_rgba(196,192,255,0.2)] transition-all duration-1000 delay-100"
                    style={{ height: `${d.completion}%` }}
                  />
                </div>
                <span
                  className={`text-[7px] sm:text-[10px] font-bold ${i === 6 ? "text-[#E2E2E2]" : "text-[#8E8D99]"}`}
                >
                  {d.dayShort}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Day Ratings */}
        <section className="rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[rgba(14,14,14,0.8)] p-4 sm:p-8">
          <h3 className="mb-6 font-headline text-xs sm:text-sm font-bold uppercase tracking-widest flex justify-between">
            Day Ratings
            <span className="text-[8px] sm:text-[10px] font-medium text-[#8E8D99] tracking-normal normal-case">
              Last 30 Days
            </span>
          </h3>
          <div className="mb-6 sm:mb-8 flex h-3 sm:h-4 w-full overflow-hidden rounded-full bg-[#111111]">
            <div
              className="h-full bg-[#ff9dd0] transition-all duration-1000"
              style={{ width: `${(ratingsCount.perfect / 30) * 100}%` }}
            />
            <div
              className="h-full bg-[#7cf6ec] transition-all duration-1000"
              style={{ width: `${(ratingsCount.great / 30) * 100}%` }}
            />
            <div
              className="h-full bg-[#C4C0FF] transition-all duration-1000"
              style={{ width: `${(ratingsCount.good / 30) * 100}%` }}
            />
            <div
              className="h-full bg-orange-400 transition-all duration-1000"
              style={{ width: `${(ratingsCount.okay / 30) * 100}%` }}
            />
            <div
              className="h-full bg-[#464555] transition-all duration-1000"
              style={{
                width: `${((ratingsCount.rough + ratingsCount.none) / 30) * 100}%`,
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-y-3 sm:gap-y-4">
            {[
              [
                `Perfect (${ratingsCount.perfect})`,
                "bg-[#ff9dd0] shadow-[0_0_8px_#ff9dd0]",
              ],
              [
                `Great (${ratingsCount.great})`,
                "bg-[#7cf6ec] shadow-[0_0_8px_#7cf6ec]",
              ],
              [
                `Good (${ratingsCount.good})`,
                "bg-[#C4C0FF] shadow-[0_0_8px_#a8a4ff]",
              ],
              [`Okay (${ratingsCount.okay})`, "bg-orange-400"],
              [
                `Rough (${ratingsCount.rough + ratingsCount.none})`,
                "bg-[#464555]",
              ],
            ].map((item) => (
              <div
                key={item[0] as string}
                className="flex items-center gap-2 sm:gap-3"
              >
                <div
                  className={`h-2 sm:h-2.5 w-2 sm:w-2.5 rounded-full ${item[1]}`}
                />
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">
                  {item[0]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Monthly Heatmap */}
        <section className="rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[rgba(14,14,14,0.8)] p-4 sm:p-8">
          <div className="mb-6 sm:mb-8 flex items-center justify-between">
            <h3 className="font-headline text-xs sm:text-sm font-bold uppercase tracking-widest">
              {monthName}
            </h3>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={handlePrevMonth}
                className="rounded-lg p-1 sm:p-2 text-[#E2E2E2] transition-colors duration-300 hover:bg-white/5 active:bg-white/10"
              >
                <span className="material-symbols-outlined text-sm sm:text-lg">
                  chevron_left
                </span>
              </button>
              <button
                onClick={handleNextMonth}
                disabled={
                  currentMonthDate.getMonth() === new Date().getMonth() &&
                  currentMonthDate.getFullYear() === new Date().getFullYear()
                }
                className="rounded-lg p-1 sm:p-2 text-[#E2E2E2] transition-colors duration-300 hover:bg-white/5 active:bg-white/10 disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-sm sm:text-lg">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 justify-items-center gap-y-3 sm:gap-y-6">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span
                key={i}
                className="text-[8px] sm:text-[10px] font-bold text-[#8E8D99]"
              >
                {d}
              </span>
            ))}
            {calendarDays.map((dateObj, i) => {
              if (!dateObj)
                return (
                  <div
                    key={`empty-${i}`}
                    className="h-2.5 sm:h-3.5 w-2.5 sm:w-3.5"
                  />
                );
              const dateStr = dateObj.toLocaleDateString("en-CA");
              const record = records.find((r) => r.date === dateStr);
              let colorClass = "bg-[#111111]";
              if (record) {
                if (record.rating === "perfect")
                  colorClass = "bg-[#ff9dd0] shadow-[0_0_8px_#ff9dd0]";
                else if (record.rating === "great")
                  colorClass = "bg-[#7cf6ec] shadow-[0_0_8px_#7cf6ec]";
                else if (record.rating === "good") colorClass = "bg-[#C4C0FF]";
                else if (record.rating === "okay") colorClass = "bg-orange-400";
                else colorClass = "bg-[#464555]";
              }
              const isToday =
                dateObj.toLocaleDateString("en-CA") ===
                new Date().toLocaleDateString("en-CA");
              if (isToday)
                colorClass +=
                  " outline outline-1 outline-offset-1 outline-white/50";
              return (
                <div
                  key={dateStr}
                  title={dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  className={`h-2.5 sm:h-3.5 w-2.5 sm:w-3.5 rounded-full ${colorClass} transition-colors cursor-help`}
                />
              );
            })}
          </div>
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-6 text-[7px] sm:text-[9px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-2 w-2 rounded-full bg-[#ff9dd0]" /> Perfect
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-2 w-2 rounded-full bg-[#7cf6ec]" /> Great
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-2 w-2 rounded-full bg-[#C4C0FF]" /> Good
            </div>
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
