import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "./firebase";
import { useAuthStore } from "../stores/useAuthStore";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    useAuthStore.getState().setLoading(true);
    const result = await signInWithPopup(auth, googleProvider);
    if (!result.user) {
      throw new Error("Sign-in failed: No user data returned");
    }
    useAuthStore.getState().setUser(result.user);
    useAuthStore.getState().setLoading(false);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    useAuthStore.getState().setLoading(false);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    useAuthStore.getState().setUser(null);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Singleton — only call initAuthListener once for the entire app lifecycle
let _unsubscribe: (() => void) | null = null;

export const initAuthListener = () => {
  // If already initialized, return a no-op. Prevents re-subscribing on every layout mount.
  if (_unsubscribe) return () => {};

  _unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
    const store = useAuthStore.getState();
    store.setUser(user);
    store.setLoading(false);
    if (!store.isInitialized) {
      store.setInitialized();
    }
  });

  return _unsubscribe;
};
