import { create } from "zustand";
import {
  signInWithPopup,
  signInWithCustomToken,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { auth } from "@/lib/firebase";
import { trackerAuth } from "@/lib/tracker-db";
import { getTrackItProjects, getTrackItTopics } from "@/lib/db";

const FOCUSFLOW_LINK_TOKEN_PATH = "/api/focusflow/link-token";

const getFocusflowLinkTokenUrl = () => {
  const bridgeBaseUrl =
    process.env.NEXT_PUBLIC_FOCUSFLOW_BRIDGE_URL?.trim() || "";

  if (bridgeBaseUrl.length > 0) {
    return `${bridgeBaseUrl.replace(/\/+$/, "")}${FOCUSFLOW_LINK_TOKEN_PATH}`;
  }

  if (Capacitor.isNativePlatform()) {
    throw new Error(
      "Missing NEXT_PUBLIC_FOCUSFLOW_BRIDGE_URL for native FocusFlow linking.",
    );
  }

  return FOCUSFLOW_LINK_TOKEN_PATH;
};

const getTrackerLinkErrorMessage = (error: unknown) => {
  const raw =
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: string }).message || "")
      : "";
  const lower = raw.toLowerCase();

  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code || "")
      : "";

  if (
    lower.includes("init.json") ||
    lower.includes("network-request-failed") ||
    lower.includes("authdomain")
  ) {
    return "FocusFlow sign-in is currently unavailable due to tracker Firebase domain config. Please try again later or update tracker Firebase env values.";
  }

  if (lower.includes("popup-closed-by-user")) {
    return "Sign-in popup was closed before completion.";
  }

  if (lower.includes("popup-blocked")) {
    return "Popup was blocked by the browser. Allow popups and try again.";
  }

  if (lower.includes("redirect-cancelled-by-user")) {
    return "Sign-in was cancelled before completion.";
  }

  if (
    lower.includes("invalid_request") ||
    lower.includes("disallowed_useragent") ||
    lower.includes("doesn't comply") ||
    lower.includes("doesn’t comply")
  ) {
    return "Google blocked WebView OAuth request. Please retry after updating app; Android now uses native Google sign-in for FocusFlow linking.";
  }

  if (
    code === "auth/invalid-credential" ||
    lower.includes("invalid idp response") ||
    lower.includes("audience")
  ) {
    return "FocusFlow link failed due to Firebase project mismatch. Google token belongs to primary app project, but tracker uses a different Firebase project. Link this account from web app, or align Android OAuth/Firebase config for tracker project.";
  }

  if (lower.includes("focusflow link token request failed")) {
    return "FocusFlow backend token bridge failed. Check server deployment/env vars and try again.";
  }

  if (lower.includes("missing next_public_focusflow_bridge_url")) {
    return "FocusFlow backend URL is missing in app config. Add NEXT_PUBLIC_FOCUSFLOW_BRIDGE_URL and rebuild Android app.";
  }

  return "Could not connect FocusFlow account right now. Please try again.";
};

interface TrackerStore {
  trackerUser: User | null;
  isLinking: boolean;
  isLinked: boolean;
  linkError: string | null;
  linkTrackerAccount: () => Promise<void>;
  linkDifferentTrackerAccount: () => Promise<void>;
  unlinkTrackerAccount: () => Promise<void>;
  initTrackerAuth: () => void;
  projects: any[];
  topics: any[];
  fetchTrackItData: () => Promise<void>;
  clearLinkError: () => void;
}

export const useTrackerStore = create<TrackerStore>()((set, get) => ({
  trackerUser: null,
  isLinking: false,
  isLinked: false,
  linkError: null,
  projects: [],
  topics: [],

  initTrackerAuth: () => {
    if (typeof window === "undefined") return;

    return onAuthStateChanged(trackerAuth, (user) => {
      set({
        trackerUser: user,
        isLinked: !!user,
        isLinking: false,
        linkError: null,
      });
    });
  },

  linkTrackerAccount: async () => {
    set({ isLinking: true, linkError: null });
    try {
      if (Capacitor.isNativePlatform()) {
        const primaryUser = auth.currentUser;
        if (!primaryUser) {
          throw new Error("Please sign in to Perfect Day first.");
        }

        const primaryIdToken = await primaryUser.getIdToken();
        const response = await fetch(getFocusflowLinkTokenUrl(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${primaryIdToken}`,
          },
          body: JSON.stringify({}),
        });

        const payload = await response
          .json()
          .catch(() => ({ message: "Unknown server response" }));

        if (!response.ok || !payload?.customToken) {
          throw new Error(
            payload?.message ||
              `FocusFlow link token request failed (${response.status})`,
          );
        }

        const trackerUserCredential = await signInWithCustomToken(
          trackerAuth,
          payload.customToken,
        );

        set({
          trackerUser: trackerUserCredential.user,
          isLinked: true,
          isLinking: false,
          linkError: null,
        });
        return;
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(trackerAuth, provider);
      if (!result.user) {
        throw new Error("Linking failed: No user data returned");
      }

      set({
        trackerUser: result.user,
        isLinked: true,
        isLinking: false,
        linkError: null,
      });
    } catch (error) {
      console.error("Failed to link tracker:", error);
      set({
        isLinking: false,
        linkError: getTrackerLinkErrorMessage(error),
      });
    }
  },

  linkDifferentTrackerAccount: async () => {
    set({ isLinking: true, linkError: null });
    try {
      if (Capacitor.isNativePlatform()) {
        const primaryUser = auth.currentUser;
        if (!primaryUser) {
          throw new Error("Please sign in to Perfect Day first.");
        }

        // Clear native Google session first to increase chances of account picker prompt.
        await FirebaseAuthentication.signOut().catch(() => undefined);
        const nativeGoogle = await FirebaseAuthentication.signInWithGoogle();
        const trackerGoogleIdToken = nativeGoogle.credential?.idToken;

        if (!trackerGoogleIdToken) {
          throw new Error(
            "Could not get Google ID token for selected tracker account.",
          );
        }

        const primaryIdToken = await primaryUser.getIdToken();
        const response = await fetch(getFocusflowLinkTokenUrl(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${primaryIdToken}`,
          },
          body: JSON.stringify({ trackerGoogleIdToken }),
        });

        const payload = await response
          .json()
          .catch(() => ({ message: "Unknown server response" }));

        if (!response.ok || !payload?.customToken) {
          throw new Error(
            payload?.message ||
              `FocusFlow link token request failed (${response.status})`,
          );
        }

        const trackerUserCredential = await signInWithCustomToken(
          trackerAuth,
          payload.customToken,
        );

        set({
          trackerUser: trackerUserCredential.user,
          isLinked: true,
          isLinking: false,
          linkError: null,
        });
        return;
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(trackerAuth, provider);
      if (!result.user) {
        throw new Error("Linking failed: No user data returned");
      }

      set({
        trackerUser: result.user,
        isLinked: true,
        isLinking: false,
        linkError: null,
      });
    } catch (error) {
      console.error("Failed to link different tracker account:", error);
      set({
        isLinking: false,
        linkError: getTrackerLinkErrorMessage(error),
      });
    }
  },

  unlinkTrackerAccount: async () => {
    try {
      await signOut(trackerAuth);
      set({ trackerUser: null, isLinked: false, linkError: null });
    } catch (error) {
      console.error("Failed to unlink tracker:", error);
    }
  },

  fetchTrackItData: async () => {
    const { trackerUser } = get();
    if (!trackerUser) return;
    try {
      const [projects, topics] = await Promise.all([
        getTrackItProjects(trackerUser.uid),
        getTrackItTopics(trackerUser.uid),
      ]);
      set({ projects, topics });
    } catch (error) {
      console.error("Failed to fetch TrackIT data:", error);
    }
  },

  clearLinkError: () => set({ linkError: null }),
}));
