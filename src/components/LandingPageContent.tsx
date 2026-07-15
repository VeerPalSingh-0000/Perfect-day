"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function LandingPageContent() {
  return (
    <div className="min-h-screen bg-black text-[#E2E2E2] overflow-x-hidden selection:bg-[#4F44E2]/30 selection:text-white">
      {/* Nav */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur-2xl border-b border-[#464555]/15 flex items-center px-6 h-16 justify-between max-w-screen"
      >
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="SIRA Logo"
            className="w-8 h-8 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] ml-2"
            width={32}
            height={32}
            priority
          />
        </div>
        <Link
          href="/login"
          className="rounded-full bg-[#E2E2E2] px-5 py-2 text-xs font-bold text-black uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(226,226,226,0.15)]"
        >
          Launch App
        </Link>
      </motion.nav>

      {/* Hero */}
      <main>
        <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 sm:pt-40 sm:pb-28 min-h-[85vh] overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#4F44E2]/10 blur-[150px] animate-pulse-glow" />
          <div className="pointer-events-none absolute top-[60%] right-[-10%] h-[400px] w-[400px] rounded-full bg-[#7cf6ec]/5 blur-[120px]" />
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 flex flex-col items-center"
          >
            <motion.span 
              variants={itemVariants}
              className="mb-6 inline-block rounded-full border border-[#4F44E2]/30 bg-[#4F44E2]/10 px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#C4C0FF] shadow-[0_0_20px_rgba(79,68,226,0.2)] backdrop-blur-md"
            >
              Your Day, Perfected
            </motion.span>

            <motion.h1 
              variants={itemVariants}
              className="font-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] max-w-4xl drop-shadow-2xl"
            >
              Build{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-[#C4C0FF] to-[#7cf6ec] text-glow">
                Unstoppable
              </span>{" "}
              Daily Routines
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="mt-6 sm:mt-8 max-w-2xl text-sm sm:text-base md:text-lg text-[#8E8D99] leading-relaxed font-medium"
            >
              SIRA is a sleek, minimal, and aesthetic habit tracker that helps you
              plan your day, track your routines, and visualize your progress with
              stunning analytics.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
            >
              <Link
                href="/login"
                className="group relative rounded-full bg-[#E2E2E2] px-8 py-4 text-sm font-bold text-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                Get Started — Free
                <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
              </Link>
              <a
                href="#features"
                className="rounded-full border border-[#464555]/40 bg-black/40 backdrop-blur-md px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#8E8D99] hover:text-white hover:border-[#4F44E2]/50 hover:bg-[#4F44E2]/10 transition-all"
              >
                See Features
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={containerVariants}
              className="mt-16 sm:mt-24 flex flex-wrap justify-center gap-10 sm:gap-20 rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl"
            >
              {[
                ["100%", "Free Forever"],
                ["Offline", "First"],
                ["< 1s", "Load Time"],
              ].map(([value, label]) => (
                <motion.div variants={itemVariants} key={label} className="text-center">
                  <p className="font-headline text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                    {value}
                  </p>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8E8D99] mt-2">
                    {label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="relative px-6 py-24 sm:py-32 max-w-6xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
              Everything You Need to{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-[#C4C0FF] to-[#7cf6ec]">Win the Day</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#8E8D99] max-w-2xl mx-auto">
              Designed for focus. Built for consistency. SIRA gives you the
              tools to show up every single day.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map((f, index) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-2xl border border-[#464555]/20 bg-[#0A0A0A]/80 backdrop-blur-xl p-8 transition-all hover:-translate-y-1 hover:border-[#4F44E2]/30 hover:shadow-[0_10px_40px_rgba(79,68,226,0.1)] overflow-hidden"
              >
                {/* Subtle gradient hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#4F44E2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-[#4F44E2]/30 bg-[#4F44E2]/10 text-[#C4C0FF] group-hover:bg-[#4F44E2]/20 group-hover:scale-110 transition-all duration-300">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={
                      f.icon === "local_fire_department" || f.icon === "star"
                        ? { fontVariationSettings: "'FILL' 1" }
                        : undefined
                    }
                  >
                    {f.icon}
                  </span>
                </div>
                <h3 className="relative z-10 font-headline text-lg font-bold tracking-tight text-white mb-3">
                  {f.title}
                </h3>
                <p className="relative z-10 text-sm text-[#8E8D99] leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24 sm:py-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center rounded-3xl border border-[#4F44E2]/20 bg-linear-to-b from-[#0A0A0A] to-[#050505] p-12 sm:p-20 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            {/* CTA Background Glows */}
            <div className="pointer-events-none absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-[#4F44E2]/10 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-[#7cf6ec]/5 blur-[100px]" />
            
            <h2 className="font-headline text-4xl sm:text-5xl font-black tracking-tighter relative z-10">
              Start Building Your{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-[#C4C0FF] to-[#7cf6ec]">Routine</span>
            </h2>
            <p className="mt-6 text-base sm:text-lg text-[#8E8D99] relative z-10 max-w-xl mx-auto">
              Join thousands who are transforming their daily routines. It takes
              30 seconds to start. Completely free.
            </p>
            <Link
              href="/login"
              className="mt-10 inline-block rounded-full bg-[#E2E2E2] px-10 py-4 text-sm font-bold text-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 relative z-10 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              Launch SIRA
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#464555]/10 py-12 px-6 text-center">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#464555]">
            © {new Date().getFullYear()} SIRA. All Rights Reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
             <span className="text-[#464555] text-xs hover:text-white transition-colors cursor-pointer">Privacy</span>
             <span className="text-[#464555] text-xs hover:text-white transition-colors cursor-pointer">Terms</span>
             <span className="text-[#464555] text-xs hover:text-white transition-colors cursor-pointer">Contact</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
