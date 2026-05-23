import { useStore } from '../store/useStore';
import { THEMES, FRAMES } from '../types';
import { ShoppingBag, Sparkles, CheckCircle2, ShieldAlert, Award, Star } from 'lucide-react';

export default function Store() {
  const { profile, purchaseTheme, selectTheme, purchaseFrame, selectFrame } = useStore();

  const currentXP = profile.xp;
  
  // Calculate total spent/current currency by deducting cost from level upgrades
  // For a simple premium experience, we can treat the user's total XP as their "Balance",
  // or XP as points that can be spent. Let's treat accumulated XP as their highscore,
  // and they can spend their XP (like a wallet)! Let's display the wallet balance clearly.
  const handleThemeAction = (themeId: string, cost: number, isOwned: boolean) => {
    if (isOwned) {
      selectTheme(themeId);
    } else {
      if (currentXP >= cost) {
        purchaseTheme(themeId, cost);
      }
    }
  };

  const handleFrameAction = (frameId: string, cost: number, isOwned: boolean) => {
    if (isOwned) {
      selectFrame(frameId);
    } else {
      if (currentXP >= cost) {
        purchaseFrame(frameId, cost);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet header information */}
      <div className="glass-card rounded-3xl p-6 border border-violet-500/20 bg-gradient-to-r from-violet-600/10 via-violet-500/5 to-teal-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full translate-y-[-20%] translate-x-[20%] blur-xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1">
          <h2 className="text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
            <ShoppingBag className="text-violet-400" size={22} />
            <span>Gamified Streak Store</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
            Maintain consistent habits, complete daily quests, and level up to earn XP currency. Spend XP here to customize your space!
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 bg-slate-950/60 border border-white/5 px-5 py-3.5 rounded-2xl shrink-0 self-start sm:self-auto shadow-inner">
          <Star className="text-yellow-400 fill-yellow-400 animate-pulse" size={24} />
          <div>
            <p className="text-2xl font-black text-slate-100 tracking-wide">{currentXP}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Available XP Wallet</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Themes custom skin section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-pink-400 animate-pulse" size={18} />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">
              Premium HSL Theme Skins
            </h3>
          </div>
          
          <div className="space-y-3">
            {THEMES.map(theme => {
              const isOwned = profile.purchasedThemes.includes(theme.id);
              const isActive = profile.activeTheme === theme.id;
              const canAfford = currentXP >= theme.cost;
              
              return (
                <div 
                  key={theme.id}
                  className={`glass-card rounded-2xl p-4 border flex items-center justify-between transition-all duration-300 ${
                    isActive 
                      ? 'border-violet-500/50 bg-violet-600/5 shadow-[0_0_15px_rgba(108,99,255,0.05)]' 
                      : 'border-white/5 bg-slate-900/40 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual miniature theme palette swatch */}
                    <div 
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} border border-white/10 flex items-center justify-center text-sm shadow-inner shrink-0`}
                    >
                      🎨
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-200 tracking-wide">{theme.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {isOwned ? (
                          <span className="text-teal-400 font-bold">Unlocked</span>
                        ) : (
                          <span>Cost: <span className="font-bold text-yellow-400">{theme.cost} XP</span></span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleThemeAction(theme.id, theme.cost, isOwned)}
                    disabled={!isOwned && !canAfford}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1 ${
                      isActive 
                        ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 cursor-default pointer-events-none' 
                        : isOwned 
                          ? 'bg-slate-950 text-slate-300 border border-white/5 hover:bg-slate-900 hover:text-white' 
                          : canAfford 
                            ? 'bg-violet-600 hover:bg-violet-500 text-white hover:shadow-violet-600/20' 
                            : 'bg-slate-950/40 text-slate-600 border border-transparent cursor-not-allowed'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 size={12} />
                        <span>Equipped</span>
                      </>
                    ) : isOwned ? (
                      <span>Equip Theme</span>
                    ) : (
                      <span>Unlock Skin</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile borders glow frames section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="text-yellow-400 animate-pulse" size={18} />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">
              Avatar Glow Frames
            </h3>
          </div>

          <div className="space-y-3">
            {FRAMES.map(frame => {
              const isOwned = profile.purchasedFrames.includes(frame.id);
              const isActive = profile.activeFrame === frame.id;
              const canAfford = currentXP >= frame.cost;
              
              return (
                <div 
                  key={frame.id}
                  className={`glass-card rounded-2xl p-4 border flex items-center justify-between transition-all duration-300 ${
                    isActive 
                      ? 'border-violet-500/50 bg-violet-600/5 shadow-[0_0_15px_rgba(108,99,255,0.05)]' 
                      : 'border-white/5 bg-slate-900/40 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual miniature frame preview */}
                    <div 
                      className={`w-10 h-10 rounded-full border-2 bg-slate-950 shrink-0 flex items-center justify-center text-sm font-bold ${frame.border}`}
                      style={{ borderColor: frame.color !== 'transparent' ? frame.color : undefined }}
                    >
                      {frame.id === 'none' ? '👤' : '✨'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-200 tracking-wide">{frame.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {isOwned ? (
                          <span className="text-teal-400 font-bold">Unlocked</span>
                        ) : (
                          <span>Cost: <span className="font-bold text-yellow-400">{frame.cost} XP</span></span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFrameAction(frame.id, frame.cost, isOwned)}
                    disabled={!isOwned && !canAfford}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1 ${
                      isActive 
                        ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 cursor-default pointer-events-none' 
                        : isOwned 
                          ? 'bg-slate-950 text-slate-300 border border-white/5 hover:bg-slate-900 hover:text-white' 
                          : canAfford 
                            ? 'bg-violet-600 hover:bg-violet-500 text-white hover:shadow-violet-600/20' 
                            : 'bg-slate-950/40 text-slate-600 border border-transparent cursor-not-allowed'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 size={12} />
                        <span>Equipped</span>
                      </>
                    ) : isOwned ? (
                      <span>Equip Frame</span>
                    ) : (
                      <span>Unlock Glow</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Informative alert banners for freeze protection purchases */}
      <div className="glass-card rounded-2xl p-5 border border-teal-500/20 bg-teal-500/5 flex items-center gap-3.5">
        <ShieldAlert className="text-teal-400 shrink-0" size={24} />
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-200 tracking-wide">Looking for Streak Freezes?</h4>
          <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed font-medium">
            You automatically earn 1 **Streak Freeze** for every 7-day master habit completion milestone! Protect your active chains in the evening warnings if you are about to miss midnight!
          </p>
        </div>
      </div>
    </div>
  );
}
