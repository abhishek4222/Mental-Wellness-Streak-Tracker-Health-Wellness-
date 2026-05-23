import { useStore } from '../store/useStore';
import { Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LevelButton() {
  const { profile } = useStore();
  
  const currentXP = profile.xp;
  const level = profile.level;
  
  // XP formula: XP required to clear level N = N * 100
  const xpNeeded = level * 100;
  
  // Calculate raw progress percent inside current level
  let previousLevelsXP = 0;
  for (let l = 1; l < level; l++) {
    previousLevelsXP += l * 100;
  }
  
  const currentLevelXP = Math.max(0, currentXP - previousLevelsXP);
  const progressPercent = Math.min(100, Math.round((currentLevelXP / xpNeeded) * 100));

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-600/10 text-violet-300 text-xs font-bold shadow-md cursor-help relative group"
      title={`${currentLevelXP} / ${xpNeeded} XP completed inside Level ${level}`}
    >
      <Trophy size={12} className="text-yellow-400 fill-yellow-400" />
      <span className="tracking-wide">Level {level}</span>
      <div className="w-10 h-1.5 rounded-full bg-slate-950/60 overflow-hidden border border-white/5 shrink-0 hidden sm:block">
        <div 
          className="h-full bg-gradient-to-r from-violet-500 to-teal-400 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <span className="text-[10px] text-teal-400 sm:font-medium">{progressPercent}% XP</span>

      {/* Floating tooltip displaying details on hover */}
      <div className="absolute right-0 top-full mt-2 w-44 p-3 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 scale-95 origin-top-right group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-50 text-slate-200">
        <div className="flex items-center gap-1 mb-1 font-extrabold text-violet-400">
          <Star size={12} className="fill-violet-400" />
          <span>Profile Progress</span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
          Total XP: <span className="text-slate-200 font-bold">{currentXP} XP</span>
        </p>
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">
          Next level in: <span className="text-teal-400 font-bold">{xpNeeded - currentLevelXP} XP</span>
        </p>
      </div>
    </motion.div>
  );
}
