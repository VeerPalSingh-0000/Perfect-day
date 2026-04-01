import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDtRG4hgelCZlQWsL06Tb07A7CipDSE2lU",
  authDomain: "study-tracker-cd631.firebaseapp.com",
  projectId: "study-tracker-cd631",
  storageBucket: "study-tracker-cd631.firebasestorage.app",
  messagingSenderId: "573843213419",
  appId: "1:573843213419:web:820842ab8437faada7f52e",
  measurementId: "G-NYQSD67FW4"
};

// Initialize the secondary tracker app only if it hasn't been initialized yet
const trackerApp = getApps().find(app => app.name === "trackerApp") 
  || initializeApp(firebaseConfig, "trackerApp");

export const trackerAuth = getAuth(trackerApp);
export const trackerDb = getFirestore(trackerApp);
