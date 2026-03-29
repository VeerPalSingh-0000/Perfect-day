"use client";

import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#464555]/20 bg-[#0E0E0E]">
        <span className="material-symbols-outlined text-4xl text-[#464555]">
          explore_off
        </span>
      </div>
      <h1 className="font-headline text-4xl sm:text-5xl font-black tracking-tighter text-[#E2E2E2] mb-3">
        404
      </h1>
      <p className="text-sm font-bold uppercase tracking-widest text-[#464555] mb-2">
        Route Not Found
      </p>
      <p className="text-xs text-[#8E8D99] max-w-sm mb-10">
        The page you&apos;re looking for doesn&apos;t exist or has been relocated
        to a different sector.
      </p>
      <Link
        href="/"
        className="rounded-full bg-[#E2E2E2] px-6 py-3 text-xs font-bold text-black uppercase tracking-widest hover:bg-white transition-colors active:scale-95"
      >
        Return Home
      </Link>
    </div>
  );
}
