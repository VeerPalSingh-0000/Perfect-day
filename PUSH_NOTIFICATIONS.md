# Push Notifications Setup Guide

This guide explains how push notifications are implemented in Perfect Day and how to set them up correctly.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup Steps](#setup-steps)
3. [Environment Variables](#environment-variables)
4. [Testing](#testing)
5. [Sending Notifications](#sending-notifications)
6. [Troubleshooting](#troubleshooting)

## Overview

Perfect Day uses **Firebase Cloud Messaging (FCM)** to send push notifications to users on both web and mobile platforms.

- **Web**: Service Worker + FCM SDK
- **Android**: Capacitor Firebase Messaging Plugin + FCM

## Setup Steps

### 1. Install Dependencies

The required dependencies have been added to `package.json`:

```bash
npm install
```

This installs:

- `@capacitor-firebase/messaging` - Native messaging plugin
- `firebase` - Firebase SDK with messaging support

### 2. Add Environment Variables

Add these to your `.env.local`:

```env
# Firebase Messaging (for web push notifications)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

**How to get your VAPID key:**

1. Go to Firebase Console → Project Settings
2. Click "Cloud Messaging" tab
3. Copy the "Web Push certificates" → "Public key (VAPID key)"

### 3. Set Up Service Worker

✅ Already created at `public/firebase-messaging-sw.js`

This file handles:

- Background push notifications on web
- Notification clicks and routing
- Platform-specific notification handling

### 4. Update Capacitor Configuration

✅ Already updated in `capacitor.config.ts`

Added Firebase Messaging plugin with:

- Badge display
- Sound alerts
- Alert popups

### 5. Android Configuration

The `google-services.json` is already in `android/app/` and includes FCM configuration.

**To enable push notifications:**

1. Sync Capacitor:

   ```bash
   npm run android:sync
   ```

2. In Android Studio, ensure permissions are added to `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   ```

## Environment Variables

Required configuration:

| Variable                                     | Source           | Purpose                |
| -------------------------------------------- | ---------------- | ---------------------- |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY`             | Firebase Console | Web push certificate   |
| `NEXT_PUBLIC_FIREBASE_API_KEY`               | `.env.local`     | Firebase API key       |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`            | `.env.local`     | Firebase project ID    |
| All other `NEXT_PUBLIC_FIREBASE_*` variables | `.env.local`     | Firebase configuration |

## Testing

### Test on Web (Browser)

1. Build and run the app:

   ```bash
   npm run dev
   ```

2. Open DevTools (F12) → Application → Service Workers
3. You should see `firebase-messaging-sw.js` registered

4. Test notification in settings:
   - Go to Settings → Push Delivery
   - Enable notifications
   - Grant browser permissions when prompted
   - Click "Test Notification" button

### Test on Android

1. Build and deploy to device:

   ```bash
   npm run build:android
   npm run android:sync
   ```

2. Open Android Studio and run on emulator/device

3. Open app and check permissions in settings

4. Send a test notification from Firebase Console:
   - Firebase Console → Cloud Messaging
   - Click "Send your first message"
   - Target by app/topic/device

## Sending Notifications

### From Firebase Console (Manual)

1. Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Choose target type (app, topic, or device token)
4. Set title, body, and image
5. Click "Send"

### From Your Backend (Programmatic)

Use Firebase Admin SDK to send notifications:

```typescript
// backend/sendNotification.ts
import admin from "firebase-admin";

export async function sendNotificationToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
) {
  try {
    // Get user's device tokens from Firestore
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();
    const deviceTokens = userDoc.data()?.deviceTokens || [];

    if (deviceTokens.length === 0) {
      console.log("No device tokens found for user:", userId);
      return;
    }

    // Send to each device
    const message = {
      notification: {
        title,
        body,
        imageUrl: "/logo.png",
      },
      data,
      tokens: deviceTokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log("Notifications sent:", response.successCount);
    console.log("Failed:", response.failureCount);
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}
```

### Using Topics (Broadcast)

Subscribe users to topics and send to all subscribers:

```typescript
// Frontend
import { FirebaseMessaging } from "@capacitor-firebase/messaging";

// Subscribe to a topic (e.g., "daily_reminders")
await FirebaseMessaging.subscribeToTopic({
  topic: "daily_reminders",
});

// Backend - Send to topic
const message = {
  notification: {
    title: "Daily Reminder",
    body: "Time to complete your tasks!",
  },
  topic: "daily_reminders",
};

await admin.messaging().send(message);
```

## Implementation Details

### Files Modified

- ✅ `package.json` - Added `@capacitor-firebase/messaging`
- ✅ `capacitor.config.ts` - Added Firebase Messaging plugin
- ✅ `src/components/AuthInitializer.tsx` - Integrated notification setup
- ✅ `src/hooks/usePushNotifications.ts` - New notification hook (NEW)
- ✅ `src/lib/messaging.ts` - FCM service (NEW)
- ✅ `public/firebase-messaging-sw.js` - Service worker (NEW)

### Key Components

#### `usePushNotifications()` Hook

Initialize push notifications in your app:

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function App() {
  usePushNotifications(); // Call once at app root

  return <YourApp />;
}
```

Already integrated in `AuthInitializer.tsx` ✅

#### Messaging Service (`src/lib/messaging.ts`)

Provides functions:

- `initializeMessaging()` - Initialize FCM
- `onForegroundMessage(callback)` - Listen for notifications
- `getDeviceToken()` - Get stored device token
- `saveDeviceToken(token)` - Save token locally
- `sendTestNotification()` - Send test notification

## Best Practices

### 1. Save Device Tokens to Database

When a user logs in, save their device token:

```typescript
// After user authentication
const token = getDeviceToken();
if (token && user) {
  await updateUserProfile(user.uid, {
    deviceTokens: firebase.firestore.FieldValue.arrayUnion(token),
  });
}
```

### 2. Handle Token Refresh

Device tokens can refresh. Listen and update:

```typescript
import { FirebaseMessaging } from "@capacitor-firebase/messaging";

FirebaseMessaging.addListener("tokenReceived", (event) => {
  const newToken = event.token;
  // Save new token to database
  updateDeviceToken(newToken);
});
```

### 3. Use Topics for Broadcasts

Instead of storing individual tokens:

```typescript
// Subscribe users to topics
await FirebaseMessaging.subscribeToTopic({ topic: "users" });

// Send to all users
await admin.messaging().send({
  notification: { title: "Update", body: "New features available!" },
  topic: "users",
});
```

### 4. Handle Notification Permissions

Always check for permission before showing notifications:

```typescript
if (Notification.permission === "granted") {
  // Safe to show notifications
}
```

## Troubleshooting

### Issue: "Service Worker registration failed"

**Cause**: Service worker file not found or invalid

**Solution**:

1. Ensure `public/firebase-messaging-sw.js` exists
2. Check browser console for specific errors
3. Verify `.js` extension (not `.ts`)

### Issue: "Token is undefined"

**Cause**: Firebase not initialized or permission not granted

**Solution**:

1. Check `.env.local` has all Firebase variables
2. Ensure Notification permission is granted
3. Check browser console for initialization errors

### Issue: "Notifications not showing on Android"

**Cause**: Missing Android permissions or plugin not synced

**Solution**:

1. Run `npm run android:sync`
2. Check `AndroidManifest.xml` includes:
   ```xml
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   ```
3. Verify Android 13+ (API 33) for runtime permissions
4. Check notification channel is created

### Issue: "Device tokens not persisting"

**Cause**: Token refresh not handled

**Solution**:

1. Listen to token refresh events:
   ```typescript
   FirebaseMessaging.addListener("tokenReceived", (event) => {
     saveDeviceToken(event.token);
   });
   ```
2. Store tokens in database with expiry handling

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Add `.env.local` variables (especially `NEXT_PUBLIC_FIREBASE_VAPID_KEY`)
3. Run: `npm run build:android && npm run android:sync`
4. Test on device/emulator
5. Implement backend notification sending
6. Save device tokens to your Firestore database

## Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Firebase Messaging Plugin](https://github.com/capacitor-community/firebase-messaging)
- [Service Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Push Protocol](https://tools.ietf.org/html/draft-ietf-webpush-protocol)

---

For questions or issues, refer to Firebase Console logs and browser DevTools.
