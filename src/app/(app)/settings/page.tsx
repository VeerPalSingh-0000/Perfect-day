"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { signOut } from "@/lib/auth";
import { initializeMessaging } from "@/lib/messaging";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { StealthFooter } from "@/components/layout/StealthFooter";
import { updateUserProfile } from "@/lib/db";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useAchievementStore } from "@/stores/useAchievementStore";

const ACHIEVEMENT_LIST = [
  {
    id: "first_perfect",
    title: "Perfect Day",
    icon: "🌟",
    desc: "Finish 100% of tasks",
  },
  { id: "streak_7", title: "Relentless", icon: "🔥", desc: "7-day streak" },
  { id: "streak_30", title: "Unstoppable", icon: "💎", desc: "30-day streak" },
  {
    id: "tasks_100",
    title: "Century",
    icon: "🏆",
    desc: "100 tasks completed",
  },
  {
    id: "early_bird",
    title: "Early Bird",
    icon: "🐦",
    desc: "Finish before noon",
  },
];

const AVATARS = [
  "/avatars/avatar1.webp",
  "/avatars/avatar2.webp",
  "/avatars/avatar3.webp",
  "/avatars/avatar4.webp",
  "/avatars/avatar5.webp",
];

import { Modal } from "@/components/ui/Modal";
import { useThemeStore } from "@/stores/useThemeStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useTrackerStore } from "@/stores/useTrackerStore";
import { useTargetStore } from "@/stores/useTargetStore";

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const updateProfileInStore = useAuthStore((state) => state.updateProfile);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [isDataProtocolsOpen, setIsDataProtocolsOpen] = useState(false);
  const [isPriorityInfoOpen, setIsPriorityInfoOpen] = useState(false);

  const unlockedAchievements = useAchievementStore(
    (state) => state.achievements,
  );

  // Theme state from store
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDarkMode = theme === "dark";

  // Priority Mode state
  const priorityMode = useSettingsStore((state) => state.priorityMode);
  const togglePriorityMode = useSettingsStore(
    (state) => state.togglePriorityMode,
  );

  // Notifications state
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  // Haptics state
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(true);

  const trackerStore = useTrackerStore();
  const targets = useTargetStore((state) => state.targets);

  React.useEffect(() => {
    trackerStore.initTrackerAuth();
  }, [trackerStore.initTrackerAuth]);

  React.useEffect(() => {
    // Check initial notification preference
    const storedPref = localStorage.getItem("push_enabled");
    if (storedPref === "true") {
      setIsNotificationsEnabled(true);
    } else {
      setIsNotificationsEnabled(false);
    }

    // Check haptics preference
    const storedHaptics = localStorage.getItem("haptics_enabled");
    if (storedHaptics === "false") {
      setIsHapticsEnabled(false);
    }
  }, []);

  const triggerHaptic = () => {
    if (
      isHapticsEnabled &&
      typeof window !== "undefined" &&
      "vibrate" in navigator
    ) {
      navigator.vibrate(50);
    }
  };

  const toggleHaptics = () => {
    const newHaptics = !isHapticsEnabled;
    setIsHapticsEnabled(newHaptics);
    localStorage.setItem("haptics_enabled", String(newHaptics));
    if (newHaptics && typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleExportData = () => {
    triggerHaptic();
    const data = {
      profile,
      theme,
      preferences: {
        notifications: isNotificationsEnabled,
        haptics: isHapticsEnabled,
      },
      system: "SIRA-v1.0.1",
      exportTimestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sira_data_extract_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleNotifications = async () => {
    triggerHaptic();
    if (!isNotificationsEnabled) {
      // Trying to enable
      try {
        const token = await initializeMessaging();
        if (token) {
          setIsNotificationsEnabled(true);
          localStorage.setItem("push_enabled", "true");

          if (typeof window !== "undefined" && "Notification" in window) {
            new Notification("Notifications Enabled", {
              body: "You will now receive reminders.",
              icon: "/avatars/avatar1.webp",
            });
          }
        } else {
          alert("Please grant notification permissions in your settings.");
        }
      } catch (error) {
        console.error("Failed to enable notifications:", error);
        alert("Failed to enable notifications.");
      }
    } else {
      // Disabling (Note: actual token revocation would require backend/firebase cleanup)
      setIsNotificationsEnabled(false);
      localStorage.setItem("push_enabled", "false");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAvatarChange = async (avatarUrl: string) => {
    if (!user || profile?.photoURL === avatarUrl) return;

    // OPTIMISTIC UPDATE: Update the UI immediately
    updateProfileInStore({ photoURL: avatarUrl });

    try {
      await updateUserProfile(user.uid, { photoURL: avatarUrl });
    } catch (err) {
      console.error("Failed to sync avatar to server:", err);
      // Fallback: If server save fails, we can either revert or just keep local
      // For avatars, keeping local is usually fine as it will re-sync on next load
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#E2E2E2]">
      <TopAppBar variant="title" title="Settings" />

      <main className="mx-auto w-full max-w-2xl space-y-6 sm:space-y-10 px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-4">
        {/* 3A. Achievements Section */}
        <section className="space-y-4">
          <h2 className="pl-0 sm:pl-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#464555]">
            ACHIEVEMENTS & MILESTONES
          </h2>
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
            {ACHIEVEMENT_LIST.map((ach) => {
              const isUnlocked = unlockedAchievements.some(
                (a) => a.id === ach.id,
              );
              return (
                <div
                  key={ach.id}
                  className={cn(
                    "flex min-w-25 flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                    isUnlocked
                      ? "border-[#C4C0FF]/30 bg-[#C4C0FF]/10 shadow-[0_0_20px_rgba(196,192,255,0.1)]"
                      : "border-white/5 bg-[#0A0A0A] opacity-40 grayscale",
                  )}
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#E2E2E2]">
                      {ach.title}
                    </p>
                    <p className="text-[7px] font-medium text-[#464555] mt-0.5 leading-tight">
                      {ach.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Account Section */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="pl-0 sm:pl-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#464555]">
            ACCOUNT PROFILE
          </h2>
          <div className="space-y-6 sm:space-y-8 rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[#0E0E0E] p-4 sm:p-6 md:p-8 shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            {/* Profile Info */}
            <div className="flex flex-col items-center sm:flex-row sm:items-center gap-6">
              <div
                className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-[#4F44E2]/30 ring-4 ring-[#4F44E2]/10 shrink-0"
                style={{ backgroundColor: "#000000" }}
              >
                <OptimizedImage
                  alt="User Avatar"
                  className="h-full w-full"
                  src={profile?.photoURL || "/avatars/avatar1.webp"}
                />
                {isUpdating && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-black leading-tight tracking-tight text-white mb-1 truncate">
                  {profile?.displayName ||
                    user?.displayName ||
                    "Sira Architect"}
                </p>
                <p className="text-xs sm:text-sm text-[#464555] font-medium tracking-wide truncate">
                  {profile?.email || user?.email || "-"}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#464555]/20 bg-[#1A1A1A] py-3 font-black text-white text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out Securely
            </button>
          </div>
        </section>

        {/* Digital Identity Section */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="pl-0 sm:pl-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#464555]">
            DIGITAL IDENTITY
          </h2>
          <div className="overflow-hidden rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[#0E0E0E] shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
              className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 transition-colors hover:bg-white/5 disabled:opacity-50"
              disabled={isUpdating}
            >
              <div className="flex flex-col items-start gap-1 text-left">
                <p className="text-[13px] font-bold uppercase tracking-wider text-white">
                  Avatar Configuration
                </p>
                <p className="text-[10px] sm:text-[11px] font-medium text-[#464555] uppercase tracking-wide">
                  Choose your visual presence across Sira
                </p>
              </div>
              <span
                className={`material-symbols-outlined text-[#464555] transition-transform duration-300 ${isAvatarDropdownOpen ? "rotate-180" : ""}`}
              >
                expand_more
              </span>
            </button>

            <div
              className={cn(
                "transition-all duration-300 ease-in-out",
                isAvatarDropdownOpen
                  ? "max-h-125 opacity-100"
                  : "max-h-0 opacity-0",
              )}
            >
              <div className="p-4 pt-0 sm:p-5 sm:pt-0 md:p-6 md:pt-0 border-t border-[#464555]/10 flex flex-col gap-4 mt-2">
                <div className="grid grid-cols-5 gap-2 sm:gap-4 pt-4">
                  {AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleAvatarChange(avatar);
                      }}
                      disabled={isUpdating}
                      style={{ backgroundColor: "#000000" }}
                      className={cn(
                        "relative flex aspect-square w-full items-center justify-center rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 active:scale-95",
                        profile?.photoURL === avatar
                          ? "border-[#4F44E2] shadow-[0_4px_20px_rgba(79,68,226,0.4)]"
                          : "border-transparent grayscale hover:grayscale-0 opacity-60 hover:opacity-100 hover:border-white/20",
                      )}
                    >
                      <OptimizedImage
                        src={avatar}
                        alt={`Avatar ${idx + 1}`}
                        className="absolute h-full w-full pointer-events-none"
                      />
                      {profile?.photoURL === avatar && (
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-[#4F44E2] flex items-center justify-center shadow-[0_0_10px_rgba(79,68,226,0.8)] z-10">
                          <span className="material-symbols-outlined text-white text-[10px] sm:text-[12px] font-black">
                            check
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Task Configuration Section */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="pl-0 sm:pl-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#464555]">
            TASK CONFIGURATION
          </h2>
          <div className="divide-y divide-[#464555]/10 rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[#0E0E0E]">
            <div className="w-full flex items-center justify-between p-4 sm:p-5 gap-3 transition-colors hover:bg-white/5">
              <button
                onClick={() => {
                  triggerHaptic();
                  togglePriorityMode();
                }}
                className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 text-left"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border shrink-0 transition-colors",
                    priorityMode === "advanced"
                      ? "border-[#4F44E2]/50 bg-[#4F44E2]/20"
                      : "border-white/10 bg-white/5",
                  )}
                >
                  <span
                    className={cn(
                      "material-symbols-outlined text-base",
                      priorityMode === "advanced"
                        ? "text-[#4F44E2]"
                        : "text-white",
                    )}
                  >
                    stars
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold uppercase tracking-wider text-white transition-colors duration-300">
                    {priorityMode === "advanced"
                      ? "Advanced Mode"
                      : "Basic Mode"}
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-medium text-[#464555] uppercase tracking-wide transition-colors duration-300">
                    {priorityMode === "advanced"
                      ? "Tasks have varying priority weights"
                      : "All tasks have equal importance"}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPriorityInfoOpen(true);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors shrink-0"
                  title="What is Advanced Mode?"
                >
                  <span className="material-symbols-outlined text-[16px] text-white/70">
                    info
                  </span>
                </button>

                <button
                  onClick={() => {
                    triggerHaptic();
                    togglePriorityMode();
                  }}
                  className={cn(
                    "relative h-5 w-10 shrink-0 rounded-full transition-colors duration-300",
                    priorityMode === "advanced"
                      ? "bg-[#4F44E2] shadow-[0_0_10px_rgba(79,68,226,0.3)]"
                      : "bg-white/20",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 h-3 w-3 rounded-full bg-white transition-all duration-300",
                      priorityMode === "advanced" ? "right-1" : "left-1",
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Target Completion Section */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="pl-0 sm:pl-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#464555]">
            TARGET COMPLETION
          </h2>
          <div className="overflow-hidden rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[#0E0E0E] shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            <div className="p-4 sm:p-5 md:p-6 border-b border-[#464555]/10 bg-white/5">
              <div className="flex flex-col gap-1">
                <p className="text-[13px] font-bold uppercase tracking-wider text-white">
                  Active Learning Cycles
                </p>
                <p className="text-[10px] sm:text-[11px] font-medium text-[#464555] uppercase tracking-wide">
                  Strategic objectives and progress tracking
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#464555]/10">
              {targets.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs font-bold text-[#464555] uppercase tracking-widest italic mb-4">
                    No active targets found
                  </p>
                  <button
                    onClick={() => {
                      triggerHaptic();
                      router.push("/targets");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4F44E2]/10 border border-[#4F44E2]/20 text-[10px] font-black uppercase tracking-widest text-[#4F44E2] hover:bg-[#4F44E2]/20 transition-all"
                  >
                    Initialize First Target
                  </button>
                </div>
              ) : (
                targets.map((target) => {
                  const percentage = Math.round(
                    (target.completedDays.length / target.totalDays) * 100,
                  );
                  return (
                    <button
                      key={target.id}
                      onClick={() => {
                        triggerHaptic();
                        useTargetStore.getState().setActiveTarget(target.id);
                        router.push("/targets");
                      }}
                      className="w-full flex items-center justify-between p-4 sm:p-5 transition-colors hover:bg-white/5 group"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1 pr-4 text-left">
                        <div className="relative flex items-center justify-center shrink-0">
                          <svg
                            className="h-10 w-10 -rotate-90"
                            viewBox="0 0 32 32"
                          >
                            <circle
                              className="text-white/5"
                              cx="16"
                              cy="16"
                              r="14"
                              fill="transparent"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            />
                            <circle
                              className="text-[#4F44E2] drop-shadow-[0_0_5px_rgba(79,68,226,0.3)]"
                              cx="16"
                              cy="16"
                              r="14"
                              fill="transparent"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeDasharray="87.96"
                              strokeDashoffset={
                                87.96 - (percentage / 100) * 87.96
                              }
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-[8px] font-black text-white">
                            {percentage}%
                          </span>
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-[11px] font-black uppercase tracking-widest text-white truncate transition-colors group-hover:text-[#C4C0FF]">
                            {target.title}
                          </p>
                          <p className="text-[9px] font-bold text-[#464555] uppercase tracking-tighter">
                            Day {target.completedDays.length} /{" "}
                            {target.totalDays} Cycle
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:border-red-500/40 hover:bg-red-500/20 transition-all cursor-pointer hover:scale-110 active:scale-95"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                "Are you sure you want to completely delete this target?",
                              )
                            ) {
                              triggerHaptic();
                              useTargetStore.getState().removeTarget(target.id);
                            }
                          }}
                          title="Delete Target"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-lg text-[#464555] group-hover:text-white transition-colors">
                          chevron_right
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {targets.length > 0 && (
              <button
                onClick={() => {
                  triggerHaptic();
                  router.push("/targets");
                }}
                className="w-full py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#464555] hover:text-white transition-colors border-t border-[#464555]/10 bg-black/20"
              >
                Access Hub Interface
              </button>
            )}
          </div>
        </section>

        {/* Preferences Section */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="pl-0 sm:pl-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#464555]">
            SYSTEM PREFERENCES
          </h2>
          <div className="divide-y divide-[#464555]/10 rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[#0E0E0E]">
            <button
              onClick={() => {
                triggerHaptic();
                toggleTheme();
              }}
              className="w-full flex items-center justify-between p-4 sm:p-5 gap-3 transition-colors hover:bg-white/5 active:bg-white/10"
            >
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 shrink-0 transition-colors">
                  <span className="material-symbols-outlined text-base">
                    {isDarkMode ? "dark_mode" : "light_mode"}
                  </span>
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[13px] font-bold uppercase tracking-wider text-white transition-colors duration-300">
                    Appearance
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-medium text-[#464555] uppercase tracking-wide transition-colors duration-300">
                    {isDarkMode ? "Dark theme active" : "Light theme active"}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "relative h-5 w-10 shrink-0 rounded-full transition-colors duration-300",
                  isDarkMode
                    ? "bg-[#4F44E2] shadow-[0_0_10px_rgba(79,68,226,0.3)]"
                    : "bg-white/20",
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 h-3 w-3 rounded-full bg-white transition-all duration-300",
                    isDarkMode ? "right-1" : "left-1",
                  )}
                />
              </div>
            </button>

            <button
              onClick={toggleNotifications}
              className="w-full flex items-center justify-between p-4 sm:p-5 gap-3 transition-colors hover:bg-white/5 active:bg-white/10"
            >
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border shrink-0 transition-colors",
                    isNotificationsEnabled
                      ? "border-[#4F44E2]/50 bg-[#4F44E2]/20"
                      : "border-white/10 bg-white/5",
                  )}
                >
                  <span
                    className={cn(
                      "material-symbols-outlined text-base",
                      isNotificationsEnabled ? "text-[#4F44E2]" : "text-white",
                    )}
                  >
                    notifications
                  </span>
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[13px] font-bold uppercase tracking-wider text-white transition-colors duration-300">
                    Push Delivery
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-medium text-[#464555] uppercase tracking-wide transition-colors duration-300">
                    {isNotificationsEnabled
                      ? "Alerts enabled"
                      : "Reminders only"}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "relative h-5 w-10 shrink-0 rounded-full transition-colors duration-300",
                  isNotificationsEnabled
                    ? "bg-[#4F44E2] shadow-[0_0_10px_rgba(79,68,226,0.3)]"
                    : "bg-white/20",
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 h-3 w-3 rounded-full bg-white transition-all duration-300",
                    isNotificationsEnabled ? "right-1" : "left-1",
                  )}
                />
              </div>
            </button>
          </div>
        </section>

        {/* About Section */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="pl-0 sm:pl-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#464555]">
            CORE SYSTEM
          </h2>
          <div className="divide-y divide-[#464555]/10 rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[#0E0E0E]">
            {/* Tactical Haptics Toggle */}
            <button
              onClick={toggleHaptics}
              className="w-full flex items-center justify-between p-4 sm:p-5 gap-3 transition-colors hover:bg-white/5 active:bg-white/10"
            >
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border shrink-0 transition-colors",
                    isHapticsEnabled
                      ? "border-[#4F44E2]/50 bg-[#4F44E2]/20"
                      : "border-white/10 bg-white/5",
                  )}
                >
                  <span
                    className={cn(
                      "material-symbols-outlined text-base",
                      isHapticsEnabled ? "text-[#4F44E2]" : "text-white",
                    )}
                  >
                    vibration
                  </span>
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[13px] font-bold uppercase tracking-wider text-white transition-colors duration-300">
                    Tactical Haptics
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-medium text-[#464555] uppercase tracking-wide transition-colors duration-300">
                    {isHapticsEnabled ? "Feedback active" : "Silent operation"}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "relative h-5 w-10 shrink-0 rounded-full transition-colors duration-300",
                  isHapticsEnabled
                    ? "bg-[#4F44E2] shadow-[0_0_10px_rgba(79,68,226,0.3)]"
                    : "bg-white/20",
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 h-3 w-3 rounded-full bg-white transition-all duration-300",
                    isHapticsEnabled ? "right-1" : "left-1",
                  )}
                />
              </div>
            </button>

            {/* Extract Archives */}
            <button
              onClick={handleExportData}
              className="group w-full flex items-center justify-between p-4 sm:p-5 transition-colors hover:bg-white/5 gap-3"
            >
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="h-9 w-9 flex items-center justify-center border border-white/10 bg-white/5 rounded-lg opacity-80 transition-colors group-hover:bg-white/10">
                  <span className="material-symbols-outlined text-base">
                    download
                  </span>
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[13px] font-bold uppercase tracking-wider text-white">
                    Extract Archives
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-medium text-[#464555] uppercase tracking-wide">
                    Export local system data
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-lg text-[#464555] group-hover:text-white transition-colors">
                chevron_right
              </span>
            </button>

            {/* Data Protocols (Moved from original) */}
            <button
              onClick={() => setIsDataProtocolsOpen(true)}
              className="w-full group flex cursor-pointer items-center justify-between p-4 sm:p-5 transition-colors hover:bg-white/5 gap-3"
            >
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="h-9 w-9 flex items-center justify-center border border-white/10 bg-white/5 rounded-lg opacity-80 group-hover:bg-white/10">
                  <span className="material-symbols-outlined text-base">
                    policy
                  </span>
                </div>
                <p className="text-[13px] font-bold uppercase tracking-wider text-white">
                  Data Protocols
                </p>
              </div>
              <span className="material-symbols-outlined text-lg text-[#464555] group-hover:text-white transition-colors">
                chevron_right
              </span>
            </button>

            <div className="flex items-center justify-between p-4 sm:p-5 gap-3 cursor-default">
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="flex h-9 w-9 items-center justify-center border border-white/5 bg-transparent rounded-lg opacity-60">
                  <span className="material-symbols-outlined text-base">
                    terminal
                  </span>
                </div>
                <p className="text-[13px] font-bold uppercase tracking-wider text-[#464555]">
                  Architecture
                </p>
              </div>
              <p className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-white">
                SIRA-v1.0.1
              </p>
            </div>
          </div>
        </section>

        <StealthFooter />
      </main>

      <BottomNav />

      {/* Background Glow */}
      <div className="pointer-events-none fixed right-0 top-0 -z-10 h-[40%] w-[40%] rounded-full bg-[#4F44E2]/5 blur-[120px]" />

      <Modal
        isOpen={isPriorityInfoOpen}
        onClose={() => setIsPriorityInfoOpen(false)}
        title="PRIORITY MODES"
      >
        <div className="space-y-6 text-[#E2E2E2]">
          <div className="flex items-center gap-4 border-b border-[#464555]/20 pb-4">
            <div className="h-12 w-12 rounded-xl bg-[#4F44E2]/10 border border-[#4F44E2]/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#4F44E2] text-2xl">
                stars
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">
                Task Weighting
              </h3>
              <p className="text-[11px] text-[#464555] mt-1">
                How completion is calculated
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-[#888890]">
            <div>
              <span className="font-bold text-[#E2E2E2]">Basic Mode</span>
              <p className="mt-1">
                Every task has equal importance. If you have 4 tasks and finish
                2, your day is 50% complete.
              </p>
            </div>
            <div>
              <span className="font-bold text-[#E2E2E2]">Advanced Mode</span>
              <p className="mt-1 mb-2">
                Tasks carry different mathematical weights. Doing harder things
                yields higher percentage gains for the day.
              </p>
              <ul className="list-none space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-red-400">🔴 Critical</span> (4x Weight)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">🟠 High</span> (3x Weight)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400">🟡 Medium</span> (2x Weight)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">🔵 Low</span> (1x Weight)
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-[#464555]/20 mt-4 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-[#4F44E2]/15 border border-[#4F44E2]/25 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#4F44E2] text-lg">
                  link
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#E2E2E2]">
                  FocusFlow Integration
                </h4>
                <p className="text-[10px] text-[#464555] mt-0.5">
                  Connect your TrackIT study timer
                </p>
              </div>
            </div>

            <a
              href="https://justtrackit.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full py-3 px-3.5 rounded-lg bg-white/3 border border-[#464555]/15 mb-4 hover:bg-white/6 hover:border-[#4F44E2]/30 transition-all group"
            >
              <span className="material-symbols-outlined text-[#4F44E2] text-lg group-hover:scale-110 transition-transform">
                open_in_new
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[#E2E2E2]">
                  Open TrackIT App
                </p>
                <p className="text-[10px] text-[#464555] truncate">
                  justtrackit.netlify.app
                </p>
              </div>
              <span className="material-symbols-outlined text-[#464555] text-sm group-hover:text-[#4F44E2] transition-colors">
                arrow_forward
              </span>
            </a>

            <div className="rounded-lg bg-white/3 border border-[#464555]/15 p-3 mb-4">
              <p className="text-[11px] font-semibold text-[#C4C0FF] mb-2">
                ✨ What does this do?
              </p>
              <p className="text-[11px] text-[#888890] leading-relaxed">
                When you study using the{" "}
                <span className="text-[#E2E2E2] font-medium">TrackIT</span> app,
                SIRA automatically marks your tasks as{" "}
                <span className="text-green-400 font-medium">done</span> once
                you hit your time goal. No manual ticking needed!
              </p>
            </div>

            <div className="rounded-lg bg-white/3 border border-[#464555]/15 p-3 mb-4">
              <p className="text-[11px] font-semibold text-[#C4C0FF] mb-2">
                📋 How to use it
              </p>
              <ol className="space-y-2 text-[11px] text-[#888890] leading-relaxed list-decimal list-inside">
                <li>
                  <span className="text-[#E2E2E2]">
                    Link your Google account
                  </span>{" "}
                  below
                </li>
                <li>
                  When adding a task, tap{" "}
                  <span className="text-[#E2E2E2]">"Link TrackIT Project"</span>{" "}
                  and pick your project
                </li>
                <li>
                  Set a <span className="text-[#E2E2E2]">Focus Goal</span> (e.g.
                  60 min)
                </li>
                <li>
                  Study in TrackIT — task auto-completes when goal is reached!
                  ✅
                </li>
              </ol>
            </div>

            <div className="rounded-lg bg-white/3 border border-[#464555]/15 p-3 mb-4">
              <p className="text-[11px] font-semibold text-[#C4C0FF] mb-2">
                📊 Bonus: Focus History
              </p>
              <p className="text-[11px] text-[#888890] leading-relaxed">
                Your total study time from TrackIT shows up in the{" "}
                <span className="text-[#E2E2E2] font-medium">Journey</span> tab.
                See how many hours you focused each day!
              </p>
            </div>

            {trackerStore.isLinked ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="material-symbols-outlined text-green-400 text-base">
                    check_circle
                  </span>
                  <div>
                    <p className="text-[11px] text-green-400 font-bold">
                      {trackerStore.trackerUser?.email
                        ? `Connected with ${trackerStore.trackerUser.email}`
                        : "Connected"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={trackerStore.unlinkTrackerAccount}
                  className="w-full py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-colors"
                >
                  Unlink Account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={trackerStore.linkTrackerAccount}
                  disabled={trackerStore.isLinking}
                  className="w-full py-3 rounded-lg bg-[#4F44E2]/20 border border-[#4F44E2]/50 text-xs font-bold uppercase tracking-widest text-[#C4C0FF] hover:bg-[#4F44E2]/30 transition-colors disabled:opacity-50"
                >
                  {trackerStore.isLinking
                    ? "Connecting..."
                    : "🔗 Link Google Account"}
                </button>
                <button
                  onClick={trackerStore.linkDifferentTrackerAccount}
                  disabled={trackerStore.isLinking}
                  className="w-full py-2.5 rounded-lg bg-white/5 border border-white/15 text-[10px] font-bold uppercase tracking-widest text-[#E2E2E2] hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Use Different Google Account
                </button>
                {trackerStore.linkError && (
                  <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2">
                    <p className="text-[10px] leading-relaxed text-amber-200">
                      {trackerStore.linkError}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#464555]/20">
            <button
              onClick={() => setIsPriorityInfoOpen(false)}
              className="w-full py-3 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDataProtocolsOpen}
        onClose={() => setIsDataProtocolsOpen(false)}
        title="DATA PRIVACY"
      >
        <div className="space-y-6 text-[#E2E2E2]">
          <div className="flex items-center gap-4 border-b border-[#464555]/20 pb-4">
            <div className="h-12 w-12 rounded-xl bg-[#4F44E2]/10 border border-[#4F44E2]/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#4F44E2] text-2xl">
                security
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">
                Your Data Safety
              </h3>
              <p className="text-[11px] text-[#464555] mt-1">
                Transparent and secure
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-[#888890]">
            <p>
              SIRA is designed to respect your privacy. All your tasks, habits,
              and daily records are securely tied to your personalized account.
            </p>
            <p>
              We automatically sync your data using industry-standard secure
              cloud infrastructure to ensure your information is safe and
              accessible across your devices.
            </p>
            <ul className="list-disc pl-4 space-y-2 mt-2">
              <li>No sensitive telemetry collection</li>
              <li>Secure authentication powered by Google</li>
              <li>No third-party tracking or advertisements</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-[#464555]/20">
            <button
              onClick={() => setIsDataProtocolsOpen(false)}
              className="w-full py-3 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
