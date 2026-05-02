"use client";

import React from "react";
import { getDeviceToken, sendTestNotification } from "@/lib/messaging";
import { cn } from "@/lib/utils";

/**
 * Notification Status Component
 * Displays current notification status and device token info
 */
export function NotificationStatus() {
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [notificationStatus, setNotificationStatus] = React.useState<
    "granted" | "denied" | "default" | "unavailable"
  >("unavailable");

  React.useEffect(() => {
    // Check notification support and permission status
    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      setNotificationStatus("unavailable");
      return;
    }

    setNotificationStatus(
      Notification.permission as "granted" | "denied" | "default",
    );

    // Get stored token
    const storedToken = getDeviceToken();
    setToken(storedToken);
  }, []);

  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      sendTestNotification();
    } catch (error) {
      console.error("Failed to send test notification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (notificationStatus) {
      case "granted":
        return "text-green-500";
      case "denied":
        return "text-red-500";
      case "default":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = () => {
    switch (notificationStatus) {
      case "granted":
        return "✅ Enabled";
      case "denied":
        return "❌ Disabled";
      case "default":
        return "⏳ Not Asked";
      default:
        return "❓ Unavailable";
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/5">
      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">
          Notification Status
        </span>
        <span className={cn("text-sm font-bold", getStatusColor())}>
          {getStatusText()}
        </span>
      </div>

      {/* Token Display */}
      {token && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Device Token (FCM)</p>
          <div className="bg-black/50 rounded p-2 border border-white/10">
            <code className="text-xs text-cyan-400 break-all font-mono">
              {token.slice(0, 50)}...
            </code>
          </div>
          <p className="text-xs text-gray-500">
            Full token stored in localStorage
          </p>
        </div>
      )}

      {/* Test Button */}
      {notificationStatus === "granted" && (
        <button
          onClick={handleTestNotification}
          disabled={isLoading}
          className={cn(
            "w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors",
            isLoading
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white active:bg-blue-800",
          )}
        >
          {isLoading ? "Sending..." : "Send Test Notification"}
        </button>
      )}

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 text-xs text-blue-300">
        <p className="font-medium mb-1">ℹ️ About Notifications</p>
        <ul className="space-y-1 text-blue-300/80">
          <li>• Enable to receive task reminders</li>
          <li>• Works on web, Android, and iOS</li>
          <li>• Token auto-refreshes when needed</li>
        </ul>
      </div>
    </div>
  );
}
