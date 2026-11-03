import React, { useState, useEffect } from 'react';
import {
  Search, Shield, Smartphone, Monitor, Download, User as UserIcon,
  Bell, CheckCircle2, Sparkles, LogIn, Clock, Briefcase, MapPin,
  ChevronDown, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationTray } from './NotificationTray';

interface AndroidHeaderProps {
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenApkGuide: () => void;
  onOpenTracker: () => void;
  onOpenProviderDashboard: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  pendingCount: number;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  onOpenSearch,
  onOpenAuth,
  onOpenAdmin,
  onOpenApkGuide,
  onOpenTracker,
  onOpenProviderDashboard,
  isMobileFrame,
  onToggleFrame,
  pendingCount
}) => {
  const { currentUser, isAdmin, isProvider } = useAuth();
  const [timeStr, setTimeStr] = useState('02:35 PM');
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentUser) {
        checkUnread();
        const interval = setInterval(checkUnread, 10000);
        return () => clearInterval(interval);
    }
  }, [currentUser]);

  const checkUnread = async () => {
    if (!currentUser) return;
    try {
        const res = await fetch(`/api/notifications/${currentUser.id}`);
        const data = await res.json();
        if (data.success) {
            setHasUnread(data.data.some((n: any) => !n.isRead));
        }
    } catch (err) {}
  };

  return (
    <header className="sticky top-0 z-30 bg-[#101C2C] text-white border-b border-white/5 luxury-shadow">
      {/* Android System Status Bar (Shown in mobile frame) */}
      {isMobileFrame && (
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-black tracking-widest text-slate-400 select-none bg-black/10">
          <span>{timeStr}</span>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-0.5">
              <div className="w-[3px] h-[5px] bg-slate-600 rounded-full" />
              <div className="w-[3px] h-[8px] bg-slate-600 rounded-full" />
              <div className="w-[3px] h-[11px] bg-[#087F5B] rounded-full shadow-[0_0_8px_#087F5B]" />
              <div className="w-[3px] h-[14px] bg-[#087F5B] rounded-full shadow-[0_0_8px_#087F5B]" />
            </div>
            <div className="flex items-center space-x-1">
              <span>98%</span>
              <div className="w-5 h-2.5 border border-slate-700 rounded-[2px] p-[1px] flex items-center">
                <div className="w-full h-full bg-[#087F5B] rounded-[1px]"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Premium App Bar */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          {/* Brand Logo Shield */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#f1d37a] p-[2px] shadow-lg shadow-[#D4AF37]/10">
            <div className="w-full h-full bg-[#101C2C] rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none">
                Service <span className="text-[#D4AF37]">Provider</span>
              </h1>
            </div>
            {/* Location Selector */}
            <button className="flex items-center space-x-1 mt-0.5 group">
              <MapPin className="w-3 h-3 text-[#087F5B]" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition">Karachi, PK</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-600 group-hover:text-[#D4AF37] transition" />
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition active:scale-90"
            title="Search Premium Services"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-xl transition active:scale-90 ${showNotifications ? 'bg-[#D4AF37] text-[#101C2C]' : 'bg-white/5 hover:bg-white/10 text-white'}`}
            title="Recent Alerts"
          >
            <Bell className="w-4.5 h-4.5" />
            {hasUnread && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#101C2C] animate-pulse shadow-[0_0_8px_#ef4444]" />}
          </button>

          {/* Desktop/Mobile Toggle */}
          {!isMobileFrame && (
            <button
              onClick={onToggleFrame}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition hidden md:flex"
              title="Mobile Preview"
            >
              <Smartphone className="w-4.5 h-4.5" />
            </button>
          )}

          {/* Provider Dashboard */}
          {isProvider && (
            <button
              onClick={onOpenProviderDashboard}
              className="p-2.5 rounded-xl bg-[#087F5B]/20 border border-[#087F5B]/30 text-[#087F5B] hover:bg-[#087F5B]/30 transition active:scale-90 shadow-lg shadow-[#087F5B]/10"
              title="Provider Hub"
            >
              <Briefcase className="w-4.5 h-4.5" />
            </button>
          )}

          {/* Admin Tools */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="relative p-2.5 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/30 transition active:scale-90"
              title="Admin HQ"
            >
              <Shield className="w-4.5 h-4.5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#101C2C]">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Avatar / Profile */}
          <button
            onClick={() => {
              if (currentUser) {
                // If logged in, navigate to profile tab
                onOpenAuth(); // Assuming App handles this or I should add an onOpenProfile
              } else {
                onOpenAuth();
              }
            }}
            className="ml-1.5 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center hover:border-[#D4AF37] transition p-0.5 active:scale-90 shadow-xl overflow-hidden"
          >
            {currentUser ? (
              currentUser.profilePhoto ? (
                <img src={currentUser.profilePhoto} alt={currentUser.name} className="w-full h-full object-cover rounded-[9px]" />
              ) : (
                <div className="w-full h-full bg-[#087F5B] rounded-[9px] flex items-center justify-center text-white font-black text-xs uppercase italic">
                  {currentUser.name.charAt(0)}
                </div>
              )
            ) : (
              <LogIn className="w-4.5 h-4.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Notification Tray Overlay */}
      {showNotifications && (
        <NotificationTray onClose={() => setShowNotifications(false)} />
      )}
    </header>
  );
};
