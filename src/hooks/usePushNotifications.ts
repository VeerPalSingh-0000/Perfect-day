"use client";

import React, { useEffect, useRef } from "react";
import {
  initializeMessaging,
  onForegroundMessage,
  getDeviceToken,
  saveDeviceToken,
} from "@/lib/messaging";
import { saveFCMToken } from "@/lib/db";

/**
 * Hook to initialize and manage push notifications
 * Call this once in your root layout or main component
 */
export function usePushNotifications(userId?: string) {
  const initRef = useRef(false);

  useEffect(() => {
    // Guard: Only run on client
    if (typeof window === "undefined") {
      return;
    }

    // Prevent double initialization if no change in status
    if (initRef.current && !userId) return;
    initRef.current = true;

    let unsubscribe: (() => void) | null = null;

    const setupNotifications = async () => {
      try {
        console.log("🚀 Starting push notifications setup...");
        const token = await initializeMessaging();

        if (token) {
          saveDeviceToken(token);
          console.log("✅ Push notifications initialized with token:", token);

          // Save to database if userId is available
          if (userId) {
            await saveFCMToken(userId, token);
          }
        } else {
          console.warn("⚠️ Could not get device token.");
        }

        // Listen for foreground messages
        const unsub = onForegroundMessage((payload) => {
          console.log("📨 Foreground notification:", payload);

          if (payload.notification) {
            if (typeof window !== "undefined" && "Notification" in window) {
              const notification = new Notification(
                payload.notification.title || "Perfect Day",
                {
                  body: payload.notification.body || "You have a new notification",
                  icon: payload.notification.image || "/logo.png",
                  badge: "/logo.png",
                  tag: payload.data?.tag || "foreground",
                },
              );

              notification.onclick = () => {
                window.focus();
                notification.close();
                if (payload.data?.click_action) {
                  window.location.href = payload.data.click_action;
                }
              };
            }
          }
        });

        if (unsub) unsubscribe = unsub;
      } catch (error) {
        console.error("❌ Failed to setup push notifications:", error);
      }
    };

    setupNotifications();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);
}

/**
 * Hook to get the current device token
 */
export function useDeviceToken(): string | null {
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedToken = getDeviceToken();
    setToken(storedToken);
  }, []);

  return token;
}
