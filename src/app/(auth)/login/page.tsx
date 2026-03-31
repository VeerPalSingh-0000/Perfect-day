"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { signInWithGoogle } from "@/lib/auth";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // Redirect if already logged in
  useEffect(() => {
    if (isInitialized && !isLoading && user) {
      router.replace("/today/");
    }
  }, [user, isLoading, isInitialized, router]);

  // Show nothing or skeleton while checking auth state or redirecting
  if (!isInitialized || isLoading || user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-white/5 border-t-white/40 animate-spin" />
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsSigningIn(true);
      const signInUser = await signInWithGoogle();
      if (signInUser) router.push("/today/");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please try again.";
      setError(message);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="bg-black text-[#E2E2E2] font-body min-h-screen selection:bg-white/20 overflow-x-hidden overflow-y-auto">
      {/* TopAppBar */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-[#464555]/15 flex items-center px-6 h-16 justify-center">
        <div className="flex items-center gap-2">
          <OptimizedImage
            src="/logo.png"
            alt="SIRA Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            priority
          />
          <span className="text-[#E2E2E2] font-black tracking-[0.2em] uppercase text-base sm:text-lg font-headline">
            SIRA
          </span>
        </div>
      </nav>
      {/* Main Content Canvas */}
      <main className="relative z-10 h-dvh w-full flex flex-col items-center justify-center pt-20 pb-8 px-6 bg-black overflow-hidden">
        {/* Login Card */}
        <div className="glass-card w-full max-w-md rounded-xl p-6 sm:p-10 flex flex-col items-center premium-shadow max-h-[90vh] overflow-y-auto">
          {/* Icon Header */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center mb-6 sm:mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <span className="material-symbols-outlined text-black text-2xl sm:text-3xl">
              lock
            </span>
          </div>
          {/* Typography Header */}
          <div className="text-center mb-6 sm:mb-10 space-y-1 sm:space-y-2">
            <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-[0.05em] text-[#E2E2E2] uppercase">
              System Access
            </h1>
            <p className="text-[#464555] font-medium text-xs sm:text-sm tracking-wide">
              Enter your credentials to continue.
            </p>
          </div>

          {error && (
            <div className="w-full mb-4 sm:mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 sm:p-4 text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-500">
              {error}
            </div>
          )}

          {/* Actions Container */}
          <div className="w-full space-y-3 sm:space-y-4">
            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className={`w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 px-6 bg-[#E2E2E2] text-black rounded-lg transition-all active:scale-[0.98] font-bold text-xs sm:text-sm uppercase tracking-widest ${
                isSigningIn ? "opacity-50 cursor-not-allowed" : "hover:bg-white"
              }`}
            >
              {isSigningIn ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
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
                  <span>Authorize with Google</span>
                </>
              )}
            </button>
            {/* Divider */}
            <div className="relative py-4 sm:py-6 flex items-center">
              <div className="grow vanish-divider h-px" />
              <span className="shrink mx-4 text-[9px] sm:text-[10px] font-bold text-[#464555] uppercase tracking-[0.3em]">
                Identity Hub
              </span>
              <div className="grow vanish-divider h-px" />
            </div>
            {/* Email Button (Coming Soon) */}
            <button
              disabled
              className="w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 px-6 bg-transparent border border-[#464555]/30 text-[#464555] rounded-lg cursor-not-allowed opacity-50"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">
                mail
              </span>
              <span className="font-bold text-xs sm:text-sm uppercase tracking-widest">
                Email authentication
              </span>
            </button>
          </div>
          {/* Footer Link */}
          <div className="mt-6 sm:mt-10 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
            <span className="text-[#464555]">Unauthorized user? </span>
            <a
              className="text-[#E2E2E2] hover:text-white transition-colors ml-1 underline decoration-[#464555] underline-offset-4"
              href="/signup"
            >
              Request Access
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
