import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { apiService } from '../services/api';
import { Sparkles, Mail, Lock, User as UserIcon, ShieldAlert, ArrowRight, ShieldCheck, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthProps {
  initialIsLogin?: boolean;
}

export default function Auth({ initialIsLogin = true }: AuthProps) {
  const { login } = useStore();
  const [isLogin, setIsLogin] = useState(initialIsLogin);

  useEffect(() => {
    setIsLogin(initialIsLogin);
  }, [initialIsLogin]);
  const [step, setStep] = useState<'form' | 'otp'>('form'); // 'form' | 'otp'
  
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');

  // States
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const response = await apiService.login({ email, password });
        login({
          token: response.token,
          name: response.user.name,
          email: response.user.email,
          id: response.user.id,
        });
      } else {
        // REGISTRATION - INITIATE OTP
        const response = await apiService.register({ name, email, password });
        setInfo(response.message || 'OTP verification code has been dispatched!');
        setStep('otp');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const response = await apiService.verifyOTP({ email, otp });
      setInfo('Account created successfully!');
      setTimeout(() => {
        login({
          token: response.token,
          name: response.user.name,
          email: response.user.email,
          id: response.user.id,
        });
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Incorrect or expired OTP verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleBypassOtp = () => {
    setOtp('123456');
    setError(null);
    setInfo('Dev bypass code entered! Click Verify to continue.');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Visual glowing bubbles backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-pink-500/10 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Upper logo and description banner */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-violet-600/10 rounded-2xl border border-violet-500/20 mb-4 animate-pulse">
            <Sparkles size={36} className="text-violet-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-200 via-slate-100 to-teal-200 bg-clip-text text-transparent">
            Wellness Streak
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Build mindful daily habits. Log consistency. Unlock achievements.
          </p>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-slate-900/60 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Form header selector tab */}
                <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-white/5 mb-6">
                  <button
                    onClick={() => { 
                      setIsLogin(true); 
                      setError(null); 
                      window.history.pushState({}, '', '/login');
                      window.dispatchEvent(new Event('popstate'));
                    }}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                      isLogin 
                        ? 'bg-violet-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { 
                      setIsLogin(false); 
                      setError(null); 
                      window.history.pushState({}, '', '/signup');
                      window.dispatchEvent(new Event('popstate'));
                    }}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                      !isLogin 
                        ? 'bg-violet-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Register
                  </button>
                </div>

                <h2 className="text-xl font-bold mb-6 text-slate-100">
                  {isLogin ? 'Welcome Back!' : 'Start Your Wellness Journey'}
                </h2>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {/* Alert notification panels */}
                  {error && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-2"
                    >
                      <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {!isLogin && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 block ml-1">Username</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className="w-full bg-slate-950/80 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 block ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-950/80 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 block ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950/80 border border-white/5 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-violet-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    {loading ? (
                      <RefreshCw className="animate-spin" size={18} />
                    ) : (
                      <>
                        <span>{isLogin ? 'Access Portal' : 'Register Account'}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-2 text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="text-teal-400" size={24} />
                  <span>Verify Verification OTP</span>
                </h2>
                <p className="text-xs text-slate-400 mb-6">
                  We sent a 6-digit verification code to <span className="font-semibold text-slate-200">{email}</span>. Please insert it below.
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {error && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-2"
                    >
                      <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {info && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-3.5 bg-teal-500/10 border border-teal-500/20 text-teal-300 rounded-xl text-xs flex items-start gap-2"
                    >
                      <Sparkles size={16} className="shrink-0 mt-0.5 text-teal-400" />
                      <span>{info}</span>
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 block ml-1">OTP Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-slate-950/80 border border-white/5 rounded-xl py-4 text-center text-2xl font-bold text-teal-400 tracking-[8px] placeholder-slate-700 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleBypassOtp}
                      className="flex-1 border border-teal-500/20 hover:border-teal-500/40 bg-teal-500/5 hover:bg-teal-500/10 text-teal-400 text-xs font-bold py-3.5 px-3 rounded-xl transition-all active:scale-95"
                    >
                      Use Dev Code
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-lg hover:shadow-violet-600/30 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="animate-spin" size={18} />
                      ) : (
                        <>
                          <span>Verify & Onboard</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setStep('form'); setError(null); setInfo(null); }}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-400 font-medium mt-4 underline decoration-white/10"
                  >
                    Back to registration form
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
