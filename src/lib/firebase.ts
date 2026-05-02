import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  Firestore,
  persistentLocalCache,
  connectFirestoreEmulator,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-key-for-build",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "dummy-domain.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "dummy-project.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:dummy",
};

// Initialize Firebase only once
let app: FirebaseApp;

if (getApps().length > 0) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

export { app };

export const auth = getAuth(app);

// Initialize Firestore with durable local cache for network resilience
// This preserves pending writes across reloads and handles offline scenarios
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
  });
} catch {
  db = getFirestore(app);
}

export { db };
