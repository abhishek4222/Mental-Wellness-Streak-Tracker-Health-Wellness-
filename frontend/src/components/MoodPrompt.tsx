import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { MOOD_EMOJIS, MOOD_LABELS } from '../types';
import { Smile, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MoodPrompt() {
  const { logs, todayMood, logMood } = useStore();
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  
  // Check if any log contains a mood entry for today
  const hasLoggedMood = useMemo(() => {
    if (todayMood !== null) return true;
    const todayLogs = logs.filter(log => log.date === todayStr);
    return todayLogs.some(log => log.mood !== undefined && log.mood !== null);
  }, [logs, todayMood, todayStr]);

  const activeMoodVal = useMemo(() => {
    if (todayMood !== null) return todayMood;
    const todayLogs = logs.filter(log => log.date === todayStr);
    const logWithMood = todayLogs.find(log => log.mood !== undefined && log.mood !== null);
    return logWithMood ? logWithMood.mood! : null;
  }, [logs, todayMood, todayStr]);

  if (hasLoggedMood && activeMoodVal) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-4 border border-white/5 flex items-center justify-between shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl p-2 bg-emerald-500/10 rounded-xl">
            {MOOD_EMOJIS[activeMoodVal - 1]}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-200 tracking-wide">
              Mental Wellness Checked
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
              You rated your emotional health as <span className="font-bold text-emerald-400">{MOOD_LABELS[activeMoodVal - 1]}</span> today.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25 shadow-sm">
          <Sparkles size={10} className="animate-pulse" />
          <span>Complete</span>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="glass-card rounded-2xl p-5 border border-[#FFB347]/20 bg-amber-500/5 shadow-lg relative">
          <div className="flex items-center gap-2.5 mb-3.5">
            <Smile className="text-[#FFB347] animate-bounce" size={20} />
            <h3 className="font-bold text-sm sm:text-base tracking-wide text-slate-100">
              How is your mind & emotional wellness today?
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-4 leading-relaxed">
            Correlate habit consistency against mental health status. Earn <span className="font-bold text-yellow-400">+15 XP</span> by checking in:
          </p>

          <div className="flex justify-between gap-1.5 max-w-sm">
            {MOOD_EMOJIS.map((emoji, index) => {
              const val = index + 1;
              return (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => logMood(val)}
                  title={MOOD_LABELS[index]}
                  className="flex-1 py-3 px-1.5 rounded-xl border border-white/5 bg-slate-900/60 hover:bg-slate-900 text-center transition-all hover:border-[#FFB347]/30 flex flex-col items-center gap-1 shadow-sm"
                >
                  <span className="text-2xl sm:text-3xl">{emoji}</span>
                  <span className="text-[9px] font-bold text-slate-500 tracking-wide uppercase sm:block hidden">
                    {MOOD_LABELS[index].split(' ')[0]}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
