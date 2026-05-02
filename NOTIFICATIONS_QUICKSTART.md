# Push Notifications - Quick Start

Get push notifications working in 5 minutes!

## ⚡ Quick Setup

### 1. **Add Environment Variable**

Add to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_from_firebase_console
```

**Where to find it:**

- Firebase Console → Project Settings → Cloud Messaging tab
- Copy "Web Push certificates" → "Public key (VAPID key)"

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Sync Android (if building for mobile)**

```bash
npm run android:sync
```

### 4. **Test It!**

Build and run the app:

```bash
npm run dev           # Web
npm run build:android # Android
npm run android:sync
npm run android:open
```

Then go to Settings → Push Delivery → Enable notifications

---

## 📱 What's Included

Everything is already implemented:

✅ **Web Push** - Service Worker + Firebase Cloud Messaging  
✅ **Android Push** - Capacitor Firebase Messaging Plugin  
✅ **Auto-Initialization** - Starts when app loads  
✅ **Settings UI** - Users can enable/disable notifications  
✅ **Device Token Tracking** - Auto-saved locally

---

## 🧪 Testing

### On Browser

1. Go to Settings page
2. Enable "Push Delivery"
3. Click "Send Test Notification"
4. You should see a notification! 🎉

### On Android

1. Install app on device
2. Go to Settings → Push Delivery
3. Grant notification permissions
4. Wait for a test notification to appear

---

## 📡 Sending Notifications

### Option A: Firebase Console (Easiest)

1. Firebase Console → Cloud Messaging
2. "Send your first message"
3. Fill in title & body
4. Target → Select "Perfect Day" app
5. Click "Send"

### Option B: Backend API (Recommended)

```typescript
import { sendNotificationToUser } from "@/path/to/backend";

// Send to specific user
await sendNotificationToUser(
  userId,
  "Task Reminder",
  "You have 3 tasks left today!",
);

// Or send to a topic (broadcast)
await sendNotificationToTopic(
  "daily_reminders",
  "Good Morning!",
  "Time to start your day",
);
```

See `NOTIFICATION_EXAMPLES.md` for complete backend examples.

---

## 🔧 Troubleshooting

| Problem                   | Solution                                                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Notifications not showing | ✓ Check permissions granted<br>✓ Verify `.env.local` has VAPID key<br>✓ Check browser console for errors              |
| "No device token"         | ✓ Make sure notification permission is granted<br>✓ Wait a few seconds for token to load                              |
| Android not receiving     | ✓ Run `npm run android:sync`<br>✓ Check Android 13+ for runtime permissions<br>✓ Verify `google-services.json` exists |

---

## 📁 Key Files

| File                                | Purpose                                     |
| ----------------------------------- | ------------------------------------------- |
| `src/lib/messaging.ts`              | FCM initialization & token management       |
| `src/hooks/usePushNotifications.ts` | React hook to setup notifications           |
| `public/firebase-messaging-sw.js`   | Service Worker for background notifications |
| `capacitor.config.ts`               | Android/iOS plugin configuration            |
| `PUSH_NOTIFICATIONS.md`             | Complete documentation                      |
| `NOTIFICATION_EXAMPLES.md`          | Backend code examples                       |

---

## 💡 Best Practices

1. **Save tokens to database** after user logs in

   ```typescript
   const token = getDeviceToken();
   if (token) await api.saveDeviceToken(userId, token);
   ```

2. **Use topics for broadcasts** instead of storing individual tokens

   ```typescript
   await FirebaseMessaging.subscribeToTopic({ topic: "users" });
   // Send to all users at once
   ```

3. **Handle token refresh** automatically

   ```typescript
   FirebaseMessaging.addListener("tokenReceived", (event) => {
     updateDeviceToken(event.token);
   });
   ```

4. **Always check permissions** before showing notifications
   ```typescript
   if (Notification.permission === "granted") {
     // Safe to notify
   }
   ```

---

## 🎯 Next Steps

1. ✅ Setup VAPID key in `.env.local`
2. ✅ Run `npm install && npm run build:android`
3. ✅ Test on device
4. ✅ Integrate backend notification sending
5. ✅ Subscribe users to relevant topics

---

**Need more help?** Check `PUSH_NOTIFICATIONS.md` for detailed documentation.
