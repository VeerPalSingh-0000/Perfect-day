"use client";

import { useEffect } from "react";
import { initAuthListener } from "@/lib/auth";
import { usePushNotifications } from "@/hooks/usePushNotifications";

/**
 * AuthInitializer - Ensures auth listener is initialized at the root level.
 * This must be called in the root layout to ensure Firebase authentication
 * persistence is properly set up and remains throughout the app lifecycle.
 * Also initializes push notifications.
 */
export function AuthInitializer() {
  // Initialize push notifications
  usePushNotifications();

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
