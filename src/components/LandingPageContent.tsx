"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const FEATURES = [
  {
    icon: "task_alt",
    title: "Smart Task Management",
    desc: "Add, complete, and organize daily tasks with a sleek, distraction-free interface.",
  },
  {
    icon: "event_repeat",
    title: "Habit Engine",
    desc: "Set habits with flexible frequencies — daily, weekdays, alternate days, and more.",
  },
  {
    icon: "bar_chart",
    title: "Beautiful Analytics",
    desc: "Weekly charts, monthly heatmaps, and performance breakdowns to visualize your growth.",
  },
  {
    icon: "local_fire_department",
    title: "Streak Tracking",
    desc: "Stay motivated with streak counters and perfect day tracking for unbreakable consistency.",
  },
  {
    icon: "star",
    title: "Day Ratings",
    desc: "Every day is rated automatically — Perfect, Great, Good, or Rough. See patterns emerge.",
  },
  {
    icon: "sync",
    title: "Cloud Sync",
    desc: "Your data syncs instantly across all devices. Never lose a single day of progress.",
  },
];

export function LandingPageContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // Immediate redirect logic
  useEffect(() => {
    if (isInitialized && !isLoading && user) {
      router.replace("/today");
    }
  }, [user, isLoading, isInitialized, router]);

  // Prevent flash: If initialized and user exists, or if not initialized yet,
  // show a clean dark background to hide content flickering.
  if (!isInitialized || isLoading || user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Sleek minimal pulse for initialization */}
        <div className="w-12 h-12 rounded-full border-2 border-white/5 border-t-white/40 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#E2E2E2] overflow-x-hidden animate-fade-in">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-[#464555]/15 flex items-center px-6 h-16 justify-between max-w-screen">
        <div className="flex items-center gap-2">
          <picture>
            <source srcSet="/logo.webp" type="image/webp" />
            <img
              src="/logo.png"
              alt="SIRA Logo"
              className="w-8 h-8 scale-[2] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              width={32}
              height={32}
              fetchPriority="high"
            />
          </picture>
          <span className="text-[#E2E2E2] font-black tracking-[0.2em] uppercase text-base font-headline">
            SIRA
          </span>
        </div>
        <Link
          href="/login"
          className="rounded-full bg-[#E2E2E2] px-5 py-2 text-xs font-bold text-black uppercase tracking-widest hover:bg-white transition-colors"
        >
          Launch App
        </Link>
      </nav>

      {/* Hero */}
      <main>
        <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 sm:pt-40 sm:pb-28 min-h-[80vh]">
          {/* Background glow */}
          <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#4F44E2]/8 blur-[150px]" />

          <span className="mb-6 inline-block rounded-full border border-[#4F44E2]/30 bg-[#4F44E2]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4C0FF]">
            Your Day, Perfected
          </span>

          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] max-w-4xl">
            Build{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-[#C4C0FF] to-[#7cf6ec]">
              Unstoppable
            </span>{" "}
            Daily Routines
          </h1>

          <p className="mt-6 max-w-xl text-sm sm:text-base md:text-lg text-[#8E8D99] leading-relaxed font-medium">
            SIRA is a sleek and minimal aesthetic habit tracker that helps you
            plan your day, track your habits, and visualize your progress with
            stunning analytics.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-[#E2E2E2] px-8 py-3.5 text-sm font-bold text-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.08)]"
            >
              Get Started — Free
            </Link>
            <a
              href="#features"
              className="rounded-full border border-[#464555]/30 px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-[#8E8D99] hover:text-white hover:border-white/20 transition-all"
            >
              See Features
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 sm:mt-20 flex flex-wrap justify-center gap-8 sm:gap-16">
            {[
              ["100%", "Free Forever"],
              ["Offline", "First"],
              ["< 1s", "Load Time"],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <p className="font-headline text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {value}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#464555] mt-1">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="relative px-6 py-20 sm:py-28 max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter">
              Everything You Need to{" "}
              <span className="text-[#C4C0FF]">Win the Day</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#8E8D99] max-w-lg mx-auto">
              Designed for focus. Built for consistency. SIRA gives you the
              tools to show up every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-[rgba(70,69,85,0.15)] bg-[#0A0A0A] p-6 sm:p-8 transition-all hover:border-white/10 hover:bg-[#0E0E0E]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-[#4F44E2]/20 bg-[#4F44E2]/10 text-[#C4C0FF] group-hover:shadow-[0_0_20px_rgba(79,68,226,0.15)] transition-shadow">
                  <span
                    className="material-symbols-outlined text-xl"
                    style={
                      f.icon === "local_fire_department" || f.icon === "star"
                        ? { fontVariationSettings: "'FILL' 1" }
                        : undefined
                    }
                  >
                    {f.icon}
                  </span>
                </div>
                <h3 className="font-headline text-sm font-bold tracking-tight text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-[#8E8D99] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 sm:py-28">
          <div className="max-w-2xl mx-auto text-center rounded-2xl border border-[rgba(70,69,85,0.2)] bg-[#0A0A0A] p-10 sm:p-14 relative overflow-hidden">
            <div className="pointer-events-none absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-[#4F44E2]/5 blur-[120px]" />
            <h2 className="font-headline text-2xl sm:text-3xl font-black tracking-tighter relative z-10">
              Start Building Your{" "}
              <span className="text-[#7cf6ec]">Routine</span>
            </h2>
            <p className="mt-4 text-sm text-[#8E8D99] relative z-10">
              Join thousands who are transforming their daily routines. It takes
              30 seconds to start.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-block rounded-full bg-[#E2E2E2] px-8 py-3.5 text-sm font-bold text-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 relative z-10"
            >
              Launch SIRA
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#464555]/10 py-10 px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#464555]">
            © {new Date().getFullYear()} SIRA by Veer Pal Singh. All Rights
            Reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
