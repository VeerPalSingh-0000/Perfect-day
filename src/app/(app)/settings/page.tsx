"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { signOut } from "@/lib/auth";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { StealthFooter } from "@/components/layout/StealthFooter";

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { theme } = useThemeStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#E2E2E2]">
      <TopAppBar variant="title" title="Settings" />

      <main className="mx-auto w-full max-w-2xl space-y-6 sm:space-y-10 px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-4">
        {/* Account Section */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="pl-0 sm:pl-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#464555]">
            ACCOUNT
          </h2>
          <div className="space-y-4 sm:space-y-6 rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[#0E0E0E] p-3 sm:p-5 md:p-6 shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative h-10 sm:h-14 w-10 sm:w-14 overflow-hidden rounded-full border border-[#464555]/30 shrink-0">
                {user?.photoURL ? (
                  <img
                    alt="User Avatar"
                    className="h-full w-full object-cover"
                    src={user.photoURL}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/5 text-base sm:text-xl">
                    <span className="material-symbols-outlined hover:scale-110 transition-transform cursor-pointer">
                      account_circle
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-bold leading-tight tracking-tight truncate">
                  {user?.displayName || "User"}
                </p>
                <p className="text-xs sm:text-sm text-[#464555] truncate">
                  {user?.email || "-"}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full rounded-lg border border-[#464555]/20 bg-[#1A1A1A] py-2.5 sm:py-3.5 font-bold text-white text-xs sm:text-base transition-colors duration-300 hover:bg-[#252525]"
            >
              Sign Out
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="pl-0 sm:pl-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#464555]">
            PREFERENCES
          </h2>
          <div className="divide-y divide-[#464555]/10 rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[#0E0E0E]">
            {/* Appearance — dark only, toggle removed */}
            <div className="flex items-center justify-between p-3 sm:p-5 gap-3 cursor-default">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-base sm:text-xl shrink-0">
                  <span className="material-symbols-outlined text-lg">
                    contrast
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-[15px] font-semibold truncate">
                    Appearance
                  </p>
                  <p className="text-[10px] sm:text-[12px] text-[#464555]">
                    Dark theme (only)
                  </p>
                </div>
              </div>
              <div
                className="relative h-5 sm:h-6 w-10 sm:w-11 rounded-full shrink-0 bg-[#4F44E2]"
              >
                <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 h-4 w-4 rounded-full bg-white" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-5 opacity-60 gap-3 cursor-not-allowed">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-base sm:text-xl shrink-0">
                  <span className="material-symbols-outlined text-lg">
                    notifications
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-[15px] font-semibold truncate">
                    Notifications
                  </p>
                  <p className="text-[10px] sm:text-[12px] text-[#464555]">
                    Daily reminders
                  </p>
                </div>
              </div>
              <span className="rounded-md bg-[#1A1A1A] px-2 py-0.5 sm:py-1 text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-[#464555] shrink-0 border border-[#464555]/20">
                COMING SOON
              </span>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-5 opacity-60 gap-3 cursor-not-allowed">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-base sm:text-xl shrink-0">
                  <span className="material-symbols-outlined text-lg">
                    widgets
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-[15px] font-semibold truncate">
                    Home Widget
                  </p>
                  <p className="text-[10px] sm:text-[12px] text-[#464555]">
                    Android only
                  </p>
                </div>
              </div>
              <span className="rounded-md bg-[#1A1A1A] px-2 py-0.5 sm:py-1 text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-[#464555] shrink-0 border border-[#464555]/20">
                COMING SOON
              </span>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="pl-0 sm:pl-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#464555]">
            ABOUT
          </h2>
          <div className="divide-y divide-[#464555]/10 rounded-lg sm:rounded-xl border border-[rgba(70,69,85,0.2)] bg-[#0E0E0E]">
            <div className="group flex cursor-pointer items-center justify-between p-3 sm:p-5 transition-colors hover:bg-white/5 gap-3">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="text-base sm:text-lg opacity-80 shrink-0">
                  <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">
                    policy
                  </span>
                </div>
                <p className="text-xs sm:text-[15px] font-semibold truncate">
                  Privacy Policy
                </p>
              </div>
              <span className="material-symbols-outlined text-xs sm:text-lg text-[#464555] shrink-0">
                chevron_right
              </span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-5 gap-3 cursor-default">
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="w-4 sm:w-[18px]" />
                <p className="text-xs sm:text-[15px] font-semibold text-[#464555]">
                  Version
                </p>
              </div>
              <p className="rounded border border-[#464555]/20 bg-[#1A1A1A] px-2 py-0.5 font-mono text-[9px] sm:text-[11px] text-[#E2E2E2] shrink-0">
                1.0.0-BETA
              </p>
            </div>
          </div>
        </section>

        <StealthFooter />
      </main>

      <BottomNav />

      {/* Background Glow */}
      <div className="pointer-events-none fixed right-0 top-0 -z-10 h-[40%] w-[40%] rounded-full bg-[#4F44E2]/5 blur-[100px]" />
    </div>
  );
}
