import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Sparkles, Plus, Bell } from 'lucide-react';
import { PRESET_HABITS } from '../types';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_POOL = ['🧘', '📖', '🚶', '💧', '✍️', '😴', '🥗', '🎵', '🏃', '🚴', '🍎', '💤', '🧠', '🌿', '🌞', '🍵'];
const COLOR_POOL = ['#6C63FF', '#4ECDC4', '#95E1A3', '#74C7D4', '#FFB347', '#9B59B6', '#FF6B6B', '#E91E63', '#45AAF2', '#2ED573'];

export default function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
  const { addHabit } = useStore();
  
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  
  // Custom Habit input states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🧘');
  const [color, setColor] = useState('#6C63FF');
  const [hasTarget, setHasTarget] = useState(false);
  const [target, setTarget] = useState(5);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notifyTime, setNotifyTime] = useState('08:00');

  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setIcon('🧘');
    setColor('#6C63FF');
    setHasTarget(false);
    setTarget(5);
    setNotifyEnabled(false);
    setNotifyTime('08:00');
    setActiveTab('presets');
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await addHabit({
        name: name.trim(),
        icon,
        color,
        target: hasTarget ? Number(target) : undefined,
        notifyTime: notifyEnabled ? notifyTime : undefined,
        notifyEnabled: notifyEnabled,
      });
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = async (preset: typeof PRESET_HABITS[0]) => {
    setLoading(true);
    try {
      await addHabit({
        name: preset.name,
        icon: preset.icon,
        color: preset.color,
        target: preset.target,
        notifyTime: preset.notifyTime,
        notifyEnabled: true,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blur backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Glassmorphic Modal Body */}
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-white/10 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Animated gradients top banner */}
        <div className="relative h-24 bg-gradient-to-r from-violet-600 to-teal-500 p-5 flex flex-col justify-end">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/20 text-white hover:bg-slate-950/40 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-1.5 text-white">
            <Sparkles className="text-yellow-300 fill-yellow-300 animate-pulse" size={18} />
            <h2 className="text-base sm:text-lg font-extrabold tracking-wide">Configure Micro-Habit</h2>
          </div>
          <p className="text-white/80 text-[10px] sm:text-xs mt-0.5 font-medium leading-relaxed">
            Configure consistency targets to earn daily XP.
          </p>
        </div>

        {/* Tab Header Selectors */}
        <div className="flex border-b border-white/5 bg-slate-950/20 p-1">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-3 text-xs font-bold transition-all relative ${
              activeTab === 'presets' 
                ? 'text-violet-400 border-b-2 border-violet-500' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wellness Library
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 text-xs font-bold transition-all relative ${
              activeTab === 'custom' 
                ? 'text-violet-400 border-b-2 border-violet-500' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Define Custom Habit
          </button>
        </div>

        {/* Modal content body scrolling */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-none space-y-5 bg-slate-900/60">
          {activeTab === 'presets' ? (
            <div className="space-y-4">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Select a Preset Daily Micro-Habit:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {PRESET_HABITS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    disabled={loading}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-violet-500/30 hover:bg-slate-950 transition-all text-left shadow-sm group active:scale-98"
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-108 transition-all"
                      style={{ backgroundColor: `${preset.color}15` }}
                    >
                      {preset.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-200 truncate group-hover:text-slate-100">{preset.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {preset.target ? `${preset.target} steps/day` : 'Daily check'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateCustom} className="space-y-4">
              {/* Habit Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block ml-0.5">
                  Habit Description
                </label>
                <input
                  type="text"
                  maxLength={30}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Floss teeth, Do pushups"
                  className="w-full bg-slate-950/80 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                />
              </div>

              {/* Emoji Icons Pool */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block ml-0.5">
                  Preset Icon Selection ({icon})
                </label>
                <div className="grid grid-cols-8 gap-1.5 p-2 bg-slate-950/30 border border-white/5 rounded-2xl">
                  {EMOJI_POOL.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`h-9 w-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                        icon === emoji 
                          ? 'bg-violet-600 text-white scale-108' 
                          : 'hover:bg-slate-950/60'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Scheme Picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block ml-0.5">
                  Glow Color Palette Scheme
                </label>
                <div className="flex gap-2 p-2 bg-slate-950/30 border border-white/5 rounded-2xl overflow-x-auto scrollbar-none">
                  {COLOR_POOL.map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      className={`h-7 w-7 rounded-full shrink-0 border-2 transition-all ${
                        color === col 
                          ? 'border-white scale-110 shadow-md' 
                          : 'border-transparent opacity-85 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Habit Target Toggle */}
              <div className="p-3 bg-slate-950/30 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Daily Step Count Target</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    Log partial progress (e.g. read 10 pages).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHasTarget(!hasTarget)}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative flex items-center p-0.5 ${
                    hasTarget ? 'bg-violet-600' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all shadow-md ${
                    hasTarget ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {hasTarget && (
                <div className="space-y-1.5 p-3 bg-slate-950/10 border border-white/5 rounded-2xl">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">
                    Steps / Cycles Target Goal Value
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={target}
                      onChange={(e) => setTarget(Math.max(1, Number(e.target.value)))}
                      className="w-20 bg-slate-950/80 border border-white/5 rounded-lg py-2 text-center text-sm font-bold text-slate-200 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-medium">repetitions / target completed per day</span>
                  </div>
                </div>
              )}

              {/* Habit Reminders Nudges */}
              <div className="p-3 bg-slate-950/30 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="text-slate-500 shrink-0" size={16} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Schedule Active Nudges</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Toggle push alert notifications time.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyEnabled(!notifyEnabled)}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative flex items-center p-0.5 ${
                    notifyEnabled ? 'bg-violet-600' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all shadow-md ${
                    notifyEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {notifyEnabled && (
                <div className="space-y-1.5 p-3 bg-slate-950/10 border border-white/5 rounded-2xl">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">
                    Nudge Alarm Time Schedule
                  </label>
                  <input
                    type="time"
                    value={notifyTime}
                    onChange={(e) => setNotifyTime(e.target.value)}
                    className="bg-slate-950/80 border border-white/5 rounded-lg py-2 px-3 text-sm font-bold text-slate-200 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg hover:shadow-violet-600/30 flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 mt-6"
              >
                <Plus size={16} />
                <span>Create Custom Habit</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
