import React, { useState } from 'react';
import {
  X, User, Mail, Phone, Lock, CheckCircle2, AlertCircle,
  Shield, LogIn, UserPlus, Sparkles, ExternalLink, KeyRound,
  ArrowRight, Chrome, Facebook
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  initialTab?: 'login' | 'register';
  isForced?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  initialTab = 'login',
  isForced = false
}) => {
  const { login, register, switchDemoUser, openNewWindowAuth, isCookieBlocked, authError, setAuthError } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'provider'>('customer');

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const displayError = localError || authError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setAuthError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (tab === 'login') {
      const res = await login(email, password);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => onClose(), 800);
      } else {
        setLocalError(res.message);
      }
    } else {
      const res = await register(name, email, mobile, password, role);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => onClose(), 800);
      } else {
        setLocalError(res.message);
      }
    }
    setLoading(false);
  };

  const handleQuickDemo = async (demoRole: 'customer' | 'provider' | 'admin') => {
    setLoading(true);
    setLocalError(null);
    await switchDemoUser(demoRole);
    setSuccessMsg(`Accessing ${demoRole.toUpperCase()} Dashboard...`);
    setLoading(false);
    setTimeout(() => onClose(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#101C2C] sm:bg-black/80 flex items-center justify-center animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md min-h-screen sm:min-h-0 bg-[#101C2C] sm:rounded-[40px] border-x sm:border border-white/5 relative flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#087F5B]/5 blur-[100px] -ml-32 -mb-32 rounded-full pointer-events-none" />

        {!isForced && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 transition z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className="flex-1 p-8 sm:p-10 space-y-8 relative">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#f1d37a] p-[2px] mx-auto shadow-xl">
              <div className="w-full h-full bg-[#101C2C] rounded-[14px] flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">
                Service <span className="text-[#D4AF37]">Provider</span>
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                {tab === 'login' ? 'Luxury Marketplace Access' : 'Exclusive Partner Membership'}
              </p>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center space-x-2 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition active:scale-95 group">
              <Chrome className="w-4 h-4 text-white/70 group-hover:text-white transition" />
              <span>Google</span>
            </button>
            <button className="flex items-center justify-center space-x-2 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition active:scale-95 group">
              <Facebook className="w-4 h-4 text-[#1877F2] group-hover:text-[#1877F2] transition" />
              <span>Facebook</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
              <span className="bg-[#101C2C] px-4 text-slate-500 italic">OR USE EMAIL</span>
            </div>
          </div>

          {displayError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{displayError}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center space-x-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p className="font-medium">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div className="space-y-4 animate-slide-up">
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition placeholder:text-slate-600"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="Mobile Number (e.g. 0300-1234567)"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition placeholder:text-slate-600"
                  />
                </div>
                
                {/* Role Switcher */}
                <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition ${
                      role === 'customer' ? 'bg-[#D4AF37] text-[#101C2C] shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('provider')}
                    className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition ${
                      role === 'provider' ? 'bg-[#087F5B] text-white shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Shopkeeper
                  </button>
                </div>
              </div>
            )}

            <div className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition placeholder:text-slate-600"
              />
            </div>

            <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Secret Password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 active:scale-[0.98] shadow-2xl ${
                tab === 'login' ? 'bg-[#D4AF37] text-[#101C2C]' : 'bg-[#087F5B] text-white'
              } disabled:opacity-50`}
            >
              <span>{loading ? 'Authenticating...' : tab === 'login' ? 'Enter Marketplace' : 'Become a Partner'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="text-center pt-4">
            <button
              onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
              className="text-xs font-bold text-slate-500 hover:text-[#D4AF37] transition"
            >
              {tab === 'login' ? "Don't have an account? Join Now" : "Already a member? Sign In"}
            </button>
          </div>

          {/* Quick Demo Section (Luxury Styled) */}
          <div className="pt-8 border-t border-white/5 space-y-4">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Fast Track Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickDemo('customer')}
                className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition group"
              >
                <div className="text-[9px] font-black text-slate-500 group-hover:text-white transition">USER</div>
                <div className="text-[11px] font-black text-white/80">Shehbaz</div>
              </button>
              <button
                onClick={() => handleQuickDemo('provider')}
                className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition group"
              >
                <div className="text-[9px] font-black text-slate-500 group-hover:text-white transition">PROVIDER</div>
                <div className="text-[11px] font-black text-white/80">Tariq M.</div>
              </button>
              <button
                onClick={() => handleQuickDemo('admin')}
                className="flex flex-col items-center p-3 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 hover:bg-[#D4AF37]/10 transition group"
              >
                <div className="text-[9px] font-black text-[#D4AF37]/50 group-hover:text-[#D4AF37] transition">ADMIN</div>
                <div className="text-[11px] font-black text-[#D4AF37]/80 group-hover:text-[#D4AF37] transition font-mono tracking-tighter italic">KARACHI_HQ</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Area with security notice */}
        <div className="p-6 bg-black/20 border-t border-white/5 text-center">
          <div className="flex items-center justify-center space-x-2 text-slate-600 text-[10px] font-bold">
            <Shield className="w-3 h-3" />
            <span className="uppercase tracking-widest italic">SECURED_BY_SP_ENCRYPTION_V2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
