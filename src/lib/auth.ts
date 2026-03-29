import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { auth } from "./firebase";
import { useAuthStore } from "../stores/useAuthStore";
import { useDataStore } from "../stores/useDataStore";
import { logError, createSafeErrorMessage } from "./errorHandler";

const googleProvider = new GoogleAuthProvider();

// Helper to get today as YYYY-MM-DD
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const signInWithGoogle = async () => {
  try {
    useAuthStore.getState().setLoading(true);

    if (Capacitor.isNativePlatform()) {
      // Native Android Flow
      const result = await FirebaseAuthentication.signInWithGoogle();
      if (!result.credential) {
        throw new Error(
          "Native Google sign-in failed: No credentials returned",
        );
      }

      const credential = GoogleAuthProvider.credential(
        result.credential.idToken,
        result.credential.accessToken,
      );
      const userCredential = await signInWithCredential(auth, credential);

      useAuthStore.getState().setUser(userCredential.user);
      useAuthStore.getState().setLoading(false);
      return userCredential.user;
    } else {
      // Standard Web Flow
      const result = await signInWithPopup(auth, googleProvider);
      if (!result.user) {
        throw new Error("Sign-in failed: No user data returned");
      }
      useAuthStore.getState().setUser(result.user);
      useAuthStore.getState().setLoading(false);
      return result.user;
    }
  } catch (error) {
    logError("auth", error, createSafeErrorMessage("auth"));
    useAuthStore.getState().setLoading(false);
    throw error;
  }
};

export const signOut = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
    }
    await firebaseSignOut(auth);
    useAuthStore.getState().setUser(null);
    // Reset data store so next login fetches fresh
    useDataStore.getState().reset();
  } catch (error) {
    logError("auth", error, createSafeErrorMessage("auth"));
    throw error;
  }
};

// Singleton — only call initAuthListener once for the entire app lifecycle
let _unsubscribe: (() => void) | null = null;
let _unsubscribeProfile: (() => void) | null = null;

export const initAuthListener = () => {
  // If already initialized, return a no-op. Prevents re-subscribing on every layout mount.
  if (_unsubscribe) return () => {};

  _unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
    const authStore = useAuthStore.getState();
    authStore.setUser(user);
    authStore.setLoading(false);
    if (!authStore.isInitialized) {
      authStore.setInitialized();
    }

    // EAGERLY start fetching data the INSTANT we know who the user is.
    if (user) {
      const dataStore = useDataStore.getState();
      const authStoreState = useAuthStore.getState();

      // Fetch data
      if (!dataStore.isDataLoaded) {
        dataStore.fetchAll(user.uid, getTodayStr(), user.email);
      }

      // Fetch Profile instantly using real-time cache sync
      import("@/lib/db").then(({ listenToUserProfile, updateUserProfile }) => {
        if (_unsubscribeProfile) {
          _unsubscribeProfile(); // clean up previous listener
        }

        _unsubscribeProfile = listenToUserProfile(user.uid, (profile) => {
          if (profile) {
            useAuthStore.getState().setProfile(profile);
          } else {
            // Create default profile if it doesn't exist (only runs once for new users)
            const newProfile = {
              uid: user.uid,
              displayName: user.displayName || "User",
              email: user.email || "",
              photoURL: "/avatars/avatar1.png", // Default avatar
              createdAt: Date.now(),
            };
            updateUserProfile(user.uid, newProfile).then(() => {
              useAuthStore.getState().setProfile(newProfile);
            });
          }
        });
      });
    } else {
      if (_unsubscribeProfile) {
        _unsubscribeProfile();
        _unsubscribeProfile = null;
      }
      useAuthStore.getState().setProfile(null);
    }
  });

  return _unsubscribe;
};
