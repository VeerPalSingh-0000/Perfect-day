import { create } from 'zustand';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { trackerAuth } from '@/lib/tracker-db';
import { getTrackItProjects, getTrackItTopics } from '@/lib/db';

interface TrackerStore {
  trackerUser: User | null;
  isLinking: boolean;
  isLinked: boolean;
  linkTrackerAccount: () => Promise<void>;
  unlinkTrackerAccount: () => Promise<void>;
  initTrackerAuth: () => void;
  projects: any[];
  topics: any[];
  fetchTrackItData: () => Promise<void>;
}

export const useTrackerStore = create<TrackerStore>()(
  (set, get) => ({
    trackerUser: null,
    isLinking: false,
    isLinked: false,
    projects: [],
    topics: [],

    initTrackerAuth: () => {
      if (typeof window === 'undefined') return;
      return onAuthStateChanged(trackerAuth, (user) => {
        set({ trackerUser: user, isLinked: !!user });
      });
    },

    linkTrackerAccount: async () => {
      set({ isLinking: true });
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(trackerAuth, provider);
        set({ trackerUser: result.user, isLinked: true, isLinking: false });
      } catch (error) {
        console.error("Failed to link tracker:", error);
        set({ isLinking: false });
      }
    },

    unlinkTrackerAccount: async () => {
      try {
        await signOut(trackerAuth);
        set({ trackerUser: null, isLinked: false });
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
          getTrackItTopics(trackerUser.uid)
        ]);
        set({ projects, topics });
      } catch (error) {
        console.error("Failed to fetch TrackIT data:", error);
      }
    }
  })
);
