"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { signOut } from "../../lib/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const NAV_ITEMS = [
  { href: "/today", label: "Focus", icon: "home" },
  { href: "/history", label: "Journey", icon: "explore" },
  { href: "/analytics", label: "Stats", icon: "bar_chart" },
  { href: "/habits", label: "Habits", icon: "event_repeat" },
  { href: "/settings", label: "Profile", icon: "person" },
];

export function Sidebar() {
  const pathname = usePathname();
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="hidden md:flex w-64 h-screen bg-black sticky top-0 px-6 py-10 flex-col border-r border-[#464555]/15">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12 px-2">
        <OptimizedImage
          src="/logo.png"
          alt="SIRA Logo"
          className="w-12 h-12 scale-[2] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          priority
        />
        <span className="font-['Plus_Jakarta_Sans'] font-black tracking-[0.2em] text-lg text-[#E2E2E2] uppercase">
          SIRA
        </span>
      </div>

      {/* Profile Summary */}
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full border border-white/10 overflow-hidden shrink-0 bg-white/5">
          <OptimizedImage
            src={profile?.photoURL || "/avatars/avatar1.webp"}
            alt="User"
            className="h-full w-full"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-white truncate">
            {profile?.displayName || user?.displayName || "Sira Architect"}
          </p>
          <p className="text-[9px] font-bold text-[#464555] uppercase tracking-tighter truncate opacity-70">
            {profile?.email || user?.email || "architect"}
          </p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300",
                isActive
                  ? "bg-white text-black font-black shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  : "text-[#464555] hover:text-[#E2E2E2] hover:bg-white/5",
              )}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span className="font-headline text-[10px] uppercase tracking-widest">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="mt-auto">
        <div className="vanish-divider mb-6" />
        <button
          onClick={async () => {
            try {
              await signOut();
            } catch (error) {
              console.error("Sign out failed:", error);
            }
          }}
          className="flex items-center gap-4 px-4 py-3 text-[#464555] hover:text-red-400 transition-colors w-full group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
            logout
          </span>
          <span className="font-headline text-[10px] uppercase tracking-widest">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
