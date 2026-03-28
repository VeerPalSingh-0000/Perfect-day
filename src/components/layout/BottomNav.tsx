"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

const navItems = [
  { id: "focus", label: "Focus", icon: "home", href: "/today" },
  { id: "journey", label: "Journey", icon: "explore", href: "/history" },
  { id: "alerts", label: "Alerts", icon: "notifications", href: "/analytics" },
  { id: "profile", label: "Profile", icon: "person", href: "/settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-[#464555]/15 bg-black/80 px-4 pb-safe pt-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between px-2 pb-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-200 active:scale-90 p-1 sm:p-2",
              isActive
                ? "text-white drop-shadow-[0_0_8px_rgba(196,192,255,0.8)] scale-100 sm:scale-110"
                : "text-[#464555] opacity-50 hover:text-[#E2E2E2]",
            )}
          >
            <span
              className="material-symbols-outlined text-lg sm:text-2xl"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span className="font-headline text-[8px] sm:text-[10px] uppercase tracking-widest mt-0.5 sm:mt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
      </div>
    </nav>
  );
}
