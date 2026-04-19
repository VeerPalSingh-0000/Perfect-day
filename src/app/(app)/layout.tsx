// src/app/(app)/layout.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDataStore } from "@/stores/useDataStore";
import { useTrackerStore } from "@/stores/useTrackerStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

// Helper to get today as YYYY-MM-DD
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const fetchAll = useDataStore((s) => s.fetchAll);
  const startTrackerSync = useDataStore((s) => s.startTrackerSync);
  const isDataLoaded = useDataStore((s) => s.isDataLoaded);

  const trackerUser = useTrackerStore((s) => s.trackerUser);
  const isTrackerLinked = useTrackerStore((s) => s.isLinked);
  const initTrackerAuth = useTrackerStore((s) => s.initTrackerAuth);

  // Ensure client-only render
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    initTrackerAuth();
  }, [initTrackerAuth]);

  // Redirect to login only once we know auth state
  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, isInitialized, router]);

  // Fetch ALL data once when user is available
  useEffect(() => {
    if (user && !isDataLoaded) {
      fetchAll(user.uid, getTodayStr(), user.email);
    }
  }, [user, isDataLoaded, fetchAll]);

  // Start Tracker Sync when linked
  useEffect(() => {
    if (user && isTrackerLinked && trackerUser) {
      startTrackerSync(user.uid, trackerUser.uid);
    }
  }, [user, isTrackerLinked, trackerUser, startTrackerSync]);

  // Refresh data when app returns to foreground or tab becomes visible.
  useEffect(() => {
    if (!user) return;

    const reloadData = () => {
      fetchAll(user.uid, getTodayStr(), user.email, true);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reloadData();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    let removeAppStateListener: (() => void) | undefined;
    if (Capacitor.isNativePlatform()) {
      App.addListener(
        "appStateChange",
        ({ isActive }: { isActive: boolean }) => {
          if (isActive) reloadData();
        },
      ).then((listener: { remove: () => void }) => {
        removeAppStateListener = () => listener.remove();
      });
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      removeAppStateListener?.();
    };
  }, [user, fetchAll]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted || !isInitialized || isLoading || !user || !isDataLoaded) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex min-h-screen bg-black w-full">
      <Sidebar />
      <div className="flex-1 w-full max-w-full relative overflow-x-hidden pb-16 md:pb-0">
        <div className="animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
