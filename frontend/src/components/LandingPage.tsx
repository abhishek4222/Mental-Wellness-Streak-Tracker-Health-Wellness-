import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Snowflake, 
  Target, 
  Wind, 
  Gift, 
  Brain, 
  ShoppingBag, 
  BarChart3, 
  CheckCircle2, 
  Zap, 
  ShieldCheck,
  Award
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  // Mini habit simulator state for interactive dashboard preview
  const [streakCount, setStreakCount] = useState(4);
  const [habits, setHabits] = useState([
    { id: '1', name: 'Mindful Breathing', icon: '🧘', completed: false, xp: 10 },
    { id: '2', name: 'Hydrate 2.5L', icon: '💧', completed: true, xp: 10 },
    { id: '3', name: 'Journal Thoughts', icon: '✍️', completed: false, xp: 10 },
  ]);
  const [activeSkin, setActiveSkin] = useState('midnight_oasis');
  const [completedCount, setCompletedCount] = useState(1);

  // Auto breathing pulse state for meditational widget preview
  const [breatheText, setBreatheText] = useState('Inhale');
  useEffect(() => {
    const interval = setInterval(() => {
      setBreatheText(prev => prev === 'Inhale' ? 'Exhale' : 'Inhale');
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const nextState = !h.completed;
        if (nextState) {
          // Trigger confetti on check-off!
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#8B5CF6', '#14B8A6', '#EC4899', '#3B82F6']
          });
          setCompletedCount(c => c + 1);
        } else {
          setCompletedCount(c => Math.max(0, c - 1));
        }
        return { ...h, completed: nextState };
      }
      return h;
    }));
  };

  useEffect(() => {
    // If all simulator habits completed, increment day streak!
    const allDone = habits.every(h => h.completed);
    if (allDone) {
      setStreakCount(5);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      setStreakCount(4);
    }
  }, [habits]);

  const skins = [
    { id: 'midnight_oasis', name: 'Midnight Oasis', class: 'bg-slate-900 border-white/5 text-slate-100' },
    { id: 'sakura_breeze', name: 'Sakura Breeze', class: 'bg-purple-950/60 border-pink-500/20 text-pink-100' },
    { id: 'sunset_boulevard', name: 'Sunset Boulevard', class: 'bg-amber-950/60 border-orange-500/20 text-orange-100' },
    { id: 'emerald_forest', name: 'Emerald Forest', class: 'bg-emerald-950/60 border-emerald-500/20 text-emerald-100' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-200">
      
      {/* 1. Ambient Background Glowing Auras */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[35%] left-[25%] w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[150px] pointer-events-none" />
      
      {/* 2. Top Header Navigation */}
      <header className="sticky top-0 z-50 w-full bg-slate-950/70 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-600/10 rounded-xl border border-violet-500/20">
              <Sparkles className="text-violet-400 fill-violet-400" size={20} />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-wide bg-gradient-to-r from-violet-200 via-slate-100 to-teal-300 bg-clip-text text-transparent">
              Wellness Streak
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('/login')}
              className="text-xs font-extrabold text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl transition-all"
            >
              Access Portal
            </button>
            <button 
              onClick={() => onNavigate('/signup')}
              className="text-xs font-extrabold bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-violet-600/20 hover:shadow-violet-600/30 active:scale-95"
            >
              Start Free
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero & Interactive Preview Widget Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Side: Copy and Actions */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-600/10 text-xs font-bold text-violet-300"
          >
            <Zap size={12} className="animate-pulse" />
            <span>Gamified Wellness Streak System</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent"
          >
            Build routines <br/>
            that <span className="bg-gradient-to-r from-violet-400 to-teal-300 bg-clip-text text-transparent">protect</span> <br/>
            your peace.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg"
          >
            Build mindful daily habits, log consistency, use Streak Freezes to safeguard progress, exchange XP in the cosmetic shop, and unlock mental fitness.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4.5 pt-2"
          >
            <button 
              onClick={() => onNavigate('/signup')}
              className="px-6 py-4 rounded-xl text-xs font-extrabold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg hover:shadow-violet-600/30 flex items-center gap-2 active:scale-95 btn-glow"
            >
              <span>Onboard Journey</span>
              <ArrowRight size={15} />
            </button>
            <button 
              onClick={() => onNavigate('/login')}
              className="px-6 py-4 rounded-xl text-xs font-extrabold border border-white/5 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-slate-100 transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Sign In</span>
            </button>
          </motion.div>

          {/* Social Proof Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5 max-w-md"
          >
            <div>
              <p className="text-xl sm:text-2xl font-black text-violet-400">100%</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Privacy Focused</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-teal-400">XP</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Gamified Rewards</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-amber-400">10+</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Preset Quests</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Interactive Dynamic Preview Widget */}
        <div className="lg:col-span-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass-card rounded-3xl border border-white/10 shadow-2xl bg-slate-900/80 p-5 sm:p-6 overflow-hidden relative"
          >
            {/* Widget top header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase ml-1">Live Interactive Preview</span>
              </div>
              <div className="flex gap-1.5">
                {skins.map(skin => (
                  <button 
                    key={skin.id}
                    onClick={() => setActiveSkin(skin.id)}
                    className={`w-3.5 h-3.5 rounded-full border border-white/20 transition-all ${
                      skin.id === 'midnight_oasis' ? 'bg-slate-900' :
                      skin.id === 'sakura_breeze' ? 'bg-pink-400' :
                      skin.id === 'sunset_boulevard' ? 'bg-orange-400' : 'bg-emerald-400'
                    } ${activeSkin === skin.id ? 'ring-2 ring-violet-500 scale-110' : 'opacity-60 hover:opacity-100'}`}
                    title={skin.name}
                  />
                ))}
              </div>
            </div>

            {/* Widget Interactive Content Area */}
            <div className="py-4 space-y-4">
              
              {/* Dynamic Skill Header Container */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600 to-teal-500 text-white flex items-center justify-between shadow-md">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider opacity-90">Consistency Streak</p>
                  <h4 className="text-lg font-black mt-0.5">Warrior Routine</h4>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-white/20 rounded-xl">
                    <Flame size={22} className="text-orange-300 fill-orange-300 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-2xl font-black">{streakCount}</span>
                    <span className="text-[10px] block font-bold tracking-wider uppercase opacity-85">Days</span>
                  </div>
                </div>
              </div>

              {/* Habit simulator check list */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Click to simulate check-off</p>
                
                {habits.map(habit => (
                  <button
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all duration-300 ${
                      habit.completed 
                        ? 'bg-emerald-950/20 border-emerald-500/25 text-emerald-300' 
                        : 'bg-slate-950/40 border-white/5 hover:border-white/15 text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{habit.icon}</span>
                      <span className={`text-xs font-bold ${habit.completed ? 'line-through opacity-70' : ''}`}>
                        {habit.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        habit.completed 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-violet-600/10 text-violet-300'
                      }`}>
                        {habit.completed ? 'Claimed' : `+${habit.xp} XP`}
                      </span>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        habit.completed 
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' 
                          : 'border-white/10 bg-slate-950'
                      }`}>
                        {habit.completed && <CheckCircle2 size={13} />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Simulated mini meditation widget */}
              <div className="p-3.5 rounded-2xl border border-white/5 bg-slate-950/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <Wind size={18} className="text-violet-400 animate-breath" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">Deep Breathing Circle</h5>
                    <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Ground your focus with a quick meditative exercise</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest bg-violet-600/10 border border-violet-500/25 px-2.5 py-1 rounded-xl">
                    {breatheText}
                  </span>
                </div>
              </div>

            </div>

            {/* Widget bottom achievements */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                <Target size={12} className="text-teal-400" />
                <span>Completion: {completedCount}/3 Done</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
                <Award size={12} />
                <span>Milestone Pending</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16 sm:py-24 border-t border-white/5 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-black text-violet-400 tracking-widest uppercase bg-violet-600/10 border border-violet-500/20 px-3 py-1 rounded-full">
            Key Functionalities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Designed for <span className="bg-gradient-to-r from-violet-300 via-slate-100 to-teal-300 bg-clip-text text-transparent">sustained consistency</span>.
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            We combined core psychological habits frameworks with rich game development concepts to build a routine tracker you will love using.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-4 hover:border-white/10 transition-all duration-300">
            <div className="p-3 bg-violet-600/10 rounded-2xl border border-violet-500/20 text-violet-400 w-fit">
              <Gift size={20} />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">Daily Quest Board</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Every day features unique quests that grant bonus experience points (XP). Complete custom challenges like morning meditations to maximize leveling.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-4 hover:border-white/10 transition-all duration-300">
            <div className="p-3 bg-teal-600/10 rounded-2xl border border-teal-500/20 text-teal-400 w-fit">
              <Snowflake size={20} />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">Streak Freeze Protection</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Life gets in the way. Avoid the psychological burnout of losing streaks with Streak Freezes. Safeguard your long-term commitment.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-4 hover:border-white/10 transition-all duration-300">
            <div className="p-3 bg-pink-600/10 rounded-2xl border border-pink-500/20 text-pink-400 w-fit">
              <ShoppingBag size={20} />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">Cosmic Cosmetic Store</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Spend XP you earned from actual routine completions to purchase exclusive avatars, profile frame glowing rings, and skin templates.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-4 hover:border-white/10 transition-all duration-300">
            <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-400 w-fit">
              <Wind size={20} />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">Breathing Timer Widget</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Feeling overwhelmed? Engage in breathing exercises with the built-in rhythmic meditate widget. Ground your mind and reduce stress.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-4 hover:border-white/10 transition-all duration-300">
            <div className="p-3 bg-amber-600/10 rounded-2xl border border-amber-500/20 text-amber-400 w-fit">
              <Brain size={20} />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">AI Sage Advisor</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Receive personalized mindfulness guidance and daily tips from the integrated AI Sage Wellness Coach based on your habit consistency data.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-4 hover:border-white/10 transition-all duration-300">
            <div className="p-3 bg-purple-600/10 rounded-2xl border border-purple-500/20 text-purple-400 w-fit">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">Milestone Analytics</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Deep-dive metrics show exactly where your routines shine. Trace completion rates, mood logs over weeks, and write weekly reflections.
            </p>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="timeline" className="max-w-6xl mx-auto px-4 py-16 sm:py-24 border-t border-white/5 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-black text-teal-400 tracking-widest uppercase bg-teal-600/10 border border-teal-500/20 px-3 py-1 rounded-full">
            Process Timeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            How It Works in <span className="bg-gradient-to-r from-teal-400 to-violet-300 bg-clip-text text-transparent">three simple steps</span>.
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Get onboarded and starting logging progress in under two minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          
          {/* Step 1 */}
          <div className="relative group">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-xs font-black text-violet-400">
                01
              </div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">Onboard & Create Account</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Choose a username and set up your email. Use our lightning-fast OTP system to activate your profile immediately.
              </p>
            </div>
            <div className="hidden md:block absolute top-12 left-[90%] w-[35%] h-[1px] bg-gradient-to-r from-violet-500/30 to-teal-500/15 z-0" />
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-teal-600/10 border border-teal-500/20 flex items-center justify-center text-xs font-black text-teal-400">
                02
              </div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">Configure Routines</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Add your own bespoke micro-habits or load from our pre-configured mindfulness habits. Adjust daily target multipliers.
              </p>
            </div>
            <div className="hidden md:block absolute top-12 left-[90%] w-[35%] h-[1px] bg-gradient-to-r from-teal-500/15 to-violet-500/30 z-0" />
          </div>

          {/* Step 3 */}
          <div className="relative group">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-xs font-black text-amber-400">
                03
              </div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">Maintain Streak Fire</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Log items daily. Accumulate level XP points, purchase glowing frames, unlock quest bonuses, and protect consistency streaks!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Benefits Matrix / About Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-24 border-t border-white/5 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] font-black text-amber-400 tracking-widest uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Why We Differ
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              A routine system built for <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">humans</span>.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Standard habit trackers operate on binary pressure: miss a single day and your streak resets to zero, causing you to give up. We implement a stress-free framework designed to build atomic habits without the emotional burnout.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1 text-teal-400 shrink-0 mt-0.5">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Psychology-Backed Design</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Leverages atomic habit theory to prompt positive consistency cycles.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 text-teal-400 shrink-0 mt-0.5">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Absolutely 100% Free</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">All premium features like AI advisor, meditational timer, custom skins are totally free.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {/* Comparison Grid */}
            <div className="p-5 sm:p-6 rounded-3xl border border-white/5 bg-slate-900/20 space-y-4">
              <h4 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">Features Comparison</h4>
              
              <div className="space-y-2.5">
                {/* Header Row */}
                <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 uppercase tracking-widest pb-2 border-b border-white/5">
                  <div className="col-span-6">Benefit Category</div>
                  <div className="col-span-3 text-center">Others</div>
                  <div className="col-span-3 text-right text-violet-400">Wellness Streak</div>
                </div>

                {/* Row 1 */}
                <div className="grid grid-cols-12 text-xs py-2.5 border-b border-white/5 items-center">
                  <div className="col-span-6 font-bold text-slate-300">Stress Free Streak Freezes</div>
                  <div className="col-span-3 text-center text-slate-600 font-medium">No Protection</div>
                  <div className="col-span-3 text-right text-teal-400 font-extrabold">✓ Included</div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-12 text-xs py-2.5 border-b border-white/5 items-center">
                  <div className="col-span-6 font-bold text-slate-300">Cosmetic Skins & Themes</div>
                  <div className="col-span-3 text-center text-slate-600 font-medium">None / Paywall</div>
                  <div className="col-span-3 text-right text-teal-400 font-extrabold">✓ Earn with XP</div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-12 text-xs py-2.5 border-b border-white/5 items-center">
                  <div className="col-span-6 font-bold text-slate-300">Integrated Meditate Timer</div>
                  <div className="col-span-3 text-center text-slate-600 font-medium">Separated app</div>
                  <div className="col-span-3 text-right text-teal-400 font-extrabold">✓ Built-In</div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-12 text-xs py-2.5 border-b border-white/5 items-center">
                  <div className="col-span-6 font-bold text-slate-300">AI Wellness Counselor</div>
                  <div className="col-span-3 text-center text-slate-600 font-medium">Not Available</div>
                  <div className="col-span-3 text-right text-teal-400 font-extrabold">✓ AI Sage Coach</div>
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-12 text-xs py-2.5 items-center">
                  <div className="col-span-6 font-bold text-slate-300">Data Privacy</div>
                  <div className="col-span-3 text-center text-slate-600 font-medium">Cloud/Sold</div>
                  <div className="col-span-3 text-right text-teal-400 font-extrabold">✓ Encrypted</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom Call-To-Action Banner */}
      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16 relative z-10">
        <div className="rounded-3xl border border-violet-500/25 bg-gradient-to-r from-violet-900/30 via-slate-900/60 to-teal-950/20 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <h2 className="text-2xl sm:text-3.5xl font-black tracking-tight leading-tight">
            Ready to ignite your streak fire today?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Create your account now, sync routines with MongoDB database, and level up your warrior journey with visual consistency.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4.5 pt-2">
            <button 
              onClick={() => onNavigate('/signup')}
              className="px-6 py-4 rounded-xl text-xs font-extrabold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg hover:shadow-violet-600/30 flex items-center gap-2 active:scale-95 btn-glow"
            >
              <span>Create Account Free</span>
              <ArrowRight size={15} />
            </button>
            <button 
              onClick={() => onNavigate('/login')}
              className="px-6 py-4 rounded-xl text-xs font-extrabold border border-white/5 bg-slate-900 hover:bg-slate-900/90 text-slate-300 transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Access Login</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer Section */}
      <footer className="border-t border-white/5 bg-slate-950/80 py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-violet-400 fill-violet-400" size={18} />
              <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-violet-200 to-teal-300 bg-clip-text text-transparent">
                Wellness Streak
              </span>
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              Atomic Routines. Gamified. Mental Peace.
            </p>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
              A stunning habit tracker matching gaming aesthetics to secure long-term consistency.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-widest">Platform</h4>
            <nav className="flex flex-col gap-2 text-xs">
              <a href="#features" className="text-slate-400 hover:text-violet-400 transition-colors">Features</a>
              <a href="#timeline" className="text-slate-400 hover:text-violet-400 transition-colors">Timeline</a>
              <a onClick={() => onNavigate('/signup')} className="text-slate-400 hover:text-violet-400 cursor-pointer transition-colors">Register</a>
              <a onClick={() => onNavigate('/login')} className="text-slate-400 hover:text-violet-400 cursor-pointer transition-colors">Login</a>
            </nav>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-widest">Wellness Skins</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <span className="hover:text-violet-400 transition-colors cursor-pointer" onClick={() => setActiveSkin('midnight_oasis')}>Midnight Oasis</span>
              <span className="hover:text-pink-400 transition-colors cursor-pointer" onClick={() => setActiveSkin('sakura_breeze')}>Sakura Breeze</span>
              <span className="hover:text-orange-400 transition-colors cursor-pointer" onClick={() => setActiveSkin('sunset_boulevard')}>Sunset Boulevard</span>
              <span className="hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => setActiveSkin('emerald_forest')}>Emerald Forest</span>
            </div>
          </div>

          {/* Copyright/Privacy */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-widest">Security & Privacy</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Your consistency logs and reflections are protected. No tracking tokens, no advertisement cookies.
            </p>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-2">
              © {new Date().getFullYear()} Wellness Streak. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
