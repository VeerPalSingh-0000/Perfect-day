"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { signOut } from "@/lib/auth";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { StealthFooter } from "@/components/layout/StealthFooter";
import { updateUserProfile } from "@/lib/db";
import { cn } from "@/lib/utils";

const AVATARS = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
  "/avatars/avatar5.png",
];

import { Modal } from "@/components/ui/Modal";
import { useThemeStore } from "@/stores/useThemeStore";

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const updateProfileInStore = useAuthStore((state) => state.updateProfile);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [isDataProtocolsOpen, setIsDataProtocolsOpen] = useState(false);

  // Theme state from store
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDarkMode = theme === "dark";

  // Notifications state
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  // Haptics state
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(true);

  React.useEffect(() => {
    // Check initial notification preference
    const storedPref = localStorage.getItem("push_enabled");
    if (
      storedPref === "true" &&
      window.Notification?.permission === "granted"
    ) {
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
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
        return;
      }

      let permission = Notification.permission;
      if (permission !== "granted") {
        permission = await Notification.requestPermission();
      }

      if (permission === "granted") {
        setIsNotificationsEnabled(true);
        localStorage.setItem("push_enabled", "true");
        // Create a test notification
        new Notification("Notifications Enabled", {
          body: "You will now receive encrypted alerts.",
          icon: "/avatars/avatar1.png",
        });
      } else {
        alert(
          "Please grant notification permissions in your browser settings.",
        );
      }
    } else {
      // Disabling
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
                <img
                  alt="User Avatar"
                  className="h-full w-full object-cover"
                  src={profile?.photoURL || "/avatars/avatar1.png"}
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
                  ? "max-h-[500px] opacity-100"
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
                      <img
                        src={avatar}
                        alt={`Avatar ${idx + 1}`}
                        className="absolute h-full w-full object-cover pointer-events-none"
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
                      : "Encrypted alerts"}
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
        isOpen={isDataProtocolsOpen}
        onClose={() => setIsDataProtocolsOpen(false)}
        title="DATA PROTOCOLS"
      >
        <div className="space-y-6 text-[#E2E2E2]">
          <div className="flex items-center gap-4 border-b border-[#464555]/20 pb-4">
            <div className="h-12 w-12 rounded-xl bg-[#4F44E2]/10 border border-[#4F44E2]/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#4F44E2] text-2xl">
                shield_lock
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">
                End-to-End Encryption
              </h3>
              <p className="text-[11px] text-[#464555] mt-1">
                Status: Active & Verified
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-[#888890]">
            <p>
              Your data is secured using AES-256 military-grade encryption
              protocols. All incoming and outgoing streams are routed through
              secure, non-traceable tunnels.
            </p>
            <p>
              Telemetry data is permanently scrubbed every 24 hours. The local
              cache maintains a lightweight footprint to preserve battery and
              device performance.
            </p>
            <ul className="list-disc pl-4 space-y-2 mt-2">
              <li>Biometric hashing locked</li>
              <li>Network obfuscation running</li>
              <li>No third-party trackers injected</li>
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
