"use client";

import React, { useEffect, useRef } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { useAuthStore } from "@/stores/useAuthStore";

export function NotificationCenter() {
  const user = useAuthStore((s) => s.user);
  const tasks = useDataStore((s) => s.tasks);
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    // Request permission if not already granted
    if (Notification.permission === "default") {
      // We wait 30 seconds before asking so we don't annoy them instantly
      setTimeout(() => {
        Notification.requestPermission();
      }, 30000);
    }
  }, []);

  useEffect(() => {
    if (!user || Notification.permission !== "granted") return;

    // Smart logic: Check every hour for "Incomplete Tasks" reminders
    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.toLocaleDateString("en-CA");

      // Only run reminder between 5 PM and 8 PM
      if (currentHour >= 17 && currentHour <= 20) {
        // Only run once per day
        const lastCheckKey = `last_reminder_${user.uid}_${currentDay}`;
        const hasRemindedToday = localStorage.getItem(lastCheckKey);

        if (!hasRemindedToday) {
          const incomplete = tasks.filter((t) => !t.isCompleted).length;
          if (incomplete > 0) {
            new Notification("SIRA: Daily Progress", {
              body: `You still have ${incomplete} tasks to finish today. You can do it! 🔥`,
              icon: "/logo.png",
            });
            localStorage.setItem(lastCheckKey, "true");
          }
        }
      }
    }, 1000 * 60 * 60); // Check once an hour

    return () => clearInterval(interval);
  }, [user, tasks]);

  return null;
}
