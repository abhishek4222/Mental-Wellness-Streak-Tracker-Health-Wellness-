import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import BreathingTimer from './components/BreathingTimer';
import Store from './components/Store';
import Analytics from './components/Analytics';
import HabitManager from './components/HabitManager';
import SageCoach from './components/SageCoach';
import { 
  Sparkles, 
  LayoutDashboard, 
  Wind, 
  ShoppingBag, 
  BarChart3, 
  FolderHeart, 
  Brain, 
  LogOut, 
  Moon, 
  Sun, 
  Menu, 
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const { user, profile, initializeDefaults, logout, toggleDarkMode } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    initializeDefaults();
  }, []);

  if (!user.authenticated) {
    return <Auth />;
  }

  // Get current visual border frame class based on profile selection
  const getFrameClass = () => {
    switch (profile.activeFrame) {
      case 'bronze':
        return 'border-2 border-[#CD7F32] shadow-[0_0_10px_#CD7F3270] bg-gradient-to-b from-slate-900 to-[#CD7F32]/10';
      case 'silver':
        return 'border-2 border-[#C0C0C0] shadow-[0_0_12px_#C0C0C090] bg-gradient-to-b from-slate-900 to-[#C0C0C0]/10';
      case 'gold':
        return 'border-2 border-[#FFD700] shadow-[0_0_18px_#FFD700a0] animate-pulse bg-gradient-to-b from-slate-900 to-[#FFD700]/15';
      default:
        return 'border border-white/10 bg-slate-900';
    }
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'breathing', name: 'Meditate Timer', icon: Wind },
    { id: 'store', name: 'Cosmetic Store', icon: ShoppingBag },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'manager', name: 'Manage Habits', icon: FolderHeart },
    { id: 'sage', name: 'AI Sage Coach', icon: Brain },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'breathing':
        return <BreathingTimer />;
      case 'store':
        return <Store />;
      case 'analytics':
        return <Analytics />;
      case 'manager':
        return <HabitManager />;
      case 'sage':
        return <SageCoach />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      
      {/* 1. Sidebar desktop navigation */}
      <aside className="w-64 shrink-0 bg-slate-950/80 border-r border-white/5 p-5 hidden md:flex flex-col justify-between fixed h-screen z-30 backdrop-blur-md">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2">
            <Sparkles className="text-violet-400 fill-violet-400" size={22} />
            <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-violet-200 to-teal-300 bg-clip-text text-transparent">
              Wellness Streak
            </span>
          </div>

          {/* User profile miniature details widget */}
          <div className="p-3 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center gap-3 relative group">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 transition-transform duration-300 group-hover:scale-105 ${getFrameClass()}`}>
              👤
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-xs text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Level {profile.level} Warrior</p>
            </div>
          </div>

          {/* Navigation deck */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all relative ${
                    isActive 
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/10' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop actions: logout & darkmode */}
        <div className="space-y-2 pt-5 border-t border-white/5">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            {profile.darkMode ? (
              <>
                <Sun size={14} className="text-yellow-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-violet-400" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={14} />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Spacer matching desktop sidebar width */}
      <div className="w-64 shrink-0 hidden md:block" />

      {/* 2. Mobile navbar layout */}
      <header className="md:hidden glass-card sticky top-0 z-40 w-full px-4 py-3.5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-violet-400 fill-violet-400 animate-pulse" size={18} />
          <span className="font-extrabold text-sm tracking-wider">Wellness Streak</span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${getFrameClass()}`}>
            👤
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-slate-400 hover:text-slate-200"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* 3. Mobile Navigation overlays modal menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass-card border-b border-white/5 absolute top-[52px] left-0 w-full z-45 overflow-hidden flex flex-col p-4 bg-slate-950/95 backdrop-blur-xl"
          >
            <nav className="space-y-1.5 mb-4">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-violet-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex gap-2.5 pt-3.5 border-t border-white/5">
              <button
                onClick={() => { toggleDarkMode(); setMobileMenuOpen(false); }}
                className="flex-1 py-2.5 rounded-xl border border-white/5 bg-slate-900 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-300"
              >
                {profile.darkMode ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-violet-400" />}
                <span>Theme</span>
              </button>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex-1 py-2.5 rounded-xl border border-rose-500/10 bg-rose-500/5 flex items-center justify-center gap-1.5 text-xs font-bold text-rose-400"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Main page viewport content wrapper */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full relative z-10 space-y-6 min-h-[90vh]">
        {renderContent()}
      </main>

    </div>
  );
}
