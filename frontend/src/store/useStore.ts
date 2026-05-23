import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, subDays } from 'date-fns';
import type { 
  Habit, 
  HabitLog, 
  UserProfile, 
  NotificationSettings, 
  UserSession, 
  Buddy, 
  LeaderboardEntry, 
  Reflection, 
  Quest 
} from '../types';
import { 
  PRESET_HABITS, 
  BADGES, 
  DAILY_QUESTS 
} from '../types';
import { apiService } from '../services/api';
import type { DBStatus } from '../services/api';

interface WellnessStore {
  habits: Habit[];
  logs: HabitLog[];
  profile: UserProfile;
  notifications: NotificationSettings;
  darkMode: boolean;
  showMoodPrompt: boolean;
  todayMood: number | null;
  dbStatus: DBStatus;
  user: UserSession;
  buddies: Buddy[];
  leaderboard: LeaderboardEntry[];
  reflections: Reflection[];
  quests: Quest[];
  questProgress: Record<string, { completed: boolean; current: number; target: number }>;
  
  // Actions
  checkDbStatus: () => Promise<void>;
  addHabit: (habit: {
    name: string;
    icon: string;
    color: string;
    target?: number;
    currentProgress?: number;
    notifyTime?: string;
    notifyEnabled?: boolean;
  }) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitComplete: (habitId: string, progress?: number) => Promise<void>;
  setHabitProgress: (habitId: string, progress: number) => Promise<void>;
  logMood: (mood: number) => Promise<void>;
  useFreeze: (habitId?: string) => boolean;
  applyFreeze: (habitId: string, date: string) => Promise<void>;
  awardFreeze: () => void;
  addXP: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
  toggleDarkMode: () => void;
  setShowMoodPrompt: (show: boolean) => void;
  checkAndAwardBadges: () => void;
  login: (payload: { token: string; name: string; email?: string; id?: string }) => Promise<void>;
  logout: () => void;
  getHabitStreak: (habitId: string) => number;
  getGlobalStreak: () => number;
  getTodayProgress: () => { completed: number; total: number };
  getCompletionRate: (habitId: string, days: number) => number;
  getLogsForDate: (date: string) => HabitLog[];
  getMoodData: (days: number) => { date: string; mood: number }[];
  initializeDefaults: () => Promise<void>;
  addBuddy: (name: string) => void;
  sendNudge: (buddyId: string) => void;
  submitReflection: (reflection: Omit<Reflection, 'date'>) => Promise<void>;
  
  // Store customization actions
  purchaseTheme: (themeId: string, cost: number) => boolean;
  selectTheme: (themeId: string) => void;
  purchaseFrame: (frameId: string, cost: number) => boolean;
  selectFrame: (frameId: string) => void;

  // Quest actions
  updateQuestProgress: (type: 'completions' | 'meditation' | 'mood' | 'early', increment: number) => void;

  // Profile updates
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  syncLeaderboard: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const normalizeHabit = (habit: any): Habit => ({
  ...habit,
  id: habit.id ?? habit._id ?? generateId(),
  name: habit.name,
  icon: habit.icon,
  color: habit.color,
  target: habit.target,
  currentProgress: habit.currentProgress ?? 0,
  createdAt: typeof habit.createdAt === 'string' ? habit.createdAt : format(new Date(habit.createdAt), 'yyyy-MM-dd'),
  isArchived: habit.isArchived ?? false,
  notifyTime: habit.notifyTime,
  notifyEnabled: habit.notifyEnabled ?? true,
});

const calculateStreak = (logs: HabitLog[], habitId: string): number => {
  const habitLogs = logs
    .filter(log => log.habitId === habitId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (habitLogs.length === 0) return 0;
  
  let streak = 0;
  let checkDate = new Date();
  
  // Start from yesterday if today isn't completed yet and today is not frozen
  const todayStr = format(checkDate, 'yyyy-MM-dd');
  const todayLog = habitLogs.find(log => log.date === todayStr);
  if (!todayLog || (!todayLog.completed && !todayLog.isFrozen)) {
    checkDate = subDays(checkDate, 1);
  }
  
  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    const log = habitLogs.find(l => l.date === dateStr);
    
    if (log && log.completed) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else if (log && log.isFrozen) {
      // Freeze day bridges the streak: it doesn't break it, just passes through
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
};

const calculateGlobalStreak = (logs: HabitLog[], habits: Habit[]): number => {
  const activeHabits = habits.filter(h => !h.isArchived);
  const activeCount = activeHabits.length;
  if (activeCount === 0) return 0;
  
  const activeHabitIds = new Set(activeHabits.map(h => h.id));
  
  // Group logs by date to check daily completed count and freeze status
  const logsByDate: Record<string, { completedHabits: Set<string>; isFrozen: boolean }> = {};
  
  logs.forEach(log => {
    // Only count logs that correspond to active habits
    if (!activeHabitIds.has(log.habitId)) return;
    
    if (!logsByDate[log.date]) {
      logsByDate[log.date] = { completedHabits: new Set(), isFrozen: false };
    }
    if (log.completed) {
      logsByDate[log.date].completedHabits.add(log.habitId);
    }
    if (log.isFrozen) {
      logsByDate[log.date].isFrozen = true;
    }
  });

  let streak = 0;
  let checkDate = new Date();
  
  // A day is only considered "completed" if all active habits are checked off
  const todayStr = format(checkDate, 'yyyy-MM-dd');
  const todayStatus = logsByDate[todayStr];
  const isTodayCompleted = todayStatus && todayStatus.completedHabits.size >= activeCount;
  const isTodayFrozen = todayStatus && todayStatus.isFrozen;
  
  if (!todayStatus || (!isTodayCompleted && !isTodayFrozen)) {
    checkDate = subDays(checkDate, 1);
  }
  
  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    const status = logsByDate[dateStr];
    
    const isCompleted = status && status.completedHabits.size >= activeCount;
    const isFrozen = status && status.isFrozen;
    
    if (isCompleted) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else if (isFrozen) {
      // Frozen day bridges the streak
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
};

const calculateLevel = (xp: number): number => {
  let level = 1;
  let xpRequired = 100;
  while (xp >= xpRequired) {
    xp -= xpRequired;
    level++;
    xpRequired = level * 100;
  }
  return level;
};

const defaultProfileState = (): UserProfile => ({
  xp: 0,
  level: 1,
  unlockedBadges: [],
  freezes: 1,
  lastFreezeAward: '',
  streakData: {},
  longestStreaks: {},
  totalCompletions: 0,
  darkMode: false,
  purchasedThemes: ['midnight_oasis'],
  activeTheme: 'midnight_oasis',
  purchasedFrames: ['none'],
  activeFrame: 'none',
});

export const useStore = create<WellnessStore>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],
      profile: defaultProfileState(),
      notifications: {
        enabled: true,
        silentHoursStart: '22:00',
        silentHoursEnd: '07:00',
        chainAlertsEnabled: true,
        chainAlertTime: '20:00',
      },
      darkMode: false,
      showMoodPrompt: false,
      todayMood: null,
      dbStatus: { connected: false, database: 'disconnected' },
      user: {
        id: null,
        email: null,
        name: null,
        token: null,
        authenticated: false,
      },
      buddies: [
        { id: '1', name: 'Aria Chen', avatar: '🌸', streak: 12, status: 'active' },
        { id: '2', name: 'Leo Vance', avatar: '🦁', streak: 8, status: 'active' },
        { id: '3', name: 'Maya Lin', avatar: '🐬', streak: 21, status: 'active' }
      ],
      leaderboard: [
        { rank: 1, name: 'Maya Lin', streak: 21, xp: 950 },
        { rank: 2, name: 'Aria Chen', streak: 12, xp: 620 },
        { rank: 3, name: 'You', streak: 0, xp: 0, isMe: true },
        { rank: 4, name: 'Leo Vance', streak: 8, xp: 410 }
      ],
      reflections: [],
      quests: DAILY_QUESTS,
      questProgress: {
        quest_1: { completed: false, current: 0, target: 1 },
        quest_2: { completed: false, current: 0, target: 1 },
        quest_3: { completed: false, current: 0, target: 1 },
        quest_4: { completed: false, current: 0, target: 1 },
      },

      checkDbStatus: async () => {
        const status = await apiService.checkStatus();
        set({ dbStatus: status });
      },

      initializeDefaults: async () => {
        const state = get();
        await state.checkDbStatus();

        if (get().dbStatus.connected && get().user.authenticated) {
          try {
            const dbHabits = await apiService.getHabits();
            const normalizedHabits = dbHabits.map(normalizeHabit);
            const dbLogs = await apiService.getLogs();
            const dbProfile = await apiService.getProfile();
            
            set({
              habits: dbHabits.length > 0 ? normalizedHabits : state.habits,
              logs: dbLogs.length > 0 ? dbLogs : state.logs,
              profile: {
                ...state.profile,
                ...dbProfile,
                purchasedThemes: dbProfile.purchasedThemes?.length > 0 ? dbProfile.purchasedThemes : state.profile.purchasedThemes,
                purchasedFrames: dbProfile.purchasedFrames?.length > 0 ? dbProfile.purchasedFrames : state.profile.purchasedFrames,
              },
            });
            
            // Set dynamic active theme
            const theme = dbProfile.activeTheme || state.profile.activeTheme || 'midnight_oasis';
            document.documentElement.setAttribute('data-theme', theme);
          } catch (err) {
            console.warn('Error syncing with MongoDB. Using cached data:', err);
          }
        }

        // Fill in preset habits if empty
        if (get().habits.length === 0) {
          const defaultHabits = PRESET_HABITS.map((habit, index) => ({
            ...habit,
            id: generateId(),
            createdAt: format(new Date(), 'yyyy-MM-dd'),
            currentProgress: 0,
            isArchived: false,
            notifyEnabled: index < 4,
          }));
          
          set({ habits: defaultHabits });

          if (get().dbStatus.connected && get().user.authenticated) {
            const savedHabits: Habit[] = [];
            for (const habit of defaultHabits) {
              try {
                const saved = await apiService.createHabit(habit);
                savedHabits.push(normalizeHabit(saved));
              } catch (err) {
                console.error('Failed to save preset to MongoDB:', err);
                savedHabits.push(habit);
              }
            }
            set({ habits: savedHabits });
          }
        }

        // Apply theme attributes in document
        const theme = get().profile.activeTheme || 'midnight_oasis';
        document.documentElement.setAttribute('data-theme', theme);
        
        // Sync leaderboard
        get().syncLeaderboard();
      },

      addHabit: async (habitData) => {
        const tempId = generateId();
        const newHabit: Habit = {
          id: tempId,
          name: habitData.name,
          icon: habitData.icon,
          color: habitData.color,
          target: habitData.target,
          currentProgress: habitData.currentProgress ?? 0,
          createdAt: format(new Date(), 'yyyy-MM-dd'),
          isArchived: false,
          notifyTime: habitData.notifyTime,
          notifyEnabled: habitData.notifyEnabled ?? true,
        };

        set((state) => ({ habits: [...state.habits, newHabit] }));

        if (get().dbStatus.connected && get().user.authenticated) {
          try {
            const savedHabit = await apiService.createHabit(newHabit);
            const normalized = normalizeHabit(savedHabit);
            set((state) => ({
              habits: state.habits.map(h => h.id === tempId ? normalized : h)
            }));
          } catch (err) {
            console.error('Failed to add habit to MongoDB:', err);
          }
        }
      },

      updateHabit: async (id, updates) => {
        set((state) => ({
          habits: state.habits.map(h => h.id === id || (h as any)._id === id ? { ...h, ...updates } : h),
        }));

        if (get().dbStatus.connected && get().user.authenticated) {
          try {
            await apiService.updateHabit(id, updates);
          } catch (err) {
            console.error('Failed to update habit in MongoDB:', err);
          }
        }
      },

      deleteHabit: async (id) => {
        set((state) => ({
          habits: state.habits.filter(h => h.id !== id && (h as any)._id !== id),
        }));

        if (get().dbStatus.connected && get().user.authenticated) {
          try {
            await apiService.deleteHabit(id);
          } catch (err) {
            console.error('Failed to delete habit from MongoDB:', err);
          }
        }
      },

      toggleHabitComplete: async (habitId, progress = 1) => {
        if (!habitId) return;
        const today = format(new Date(), 'yyyy-MM-dd');
        const state = get();
        const habit = state.habits.find(h => h.id === habitId || (h as any)._id === habitId);
        if (!habit) return;

        const existingLog = state.logs.find(
          log => log.habitId === habitId && log.date === today
        );

        const isCompleting = !existingLog?.completed;
        const targetMet = habit.target ? progress >= habit.target : true;
        const finalProgress = habit.target ? Math.min(progress, habit.target) : 1;

        if (existingLog) {
          set((state) => ({
            logs: state.logs.map(log =>
              log.habitId === habitId && log.date === today
                ? { ...log, completed: isCompleting, progress: finalProgress }
                : log
            ),
          }));
        } else {
          const newLog: HabitLog = {
            habitId,
            date: today,
            completed: isCompleting,
            progress: finalProgress,
            mood: state.todayMood ?? undefined,
          };
          set((state) => ({ logs: [...state.logs, newLog] }));
        }

        if (get().dbStatus.connected && get().user.authenticated) {
          try {
            await apiService.upsertLog({
              habitId,
              date: today,
              completed: isCompleting,
              progress: finalProgress,
              mood: state.todayMood ?? undefined,
            });
          } catch (err) {
            console.error('Failed to upsert log in MongoDB:', err);
          }
        }

        if (isCompleting && targetMet) {
          get().addXP(10);
          get().checkAndAwardBadges();

          // Check quest completions
          get().updateQuestProgress('completions', 1);

          // Check early completions quest (completed before 12 PM)
          const hour = new Date().getHours();
          if (hour < 12) {
            get().updateQuestProgress('early', 1);
          }

          // Check special preset types
          if (habit.name.toLowerCase() === 'drink water') {
            get().updateQuestProgress('completions', 1);
          }
        }

        get().syncLeaderboard();
      },

      setHabitProgress: async (habitId, progress) => {
        if (!habitId) return;
        const today = format(new Date(), 'yyyy-MM-dd');
        const state = get();
        const habit = state.habits.find(h => h.id === habitId || (h as any)._id === habitId);
        if (!habit) return;

        const existingLog = state.logs.find(
          log => log.habitId === habitId && log.date === today
        );

        const completed = habit.target ? progress >= habit.target : progress >= 1;
        const finalProgress = habit.target ? Math.min(progress, habit.target) : progress;

        if (existingLog) {
          set((state) => ({
            logs: state.logs.map(log =>
              log.habitId === habitId && log.date === today
                ? { ...log, progress: finalProgress, completed }
                : log
            ),
          }));
        } else {
          const newLog: HabitLog = {
            habitId,
            date: today,
            completed,
            progress: finalProgress,
            mood: state.todayMood ?? undefined,
          };
          set((state) => ({ logs: [...state.logs, newLog] }));
        }

        if (get().dbStatus.connected && get().user.authenticated) {
          try {
            await apiService.upsertLog({
              habitId,
              date: today,
              completed,
              progress: finalProgress,
              mood: state.todayMood ?? undefined,
            });
          } catch (err) {
            console.error('Failed to sync progress log in MongoDB:', err);
          }
        }

        if (completed) {
          get().addXP(5);
        }

        get().syncLeaderboard();
      },

      logMood: async (mood) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Log mood local caching
        set((state) => {
          const updatedLogs = [...state.logs];
          const todayLogs = updatedLogs.filter(log => log.date === today);
          
          if (todayLogs.length > 0) {
            todayLogs.forEach(log => {
              log.mood = mood;
            });
            return { logs: updatedLogs, todayMood: mood };
          } else {
            // Log mood as a global state cache
            return { todayMood: mood };
          }
        });

        // Sync with API
        if (get().dbStatus.connected && get().user.authenticated) {
          try {
            const todayLogs = get().logs.filter(log => log.date === today);
            for (const log of todayLogs) {
              await apiService.upsertLog({
                habitId: log.habitId,
                date: today,
                completed: log.completed,
                progress: log.progress,
                mood,
              });
            }
          } catch (err) {
            console.error('Failed to sync mood log in MongoDB:', err);
          }
        }

        // Complete daily mood quest
        get().updateQuestProgress('mood', 1);
        get().checkAndAwardBadges();
      },

      useFreeze: (habitId?: string) => {
        const state = get();
        if (state.profile.freezes <= 0) return false;

        const updatedProfile = {
          ...state.profile,
          freezes: state.profile.freezes - 1,
        };

        set(() => ({
          profile: updatedProfile,
        }));

        if (get().dbStatus.connected && get().user.authenticated) {
          apiService.updateProfile(updatedProfile).catch((err) => {
            console.error('Failed to sync freeze decrement in MongoDB:', err);
          });
        }

        if (habitId) {
          get().unlockBadge('freeze_saver');
        }
        return true;
      },

      applyFreeze: async (habitId, date) => {
        if (!habitId) return;
        const state = get();
        if (state.profile.freezes <= 0) return;

        const existingLog = state.logs.find(log => log.habitId === habitId && log.date === date);
        const updatedLogs = existingLog
          ? state.logs.map(log => log.habitId === habitId && log.date === date ? { ...log, isFrozen: true, completed: false, progress: 0 } : log)
          : [...state.logs, { habitId, date, completed: false, progress: 0, isFrozen: true }];

        const updatedProfile = {
          ...state.profile,
          freezes: state.profile.freezes - 1,
        };

        set({
          logs: updatedLogs,
          profile: updatedProfile,
        });

        if (get().dbStatus.connected && get().user.authenticated) {
          try {
            await apiService.upsertLog({ habitId, date, completed: false, progress: 0, isFrozen: true });
            await apiService.updateProfile(updatedProfile);
          } catch (err) {
            console.error('Failed to sync freeze to DB:', err);
          }
        }

        get().unlockBadge('freeze_saver');
        get().syncLeaderboard();
      },

      awardFreeze: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const updatedProfile = {
          ...get().profile,
          freezes: get().profile.freezes + 1,
          lastFreezeAward: today,
        };

        set(() => ({
          profile: updatedProfile,
        }));

        if (get().dbStatus.connected && get().user.authenticated) {
          apiService.updateProfile(updatedProfile).catch((err) => {
            console.error('Failed to sync freeze award in MongoDB:', err);
          });
        }
      },

      addXP: (amount) => {
        const state = get();
        const newXP = state.profile.xp + amount;
        const newLevel = calculateLevel(newXP);
        
        const updatedProfile = {
          ...state.profile,
          xp: newXP,
          level: newLevel,
        };

        set(() => ({
          profile: updatedProfile,
        }));

        // Adjust leaderboard list
        get().syncLeaderboard();

        if (get().dbStatus.connected && get().user.authenticated) {
          apiService.updateProfile(updatedProfile).catch((err) => {
            console.error('Failed to sync XP in MongoDB:', err);
          });
        }

        get().checkAndAwardBadges();
      },

      unlockBadge: (badgeId) => {
        const state = get();
        if (state.profile.unlockedBadges.includes(badgeId)) return;
        
        const badge = BADGES.find(b => b.id === badgeId);
        if (!badge) return;

        const updatedProfile = {
          ...state.profile,
          unlockedBadges: [...state.profile.unlockedBadges, badgeId],
        };

        set(() => ({
          profile: updatedProfile,
        }));

        if (get().dbStatus.connected && get().user.authenticated) {
          apiService.updateProfile(updatedProfile).catch((err) => {
            console.error('Failed to sync unlocked badge in MongoDB:', err);
          });
        }
      },

      checkAndAwardBadges: () => {
        const state = get();

        // First step badge
        if (state.logs.length > 0 && !state.profile.unlockedBadges.includes('first_step')) {
          get().unlockBadge('first_step');
        }

        // XP collector badge
        if (state.profile.xp >= 500 && !state.profile.unlockedBadges.includes('xp_collector')) {
          get().unlockBadge('xp_collector');
        }

        // Check time-based badges
        const hour = new Date().getHours();
        if (hour < 9 && !state.profile.unlockedBadges.includes('early_bird')) {
          get().unlockBadge('early_bird');
        }
        if (hour >= 21 && !state.profile.unlockedBadges.includes('night_owl')) {
          get().unlockBadge('night_owl');
        }

        // Mood tracker badge
        const moodLogs = state.logs.filter(log => log.mood !== undefined);
        const uniqueMoodDays = new Set(moodLogs.map(log => log.date)).size;
        if (uniqueMoodDays >= 7 && !state.profile.unlockedBadges.includes('mood_tracker')) {
          get().unlockBadge('mood_tracker');
        }

        // Streak-based badges
        const globalStreak = get().getGlobalStreak();
        const streakBadges = [
          { streak: 7, badge: 'week_warrior' },
          { streak: 14, badge: 'fortnight_focus' },
          { streak: 30, badge: 'monthly_master' },
          { streak: 90, badge: 'quarter_champion' },
          { streak: 100, badge: 'century_seeker' },
        ];

        streakBadges.forEach(({ streak, badge }) => {
          if (globalStreak >= streak && !state.profile.unlockedBadges.includes(badge)) {
            get().unlockBadge(badge);
          }
        });

        // Award dynamic milestones: 1 Streak Freeze for every 7-day master streak milestone
        if (globalStreak > 0 && globalStreak % 7 === 0) {
          const today = format(new Date(), 'yyyy-MM-dd');
          if (state.profile.lastFreezeAward !== today) {
            get().awardFreeze();
          }
        }

        // Perfectionist badge (7 days with 100% completion)
        let perfectDays = 0;
        const activeHabits = state.habits.filter(h => !h.isArchived);
        const activeCount = activeHabits.length;
        if (activeCount > 0) {
          const activeHabitIds = new Set(activeHabits.map(h => h.id));
          for (let i = 0; i < 7; i++) {
            const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
            const dayLogs = state.logs.filter(log => log.date === date && activeHabitIds.has(log.habitId));
            const completedCount = dayLogs.filter(log => log.completed).length;
            if (completedCount >= activeCount) {
              perfectDays++;
            }
          }
        }
        if (perfectDays >= 7 && !state.profile.unlockedBadges.includes('perfectionist')) {
          get().unlockBadge('perfectionist');
        }
      },

      getHabitStreak: (habitId) => {
        return calculateStreak(get().logs, habitId);
      },

      getGlobalStreak: () => {
        return calculateGlobalStreak(get().logs, get().habits);
      },

      getTodayProgress: () => {
        const state = get();
        const today = format(new Date(), 'yyyy-MM-dd');
        const activeHabits = state.habits.filter(h => !h.isArchived);
        const activeHabitIds = new Set(activeHabits.map(h => h.id));
        const todayLogs = state.logs.filter(
          log => log.date === today && log.completed && activeHabitIds.has(log.habitId)
        );
        return {
          completed: todayLogs.length,
          total: activeHabits.length,
        };
      },

      getCompletionRate: (habitId, days) => {
        const state = get();
        const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
        const relevantLogs = state.logs.filter(
          log => log.habitId === habitId && log.date >= startDate
        );
        if (relevantLogs.length === 0) return 0;
        const completed = relevantLogs.filter(log => log.completed).length;
        return Math.round((completed / days) * 100);
      },

      getLogsForDate: (date) => {
        return get().logs.filter(log => log.date === date);
      },

      getMoodData: (days) => {
        const state = get();
        const result: { date: string; mood: number }[] = [];
        
        for (let i = days - 1; i >= 0; i--) {
          const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
          const dayLogs = state.logs.filter(log => log.date === date && log.mood !== undefined);
          if (dayLogs.length > 0) {
            const avgMood = dayLogs.reduce((sum, log) => sum + (log.mood || 3), 0) / dayLogs.length;
            result.push({ date, mood: Math.round(avgMood) });
          }
        }
        
        return result;
      },

      toggleDarkMode: () => {
        const nextDarkMode = !get().profile.darkMode;
        const updatedProfile = {
          ...get().profile,
          darkMode: nextDarkMode,
        };
        set({ darkMode: nextDarkMode, profile: updatedProfile });

        if (get().dbStatus.connected && get().user.authenticated) {
          apiService.updateProfile(updatedProfile).catch((err) => {
            console.error('Failed to sync dark mode in MongoDB:', err);
          });
        }
      },

      setShowMoodPrompt: (show) => {
        set({ showMoodPrompt: show });
      },

      login: async (payload) => {
        const { token, name, email, id } = payload;
        apiService.setToken(token);
        
        set({ 
          user: { id: id ?? null, email: email ?? null, name, token, authenticated: true } 
        });

        // Instantly load data from MongoDB
        const state = get();
        await state.checkDbStatus();
        if (state.dbStatus.connected) {
          try {
            const dbHabits = await apiService.getHabits();
            const dbLogs = await apiService.getLogs();
            const dbProfile = await apiService.getProfile();
            
            set({
              habits: dbHabits.length > 0 ? dbHabits.map(normalizeHabit) : state.habits,
              logs: dbLogs.length > 0 ? dbLogs : state.logs,
              profile: {
                ...state.profile,
                ...dbProfile,
              },
            });
            
            // Set dynamic theme
            const theme = dbProfile.activeTheme || state.profile.activeTheme || 'midnight_oasis';
            document.documentElement.setAttribute('data-theme', theme);
            get().syncLeaderboard();
          } catch (e) {
            console.warn('Failed to load profile on login:', e);
          }
        }
      },

      logout: () => {
        apiService.setToken(null);
        set({ 
          user: { id: null, email: null, name: null, token: null, authenticated: false },
          habits: [],
          logs: [],
          profile: defaultProfileState(),
        });
        document.documentElement.setAttribute('data-theme', 'midnight_oasis');
      },

      addBuddy: (name) => {
        const emojis = ['🐨', '🐼', '🦊', '🐰', '🐯', '🐸', '🐨', '🦊'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const newBuddy: Buddy = {
          id: generateId(),
          name,
          avatar: randomEmoji,
          streak: 0,
          status: 'active'
        };
        set(state => ({
          buddies: [...state.buddies, newBuddy]
        }));
      },

      sendNudge: (buddyId) => {
        set(state => ({
          buddies: state.buddies.map(b => b.id === buddyId ? { ...b, status: 'nudge_sent' } : b)
        }));
        setTimeout(() => {
          set(state => ({
            buddies: state.buddies.map(b => b.id === buddyId ? { ...b, status: 'active' } : b)
          }));
        }, 5000);
      },

      submitReflection: async (reflectionData) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const newReflection: Reflection = {
          ...reflectionData,
          date: today
        };
        
        set(state => ({
          reflections: [...state.reflections, newReflection]
        }));

        get().addXP(30);

        // Save Sunday Reflection in Profile
        if (get().dbStatus.connected && get().user.authenticated) {
          try {
            const updatedProfile = {
              ...get().profile,
              totalCompletions: get().profile.totalCompletions + 1,
            };
            await apiService.updateProfile(updatedProfile);
          } catch (e) {
            console.error('Failed to sync Sunday reflection:', e);
          }
        }
      },

      purchaseTheme: (themeId: string, cost: number) => {
        const state = get();
        if (state.profile.xp < cost) return false;
        if (state.profile.purchasedThemes.includes(themeId)) return true;

        const updatedProfile = {
          ...state.profile,
          xp: state.profile.xp - cost,
          purchasedThemes: [...state.profile.purchasedThemes, themeId],
          activeTheme: themeId,
        };

        set({ profile: updatedProfile });
        document.documentElement.setAttribute('data-theme', themeId);

        if (get().dbStatus.connected && get().user.authenticated) {
          apiService.updateProfile(updatedProfile).catch((err) => {
            console.error('Failed to sync theme purchase:', err);
          });
        }
        return true;
      },

      selectTheme: (themeId: string) => {
        const state = get();
        if (!state.profile.purchasedThemes.includes(themeId)) return;

        const updatedProfile = {
          ...state.profile,
          activeTheme: themeId,
        };

        set({ profile: updatedProfile });
        document.documentElement.setAttribute('data-theme', themeId);

        if (get().dbStatus.connected && get().user.authenticated) {
          apiService.updateProfile(updatedProfile).catch((err) => {
            console.error('Failed to sync theme activation:', err);
          });
        }
      },

      purchaseFrame: (frameId: string, cost: number) => {
        const state = get();
        if (state.profile.xp < cost) return false;
        if (state.profile.purchasedFrames.includes(frameId)) return true;

        const updatedProfile = {
          ...state.profile,
          xp: state.profile.xp - cost,
          purchasedFrames: [...state.profile.purchasedFrames, frameId],
          activeFrame: frameId,
        };

        set({ profile: updatedProfile });

        if (get().dbStatus.connected && get().user.authenticated) {
          apiService.updateProfile(updatedProfile).catch((err) => {
            console.error('Failed to sync frame purchase:', err);
          });
        }
        return true;
      },

      selectFrame: (frameId: string) => {
        const state = get();
        if (!state.profile.purchasedFrames.includes(frameId)) return;

        const updatedProfile = {
          ...state.profile,
          activeFrame: frameId,
        };

        set({ profile: updatedProfile });

        if (get().dbStatus.connected && get().user.authenticated) {
          apiService.updateProfile(updatedProfile).catch((err) => {
            console.error('Failed to sync frame activation:', err);
          });
        }
      },

      updateQuestProgress: (type, increment) => {
        const state = get();
        const progress = { ...state.questProgress };
        let pointsEarned = 0;

        state.quests.forEach(quest => {
          if (quest.type === type) {
            const qProg = progress[quest.id] || { completed: false, current: 0, target: quest.target };
            if (!qProg.completed) {
              const currentVal = Math.min(qProg.current + increment, quest.target);
              const completed = currentVal >= quest.target;
              
              progress[quest.id] = {
                completed,
                current: currentVal,
                target: quest.target,
              };

              if (completed) {
                pointsEarned += quest.xpReward;
              }
            }
          }
        });

        if (pointsEarned > 0) {
          set({ questProgress: progress });
          get().addXP(pointsEarned);
        } else {
          set({ questProgress: progress });
        }
      },

      updateProfile: async (updates) => {
        const updatedProfile = {
          ...get().profile,
          ...updates,
        };
        set({ profile: updatedProfile });
        if (get().dbStatus.connected && get().user.authenticated) {
          try {
            await apiService.updateProfile(updatedProfile);
          } catch (err) {
            console.error('Failed to sync updated profile in MongoDB:', err);
          }
        }
      },

      syncLeaderboard: () => {
        const state = get();
        const globalStreak = calculateGlobalStreak(state.logs, state.habits);
        const currentXP = state.profile.xp;
        set((state) => ({
          leaderboard: state.leaderboard.map(entry => 
            entry.isMe ? { ...entry, xp: currentXP, streak: globalStreak } : entry
          ).sort((a, b) => b.xp - a.xp).map((entry, idx) => ({ ...entry, rank: idx + 1 }))
        }));
      }
    }),
    {
      name: 'wellness-tracker-storage',
      partialize: (state) => ({
        habits: state.habits,
        logs: state.logs,
        profile: state.profile,
        notifications: state.notifications,
        darkMode: state.darkMode,
        todayMood: state.todayMood,
        user: state.user,
        buddies: state.buddies,
        leaderboard: state.leaderboard,
        reflections: state.reflections,
        questProgress: state.questProgress,
      }),
    }
  )
);
