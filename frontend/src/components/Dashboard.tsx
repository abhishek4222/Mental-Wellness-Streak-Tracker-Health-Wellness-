import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { Flame, Snowflake, Target, Plus, Wind, Gift, Quote } from 'lucide-react';
import { format } from 'date-fns';
import HabitCard from './HabitCard';
import LevelButton from './LevelButton';
import MoodPrompt from './MoodPrompt';
import AddHabitModal from './AddHabitModal';
import SundayReflectionModal from './SundayReflectionModal';
import { motion } from 'framer-motion';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const { 
    habits, 
    logs, 
    profile, 
    getGlobalStreak, 
    getTodayProgress,
    applyFreeze,
    quests,
    questProgress,
  } = useStore();
  
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showSundayReflection, setShowSundayReflection] = useState(false);
  
  const activeHabits = useMemo(
    () => habits.filter(h => !h.isArchived),
    [habits]
  );
  
  const globalStreak = useMemo(getGlobalStreak, [logs]);
  const todayProgress = useMemo(() => getTodayProgress(), [logs, habits]);
  const todayCompletionPercent = todayProgress.total > 0 
    ? Math.round((todayProgress.completed / todayProgress.total) * 100) 
    : 0;
  
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  
  const unfrozenUncompletedHabits = useMemo(() => {
    return activeHabits.filter(habit => {
      const habitId = habit.id ?? (habit as any)._id;
      const log = logs.find(l => l.habitId === habitId && l.date === todayStr);
      return !log || (!log.completed && !log.isFrozen);
    });
  }, [activeHabits, logs, todayStr]);

  const isSunday = new Date().getDay() === 0;

  return (
    <div className="space-y-6">
      {/* Sunday Reflection Promo Banner */}
      {isSunday && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl p-5 border border-violet-500/20 bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 shadow-lg text-slate-100"
        >
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-violet-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="text-3xl p-2.5 bg-violet-500/10 rounded-2xl border border-violet-500/20 animate-bounce">✨</div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base tracking-wide text-slate-100">It's Reflection Sunday!</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Check in with yourself and review your wellness streaks. Earn <span className="font-extrabold text-yellow-400">+30 XP</span>!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSundayReflection(true)}
              className="px-5 py-3 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md active:scale-95 whitespace-nowrap self-start sm:self-auto btn-glow"
            >
              Reflect Now
            </button>
          </div>
        </motion.div>
      )}

      {/* Streak Freeze Banner CTA */}
      {unfrozenUncompletedHabits.length > 0 && profile.freezes > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-4 border border-teal-500/25 bg-gradient-to-r from-teal-950/20 to-slate-900/60 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl border border-teal-500/20 animate-pulse">
              <Snowflake size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wide text-teal-400">Streak Protection Available ({profile.freezes} Freezes)</h4>
              <p className="text-xs text-slate-400 mt-0.5 font-medium leading-relaxed">
                Protect your consistency! Apply a Streak Freeze to bridge your uncompleted habits:
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {unfrozenUncompletedHabits.map(habit => {
              const habitId = habit.id ?? (habit as any)._id;
              return (
                <button
                  key={habitId}
                  onClick={async () => {
                    await applyFreeze(habitId, todayStr);
                  }}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <span>{habit.icon}</span>
                  <span>Freeze {habit.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Mood Prompt check-in card */}
      <MoodPrompt />

      {/* Hero section overall consistency stats */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-violet-600 via-violet-700 to-teal-500 shadow-2xl">
        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 blur-sm" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-white/80 text-xs sm:text-sm font-bold uppercase tracking-wider">{greeting}, {profile.lastFreezeAward ? 'Warrior' : 'Champion'}</p>
              <h2 className="text-white text-2xl sm:text-3xl font-black mt-1 tracking-wide">Your Wellness Journey</h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <div className="flex items-center gap-3">
                <div className={`p-3.5 rounded-2xl border ${
                  globalStreak > 0 ? 'bg-white/15 border-white/20' : 'bg-white/5 border-white/10'
                }`}>
                  <Flame 
                    size={28} 
                    className={globalStreak > 0 ? 'text-orange-400 fill-orange-400 animate-pulse' : 'text-white/50'} 
                  />
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-black text-white leading-none">{globalStreak}</p>
                  <p className="text-white/80 text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-1.5">Day Streak</p>
                </div>
              </div>
              
              <div className="h-10 w-px bg-white/25 hidden sm:block" />
              
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">{todayProgress.completed} / {todayProgress.total}</p>
                <p className="text-white/80 text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-1.5">Completed Today</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3.5">
            <LevelButton />
            
            {profile.freezes > 0 && (
              <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3.5 py-1.5 text-white text-xs font-bold">
                <Snowflake size={12} className="text-cyan-200 animate-spin-slow" />
                <span>{profile.freezes} Freezes</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gamified Quest Board */}
      <div className="glass-card rounded-3xl p-5 border border-white/5 bg-slate-900/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift className="text-violet-400" size={18} />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Daily Quest Board</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-950/60 px-2.5 py-1 rounded-lg border border-white/5">
            Refreshes Daily
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5">
          {quests.map(quest => {
            const prog = questProgress[quest.id] || { completed: false, current: 0, target: quest.target };
            
            return (
              <div 
                key={quest.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
                  prog.completed 
                    ? 'border-emerald-500/25 bg-emerald-950/10' 
                    : 'border-white/5 bg-slate-950/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl">{quest.icon}</span>
                  <div>
                    <h4 className={`font-bold text-xs ${prog.completed ? 'text-emerald-400 line-through' : 'text-slate-200'}`}>
                      {quest.name}
                    </h4>
                    <p className="text-[9px] text-slate-500 font-semibold mt-0.5 max-w-[160px] truncate sm:max-w-none">
                      {quest.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    prog.completed 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                      : 'bg-violet-600/10 text-violet-300 border border-violet-500/25'
                  }`}>
                    {prog.completed ? 'Claimed' : `+${quest.xpReward} XP`}
                  </span>
                  <div className="text-[9px] text-slate-500 font-bold">
                    {prog.current}/{quest.target} completed
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress ring tracking charts and checklists */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Radial completion progress panel */}
        <div className="glass-card rounded-3xl p-5 border border-white/5 bg-slate-900/40 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Today's Progress</h3>
            <span className="text-xs font-black text-violet-400 bg-violet-600/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
              {todayCompletionPercent}%
            </span>
          </div>

          <div className="flex flex-col items-center py-2">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#6C63FF"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${todayCompletionPercent * 2.51} 251`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Target size={30} className="text-violet-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-xs font-bold text-slate-200">
              Completed {todayProgress.completed} of {todayProgress.total} habits
            </p>
            <div className="h-2 bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-violet-600 to-teal-400 rounded-full"
                style={{ width: `${todayCompletionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daily checklist and habit cards list */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Today's Micro-Habits</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('breathing')}
                className="flex items-center gap-1.5 text-[10px] font-bold text-teal-400 hover:bg-teal-500/10 px-2.5 py-1.5 rounded-xl border border-teal-500/20 transition-all active:scale-95"
              >
                <Wind size={12} />
                <span>Breathe Widget</span>
              </button>
              <button
                onClick={() => setShowAddHabit(true)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-violet-400 hover:bg-violet-600/10 px-2.5 py-1.5 rounded-xl border border-violet-500/20 transition-all active:scale-95"
              >
                <Plus size={12} />
                <span>Create Habit</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {activeHabits.length === 0 ? (
              <div className="text-center py-10 glass-card rounded-3xl border border-white/5 bg-slate-900/20">
                <div className="text-4xl mb-3">🌱</div>
                <h4 className="font-bold text-slate-200">Seed Your Routine</h4>
                <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto mt-1 mb-4 leading-relaxed">
                  You do not have any active habits configured. Create your first micro-habit to begin earning streaks!
                </p>
                <button
                  onClick={() => setShowAddHabit(true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md active:scale-95"
                >
                  Create Habit Now
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {activeHabits.map((habit) => {
                  const habitId = habit.id ?? (habit as any)._id;
                  return (
                    <HabitCard 
                      key={habitId} 
                      habit={habit} 
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Motivational quote cards */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 bg-slate-900/40 flex items-start gap-4">
        <Quote className="text-[#FFB347] shrink-0 mt-0.5 rotate-180" size={24} />
        <div>
          <p className="italic text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            "The secret of getting ahead is getting started."
          </p>
          <p className="text-xs font-bold text-slate-200 mt-1">— Mark Twain</p>
        </div>
      </div>

      {/* Add Habit & Sunday Reflection Modals */}
      <AddHabitModal 
        isOpen={showAddHabit} 
        onClose={() => setShowAddHabit(false)} 
      />
      <SundayReflectionModal
        isOpen={showSundayReflection}
        onClose={() => setShowSundayReflection(false)}
      />
    </div>
  );
}
