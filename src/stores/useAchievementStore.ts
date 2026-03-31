import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Achievement } from '@/types';

interface AchievementState {
  achievements: Achievement[];
  unlockAchievement: (details: Partial<Achievement> & { id: string }) => void;
  markAchievementViewed: (id: string) => void;
  getUnlockedCount: () => number;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      achievements: [],
      
      unlockAchievement: (details) => {
        const alreadyExists = get().achievements.some(a => a.id === details.id);
        if (alreadyExists) return;

        const newAchievement: Achievement = {
          id: details.id,
          type: details.type || 'milestone',
          title: details.title || 'New Achievement',
          description: details.description || '',
          icon: details.icon || 'star',
          unlockedAt: Date.now(),
          isViewed: false,
        };

        set(state => ({
          achievements: [...state.achievements, newAchievement]
        }));
      },

      markAchievementViewed: (id) => {
        set(state => ({
          achievements: state.achievements.map(a => 
            a.id === id ? { ...a, isViewed: true } : a
          )
        }));
      },

      getUnlockedCount: () => get().achievements.length,
    }),
    {
      name: 'sira-achievements',
    }
  )
);
