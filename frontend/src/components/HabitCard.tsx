import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Flame, MinusCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    icon: string;
    color: string;
    target?: number;
    currentProgress: number;
    notifyEnabled?: boolean;
  };
}

export default function HabitCard({ habit }: HabitCardProps) {
  const { logs, toggleHabitComplete, setHabitProgress, getHabitStreak } = useStore();
  const habitId = habit.id ?? (habit as any)._id;
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLog = useMemo(
    () => logs.find(log => log.habitId === habitId && log.date === today),
    [logs, habitId, today]
  );
  
  const streak = useMemo(() => getHabitStreak(habitId), [logs, habitId]);
  const isCompleted = todayLog?.completed ?? false;
  const progress = todayLog?.progress ?? 0;
  
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      colors: [habit.color, '#FFD700', '#4ECDC4', '#FF79C6'],
      origin: { y: 0.8 }
    });
  };

  const handleToggle = () => {
    if (!habitId) return;
    
    if (habit.target) {
      if (isCompleted) {
        toggleHabitComplete(habitId, 0);
      } else {
        const newProgress = Math.min(progress + 1, habit.target);
        setHabitProgress(habitId, newProgress);
        if (newProgress >= habit.target) {
          triggerConfetti();
        }
      }
    } else {
      toggleHabitComplete(habitId, 1);
      if (!isCompleted) {
        triggerConfetti();
      }
    }
  };

  return (
    <motion.div 
      layout
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${
        isCompleted 
          ? 'bg-emerald-950/20 border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
          : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
      }`}
    >
      {/* Accent color left bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: habit.color }}
      />
      
      <div className="flex items-center gap-4">
        {/* Visual custom colored Icon wrapper */}
        <div 
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 transition-transform duration-300"
          style={{ backgroundColor: `${habit.color}15`, boxShadow: `inset 0 0 10px ${habit.color}10` }}
        >
          {habit.icon}
        </div>
        
        {/* Habit text & target bars */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm sm:text-base tracking-wide text-slate-100 truncate">
              {habit.name}
            </h4>
            {streak > 0 && (
              <div className="flex items-center gap-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-2 py-0.5 text-[10px] font-bold text-orange-400">
                <Flame size={10} className="fill-orange-400" />
                <span>{streak}d</span>
              </div>
            )}
          </div>
          
          {/* Target habits indicator bar */}
          {habit.target && (
            <div className="mt-2.5">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">
                  {progress} of {habit.target} steps completed
                </span>
                <span className="font-bold" style={{ color: habit.color }}>
                  {Math.round((progress / habit.target) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${(progress / habit.target) * 100}%`,
                    backgroundColor: habit.color,
                    boxShadow: `0 0 8px ${habit.color}`
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Custom micro buttons for quick progress logging */}
          {habit.target && !isCompleted && (
            <div className="flex gap-2 mt-3">
              {[1, 2, 3].map(num => {
                const isSelected = progress >= num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!habitId) return;
                      setHabitProgress(habitId, num);
                      if (num >= habit.target!) {
                        triggerConfetti();
                      }
                    }}
                    className={`h-8 min-w-[34px] rounded-lg border transition-all duration-200 flex items-center justify-center text-xs font-bold shadow-sm ${
                      isSelected
                        ? 'text-white border-transparent' 
                        : 'bg-slate-900/60 text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200'
                    }`}
                    style={isSelected ? { backgroundColor: habit.color, boxShadow: `0 0 10px ${habit.color}40` } : undefined}
                  >
                    +{num}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Right checklist completion checkmark button */}
        <button
          onClick={handleToggle}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 border ${
            isCompleted 
              ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105 active:scale-95' 
              : 'bg-slate-900/50 hover:bg-slate-900 border-white/5 hover:border-white/15 text-slate-500 hover:text-slate-300 hover:scale-105 active:scale-95'
          }`}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted ? (
            <CheckCircle2 size={24} className="stroke-[2.5px]" />
          ) : habit.target && progress > 0 ? (
            <MinusCircle size={22} className="text-slate-400" />
          ) : (
            <Circle size={22} className="text-slate-500" />
          )}
        </button>
      </div>
    </motion.div>
  );
}
