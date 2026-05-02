/* eslint-disable no-undef */
// firebase-messaging-sw.js
// Place this file in public/ directory
// This file handles background push notifications for web

importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
);

// Listen for config from main app thread via postMessage
let messaging = null;
let configReceived = false;
let isReady = false;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INIT_FIREBASE_CONFIG") {
    try {
      const config = event.data.config;
      console.log(
        "[firebase-messaging-sw.js] Initializing Firebase with config",
      );

      // Initialize Firebase only once
      if (!configReceived) {
        firebase.initializeApp(config);
        messaging = firebase.messaging();
        configReceived = true;
        isReady = true;
        console.log(
          "[firebase-messaging-sw.js] Firebase initialized in Service Worker",
        );

        // Send ready signal back to main thread
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ type: "SW_READY", success: true });
        }

        // Setup message listener after Firebase is initialized
        setupMessageListener();
      }
    } catch (error) {
      console.error(
        "[firebase-messaging-sw.js] Failed to initialize Firebase:",
        error,
      );
      isReady = false;
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: "SW_READY",
          success: false,
          error: error.message,
        });
      }
    }
  }
});

// Handle background messages once Firebase is ready
function setupMessageListener() {
  if (!messaging) {
    console.warn(
      "[firebase-messaging-sw.js] Messaging not ready, retrying in 100ms",
    );
    setTimeout(setupMessageListener, 100);
    return;
  }

  try {
    messaging.onBackgroundMessage(function (payload) {
      console.log(
        "[firebase-messaging-sw.js] Received background message:",
        payload,
      );

      const notificationTitle = payload.notification?.title || "Perfect Day";
      const notificationOptions = {
        body: payload.notification?.body || "You have a new notification",
        icon: payload.notification?.image || "/logo.png",
        badge: "/logo.png",
        tag: payload.data?.tag || "notification",
        data: payload.data || {},
        click_action: payload.data?.click_action || "/",
      };

      self.registration.showNotification(
        notificationTitle,
        notificationOptions,
      );
    });
    console.log(
      "[firebase-messaging-sw.js] Background message listener setup successfully",
    );
  } catch (error) {
    console.error(
      "[firebase-messaging-sw.js] Failed to setup message listener:",
      error,
    );
  }
}

// Handle notification click
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // Get the URL from notification data or default to home
  const url = event.notification.data?.click_action || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // Check if there's already a window/tab with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
