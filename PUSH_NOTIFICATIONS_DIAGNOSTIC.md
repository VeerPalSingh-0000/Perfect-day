# 🔍 Push Notifications Diagnostic Guide

If you're seeing "Could not get device token" error, use this guide to diagnose the issue.

## Step 1: Check Environment Variables

Open `.env.local` and verify:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here  ⬅️ THIS IS CRITICAL
```

**To get VAPID key:**

1. Go to Firebase Console → Project Settings
2. Click "Cloud Messaging" tab
3. Copy "Web Push certificates" → "Public key (VAPID key)"

## Step 2: Check Browser Console Logs

When you load the app, open DevTools (F12) → Console tab and look for:

### ✅ Success Logs (You should see these)

```
🚀 Starting push notifications setup...
✅ Service Worker registered: ...
✅ Firebase Messaging initialized
📋 Current notification permission: granted
✅ Web Device Token obtained successfully
```

### ❌ Error Logs (Diagnose these)

| Error                                                  | Cause                       | Solution                                           |
| ------------------------------------------------------ | --------------------------- | -------------------------------------------------- |
| `❌ NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set`         | Missing VAPID key in .env   | Add to .env.local and restart dev server           |
| `❌ Failed to register Service Worker`                 | Service worker file missing | Check `public/firebase-messaging-sw.js` exists     |
| `📋 Current notification permission: denied`           | User denied notifications   | Clear site data and reload, then accept permission |
| `❌ Failed to initialize web messaging: FirebaseError` | Firebase misconfiguration   | Check all Firebase env vars are correct            |

## Step 3: Check Service Worker

Open DevTools → Application tab → Service Workers:

✅ You should see `/firebase-messaging-sw.js` in the active workers list

If not registered:

1. Check `public/firebase-messaging-sw.js` exists
2. Hard refresh (Ctrl+Shift+R)
3. Check console for registration errors

## Step 4: Check Notification Permission

Open DevTools → Console and run:

```javascript
Notification.permission; // Should return "granted"
```

If it returns "denied":

1. Click lock icon in address bar
2. Find "Notifications" setting
3. Change from "Block" to "Allow"
4. Refresh page

## Step 5: Firestore Permissions Error

The separate "Missing or insufficient permissions" error is about Firestore, not notifications.

**Fix:**

1. Go to Firebase Console → Firestore → Rules
2. Check rules allow authenticated reads/writes:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Complete Checklist

- [ ] VAPID key is in `.env.local`
- [ ] Dev server restarted after adding VAPID key
- [ ] `public/firebase-messaging-sw.js` exists
- [ ] Browser allows notifications (not blocked)
- [ ] All Firebase env variables are correct
- [ ] Browser console shows detailed logs (no errors)
- [ ] Service Worker is registered (check Application tab)
- [ ] Firestore rules allow authenticated access

## Debug Commands

Run these in browser console to diagnose:

```javascript
// Check if Service Worker is registered
navigator.serviceWorker.getRegistrations();

// Check notification permission
Notification.permission;

// Check if Firebase app is initialized
try {
  const { app } = await import("./src/lib/firebase");
  console.log("Firebase app:", app);
} catch (e) {
  console.error("Firebase error:", e);
}

// Check if messaging is available
"serviceWorker" in navigator && "Notification" in window;
```

## Common Issues & Fixes

### Issue: Token changes every refresh

**Cause:** Normal behavior - FCM tokens can refresh  
**Fix:** Save to database on every init, use token refresh listener

### Issue: Service Worker won't register

**Cause:** File path wrong or CORS issue  
**Fix:** Ensure file is at `public/firebase-messaging-sw.js` (exact path)

### Issue: Notifications work on web but not Android

**Cause:** Plugin not synced or permissions missing  
**Fix:** Run `npm run android:sync` and check AndroidManifest.xml

### Issue: Permission prompt doesn't appear

**Cause:** Already dismissed - browser won't ask again  
**Fix:**

1. Go to site settings (lock icon in address bar)
2. Reset permissions
3. Hard refresh (Ctrl+Shift+R)

## Next Steps

1. ✅ Verify all steps in checklist
2. ✅ Check browser console for detailed error messages
3. ✅ Share error messages from console if still stuck
4. ✅ Test notification on [Firebase Console → Cloud Messaging](https://console.firebase.google.com/project/_/messaging)

---

**Still having issues?** Share the complete error message from browser console for debugging.
