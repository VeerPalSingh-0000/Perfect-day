"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDataStore } from "@/stores/useDataStore";
import { initAuthListener } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";

function AppSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4F44E2] border-t-transparent" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#464555] animate-pulse">
          Loading
        </span>
      </div>
    </div>
  );
}

// Helper to get today as YYYY-MM-DD
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const fetchAll = useDataStore((s) => s.fetchAll);
  const isDataLoaded = useDataStore((s) => s.isDataLoaded);
  const router = useRouter();

  // Start the singleton auth listener
  useEffect(() => {
    initAuthListener();
  }, []);

  // Redirect to login only once we know auth state
  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, isInitialized, router]);

  // Fetch ALL data once when user is available
  useEffect(() => {
    if (user && !isDataLoaded) {
      fetchAll(user.uid, getTodayStr());
    }
  }, [user, isDataLoaded, fetchAll]);

  if (!isInitialized) return <AppSkeleton />;
  if (!user) return <AppSkeleton />;

  // Show skeleton only on the very first data load
  if (!isDataLoaded) return <AppSkeleton />;

  return (
    <div className="flex min-h-screen bg-black w-full">
      <Sidebar />
      <div className="flex-1 w-full max-w-full relative overflow-x-hidden pb-16 md:pb-0">
        <div className="animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
