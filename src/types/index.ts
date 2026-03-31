export type HabitFrequency = 'daily' | 'mon-sat' | 'alternate' | 'weekdays' | 'weekends';

export interface Task {
  id: string;
  userId: string;
  title: string;
  category: TaskCategory;
  isCompleted: boolean;
  isHabit: boolean;
  frequency?: HabitFrequency;
  date: string; // YYYY-MM-DD format
  order: number;
  createdAt: number; // Unix timestamp for easier sorting
  completedAt?: number;
}

export interface DayRecord {
  id: string; // userId_YYYY-MM-DD
  userId: string;
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  rating: DayRating;
  tasks: Task[];
  createdAt: number;
  focusWord?: string; // Daily Intention
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: number;
}

export type DayRating = 'perfect' | 'great' | 'good' | 'okay' | 'rough' | 'none';

export type TaskCategory = 'health' | 'work' | 'personal' | 'learning' | 'fitness' | 'other';

export interface Achievement {
  id: string;
  type: 'milestone' | 'streak' | 'stat';
  title: string;
  description: string;
  icon: string;
  unlockedAt: number;
  isViewed: boolean;
}
