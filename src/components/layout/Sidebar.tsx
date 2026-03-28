"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { signOut } from "../../lib/auth";

const NAV_ITEMS = [
  { href: "/today", label: "Focus", icon: "home" },
  { href: "/history", label: "Journey", icon: "explore" },
  { href: "/analytics", label: "Alerts", icon: "notifications" },
  { href: "/settings", label: "Profile", icon: "person" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 h-screen bg-black sticky top-0 px-6 py-10 flex-col border-r border-[#464555]/15">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-16 px-2">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#4F44E2] to-[#C4C0FF] flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(79,68,226,0.3)]">
          P
        </div>
        <span className="font-['Plus_Jakarta_Sans'] font-black tracking-[0.2em] text-sm text-[#E2E2E2] uppercase">
          STEALTH
        </span>
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
              <span className="font-headline text-xs uppercase tracking-widest">
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
          <span className="font-headline text-xs uppercase tracking-widest">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
