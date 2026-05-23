export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  target?: number;
  currentProgress: number;
  createdAt: string;
  isArchived: boolean;
  notifyTime?: string;
  notifyEnabled: boolean;
}

export type NewHabitData = {
  name: string;
  icon: string;
  color: string;
  target?: number;
  currentProgress?: number;
  notifyTime?: string;
  notifyEnabled?: boolean;
};

export interface HabitLog {
  habitId: string;
  date: string;
  completed: boolean;
  progress: number;
  mood?: number;
  isFrozen?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'completion' | 'special';
  requirement: number;
}

export interface UserProfile {
  xp: number;
  level: number;
  unlockedBadges: string[];
  freezes: number;
  lastFreezeAward: string;
  streakData: Record<string, number>;
  longestStreaks: Record<string, number>;
  totalCompletions: number;
  darkMode: boolean;
  purchasedThemes: string[];
  activeTheme: string;
  purchasedFrames: string[];
  activeFrame: string;
}

export interface NotificationSettings {
  enabled: boolean;
  silentHoursStart: string;
  silentHoursEnd: string;
  chainAlertsEnabled: boolean;
  chainAlertTime: string;
}

export interface UserSession {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  token?: string | null;
  authenticated: boolean;
}

export interface Buddy {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  status: 'active' | 'nudge_sent' | 'offline';
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  streak: number;
  xp: number;
  isMe?: boolean;
}

export interface Reflection {
  date: string;
  moodScore: number;
  successRate: number;
  challenges: string[];
  notes: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  type: 'completions' | 'meditation' | 'mood' | 'early';
  target: number;
  icon: string;
}

export const PRESET_HABITS: Omit<Habit, 'id' | 'createdAt' | 'currentProgress' | 'isArchived' | 'notifyEnabled'>[] = [
  { name: 'Meditate', icon: '🧘', color: '#6C63FF', target: 5, notifyTime: '08:00' },
  { name: 'Read Books', icon: '📖', color: '#4ECDC4', target: 10, notifyTime: '20:00' },
  { name: 'Morning Walk', icon: '🚶', color: '#95E1A3', target: 15, notifyTime: '07:00' },
  { name: 'Drink Water', icon: '💧', color: '#74C7D4', target: 8, notifyTime: '09:00' },
  { name: 'Journal', icon: '✍️', color: '#FFB347', target: 1, notifyTime: '21:00' },
  { name: 'Sleep Early', icon: '😴', color: '#9B59B6', target: 8, notifyTime: '22:00' },
  { name: 'Eat Healthy', icon: '🥗', color: '#FF6B6B', target: 3, notifyTime: '12:00' },
  { name: 'Listen to Music', icon: '🎵', color: '#E91E63', target: 1, notifyTime: '15:00' },
];

export const BADGES: Badge[] = [
  { id: 'first_step', name: 'First Step', description: 'Complete your first habit', icon: '🌱', category: 'streak', requirement: 1 },
  { id: 'week_warrior', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🛡️', category: 'streak', requirement: 7 },
  { id: 'fortnight_focus', name: 'Fortnight Focus', description: 'Maintain a 14-day streak', icon: '⚔️', category: 'streak', requirement: 14 },
  { id: 'monthly_master', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🏆', category: 'streak', requirement: 30 },
  { id: 'quarter_champion', name: 'Quarter Champion', description: 'Maintain a 90-day streak', icon: '👑', category: 'streak', requirement: 90 },
  { id: 'century_seeker', name: 'Century Seeker', description: 'Maintain a 100-day streak', icon: '💎', category: 'streak', requirement: 100 },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Complete all habits for 7 days straight', icon: '✨', category: 'completion', requirement: 7 },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete a habit before 9am', icon: '🌅', category: 'special', requirement: 1 },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a habit after 9pm', icon: '🦉', category: 'special', requirement: 1 },
  { id: 'freeze_saver', name: 'Freeze Saver', description: 'Use a freeze to save your streak', icon: '❄️', category: 'special', requirement: 1 },
  { id: 'mood_tracker', name: 'Mood Tracker', description: 'Log your mood for 7 days', icon: '🎭', category: 'special', requirement: 7 },
  { id: 'xp_collector', name: 'XP Collector', description: 'Earn 500 XP', icon: '⭐', category: 'special', requirement: 500 },
];

export const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😊'];
export const MOOD_LABELS = ['Very Low', 'Low', 'Okay', 'Good', 'Great'];

export const THEMES = [
  { id: 'midnight_oasis', name: 'Midnight Oasis', cost: 0, gradient: 'from-[#1A1B2E] via-[#111224] to-[#0A0A14]', text: 'text-slate-100', accent: '#6C63FF' },
  { id: 'sakura_breeze', name: 'Sakura Breeze', cost: 150, gradient: 'from-[#2D1B2D] via-[#211221] to-[#140A14]', text: 'text-rose-100', accent: '#FF79C6' },
  { id: 'sunset_boulevard', name: 'Sunset Boulevard', cost: 250, gradient: 'from-[#2E1A1A] via-[#241111] to-[#140A0A]', text: 'text-amber-100', accent: '#FFB347' },
  { id: 'emerald_forest', name: 'Emerald Forest', cost: 200, gradient: 'from-[#1A2E26] via-[#11241C] to-[#0A1410]', text: 'text-emerald-100', accent: '#4ECDC4' },
];

export const FRAMES = [
  { id: 'none', name: 'No Frame', cost: 0, border: 'border-transparent', color: 'transparent' },
  { id: 'bronze', name: 'Bronze Glow', cost: 50, border: 'border-[#CD7F32] shadow-[0_0_10px_#CD7F3250]', color: '#CD7F32' },
  { id: 'silver', name: 'Silver Sparkle', cost: 100, border: 'border-[#C0C0C0] shadow-[0_0_10px_#C0C0C070]', color: '#C0C0C0' },
  { id: 'gold', name: 'Golden Champion', cost: 300, border: 'border-[#FFD700] shadow-[0_0_15px_#FFD70090] animate-pulse', color: '#FFD700' },
];

export const DAILY_QUESTS: Quest[] = [
  { id: 'quest_1', name: 'Daily Water Intake', description: 'Log any progress for Drink Water today', type: 'completions', target: 1, xpReward: 20, icon: '💧' },
  { id: 'quest_2', name: 'Mindfulness Breathe', description: 'Complete a 2-minute visual breathing session', type: 'meditation', target: 1, xpReward: 30, icon: '🧘' },
  { id: 'quest_3', name: 'Self Assessment Check-In', description: 'Log your emotional state today', type: 'mood', target: 1, xpReward: 15, icon: '🎭' },
  { id: 'quest_4', name: 'Early Consistency', description: 'Complete any habit before 12 PM', type: 'early', target: 1, xpReward: 25, icon: '🌅' },
];
