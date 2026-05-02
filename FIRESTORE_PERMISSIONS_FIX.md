# 🔐 Firestore Permission Error - Fix Guide

## Problem

You're seeing: `FirebaseError: Missing or insufficient permissions`

This happens when the app tries to read/write Firestore data before the user is fully authenticated.

## Root Cause

Your Firestore rules (correctly) restrict access to authenticated users only:

```firestore
match /users/{userId} {
  allow read: if request.auth.uid == userId;
  allow write: if request.auth.uid == userId && ...
}
```

The issue is likely **timing** - the app tries to fetch data before authentication completes.

## Fix

### Option 1: Wait for Auth Before Fetching (RECOMMENDED)

In your data store/service, add an auth check before fetching:

```typescript
// src/lib/db.ts
export const listenToUserProfile = (
  userId: string,
  callback: (profile: UserProfile | null) => void,
): (() => void) => {
  // ✅ Guard: Don't fetch if no userId
  if (!userId) {
    console.log("⏳ Waiting for authentication...");
    return () => {};
  }

  const userRef = doc(db, "users", userId);
  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("❌ Firestore error:", error);
      if (error.code === "permission-denied") {
        console.error("User not authenticated or lacks permissions", userId);
      }
    },
  );
};
```

### Option 2: Check Auth in Layout Component

Update `src/app/(app)/layout.tsx`:

```typescript
import { useAuthStore } from "@/stores/useAuthStore";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  // ✅ Show loading until auth is ready
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // ✅ Guard: Don't render until user is authenticated
  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      {/* Your layout */}
      {children}
    </div>
  );
}
```

### Option 3: Add Error Boundary for Firestore Errors

Create a safer error handler in your stores:

```typescript
// In your useDataStore or similar
const fetchAll = async (userId: string, date: string) => {
  // ✅ Guard: Check auth first
  if (!userId) {
    console.warn("Cannot fetch data: userId is empty");
    setTasks([]);
    return;
  }

  try {
    // Your fetch logic
  } catch (error) {
    if (error instanceof Error && error.message.includes("permission-denied")) {
      console.error("❌ Permission denied. User may not be authenticated.");
      return;
    }
    throw error;
  }
};
```

## Verify Your Firestore Rules

Your current rules are correct. Verify in Firebase Console:

1. Go to **Firestore → Rules**
2. Check that you have these rules or similar:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;

      match /tasks/{taskId} {
        allow read, write: if request.auth.uid == userId;
      }

      match /dayRecords/{recordId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

3. Click **Publish** if you make changes

## Debugging Steps

1. **Add logging** to see when auth completes:

   ```typescript
   useEffect(() => {
     console.log("👤 User state:", user);
     console.log("⏳ Loading state:", loading);
   }, [user, loading]);
   ```

2. **Check browser console** for timing:
   - Look for when "user logged in" message appears
   - Check if data fetch happens before or after

3. **In Firebase Console**, check:
   - Firestore → Rules are published
   - Authentication → Users exist and are enabled

## Common Issues & Fixes

| Issue                         | Fix                                    |
| ----------------------------- | -------------------------------------- |
| App fetches before auth ready | Use `if (!user) return;` guards        |
| Firestore rules block access  | Check rules match your data structure  |
| User document doesn't exist   | Create on first login with proper data |
| Email mismatch in rules       | Ensure `auth.token.email` matches data |

## Step-by-Step Fix

1. **Add auth guard** before every Firestore query:

   ```typescript
   if (!userId) return null;
   ```

2. **Add error logging** to see exact failures:

   ```typescript
   onSnapshot(
     ref,
     (snap) => {
       /* success */
     },
     (error) => console.error("Firestore error:", error.code, error.message),
   );
   ```

3. **Check in Firebase Console**:
   - Is user authenticated?
   - Does user document exist?
   - Are rules published?

4. **Test permission**:
   - Go to Firestore Console
   - Try reading `/users/{your-uid}/` manually
   - Check if it returns data

## Success Signs

You should see in browser console:

```
✅ User authenticated: user@example.com
✅ Fetching user data...
✅ Data loaded: [tasks and records]
```

NOT:

```
❌ Permission denied
```

---

**Still getting the error?** Add the auth guards suggested in Option 1 or 2, and the permission errors should resolve.
