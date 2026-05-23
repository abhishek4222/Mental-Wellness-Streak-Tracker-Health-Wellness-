import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Play, Square, Award, Volume2, VolumeX, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type AmbientSound = 'none' | 'meditate' | 'rain';

export default function BreathingTimer() {
  const { addXP, updateQuestProgress } = useStore();
  const [duration, setDuration] = useState<120 | 300 | 60>(120); // seconds
  const [timeLeft, setTimeLeft] = useState(120);
  const [isRunning, setIsRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [completed, setCompleted] = useState(false);
  const [sound, setSound] = useState<AmbientSound>('none');
  
  // Audio Web Nodes Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodeRef = useRef<any>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Sync time selection
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(duration);
    }
  }, [duration, isRunning]);

  // Main countdown timer
  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Rhythmic breathing coach phases (Inhale: 4s, Hold: 4s, Exhale: 4s)
  useEffect(() => {
    let phaseTimer: any;
    if (isRunning) {
      phaseTimer = setInterval(() => {
        setPhaseSeconds(prev => {
          if (prev <= 1) {
            // Transition phase
            setBreathPhase(current => {
              if (current === 'Inhale') return 'Hold';
              if (current === 'Hold') return 'Exhale';
              return 'Inhale';
            });
            return 4; // Reset phase duration
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(phaseTimer);
  }, [isRunning]);

  // Handle ambient synthesizer triggers
  useEffect(() => {
    if (isRunning && sound !== 'none') {
      startSynthSound();
    } else {
      stopSynthSound();
    }
    return () => stopSynthSound();
  }, [isRunning, sound]);

  // Web Audio Synthesizer builder
  const startSynthSound = () => {
    try {
      stopSynthSound();
      
      // Init Audio Context
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      if (sound === 'meditate') {
        // Deep meditation hum: oscillator with LFO modulation
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime); // A2 Note low frequency hum

        // Modulate with sub-oscillator for relaxing vibrato waves
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // 0.2Hz wave
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        osc.connect(gain);
        
        osc.start();
        lfo.start();
        
        soundNodeRef.current = osc;
      } else if (sound === 'rain') {
        // Rain hum noise synthesis: White noise band-passed
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        
        // Bandpass Filter to sound like rain
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        filter.Q.setValueAtTime(0.8, ctx.currentTime);
        
        whiteNoise.connect(filter);
        filter.connect(gain);
        
        whiteNoise.start();
        soundNodeRef.current = whiteNoise;
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  };

  const stopSynthSound = () => {
    if (soundNodeRef.current) {
      try {
        (soundNodeRef.current as any).stop();
      } catch (e) {}
      soundNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    gainNodeRef.current = null;
  };

  const handleStart = () => {
    setIsRunning(true);
    setCompleted(false);
    setBreathPhase('Inhale');
    setPhaseSeconds(4);
  };

  const handleStop = () => {
    setIsRunning(false);
    stopSynthSound();
    setTimeLeft(duration);
  };

  const handleComplete = () => {
    setIsRunning(false);
    stopSynthSound();
    setCompleted(true);
    addXP(15);
    updateQuestProgress('meditation', 1);

    confetti({
      particleCount: 150,
      spread: 80,
      colors: ['#6C63FF', '#4ECDC4', '#FFB347'],
      origin: { y: 0.6 }
    });
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
          <Wind className="text-teal-400" size={22} />
          <span>Mindful Breathing Timer</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
          Improve emotional regulation, alleviate anxiety, and earn <span className="font-bold text-teal-400">+15 XP</span> consistency boosts.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Breathing guide animated circle panel */}
        <div className="md:col-span-2 glass-card rounded-3xl p-6 border border-white/5 bg-slate-900/40 flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient from-violet-600/5 to-transparent pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {!completed ? (
              <div className="flex flex-col items-center justify-center space-y-6 relative z-10 w-full">
                {/* Visual Breathing Ring */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  {/* Outer breathing ring tracker guided by phase scale */}
                  <motion.div
                    animate={{
                      scale: breathPhase === 'Inhale' ? 1.3 : breathPhase === 'Hold' ? 1.3 : 0.9,
                    }}
                    transition={{
                      duration: 4,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 rounded-full border-4 border-violet-500/25 bg-violet-600/5"
                  />

                  {/* Secondary subtle floating glow ring */}
                  <motion.div
                    animate={{
                      scale: breathPhase === 'Inhale' ? 1.45 : breathPhase === 'Hold' ? 1.45 : 0.8,
                      opacity: breathPhase === 'Hold' ? 0.4 : 0.15,
                    }}
                    transition={{
                      duration: 4,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-[-15px] rounded-full border border-teal-400/20 bg-teal-400/5 blur-sm"
                  />

                  {/* Core central text */}
                  <div className="relative z-20 text-center space-y-1">
                    <motion.div
                      key={breathPhase}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="text-2xl font-black text-slate-100 uppercase tracking-widest"
                      style={{ color: breathPhase === 'Hold' ? '#4ECDC4' : breathPhase === 'Inhale' ? '#6C63FF' : '#FF79C6' }}
                    >
                      {breathPhase}
                    </motion.div>
                    <div className="text-3xl font-black text-slate-100">{phaseSeconds}s</div>
                  </div>
                </div>

                {/* Session countdown clock */}
                <div className="text-center">
                  <div className="text-4xl font-black tracking-wider text-slate-200">{formatTimer(timeLeft)}</div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Remaining Time</p>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center p-8 space-y-4"
              >
                <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  <Award size={32} />
                </div>
                <h3 className="text-xl font-bold text-teal-400">Mindfulness Complete!</h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  Excellent work taking care of your breathing. You've unlocked <span className="font-bold text-violet-400">+15 XP</span> and progressed your wellness quests!
                </p>
                <button
                  onClick={() => setCompleted(false)}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  Start New Session
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Configurations panel side widgets */}
        <div className="space-y-4">
          {/* Session settings duration selectors */}
          <div className="glass-card rounded-3xl p-5 border border-white/5 bg-slate-900/40">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3.5">
              1. Session Duration
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '1 min', val: 60 },
                { label: '2 min', val: 120 },
                { label: '5 min', val: 300 },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  disabled={isRunning}
                  onClick={() => {
                    setDuration(opt.val as any);
                    setTimeLeft(opt.val);
                  }}
                  className={`py-2 px-1 rounded-xl border text-center text-xs font-bold transition-all ${
                    duration === opt.val
                      ? 'border-violet-500 bg-violet-600/15 text-violet-400 shadow-md'
                      : 'border-white/5 bg-slate-950/20 text-slate-400 hover:text-slate-200'
                  } disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Soundscapes synthesizer settings */}
          <div className="glass-card rounded-3xl p-5 border border-white/5 bg-slate-900/40">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3.5 flex items-center justify-between">
              <span>2. Audio Synthesizer</span>
              {sound !== 'none' ? <Volume2 size={14} className="text-teal-400 animate-pulse" /> : <VolumeX size={14} className="text-slate-500" />}
            </h3>
            <div className="space-y-2">
              {[
                { id: 'none', name: 'Silent Meditation', desc: 'Distraction-free silence' },
                { id: 'meditate', name: 'Meditation Oscillator', desc: 'Resonating low pitch theta wave hums' },
                { id: 'rain', name: 'Rain Synthesizer', desc: 'Analog white noise rain synthesis' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSound(opt.id as AmbientSound)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col gap-0.5 ${
                    sound === opt.id
                      ? 'border-violet-500 bg-violet-600/15 text-violet-300'
                      : 'border-white/5 bg-slate-950/20 text-slate-400 hover:bg-slate-950'
                  }`}
                >
                  <span className="font-bold text-slate-200">{opt.name}</span>
                  <span className="text-[9px] text-slate-500 font-medium leading-relaxed">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action controllers buttons */}
          {!completed && (
            <div className="flex gap-3">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-teal-500 hover:from-violet-500 hover:to-teal-400 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg hover:shadow-violet-600/25 flex items-center justify-center gap-2 active:scale-95 btn-glow"
                >
                  <Play size={16} fill="currentColor" />
                  <span>Begin Session</span>
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex-1 bg-slate-950 border border-white/5 hover:bg-slate-900 text-slate-300 font-bold py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Square size={16} fill="currentColor" />
                  <span>Stop Session</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
