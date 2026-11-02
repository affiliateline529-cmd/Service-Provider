import React, { useState } from 'react';
import {
  X, User, Mail, Phone, Lock, CheckCircle2, AlertCircle,
  Shield, LogIn, UserPlus, Sparkles, ExternalLink, KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  initialTab = 'login'
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
    setSuccessMsg(`Switched to ${demoRole === 'admin' ? 'Administrator' : demoRole === 'provider' ? 'Business Provider' : 'Customer'} account!`);
    setLoading(false);
    setTimeout(() => onClose(), 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <Shield className="w-6 h-6 text-blue-800" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Service Provider – All Services Karachi
          </h2>
          <p className="text-xs text-slate-500">
            {tab === 'login' ? 'Log in to rate services & save favorite businesses' : 'Create your free customer account'}
          </p>
        </div>

        {/* First-Party Window Authentication notice / banner */}
        <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-start space-x-2.5">
            <KeyRound className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-semibold text-blue-950">
                Action required to load your app?
              </p>
              <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                If your browser is blocking a required security cookie (common on older versions of iOS and Safari or Android Chrome), authenticate in a new first-party window.
              </p>
              <button
                type="button"
                onClick={openNewWindowAuth}
                className="mt-2 w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-xs transition"
              >
                <span>Authenticate in new window</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => { setTab('login'); setLocalError(null); setAuthError(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              tab === 'login' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Login
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setLocalError(null); setAuthError(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              tab === 'register' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {displayError && (
          <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1.5">
            <div className="flex items-center space-x-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{displayError}</span>
            </div>
            <p className="text-[11px] text-red-600 pl-6">
              Recovery hint: Make sure your email and password are correct, or tap <strong>Authenticate in new window</strong> above to bypass browser cookie blocking.
            </p>
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Shehbaz Abro"
                    required
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Karachi Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="0333-1234567"
                    required
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Purpose
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold ${
                      role === 'customer'
                        ? 'bg-blue-50 border-blue-600 text-blue-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Customer / Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('provider')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold ${
                      role === 'provider'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Business Owner
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="youremail@example.com"
                required
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50 mt-1"
          >
            {loading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Demo Fast-Switch Logins */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <p className="text-[11px] font-bold text-slate-500 mb-2 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>One-Click Test Demo Logins:</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('customer')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center transition"
            >
              <div className="text-[11px] font-bold text-slate-800">Customer</div>
              <div className="text-[9px] text-slate-500 truncate">Shehbaz Abro</div>
            </button>

            <button
              onClick={() => handleQuickDemo('provider')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center transition"
            >
              <div className="text-[11px] font-bold text-slate-800">Business</div>
              <div className="text-[9px] text-slate-500 truncate">Tariq Mehmood</div>
            </button>

            <button
              onClick={() => handleQuickDemo('admin')}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-center transition"
            >
              <div className="text-[11px] font-bold text-amber-900">Admin</div>
              <div className="text-[9px] text-amber-700 truncate">Karachi HQ</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

