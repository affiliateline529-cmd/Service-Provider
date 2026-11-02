import React, { useState, useEffect } from 'react';
import {
  Search, Shield, Smartphone, Monitor, Download, User as UserIcon,
  Bell, CheckCircle2, Sparkles, LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AndroidHeaderProps {
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenApkGuide: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  pendingCount: number;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  onOpenSearch,
  onOpenAuth,
  onOpenAdmin,
  onOpenApkGuide,
  isMobileFrame,
  onToggleFrame,
  pendingCount
}) => {
  const { currentUser, isAdmin } = useAuth();
  const [timeStr, setTimeStr] = useState('02:35 PM');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-800 text-white shadow-md">
      {/* Android System Status Bar (Shown in mobile frame) */}
      {isMobileFrame && (
        <div className="flex items-center justify-between px-5 pt-2 pb-1 text-xs font-semibold tracking-wider text-slate-200 select-none bg-black/20">
          <span>{timeStr}</span>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded font-mono">4G LTE</span>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z"/>
            </svg>
            <div className="flex items-center space-x-0.5">
              <span className="text-[10px]">98%</span>
              <div className="w-4 h-2 border border-slate-300 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-emerald-400 rounded-2xs"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Android App Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-blue-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                Service Provider
              </h1>
              <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-semibold px-1.5 py-0.2 rounded-full">
                Karachi
              </span>
            </div>
            <p className="text-[11px] text-blue-200 font-medium">All Services & Shops Catalogue</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5">
          {/* Frame Switcher for responsive demo */}
          <button
            onClick={onToggleFrame}
            title={isMobileFrame ? 'Switch to Full Screen View' : 'Switch to Android Mobile Frame'}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 transition"
          >
            {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            title="Search Services"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Install APK / Android Guide */}
          <button
            onClick={onOpenApkGuide}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition"
            title="Download APK / Android Guide"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Get APK</span>
          </button>

          {/* Admin Dashboard CTA if admin */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="relative p-2 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 transition"
              title="Admin Panel"
            >
              <Shield className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* User profile / login */}
          <button
            onClick={onOpenAuth}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center space-x-1"
            title={currentUser ? `Logged in as ${currentUser.name}` : 'Login / Register'}
          >
            {currentUser ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center uppercase">
                {currentUser.name.charAt(0)}
              </div>
            ) : (
              <LogIn className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
