import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const getEnv = (value: string | undefined, fallback: string) =>
  value && value.trim().length > 0 ? value.trim() : fallback;

const firebaseConfig = {
  apiKey: getEnv(
    process.env.NEXT_PUBLIC_TRACKER_FIREBASE_API_KEY,
    "AIzaSyDtRG4hgelCZlQWsL06Tb07A7CipDSE2lU",
  ),
  authDomain: getEnv(
    process.env.NEXT_PUBLIC_TRACKER_FIREBASE_AUTH_DOMAIN,
    "study-tracker-cd631.web.app",
  ),
  projectId: getEnv(
    process.env.NEXT_PUBLIC_TRACKER_FIREBASE_PROJECT_ID,
    "study-tracker-cd631",
  ),
  storageBucket: getEnv(
    process.env.NEXT_PUBLIC_TRACKER_FIREBASE_STORAGE_BUCKET,
    "study-tracker-cd631.appspot.com",
  ),
  messagingSenderId: getEnv(
    process.env.NEXT_PUBLIC_TRACKER_FIREBASE_MESSAGING_SENDER_ID,
    "573843213419",
  ),
  appId: getEnv(
    process.env.NEXT_PUBLIC_TRACKER_FIREBASE_APP_ID,
    "1:573843213419:web:820842ab8437faada7f52e",
  ),
  measurementId: getEnv(
    process.env.NEXT_PUBLIC_TRACKER_FIREBASE_MEASUREMENT_ID,
    "G-NYQSD67FW4",
  ),
};

// Initialize the secondary tracker app only if it hasn't been initialized yet
const trackerApp =
  getApps().find((app) => app.name === "trackerApp") ||
  initializeApp(firebaseConfig, "trackerApp");

export const trackerAuth = getAuth(trackerApp);
export const trackerDb = getFirestore(trackerApp);
