import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { MOOD_EMOJIS, MOOD_LABELS } from '../types';
import { subDays, format } from 'date-fns';

interface SundayReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHALLENGE_OPTIONS = [
  'Lack of Time',
  'Procrastination',
  'Low Energy/Fatigue',
  'Change in Routine',
  'Forgetfulness',
  'High Stress',
  'Unclear Goals',
];

export default function SundayReflectionModal({ isOpen, onClose }: SundayReflectionModalProps) {
  const { submitReflection, getGlobalStreak, habits, logs } = useStore();
  const [moodScore, setMoodScore] = useState<number>(3);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Auto-calculate this week's habit completion rate
  const weeklySuccessRate = useMemo(() => {
    if (habits.length === 0) return 0;
    const activeHabits = habits.filter(h => !h.isArchived);
    if (activeHabits.length === 0) return 0;

    const today = new Date();
    let completedLogsCount = 0;
    const totalPossibleLogs = activeHabits.length * 7;

    for (let i = 0; i < 7; i++) {
      const checkDate = subDays(today, i);
      const dateStr = format(checkDate, 'yyyy-MM-dd');

      const dayLogs = logs.filter(log => log.date === dateStr && log.completed);
      completedLogsCount += dayLogs.length;
    }

    return Math.round((completedLogsCount / totalPossibleLogs) * 100);
  }, [habits, logs]);

  const handleToggleChallenge = (challenge: string) => {
    if (selectedChallenges.includes(challenge)) {
      setSelectedChallenges(selectedChallenges.filter(c => c !== challenge));
    } else {
      setSelectedChallenges([...selectedChallenges, challenge]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReflection({
      moodScore,
      successRate: weeklySuccessRate,
      challenges: selectedChallenges,
      notes: notes.trim(),
    });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setMoodScore(3);
      setSelectedChallenges([]);
      setNotes('');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-white/10 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Animated Banner Header */}
        <div className="relative h-28 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-teal-500 p-6 flex flex-col justify-end">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/20 text-white hover:bg-slate-950/40 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-300 animate-pulse" size={22} />
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide">Weekly Sunday Reflection</h2>
          </div>
          <p className="text-white/80 text-[10px] sm:text-xs mt-0.5">Take a deep breath and review your mind and body wellness.</p>
        </div>

        {submitted ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce border border-emerald-500/20">
              ✨
            </div>
            <h3 className="text-lg font-bold text-emerald-400">Reflection Logged!</h3>
            <p className="text-xs text-slate-400 font-medium">
              Thank you for meditating on your progress. You earned <span className="font-extrabold text-violet-400">+30 XP</span>!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto scrollbar-none flex-1">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl text-center bg-slate-950/40 border border-white/5 shadow-sm">
                <div className="text-2xl font-black text-violet-400">{weeklySuccessRate}%</div>
                <div className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500 mt-1">Weekly Consistency Rate</div>
              </div>
              <div className="p-4 rounded-2xl text-center bg-slate-950/40 border border-white/5 shadow-sm">
                <div className="text-2xl font-black text-teal-400">{getGlobalStreak()} Days</div>
                <div className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500 mt-1">Active Global Streak</div>
              </div>
            </div>

            {/* 1. Mood Rating */}
            <div className="space-y-3">
              <label className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                1. How was your mental health overall this week?
              </label>
              <div className="flex justify-around items-center gap-1.5 p-2 bg-slate-950/20 border border-white/5 rounded-2xl">
                {MOOD_EMOJIS.map((emoji, index) => {
                  const val = index + 1;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setMoodScore(val)}
                      className={`flex-1 flex flex-col items-center p-2.5 rounded-xl border transition-all ${
                        moodScore === val
                          ? 'border-violet-500 bg-violet-600/10 scale-105 shadow-md text-violet-300'
                          : 'border-transparent bg-transparent hover:bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-[9px] mt-1 text-slate-500 font-bold uppercase tracking-tight">{MOOD_LABELS[index].split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Challenges Checklist */}
            <div className="space-y-3">
              <label className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                2. What challenges did you face this week?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CHALLENGE_OPTIONS.map((challenge) => {
                  const isChecked = selectedChallenges.includes(challenge);
                  return (
                    <button
                      key={challenge}
                      type="button"
                      onClick={() => handleToggleChallenge(challenge)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                        isChecked
                          ? 'border-violet-500 bg-violet-600/10 text-violet-300'
                          : 'border-white/5 bg-slate-950/20 text-slate-400 hover:bg-slate-950'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border text-[9px] ${
                        isChecked 
                          ? 'bg-violet-600 border-violet-500 text-white font-extrabold' 
                          : 'border-slate-600'
                      }`}>
                        {isChecked && '✓'}
                      </div>
                      <span className="truncate">{challenge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Journal Notes */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                3. Weekly Gratitude & Reflection (Open Journal)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What went well? What are you grateful for? How will you improve next week?"
                rows={3}
                className="w-full px-4 py-3 bg-slate-950/80 border border-white/5 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all focus:ring-1 focus:ring-violet-500/20"
              />
            </div>

            {/* Form actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl text-[10px] font-extrabold tracking-wider uppercase bg-slate-950/50 hover:bg-slate-950 text-slate-400 transition-colors"
              >
                Skip Reflection
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl text-[10px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-violet-600 to-teal-500 hover:from-violet-500 hover:to-teal-400 text-white shadow-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Save Reflection</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
