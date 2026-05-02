import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from "firebase/messaging";
import { app } from "./firebase";

let messaging: Messaging | null = null;

/**
 * Initialize Firebase Cloud Messaging
 * Handles both web and native platforms
 * MUST ONLY BE CALLED ON CLIENT SIDE
 */
export const initializeMessaging = async (): Promise<string | null> => {
  // Guard: Ensure this only runs on client
  if (typeof window === "undefined") {
    console.warn("Messaging initialization attempted on server. Skipping.");
    return null;
  }

  try {
    if (Capacitor.isNativePlatform()) {
      // Native Android/iOS
      return await initializeNativeMessaging();
    } else {
      // Web platform
      return await initializeWebMessaging();
    }
  } catch (error) {
    console.error("Failed to initialize messaging:", error);
    return null;
  }
};

/**
 * Initialize messaging for native Android/iOS
 */
const initializeNativeMessaging = async (): Promise<string | null> => {
  try {
    // Request notification permission
    await FirebaseMessaging.requestPermissions();

    console.log("✅ Native notification permission requested");
    // Get the device token for native platforms
    const tokenResult = await FirebaseMessaging.getToken();
    console.log("📱 Native Device Token:", tokenResult.token);
    return tokenResult.token;
  } catch (error) {
    console.error("Failed to initialize native messaging:", error);
    return null;
  }
};

/**
 * Initialize messaging for web platform
 */
const initializeWebMessaging = async (): Promise<string | null> => {
  try {
    // Check if running in development mode
    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";

    // Development warning (Removed return null to allow testing on localhost)
    if (isDev && isLocalhost) {
      console.warn(
        "ℹ️ Push notifications are running in development mode (HTTP/localhost)",
      );
    }

    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      console.warn(
        "Service Workers not supported. Push notifications unavailable.",
      );
      return null;
    }

    // Register service worker
    let registration: ServiceWorkerRegistration | undefined;
    try {
      registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" },
      );
      console.log("✅ Service Worker registered:", registration);

      // Type guard: Ensure registration was successful
      if (!registration) {
        console.error("❌ Service Worker registration returned undefined");
        return null;
      }

      // Cast to non-null for type safety in the following operations
      const reg: ServiceWorkerRegistration = registration;

      // Wait for SW to be active
      let swReady = false;
      let swAttempts = 0;
      const maxAttempts = 50; // 5 seconds max wait

      while (!swReady && swAttempts < maxAttempts) {
        if (reg.active) {
          // Create a communication channel
          const channel = new MessageChannel();

          // Send config and wait for readiness via port
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
              console.warn(
                "[messaging] SW config delivery timeout, proceeding anyway",
              );
              resolve();
            }, 2000);

            channel.port2.onmessage = (event) => {
              if (event.data.type === "SW_READY") {
                clearTimeout(timeout);
                if (event.data.success) {
                  console.log(
                    "✅ Service Worker ready and Firebase initialized",
                  );
                  swReady = true;
                } else {
                  console.error("❌ SW reported error:", event.data.error);
                }
                resolve();
              }
            };

            reg.active!.postMessage(
              {
                type: "INIT_FIREBASE_CONFIG",
                config: {
                  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                  storageBucket:
                    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                  messagingSenderId:
                    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                },
              },
              [channel.port1],
            );
          });

          if (swReady) break;
        }

        // Wait a bit before checking again
        await new Promise((resolve) => setTimeout(resolve, 100));
        swAttempts++;
      }

      if (!reg.active) {
        console.error("❌ Service Worker failed to activate after 5 seconds");
        return null;
      }

      console.log("✅ Firebase config sent to Service Worker");
    } catch (swError) {
      console.error("❌ Failed to register Service Worker:", swError);
      return null;
    }

    // Type guard: Ensure registration is defined
    if (!registration) {
      console.error("❌ Service Worker registration is undefined");
      return null;
    }

    console.log("✅ Firebase config sent to Service Worker");

    // Initialize messaging
    messaging = getMessaging(app);
    console.log("✅ Firebase Messaging initialized");
    console.log("📦 Messaging object:", {
      isInitialized: messaging !== null,
      type: messaging?.constructor?.name,
    });

    // Check VAPID key
    if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
      console.error(
        "❌ NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set in environment",
      );
      console.info(
        "Add to .env.local: NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_key_here",
      );
      return null;
    }

    console.log(
      "✅ VAPID Key found:",
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY.substring(0, 20) + "...",
    );

    // Request notification permission
    const permission = Notification.permission;
    console.log("📋 Current notification permission:", permission);

    if (permission === "default") {
      console.log("📍 Requesting notification permission...");
      try {
        const result = await Notification.requestPermission();
        console.log("📋 Permission result:", result);
        if (result !== "granted") {
          console.warn("⚠️ Notification permission denied by user");
          return null;
        }
      } catch (permError) {
        console.error("❌ Permission request error:", permError);
        return null;
      }
    } else if (permission !== "granted") {
      console.warn(
        "⚠️ Notification permission not granted. Current:",
        permission,
      );
      return null;
    }

    console.log("✅ Notification permission confirmed as granted");

    // Get FCM token
    console.log("🔑 Getting FCM token...");

    // Verify messaging object
    if (!messaging) {
      console.error("❌ Messaging object not initialized");
      return null;
    }

    console.log("✅ Messaging object is valid, ready to request token");

    // Ensure service worker is fully ready
    let swFullyReady = false;
    let readyCheck = 0;
    while (!swFullyReady && readyCheck < 10) {
      if (
        registration &&
        registration.active &&
        navigator.serviceWorker.controller
      ) {
        swFullyReady = true;
        console.log("✅ Service Worker fully ready (controller active)");
      } else {
        console.log("⏳ Waiting for Service Worker controller...");
        await new Promise((resolve) => setTimeout(resolve, 200));
        readyCheck++;
      }
    }

    if (!swFullyReady) {
      console.warn(
        "⚠️ Service Worker controller not ready, proceeding with token request anyway",
      );
    }

    // Small delay to ensure Push Service is fully ready
    await new Promise((resolve) => setTimeout(resolve, 800));

    let token: string | null = null;
    let tokenAttempts = 0;
    const maxTokenAttempts = 5;

    while (!token && tokenAttempts < maxTokenAttempts) {
      try {
        tokenAttempts++;
        console.log(
          `🔑 Attempting to get FCM token (${tokenAttempts}/${maxTokenAttempts})...`,
        );

        token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
        });

        if (token) {
          console.log("✅ Web Device Token obtained successfully:", token);
          return token;
        } else {
          console.warn(
            `⚠️ getToken() returned null on attempt ${tokenAttempts}`,
          );
          // If token is null, wait and retry
          if (tokenAttempts < maxTokenAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } catch (tokenError) {
        const errorMsg =
          tokenError instanceof Error ? tokenError.message : String(tokenError);
        const errorCode =
          tokenError instanceof Error
            ? (tokenError as any).code || "UNKNOWN"
            : "UNKNOWN";

        console.error(
          `❌ FCM token attempt ${tokenAttempts}/${maxTokenAttempts} failed`,
        );
        console.error("  Error Message:", errorMsg);
        console.error("  Error Code:", errorCode);
        console.error("  Full Error:", tokenError);

        // If it's a specific error we can act on
        if (
          errorMsg.includes("not-supported") ||
          errorMsg.includes("not supported")
        ) {
          console.error(
            "🚫 Notifications not supported in this browser/environment",
          );
          return null;
        }

        if (tokenAttempts < maxTokenAttempts) {
          const backoffMs = 500 + tokenAttempts * 500;
          console.log(`⏳ Retrying in ${backoffMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    if (!token) {
      console.error(
        "❌ Failed to obtain FCM token after",
        maxTokenAttempts,
        "attempts",
      );

      // In development, this might be expected
      if (process.env.NODE_ENV === "development") {
        console.info(
          "💡 Development mode: Push Service might have restrictions on non-HTTPS.",
        );
        console.info("For production, ensure HTTPS is enabled and try again.");
        console.info(
          "App will continue to function, but push notifications will be unavailable.",
        );
        // Don't treat as fatal error in development
        return null;
      }

      console.warn(
        "💡 Troubleshooting: Check that VAPID key is valid, HTTPS is used, and Service Worker is active",
      );
      return null;
    }

    console.log("✅ Web Device Token obtained successfully");
    return token;
  } catch (error) {
    console.error("❌ Failed to initialize web messaging:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
};

/**
 * Listen for foreground messages on web
 * MUST ONLY BE CALLED ON CLIENT SIDE
 */
export const onForegroundMessage = (
  callback: (payload: any) => void,
): (() => void) | null => {
  // Guard: Only run on client
  if (typeof window === "undefined") {
    return null;
  }

  try {
    if (Capacitor.isNativePlatform()) {
      // For native, use FirebaseMessaging plugin
      return () => {
        FirebaseMessaging.addListener("notificationReceived", (event) => {
          console.log("📬 Native foreground message:", event.notification);
          callback(event.notification);
        });
      };
    } else {
      // For web
      if (!messaging) {
        messaging = getMessaging(app);
      }

      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("📬 Web foreground message:", payload);
        callback(payload);
      });

      return unsubscribe;
    }
  } catch (error) {
    console.error("Failed to listen for foreground messages:", error);
    return null;
  }
};

/**
 * Get or retrieve a stored device token
 */
export const getDeviceToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fcm_device_token");
};

/**
 * Save device token to local storage and database
 */
export const saveDeviceToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("fcm_device_token", token);
};

/**
 * Send a test notification (for debugging)
 */
export const sendTestNotification = (): void => {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification("Perfect Day Notification Test", {
      body: "If you see this, push notifications are working! 🎉",
      icon: "/logo.png",
      badge: "/logo.png",
      tag: "test-notification",
    });
  }
};
