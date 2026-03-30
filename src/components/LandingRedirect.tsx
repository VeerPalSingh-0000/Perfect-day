"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * LandingRedirect - Redirects authenticated users from the landing page
 * to the main application (/today).
 */
export function LandingRedirect() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    // If the user is logged in and auth is initialized, redirect to /today
    if (isInitialized && !isLoading && user) {
      router.replace("/today");
    }
  }, [user, isLoading, isInitialized, router]);

  return null;
}
