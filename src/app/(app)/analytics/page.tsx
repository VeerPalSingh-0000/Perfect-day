"use client";

import React, { useState, useMemo } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AnalyticsPage() {
  const records = useDataStore((s) => s.records);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDayRecord, setSelectedDayRecord] = useState<
    (typeof records)[0] | null
  >(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- Core Stats ---
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

  // Streak Calculation
  const { streak, longestStreak } = useMemo(() => {
    if (records.length === 0) return { streak: 0, longestStreak: 0 };

    // Current Streak
    let current = 0;
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
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        checking = false;
      }
    }

    // Longest Streak Ever
    const sortedDates = [...new Set(records.map((r) => r.date))].sort();
    let max = 0;
    let temp = 0;
    let lastDate: Date | null = null;

    sortedDates.forEach((dateStr) => {
      const d = new Date(dateStr);
      const rec = records.find((r) => r.date === dateStr);
      const isSuccessful = rec && rec.completionPercentage >= 80;

      if (isSuccessful) {
        if (lastDate) {
          const diff = (d.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
          if (diff === 1) {
            temp++;
          } else {
            temp = 1;
          }
        } else {
          temp = 1;
        }
        if (temp > max) max = temp;
        lastDate = d;
      } else {
        temp = 0;
        lastDate = null;
      }
    });

    return { streak: current, longestStreak: max };
  }, [records, today]);

  // Weekly chart data
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

  // Trend & Category Breakdown
  const { trend, weeklyCompare, categoryStats, bestDay, topHabit } =
    useMemo(() => {
      // Trend
      const fifteenDaysAgo = new Date(today);
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recent = records.filter(
        (r) => r.date > fifteenDaysAgo.toLocaleDateString("en-CA"),
      );
      const older = records.filter(
        (r) =>
          r.date <= fifteenDaysAgo.toLocaleDateString("en-CA") &&
          r.date > thirtyDaysAgo.toLocaleDateString("en-CA"),
      );
      const recentAvg = recent.length
        ? recent.reduce((a, b) => a + b.completionPercentage, 0) / recent.length
        : 0;
      const olderAvg = older.length
        ? older.reduce((a, b) => a + b.completionPercentage, 0) / older.length
        : 0;
      const tDiff = Math.round(recentAvg - olderAvg);

      // Weekly Compare
      const thisWeekAvg = weeklyData.reduce((a, b) => a + b.completion, 0) / 7;
      const lastWeekRecs = records.filter((r) => {
        const d = new Date(r.date);
        const diff = (today.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diff > 7 && diff <= 14;
      });
      const lastWeekAvg = lastWeekRecs.length
        ? lastWeekRecs.reduce((a, b) => a + b.completionPercentage, 0) / 7
        : 0;
      const wDiff = Math.round(thisWeekAvg - lastWeekAvg);

      // Categories
      const catCounts: Record<string, number> = {};
      let catTotal = 0;
      records.forEach((r) =>
        r.tasks.forEach((t) => {
          if (t.isCompleted) {
            catCounts[t.category] = (catCounts[t.category] || 0) + 1;
            catTotal++;
          }
        }),
      );
      const cStats = Object.entries(catCounts)
        .map(([name, count]) => ({
          name,
          percentage: catTotal > 0 ? Math.round((count / catTotal) * 100) : 0,
        }))
        .sort((a, b) => b.percentage - a.percentage);

      // Best Day & Top Habit
      const bestDayRec = weeklyData.reduce(
        (prev, curr) => (curr.completion > prev.completion ? curr : prev),
        weeklyData[0],
      );
      const topHabitStr = cStats.length > 0 ? cStats[0].name : "None";

      return {
        trend: { val: tDiff, isUp: tDiff >= 0 },
        weeklyCompare: { val: wDiff, isUp: wDiff >= 0 },
        categoryStats: cStats,
        bestDay: bestDayRec,
        topHabit: topHabitStr,
      };
    }, [records, today, weeklyData]);

  const handleShare = () => {
    const text =
      `I had a ${streak > 0 ? `${streak}-day streak` : "great day"} on SIRA! 🔥\n` +
      `Avg completion this week: ${avgCompletion}%\n` +
      `Perfect Days: ${perfectDaysCount} 🌟\n` +
      `Join me on SIRA and build your perfect routine.`;

    if (navigator.share) {
      navigator
        .share({
          title: "My SIRA Stats",
          text: text,
          url: window.location.origin,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert("Stats copied to clipboard! Share them with your friends. 🚀");
    }
  };

  // Last 30 days ratings
  const thirtyDaysAgoStr = new Date(
    new Date().setDate(new Date().getDate() - 30),
  ).toLocaleDateString("en-CA");
  const last30Records = records.filter((r) => r.date >= thirtyDaysAgoStr);
  const ratingsCount = {
    perfect: last30Records.filter((r) => r.rating === "perfect").length,
    great: last30Records.filter((r) => r.rating === "great").length,
    good: last30Records.filter((r) => r.rating === "good").length,
    okay: last30Records.filter((r) => r.rating === "okay").length,
    rough: last30Records.filter((r) => r.rating === "rough").length,
    none: Math.max(0, 30 - last30Records.length),
  };

  // Monthly heatmap pagination
  const handlePrevMonth = () =>
    setCurrentMonthDate((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setCurrentMonthDate((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));
  const monthName = currentMonthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const calendarDays: (Date | null)[] = [];
  const firstDay = new Date(year, month, 1);
  for (let i = 0; i < firstDay.getDay(); i++) calendarDays.push(null);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++)
    calendarDays.push(new Date(year, month, i));

  return (
    <div className="min-h-screen bg-black text-[#E2E2E2]">
      <TopAppBar variant="brand" />
      <main className="mx-auto w-full max-w-2xl space-y-6 sm:space-y-8 px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-4">
        {/* Share Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-2xl sm:text-3xl font-black tracking-tighter text-[#E2E2E2] uppercase">
              Insights
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#464555]">
              Your performance landscape
            </p>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full border border-[#C4C0FF]/20 bg-[#C4C0FF]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#C4C0FF] hover:bg-[#C4C0FF]/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">share</span>
            <span>Share Success</span>
          </button>
        </div>
        {/* 2×2 Core Stats */}
        <section className="grid grid-cols-2 gap-2 sm:gap-4">
          {/* Trend & Avg */}
          <div className="flex h-24 sm:h-32 flex-col justify-between rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[rgba(14,14,14,0.8)] p-3 sm:p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all hover:bg-[#111111]">
            <div className="flex items-start justify-between gap-2">
              <span className="font-headline text-2xl sm:text-3xl font-extrabold text-[#E2E2E2]">
                {avgCompletion}%
              </span>
              <span className="material-symbols-outlined text-xs sm:text-base opacity-50 text-[#E2E2E2]">
                trending_up
              </span>
            </div>
            <div className="flex flex-col">
              <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#8E8D99]">
                Avg. Completion
              </p>
              <span
                className={`text-[7px] font-bold mt-0.5 ${trend.isUp ? "text-[#C4C0FF]" : "text-[#464555]"}`}
              >
                {trend.isUp ? "↑" : "↓"} {Math.abs(trend.val)}% vs last month
              </span>
            </div>
          </div>

          {/* Streak Details */}
          <div className="flex h-24 sm:h-32 flex-col justify-between rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[rgba(14,14,14,0.8)] p-3 sm:p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all hover:bg-[#111111]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-headline text-2xl sm:text-3xl font-extrabold text-[#E2E2E2]">
                  {streak}
                </span>
                <span className="ml-2 text-[10px] font-bold text-[#8E8D99]">
                  / {longestStreak}
                </span>
              </div>
              <span
                className="material-symbols-outlined text-xs sm:text-base opacity-50 text-[#E2E2E2]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
            <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#8E8D99]">
              Streak (Current / Best)
            </p>
          </div>

          {/* Perfect Days */}
          <div className="flex h-24 sm:h-32 flex-col justify-between rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[rgba(14,14,14,0.8)] p-3 sm:p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all hover:bg-[#111111]">
            <div className="flex items-start justify-between gap-2">
              <span className="font-headline text-2xl sm:text-3xl font-extrabold text-[#E2E2E2]">
                {perfectDaysCount}
              </span>
              <span
                className="material-symbols-outlined text-xs sm:text-base opacity-50 text-[#E2E2E2]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            </div>
            <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#8E8D99]">
              Perfect Days
            </p>
          </div>

          {/* Lifetime Tasks */}
          <div className="flex h-24 sm:h-32 flex-col justify-between rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[rgba(14,14,14,0.8)] p-3 sm:p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all hover:bg-[#111111]">
            <div className="flex items-start justify-between gap-2">
              <span className="font-headline text-2xl sm:text-3xl font-extrabold text-[#E2E2E2]">
                {totalTasksDone}
              </span>
              <span className="material-symbols-outlined text-xs sm:text-base opacity-50 text-[#E2E2E2]">
                task_alt
              </span>
            </div>
            <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#8E8D99]">
              Total Tasks Done
            </p>
          </div>
        </section>

        {/* Weekly Chart & Comparison */}
        <section className="rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[rgba(14,14,14,0.8)] p-4 sm:p-8">
          <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex flex-col">
              <h3 className="font-headline text-xs sm:text-sm font-bold uppercase tracking-widest">
                Weekly Completion
              </h3>
              <span
                className={`text-[8px] font-bold uppercase ${weeklyCompare.isUp ? "text-[#C4C0FF]" : "text-[#464555]"}`}
              >
                {weeklyCompare.isUp ? "↑" : "↓"} {Math.abs(weeklyCompare.val)}%
                vs last week
              </span>
            </div>
            <span className="text-[8px] sm:text-[10px] font-medium text-[#8E8D99] tracking-normal">
              {weekStartStr} - {weekEndStr}
            </span>
          </div>
          <div className="flex h-32 sm:h-48 items-end justify-between gap-2 sm:gap-3">
            {weeklyData.map((d, i) => (
              <div
                key={i}
                className="flex flex-1 flex-col items-center gap-2 sm:gap-3"
              >
                <div className="relative h-24 sm:h-32 w-full overflow-hidden rounded-md bg-[#111111]">
                  <div
                    className="absolute bottom-0 w-full rounded-t-sm bg-white shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-1000 delay-100"
                    style={{ height: `${d.completion}%` }}
                  />
                </div>
                <span
                  className={`text-[7px] sm:text-[10px] font-bold ${i === 6 ? "text-[#E2E2E2]" : "text-[#464555]"}`}
                >
                  {d.dayShort}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 3C. Weekly Summary Report Card */}
        <section className="rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-linear-to-br from-[#0E0E0E] to-[#151515] p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-8xl">
              assessment
            </span>
          </div>
          <h3 className="mb-6 font-headline text-xs sm:text-sm font-bold uppercase tracking-widest text-[#C4C0FF]">
            Weekly Report Summary
          </h3>

          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#464555]">
                Best Day
              </span>
              <p className="font-bold text-sm text-white">
                {bestDay.dayShort} • {bestDay.completion}%
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#464555]">
                Top Habit
              </span>
              <p className="font-bold text-sm text-white uppercase">
                {topHabit}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#464555]">
                Weekly Delta
              </span>
              <p
                className={`font-bold text-sm ${weeklyCompare.isUp ? "text-[#E2E2E2]" : "text-[#8E8D99]"}`}
              >
                {weeklyCompare.isUp ? "+" : ""}
                {weeklyCompare.val}%{" "}
                <span className="text-[10px] text-[#464555] ml-1">
                  vs last week
                </span>
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#464555]">
                Performance
              </span>
              <p className="font-bold text-sm text-white">Consistent</p>
            </div>
          </div>
        </section>

        {/* Category Breakdown (Donut-style visualization) */}
        <section className="rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[rgba(14,14,14,0.8)] p-4 sm:p-8">
          <h3 className="mb-6 font-headline text-xs sm:text-sm font-bold uppercase tracking-widest">
            Category Allocation
          </h3>
          <div className="space-y-4">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-[#464555] text-center">
                No task data available.
              </p>
            ) : (
              categoryStats.map((cat, i) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-[#E2E2E2]">{cat.name}</span>
                    <span className="text-[#8E8D99]">{cat.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#111111] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor:
                          i === 0
                            ? "#E2E2E2"
                            : i === 1
                              ? "#C4C0FF"
                              : i === 2
                                ? "#4F44E2"
                                : i === 3
                                  ? "#464555"
                                  : "#1A1A1A",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
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
              className="h-full bg-[#7cf6ec] transition-all duration-1000"
              style={{ width: `${(ratingsCount.perfect / 30) * 100}%` }}
            />
            <div
              className="h-full bg-[#C4C0FF] transition-all duration-1000"
              style={{ width: `${(ratingsCount.great / 30) * 100}%` }}
            />
            <div
              className="h-full bg-[#4F44E2] transition-all duration-1000"
              style={{ width: `${(ratingsCount.good / 30) * 100}%` }}
            />
            <div
              className="h-full bg-[#FFB86C] transition-all duration-1000"
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
              [`Perfect (${ratingsCount.perfect})`, "bg-[#7cf6ec]"],
              [`Great (${ratingsCount.great})`, "bg-[#C4C0FF]"],
              [`Good (${ratingsCount.good})`, "bg-[#4F44E2]"],
              [`Okay (${ratingsCount.okay})`, "bg-[#FFB86C]"],
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
              let colorClass = "bg-[#111111] border border-[#2A2A2A]";
              if (record) {
                if (record.rating === "perfect")
                  colorClass =
                    "bg-[#7cf6ec] shadow-[0_0_10px_rgba(124,246,236,0.3)]";
                else if (record.rating === "great") colorClass = "bg-[#C4C0FF]";
                else if (record.rating === "good") colorClass = "bg-[#4F44E2]";
                else if (record.rating === "okay") colorClass = "bg-[#FFB86C]";
                else colorClass = "bg-[#464555]";
              }
              const isToday =
                dateObj.toLocaleDateString("en-CA") ===
                new Date().toLocaleDateString("en-CA");
              if (isToday)
                colorClass +=
                  " outline outline-1 outline-offset-1 outline-white/30";
              return (
                <div
                  key={dateStr}
                  title={dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  onClick={() => record && setSelectedDayRecord(record)}
                  className={`h-2.5 sm:h-3.5 w-2.5 sm:w-3.5 rounded-sm ${colorClass} transition-all cursor-pointer hover:scale-125 active:scale-95`}
                />
              );
            })}
          </div>

          {/* Tap detail area */}
          {selectedDayRecord && (
            <div className="mt-8 rounded-lg border border-[rgba(70,69,85,0.2)] bg-[#111111]/80 p-4 animate-fade-in shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8E8D99]">
                    Selected Audit
                  </span>
                  <span className="text-sm font-bold text-[#E2E2E2]">
                    {new Date(selectedDayRecord.date).toLocaleDateString(
                      undefined,
                      { month: "long", day: "numeric", year: "numeric" },
                    )}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDayRecord(null)}
                  className="text-[#464555] hover:text-[#E2E2E2] transition-colors rounded-full p-1 bg-black"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>
              </div>
              <div className="space-y-2">
                {selectedDayRecord.tasks.length === 0 ? (
                  <p className="text-center text-xs text-[#464555] py-2">
                    No tasks recorded.
                  </p>
                ) : (
                  selectedDayRecord.tasks.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-1">
                      <span
                        className={`material-symbols-outlined text-sm ${t.isCompleted ? "text-[#E2E2E2]" : "text-[#464555]"}`}
                      >
                        {t.isCompleted ? "check_circle" : "circle"}
                      </span>
                      <span
                        className={`text-xs ${t.isCompleted ? "text-[#E2E2E2]" : "text-[#464555] line-through"}`}
                      >
                        {t.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-6 text-[7px] sm:text-[9px] font-bold uppercase tracking-widest text-[#8E8D99]">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-2 w-2 rounded-[2px] bg-[#7cf6ec]" /> Perfect
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-2 w-2 rounded-[2px] bg-[#C4C0FF]" /> Great
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-2 w-2 rounded-[2px] bg-[#4F44E2]" /> Good
            </div>
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
