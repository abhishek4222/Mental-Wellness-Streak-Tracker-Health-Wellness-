import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { BarChart3, TrendingUp, Calendar as CalendarIcon, Smile, Lightbulb } from 'lucide-react';
import { MOOD_EMOJIS } from '../types';

export default function Analytics() {
  const { habits, logs, getCompletionRate, getMoodData } = useStore();
  const [selectedPeriod, setSelectedPeriod] = useState<30 | 90>(30);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  const activeHabits = useMemo(
    () => habits.filter(h => !h.isArchived),
    [habits]
  );
  
  const completionRates = useMemo(() => {
    return activeHabits.map(habit => {
      const habitId = habit.id ?? (habit as any)._id;
      return {
        habit,
        rate: getCompletionRate(habitId, selectedPeriod),
      };
    });
  }, [activeHabits, logs, selectedPeriod]);
  
  const moodData = useMemo(() => getMoodData(selectedPeriod), [logs, selectedPeriod]);
  
  const calendarData = useMemo(() => {
    const data: Record<string, { completed: number; total: number; mood?: number }> = {};
    const today = new Date();
    
    // Scan last 90 days
    for (let i = 89; i >= 0; i--) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const dayLogs = logs.filter(log => log.date === date);
      const dayMood = dayLogs.find(log => log.mood !== undefined)?.mood;
      
      data[date] = {
        completed: dayLogs.filter(log => log.completed).length,
        total: activeHabits.length,
        mood: dayMood,
      };
    }
    
    return data;
  }, [logs, activeHabits]);
  
  const averageMood = useMemo(() => {
    if (moodData.length === 0) return null;
    const sum = moodData.reduce((acc, d) => acc + d.mood, 0);
    return (sum / moodData.length).toFixed(1);
  }, [moodData]);
  
  const overallCompletion = useMemo(() => {
    const rates = completionRates.map(r => r.rate);
    if (rates.length === 0) return 0;
    return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
  }, [completionRates]);
  
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
          <BarChart3 className="text-violet-400" size={22} />
          <span>Analytics & Reflections</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
          Monitor your wellness journey, emotional statistics, and consistency rates over time.
        </p>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-white/5 max-w-[280px]">
        <button
          onClick={() => setSelectedPeriod(30)}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            selectedPeriod === 30
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setSelectedPeriod(90)}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            selectedPeriod === 90
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Last 90 Days
        </button>
      </div>

      {/* Overview Stats Widgets */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <BarChart3 size={16} className="text-violet-400" />
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider">
              Completion Rate
            </span>
          </div>
          <p className="text-3xl font-black text-violet-400 leading-none">{overallCompletion}%</p>
        </div>
        
        <div className="glass-card rounded-2xl p-5 border border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Smile size={16} className="text-amber-400" />
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider">
              Avg. Mood
            </span>
          </div>
          <p className="text-3xl font-black text-amber-400 leading-none">
            {averageMood ? `${MOOD_EMOJIS[Math.round(parseFloat(averageMood)) - 1]} (${averageMood})` : '—'}
          </p>
        </div>
      </div>

      {/* Mood Trend Graph Custom Chart */}
      {moodData.length > 0 && (
        <div className="glass-card rounded-3xl p-5 border border-white/5 bg-slate-900/40">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">Mood Tracking Chart</h3>
            <TrendingUp size={16} className="text-teal-400 animate-pulse" />
          </div>
          
          <div className="flex items-end justify-between h-28 gap-1.5 pt-4">
            {moodData.slice(-14).map((data) => (
              <div key={data.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                
                {/* Floating tooltip */}
                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 pointer-events-none z-10">
                  {MOOD_EMOJIS[data.mood - 1]}
                </div>

                <div 
                  className="w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80"
                  style={{ 
                    height: `${(data.mood / 5) * 80}%`,
                    backgroundColor: data.mood >= 4 ? '#4ECDC4' : data.mood >= 3 ? '#FFB347' : '#FF6B6B',
                    boxShadow: `0 0 10px ${data.mood >= 4 ? '#4ECDC440' : data.mood >= 3 ? '#FFB34740' : '#FF6B6B40'}`
                  }}
                />
                <span className="text-[9px] font-bold text-slate-500 tracking-wider">
                  {format(parseISO(data.date), 'MM/dd')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Heatmap Grid */}
      <div className="glass-card rounded-3xl p-5 border border-white/5 bg-slate-900/40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">Activity Calendar</h3>
          <CalendarIcon size={16} className="text-violet-400" />
        </div>
        
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {monthDays.map((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayData = calendarData[dateStr] || { completed: 0, total: 0 };
            const completionPercent = dayData.total > 0 
              ? (dayData.completed / dayData.total) * 100 
              : 0;
            
            const isSelected = dateStr === selectedDate;
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:scale-115 active:scale-95 cursor-pointer relative ${
                  isSelected 
                    ? 'ring-2 ring-violet-400 scale-105 shadow-[0_0_12px_rgba(108,99,255,0.4)] z-10' 
                    : ''
                } ${
                  completionPercent === 100 
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : completionPercent >= 50
                      ? 'bg-violet-600/60 text-slate-100 border border-violet-500/20'
                      : completionPercent > 0
                        ? 'bg-violet-600/30 text-slate-300 border border-violet-500/10'
                        : 'bg-slate-950/40 text-slate-500 border border-white/5'
                }`}
                title={`${dateStr}: completed ${dayData.completed}/${dayData.total} habits${dayData.mood ? ` • Mood: ${MOOD_EMOJIS[dayData.mood - 1]}` : ''}`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
        
        {/* Legend Swatches */}
        <div className="flex items-center justify-center gap-4 mt-5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-950/40 border border-white/5" />
            <span>0%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-violet-600/30 border border-violet-500/10" />
            <span>1-49%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-violet-600/60 border border-violet-500/20" />
            <span>50-99%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-sm" />
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Selected Date Habit Performance Breakdown */}
      {(() => {
        const parsedDate = parseISO(selectedDate);
        const formattedSelectedDate = format(parsedDate, 'MMMM d, yyyy');
        
        const dayLogs = logs.filter(log => log.date === selectedDate);
        const dayMoodLog = dayLogs.find(log => log.mood !== undefined);
        const moodScore = dayMoodLog?.mood;
        
        const activeHabitIds = new Set(activeHabits.map(h => h.id));
        const relevantLogs = dayLogs.filter(log => activeHabitIds.has(log.habitId));
        const completedLogs = relevantLogs.filter(log => log.completed);
        
        return (
          <div className="glass-card rounded-3xl p-5 border border-white/5 bg-slate-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Daily History Checklist: {formattedSelectedDate}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  Click any calendar day above to inspect past stats
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-violet-400 bg-violet-600/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                  {activeHabits.length > 0 ? Math.round((completedLogs.length / activeHabits.length) * 100) : 0}% Done
                </span>
                {moodScore !== undefined && (
                  <span className="text-xs font-black text-amber-400 bg-amber-600/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                    Mood: {MOOD_EMOJIS[moodScore - 1]}
                  </span>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {activeHabits.map((habit) => {
                const habitId = habit.id ?? (habit as any)._id;
                const log = dayLogs.find(l => l.habitId === habitId);
                const isCompleted = log?.completed ?? false;
                const isFrozen = log?.isFrozen ?? false;
                const progress = log?.progress ?? 0;

                return (
                  <div 
                    key={habitId} 
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                      isCompleted 
                        ? 'border-emerald-500/25 bg-emerald-950/10' 
                        : isFrozen 
                          ? 'border-cyan-500/25 bg-cyan-950/10'
                          : 'border-white/5 bg-slate-950/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{habit.icon}</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-200 truncate">{habit.name}</h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {habit.target ? `${progress} of ${habit.target} steps` : isCompleted ? 'Completed' : 'Not completed'}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isCompleted 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                        : isFrozen 
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25'
                          : 'bg-slate-900 text-slate-500 border border-white/5'
                    }`}>
                      {isCompleted ? '✓ Completed' : isFrozen ? '❄️ Frozen' : '× Missed'}
                    </span>
                  </div>
                );
              })}

              {activeHabits.length === 0 && (
                <div className="col-span-2 text-center py-6 text-xs text-slate-500 font-medium">
                  No habits configured for this day.
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Per-Habit breakdowns */}
      <div className="glass-card rounded-3xl p-5 border border-white/5 bg-slate-900/40">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-4">
          Individual Habit Performance
        </h3>
        
        <div className="space-y-4">
          {completionRates.map(({ habit, rate }) => (
            <div key={habit.id}>
              <div className="flex items-center justify-between mb-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <span className="text-base">{habit.icon}</span>
                  <span>{habit.name}</span>
                </div>
                <span className="font-black text-slate-400">{rate}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-slate-950/60 border border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${rate}%`,
                    backgroundColor: habit.color,
                    boxShadow: `0 0 8px ${habit.color}`
                  }}
                />
              </div>
            </div>
          ))}
          
          {completionRates.length === 0 && (
            <p className="text-center py-6 text-xs text-slate-500 font-medium">
              No habit records logged. Please log a checklist completion!
            </p>
          )}
        </div>
      </div>

      {/* Mental Health Coaching Insights */}
      <div className="glass-card rounded-2xl p-5 border border-teal-500/20 bg-teal-500/5 flex items-start gap-4">
        <Lightbulb className="text-teal-400 shrink-0 mt-0.5" size={22} />
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-teal-400 tracking-wide mb-1">💡 Analytics Insight</h3>
          <ul className="text-xs space-y-2 text-slate-400 font-medium leading-relaxed">
            {overallCompletion >= 80 ? (
              <li>🌟 You're doing amazing! Keep up this spectacular momentum.</li>
            ) : overallCompletion >= 50 ? (
              <li>📈 Steady progress. Target one difficult micro-habit tomorrow to boost your average.</li>
            ) : overallCompletion > 0 ? (
              <li>🚀 Small steps build giants. Focus on just checking off one simple routine.</li>
            ) : (
              <li>🌱 Begin by completing at least one habit today to trigger your first streak streak!</li>
            )}
            {moodData.length > 3 && averageMood && parseFloat(averageMood) >= 4 && (
              <li>😊 High mood correlations: Consistent checklists are acting as emotional enhancers!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
