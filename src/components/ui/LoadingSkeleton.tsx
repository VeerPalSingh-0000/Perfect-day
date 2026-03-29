"use client";

export function LoadingSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Deep Atmospheric Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-160 h-160 bg-[#4F44E2]/5 blur-[120px] rounded-full animate-pulse-glow" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-80 bg-[#4F44E2]/10 blur-[80px] rounded-full animate-pulse"
          style={{ animationDuration: "3s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 animate-fade-in-up">
        {/* Core Loader Component */}
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Rotating borders */}
          <div className="absolute inset-0 rounded-full border border-white/5" />
          <div
            className="absolute inset-1 rounded-full border border-t-[#4F44E2] border-r-transparent border-b-transparent border-l-transparent animate-spin"
            style={{ animationDuration: "2s" }}
          />
          <div
            className="absolute -inset-1 rounded-full border border-b-[#7CF6EC]/30 border-t-transparent border-r-transparent border-l-transparent animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "3s" }}
          />

          {/* Inner Glowing Center */}
          <div className="w-12 h-12 rounded-full bg-black/80 border border-white/10 backdrop-blur-2xl flex items-center justify-center premium-shadow">
            <div className="w-4 h-4 rounded-full bg-linear-to-tr from-[#4F44E2] to-[#C4C0FF] animate-pulse glow-primary shadow-[0_0_20px_rgba(196,192,255,0.6)]" />
          </div>
        </div>

        {/* Branding & Status */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-white/90 font-black tracking-[0.4em] uppercase text-sm font-headline drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            SIRA
          </span>
          <div className="flex items-center gap-4">
            <div className="h-px w-6 bg-linear-to-r from-transparent to-[#4F44E2]/50" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#464555] animate-pulse">
              System Initialization
            </span>
            <div className="h-px w-6 bg-linear-to-l from-transparent to-[#4F44E2]/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
