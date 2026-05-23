import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { Brain, BellRing, Moon, Settings, Check } from 'lucide-react';
import { subDays } from 'date-fns';

export default function SageCoach() {
  const { logs, habits, reflections, notifications, profile, updateProfile } = useStore();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Notifications settings fields
  const [enabled, setEnabled] = useState(notifications?.enabled ?? true);
  const [silentStart, setSilentStart] = useState(notifications?.silentHoursStart ?? '22:00');
  const [silentEnd, setSilentEnd] = useState(notifications?.silentHoursEnd ?? '07:00');
  const [chainAlerts, setChainAlerts] = useState(notifications?.chainAlertsEnabled ?? true);
  const [chainTime, setChainTime] = useState(notifications?.chainAlertTime ?? '20:00');

  // AI Insights Generation Engine based on user logs
  const coachInsights = useMemo(() => {
    const insights: { type: 'success' | 'warn' | 'info'; title: string; desc: string }[] = [];
    const activeHabits = habits.filter(h => !h.isArchived);

    if (activeHabits.length === 0) {
      return [{
        type: 'info' as const,
        title: '🌱 Seed Your Garden',
        desc: 'Hello! I am Sage, your mindful AI wellness coach. To begin, configure a few daily habits on your dashboard so we can track consistency.'
      }];
    }

    // Calculation: Mood correlations
    const moodLogs = logs.filter(log => log.mood !== undefined && log.mood !== null);
    const completedLogs = logs.filter(log => log.completed);
    
    // Insight 1: General Consistency
    const last7DaysLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      const limit = subDays(new Date(), 7);
      return logDate >= limit;
    });

    const completionPercent = last7DaysLogs.length > 0 
      ? Math.round((last7DaysLogs.filter(l => l.completed).length / (activeHabits.length * 7)) * 100)
      : 0;

    if (completionPercent >= 80) {
      insights.push({
        type: 'success',
        title: '🌟 Outstanding Consistency',
        desc: `You completed ${completionPercent}% of your daily targets this week! Your discipline is forging high emotional resilience.`
      });
    } else if (completionPercent >= 50) {
      insights.push({
        type: 'info',
        title: '📈 Steady Progress',
        desc: `Your 7-day habit success is at ${completionPercent}%. You're building healthy momentum. Focus on one micro-habit at a time.`
      });
    } else {
      insights.push({
        type: 'warn',
        title: '🌱 Compassion & Focus',
        desc: `Consistency is at ${completionPercent}% this week. Be gentle with yourself. Micro-habits are meant to be simple. Let's aim to check off just one simple item tomorrow.`
      });
    }

    // Insight 2: Mood Correlation diagnostic
    if (moodLogs.length > 3) {
      const highMoodDays = moodLogs.filter(log => log.mood! >= 4);
      const lowMoodDays = moodLogs.filter(log => log.mood! <= 2);

      if (highMoodDays.length > 0) {
        // Find habits completed on high mood days
        const dates = highMoodDays.map(l => l.date);
        const completedOnHighDays = completedLogs.filter(l => dates.includes(l.date));
        
        const counts: Record<string, number> = {};
        completedOnHighDays.forEach(l => {
          counts[l.habitId] = (counts[l.habitId] || 0) + 1;
        });

        const bestHabitId = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, '');
        const bestHabit = habits.find(h => h.id === bestHabitId || (h as any)._id === bestHabitId);

        if (bestHabit) {
          insights.push({
            type: 'success',
            title: '✨ Mood Elevator Discovered',
            desc: `Your logs show a strong positive correlation between high emotional wellness and completing "${bestHabit.icon} ${bestHabit.name}". Double down on this activity!`
          });
        }
      }

      if (lowMoodDays.length > 0) {
        // Find reflections matching challenges on low mood weeks
        const reflectionChallenges = reflections.flatMap(r => r.challenges);
        const challengeCounts: Record<string, number> = {};
        
        reflectionChallenges.forEach(c => {
          challengeCounts[c] = (challengeCounts[c] || 0) + 1;
        });

        const topChallenge = Object.keys(challengeCounts).reduce((a, b) => challengeCounts[a] > challengeCounts[b] ? a : b, '');
        if (topChallenge) {
          insights.push({
            type: 'warn',
            title: '⚠️ Energy Drainage Alert',
            desc: `Analyzing your weekly Sunday reviews, "${topChallenge}" appears as your main blocker. Try scheduled time-blocking or evening notifications to tackle this.`
          });
        }
      }
    } else {
      insights.push({
        type: 'info',
        title: '🧠 Awaiting Wellness Data',
        desc: 'Log your emotional mood for at least 3 days in the daily prompt. I will analyze the logs to discover custom correlations between specific habits and your mental health!'
      });
    }

    // Insight 3: Dynamic positive affirmations generator
    const affirmations = [
      "Every small action you take today is a seed sown for your future peace.",
      "Consistency is not about perfection. It is about showing up with compassion.",
      "Your wellness journey is unique. Celebrate the minor checklist victories.",
      "Inhale peace, exhale self-doubt. You are building lasting healthy routines."
    ];
    const index = Math.min(affirmations.length - 1, Math.floor(Math.random() * affirmations.length));
    insights.push({
      type: 'info',
      title: '💭 Sage Affirmation',
      desc: `"${affirmations[index]}"`
    });

    return insights;
  }, [logs, habits, reflections]);

  const handleSaveSettings = () => {
    // Save settings back to profile store
    const updatedNotifications = {
      enabled,
      silentHoursStart: silentStart,
      silentHoursEnd: silentEnd,
      chainAlertsEnabled: chainAlerts,
      chainAlertTime: chainTime,
    };
    
    // We trigger dynamic profile updating
    updateProfile({
      ...profile,
      // We embed notifications settings inside storage
    } as any);

    // Save local storage node manually for notifications matching key
    localStorage.setItem('wellness-tracker-storage', JSON.stringify({
      state: {
        ...JSON.parse(localStorage.getItem('wellness-tracker-storage') || '{}').state,
        notifications: updatedNotifications
      }
    }));

    setSuccessMsg('Configurations saved successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* AI Sage Insights Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="text-violet-400 animate-pulse" size={20} />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">
              AI Mindful Diagnostic Insights
            </h3>
          </div>

          <div className="space-y-4">
            {coachInsights.map((insight, idx) => (
              <div 
                key={idx}
                className={`glass-card rounded-2xl p-5 border border-white/5 flex items-start gap-4 transition-all duration-300 hover:scale-101 ${
                  insight.type === 'success' 
                    ? 'border-emerald-500/20 bg-emerald-500/5' 
                    : insight.type === 'warn' 
                      ? 'border-amber-500/20 bg-amber-500/5' 
                      : 'border-violet-500/10 bg-slate-900/40'
                }`}
              >
                <div className="text-2xl mt-0.5">
                  {insight.type === 'success' ? '💡' : insight.type === 'warn' ? '🧠' : '📜'}
                </div>
                <div className="space-y-1">
                  <h4 className={`font-bold text-xs sm:text-sm tracking-wide ${
                    insight.type === 'success' 
                      ? 'text-emerald-400' 
                      : insight.type === 'warn' 
                        ? 'text-amber-400' 
                        : 'text-violet-400'
                  }`}>
                    {insight.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium">
                    {insight.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configurations Setup Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="text-teal-400 shrink-0" size={18} />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">
              Nudges & Configurations
            </h3>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-white/5 bg-slate-900/40 space-y-4">
            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1">
                <Check size={14} className="stroke-[2.5px]" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* General toggle */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Daily Push Alerts</h4>
                <p className="text-[9px] text-slate-500 font-medium">Toggle notification nudges.</p>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-10 h-5.5 rounded-full transition-all relative flex items-center p-0.5 ${
                  enabled ? 'bg-violet-600' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-all ${
                  enabled ? 'translate-x-4.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Quiet Hours configs */}
            <div className="space-y-2 border-b border-white/5 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Moon size={14} className="text-slate-500" />
                  <h4 className="text-xs font-bold text-slate-200">Silent Sleep Mode</h4>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                Mute push alerts during configured hours to prevent late-night sleep disturbances.
              </p>
              <div className="flex gap-2.5 items-center">
                <div className="flex-1 space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Start Time</span>
                  <input
                    type="time"
                    disabled={!enabled}
                    value={silentStart}
                    onChange={(e) => setSilentStart(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/5 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-300 disabled:opacity-40 focus:outline-none"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">End Time</span>
                  <input
                    type="time"
                    disabled={!enabled}
                    value={silentEnd}
                    onChange={(e) => setSilentEnd(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/5 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-300 disabled:opacity-40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Chain alerts warning toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">"Don't Break the Chain"</h4>
                  <p className="text-[9px] text-slate-500 font-medium">Alerts before midnight.</p>
                </div>
                <button
                  onClick={() => setChainAlerts(!chainAlerts)}
                  disabled={!enabled}
                  className={`w-10 h-5.5 rounded-full transition-all relative flex items-center p-0.5 ${
                    chainAlerts && enabled ? 'bg-violet-600' : 'bg-slate-800'
                  } disabled:opacity-40`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white transition-all ${
                    chainAlerts && enabled ? 'translate-x-4.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {chainAlerts && enabled && (
                <div className="space-y-1 p-2.5 bg-slate-950/30 border border-white/5 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Evening Warning Time</span>
                  <input
                    type="time"
                    value={chainTime}
                    onChange={(e) => setChainTime(e.target.value)}
                    className="bg-slate-950/80 border border-white/5 rounded-lg py-1.5 px-2.5 text-xs font-bold text-slate-300 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <BellRing size={14} />
              <span>Save Configurations</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
