"use client";

import React, { useState } from "react";
import { signInWithGoogle } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentYear } from "@/lib/utils";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      const user = await signInWithGoogle();
      if (user) {
        router.push("/today");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to sign up. Please try again.";
      setError(errorMessage);
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Atmospheric Background Blobs */}
      <div className="fixed top-0 left-0 w-[60%] h-[60%] bg-tertiary/10 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50" />
      <div className="fixed bottom-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none opacity-30" />

      {/* Main Content Card */}
      <main className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="glass-card rounded-xl p-10 flex flex-col items-center shadow-2xl border-white/5 bg-[#0A0A0A]/80">
          {/* Icon Header */}
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,255,255,0.15)] group hover:scale-110 transition-transform duration-500">
            <span
              className="material-symbols-outlined text-black text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          </div>

          {/* Typography Header */}
          <div className="text-center mb-10 space-y-2">
            <h1 className="font-headline text-3xl font-black tracking-[0.05em] text-[#E2E2E2] uppercase">
              Request Access
            </h1>
            <p className="text-[#464555] font-medium text-sm tracking-wide">
              Start building your legacy today.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-lg text-center uppercase tracking-widest">
              {error}
            </div>
          )}

          {/* Actions Container */}
          <div className="w-full space-y-4">
            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#E2E2E2] text-black rounded-lg hover:bg-white transition-all active:scale-[0.98] font-black text-xs uppercase tracking-widest shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="currentColor"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="currentColor"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="currentColor"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="currentColor"
                />
              </svg>
              <span>Join via Google</span>
            </button>

            {/* Divider */}
            <div className="relative py-4 flex items-center">
              <div className="grow vanish-divider h-px" />
              <span className="shrink mx-4 text-[9px] font-black text-[#464555] uppercase tracking-[0.3em]">
                Identity Hub
              </span>
              <div className="grow vanish-divider h-px" />
            </div>

            {/* Email Button (Coming Soon) — now properly disabled */}
            <button
              disabled
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-transparent border border-[#464555]/30 text-[#464555] rounded-lg cursor-not-allowed opacity-50"
            >
              <span className="material-symbols-outlined text-xl">mail</span>
              <span className="font-black text-xs uppercase tracking-widest">
                Email authentication
              </span>
            </button>
          </div>

          {/* Footer Link */}
          <div className="mt-10 text-[10px] font-bold uppercase tracking-widest">
            <span className="text-[#464555]">Already authorized? </span>
            <Link
              href="/login"
              className="text-[#E2E2E2] hover:text-white transition-colors ml-1 underline decoration-[#464555] underline-offset-4"
            >
              Access System
            </Link>
          </div>
        </div>
      </main>

      {/* Brand Label */}
      <div className="fixed bottom-10 w-full text-center z-20">
        <p className="font-headline text-[10px] font-medium tracking-[0.2rem] uppercase text-[#464555]">
          © {getCurrentYear()} SIRA ARCHITECT. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
}
