import { create } from "zustand";
import { User } from "firebase/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean; // true once the first onAuthStateChanged has fired
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isInitialized: false,
  setUser: (user: User | null) => set({ user }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setInitialized: () => set({ isInitialized: true }),
}));
