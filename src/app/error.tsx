"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
        <span className="material-symbols-outlined text-4xl text-red-400">
          error
        </span>
      </div>
      <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tighter text-[#E2E2E2] mb-3">
        Something Went Wrong
      </h1>
      <p className="text-xs text-[#8E8D99] max-w-sm mb-8">
        An unexpected error occurred. Our systems have logged the incident.
        Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-[#E2E2E2] px-6 py-3 text-xs font-bold text-black uppercase tracking-widest hover:bg-white transition-colors active:scale-95"
      >
        Try Again
      </button>
    </div>
  );
}
