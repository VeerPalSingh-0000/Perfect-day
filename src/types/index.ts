export type HabitFrequency = 'daily' | 'mon-sat' | 'alternate' | 'weekdays' | 'weekends';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  userId: string;
  title: string;
  category: TaskCategory;
  isCompleted: boolean;
  isHabit: boolean;
  frequency?: HabitFrequency;
  priority?: TaskPriority;
  targetTime?: number; // Target duration in minutes
  timeSpent?: number; // Total time spent in seconds
  isRunning?: boolean; // Timer status
  lastStartedAt?: number; // Unix timestamp for timer
  date: string; // YYYY-MM-DD format
  order: number;
  createdAt: number; // Unix timestamp for easier sorting
  completedAt?: number;
  linkedTrackItIds?: string[]; // IDs from TrackIT (projects, topics, subtopics)
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
  totalFocusTime?: number; // Total minutes spent across all FocusFlow sessions today
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
