"use client";

import { useEffect } from "react";
import { initAuthListener } from "@/lib/auth";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * AuthInitializer - Ensures auth listener is initialized at the root level.
 * This must be called in the root layout to ensure Firebase authentication
 * persistence is properly set up and remains throughout the app lifecycle.
 * Also initializes push notifications.
 */
export function AuthInitializer() {
  const user = useAuthStore((s) => s.user);

  // Initialize push notifications
  usePushNotifications(user?.uid);

  useEffect(() => {
    // Initialize the auth listener singleton at the root level
    const unsubscribe = initAuthListener();
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return null; // This is a non-rendering component
}
