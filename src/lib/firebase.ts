import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only once
let app;
if (getApps().length > 0) {
  app = getApp();
} else {
  // During build on platforms like Netlify, env vars might be missing. 
  // We provide dummy values so the build doesn't crash, but it will need real ones at runtime.
  const config = firebaseConfig.apiKey ? firebaseConfig : {
    apiKey: "dummy-key-for-build",
    authDomain: "dummy-domain.firebaseapp.com",
    projectId: "dummy-project",
    storageBucket: "dummy-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:dummy"
  };
  app = initializeApp(config);
}

export const auth = getAuth(app);

// Initialize Firestore
let db: Firestore;

if (typeof window !== 'undefined') {
  // Client-side: Initialize with persistent local cache.
  // Reads come from local IndexedDB cache FIRST (instant),
  // then sync with server in the background.
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    // Already initialized (e.g., hot reload) — get existing instance
    db = getFirestore(app);
  }
} else {
  // Server-side (during Next.js build): Use standard memory cache
  db = getFirestore(app);
}

export { db };
