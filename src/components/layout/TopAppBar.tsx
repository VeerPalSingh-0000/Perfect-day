"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface TopAppBarProps {
  variant?: "brand" | "title";
  title?: string;
  showSearch?: boolean;
}

export function TopAppBar({ variant = "brand", title, showSearch = false }: TopAppBarProps) {
  const router = useRouter();

  return (
    <header className="fixed top-0 z-50 flex h-14 sm:h-16 w-full items-center justify-between border-b border-[#464555]/15 bg-black/80 px-4 sm:px-6 backdrop-blur-xl md:left-60 md:w-[calc(100%-15rem)]">
      <div className="flex items-center gap-2 sm:gap-4">
        {variant === "title" && (
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 text-[#E2E2E2] transition-colors duration-300 hover:bg-white/5 active:bg-white/10"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-sm sm:text-xl">
              arrow_back
            </span>
          </button>
        )}

        {variant === "brand" ? (
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 md:hidden cursor-pointer" onClick={() => router.push('/today')}>
            <OptimizedImage
              src="/logo.png"
              alt="Sira Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 scale-[2] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]"
              priority
            />
            <h1 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-black uppercase tracking-[0.2em] text-[#E2E2E2]">
              SIRA
            </h1>
          </div>
        ) : (
          <h1 className="font-['Plus_Jakarta_Sans'] text-xs sm:text-base font-bold tracking-tighter text-[#E2E2E2]">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {showSearch && (
          <button
            className="rounded-lg p-2 text-[#E2E2E2] transition-colors duration-300 hover:bg-white/5 active:bg-white/10"
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-sm sm:text-xl">
              search
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
