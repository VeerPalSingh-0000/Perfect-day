"use client";

import React, { useEffect, useRef } from "react";
import {
  initializeMessaging,
  onForegroundMessage,
  getDeviceToken,
  saveDeviceToken,
} from "@/lib/messaging";

/**
 * Hook to initialize and manage push notifications
 * Call this once in your root layout or main component
 */
export function usePushNotifications() {
  const initRef = useRef(false);

  useEffect(() => {
    // Guard: Only run on client
    if (typeof window === "undefined") {
      return;
    }

    // Prevent double initialization
    if (initRef.current) return;
    initRef.current = true;

    const setupNotifications = async () => {
      try {
        console.log("🚀 Starting push notifications setup...");

        // Initialize messaging and get device token
        const token = await initializeMessaging();

        if (token) {
          // Save token locally
          saveDeviceToken(token);
          console.log("✅ Push notifications initialized with token:", token);

          // TODO: Send this token to your backend to store in user profile
          // await api.saveDeviceToken(token);
        } else {
          console.warn(
            "⚠️ Could not get device token. Push notifications may not work.",
          );
          console.info("Check browser console for detailed error messages");
        }

        // Listen for foreground messages
        const unsubscribe = onForegroundMessage((payload) => {
          console.log("📨 Foreground notification:", payload);

          // Customize how you want to display the notification
          if (payload.notification) {
            // You can show a toast, modal, or badge here
            if (typeof window !== "undefined" && "Notification" in window) {
              const notification = new Notification(
                payload.notification.title || "Perfect Day",
                {
                  body:
                    payload.notification.body || "You have a new notification",
                  icon: payload.notification.image || "/logo.png",
                  badge: "/logo.png",
                  tag: payload.data?.tag || "foreground",
                },
              );

              // Optional: Handle notification click
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

        return () => {
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error("❌ Failed to setup push notifications:", error);
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
          });
        }
      }
    };

    setupNotifications();
  }, []);
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
