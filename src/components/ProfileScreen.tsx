import React, { useState } from 'react';
import { 
  Settings, ChevronRight, Package, CreditCard, 
  History, Heart, Star, HelpCircle, ShieldCheck, 
  Wallet, Building2, UserCircle2, Mail, Smartphone
} from 'lucide-react';
import { User } from '../types';
import ProfileSettingsModal from './ProfileSettingsModal';

interface ProfileScreenProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onNavigate: (tab: string) => void;
}

export default function ProfileScreen({ user, onUpdateUser, onLogout, onNavigate }: ProfileScreenProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const menuItems = user.role === 'customer' ? [
    { id: 'bookings', label: 'My Bookings', icon: History, color: 'bg-blue-50 text-blue-600' },
    { id: 'favorites', label: 'Saved Shops', icon: Heart, iconColor: 'text-red-500', color: 'bg-red-50 text-red-600' },
    { id: 'reviews', label: 'My Reviews', icon: Star, color: 'bg-amber-50 text-amber-600' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, color: 'bg-gray-50 text-gray-600' },
  ] : [
    { id: 'shops', label: 'My Businesses', icon: Building2, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'earnings', label: 'Earnings & Payouts', icon: Wallet, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'packages', label: 'Subscription Plan', icon: Package, color: 'bg-[#D4AF37]/10 text-[#D4AF37]' },
    { id: 'support', label: 'Business Support', icon: HelpCircle, color: 'bg-gray-50 text-gray-600' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6]">
      {/* Profile Header Card */}
      <div className="p-6 pb-20 bg-[#101C2C] rounded-b-[3rem] shadow-xl relative">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 bg-white/10 rounded-2xl text-[#D4AF37] hover:bg-white/20 transition-all active:scale-95"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-[#D4AF37] shadow-2xl bg-white/5 flex items-center justify-center">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle2 className="w-12 h-12 text-[#D4AF37]" />
              )}
            </div>
            {user.isEmailVerified && (
              <div className="absolute -bottom-1 -right-1 bg-[#087F5B] text-white p-1 rounded-full border-2 border-[#101C2C]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white leading-tight">{user.name}</h2>
            <p className="text-[#D4AF37] font-bold text-sm mb-2">@{user.username}</p>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-[10px] font-bold uppercase tracking-wider border border-[#D4AF37]/20">
                {user.role} Account
              </span>
              <span className="px-2.5 py-1 bg-[#087F5B]/10 text-[#087F5B] rounded-lg text-[10px] font-bold uppercase tracking-wider border border-[#087F5B]/20">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Stats Section Overlay */}
        <div className="absolute left-6 right-6 -bottom-12 bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex justify-between divide-x divide-gray-50">
          <div className="flex-1 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bookings</p>
            <p className="text-lg font-black text-[#101C2C]">12</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Points</p>
            <p className="text-lg font-black text-[#087F5B]">450</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Level</p>
            <p className="text-lg font-black text-[#D4AF37]">Gold</p>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto px-6 pt-20 pb-24">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-6">
          {menuItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors ${idx !== menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${item.color}`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor || ''}`} />
                </div>
                <span className="font-bold text-[#101C2C]">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden p-6 mb-6">
          <h4 className="text-sm font-bold text-[#101C2C] mb-4">Verification Status</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Email Address</span>
              </div>
              {user.isEmailVerified ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#087F5B] uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              ) : (
                <button className="text-[10px] font-bold text-red-500 underline uppercase tracking-wider">Verify Now</button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Mobile Number</span>
              </div>
              {user.isMobileVerified ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#087F5B] uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              ) : (
                <button className="text-[10px] font-bold text-red-500 underline uppercase tracking-wider">Verify Now</button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          Version 2.4.0 (Build 529)
        </p>
      </div>

      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUpdateUser={onUpdateUser}
        onLogout={onLogout}
      />
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
