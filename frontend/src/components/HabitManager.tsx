import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { Archive, Plus, Trash2, Bell, BellOff } from 'lucide-react';
import AddHabitModal from './AddHabitModal';

export default function HabitManager() {
  const { habits, updateHabit, deleteHabit } = useStore();
  const [showAdd, setShowAdd] = useState(false);

  const activeHabits = useMemo(
    () => habits.filter(h => !h.isArchived),
    [habits]
  );

  const archivedHabits = useMemo(
    () => habits.filter(h => h.isArchived),
    [habits]
  );

  const handleToggleArchive = async (id: string, isArchived: boolean) => {
    await updateHabit(id, { isArchived: !isArchived });
  };

  const handleToggleNotify = async (id: string, enabled: boolean) => {
    await updateHabit(id, { notifyEnabled: !enabled });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this habit and all its logged history? This cannot be undone.')) {
      await deleteHabit(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
            <Archive className="text-violet-400" size={22} />
            <span>Manage Habits & Library</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
            Archive unused items to pause streaks, or delete them to reset history entirely.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-5 py-3 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 self-start sm:self-auto btn-glow"
        >
          <Plus size={14} />
          <span>Create New Habit</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Habits panel */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Active Habits ({activeHabits.length})</span>
          </h3>

          <div className="space-y-3">
            {activeHabits.map(habit => {
              const habitId = habit.id ?? (habit as any)._id;
              
              return (
                <div 
                  key={habitId}
                  className="glass-card rounded-2xl p-4 border border-white/5 bg-slate-900/40 flex items-center justify-between gap-4 transition-all duration-300 hover:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${habit.color}15` }}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-200 tracking-wide">{habit.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {habit.target ? `Target: ${habit.target} steps/day` : 'Daily check'}
                        {habit.notifyTime && ` • alarm at ${habit.notifyTime}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle notification */}
                    <button
                      type="button"
                      onClick={() => handleToggleNotify(habitId, habit.notifyEnabled)}
                      title={habit.notifyEnabled ? 'Mute Alerts' : 'Unmute Alerts'}
                      className={`p-2 rounded-xl border transition-all ${
                        habit.notifyEnabled 
                          ? 'border-violet-500/25 bg-violet-600/10 text-violet-400' 
                          : 'border-white/5 bg-slate-950/20 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {habit.notifyEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                    </button>

                    {/* Archive button */}
                    <button
                      type="button"
                      onClick={() => handleToggleArchive(habitId, habit.isArchived)}
                      title="Archive Habit"
                      className="p-2 rounded-xl border border-white/5 bg-slate-950/20 text-slate-400 hover:text-slate-200 hover:border-white/10 transition-all"
                    >
                      <Archive size={14} />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(habitId)}
                      title="Delete Habit"
                      className="p-2 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/20 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {activeHabits.length === 0 && (
              <p className="text-center py-8 text-xs text-slate-500 font-medium">
                No active habits configured. Use Create Habit to start.
              </p>
            )}
          </div>
        </div>

        {/* Archived Habits panel */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Archived Library ({archivedHabits.length})
          </h3>

          <div className="space-y-3">
            {archivedHabits.map(habit => {
              const habitId = habit.id ?? (habit as any)._id;
              
              return (
                <div 
                  key={habitId}
                  className="glass-card rounded-2xl p-4 border border-white/5 bg-slate-900/10 flex items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-slate-950/40"
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-400 tracking-wide line-through">{habit.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Archived library item
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Unarchive button */}
                    <button
                      type="button"
                      onClick={() => handleToggleArchive(habitId, habit.isArchived)}
                      className="px-3.5 py-2 rounded-xl border border-white/5 bg-slate-950 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-all active:scale-95"
                    >
                      Restore Habit
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(habitId)}
                      title="Delete Permanently"
                      className="p-2 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/20 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {archivedHabits.length === 0 && (
              <p className="text-center py-8 text-xs text-slate-500 font-medium">
                No archived library items.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Habit Modal */}
      <AddHabitModal 
        isOpen={showAdd} 
        onClose={() => setShowAdd(false)} 
      />
    </div>
  );
}
