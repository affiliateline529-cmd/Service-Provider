import React from 'react';
import { Home, LayoutGrid, Layers, Heart, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 
  | 'home' | 'categories' | 'bookings' | 'favorites' | 'profile' // Customer
  | 'dashboard' | 'shops' | 'earnings' // Provider additions
  | 'admin'; // Admin additions

interface AndroidBottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  favoritesCount: number;
}

import { LayoutDashboard, ShoppingBag, Wallet, History, Search } from 'lucide-react';

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onChangeTab,
  favoritesCount
}) => {
  const { currentUser, role } = useAuth();

  const navItems = [
    { id: (role === 'provider' ? 'dashboard' : 'home') as NavTab, label: 'Home', icon: Home, badge: 0 },
    { id: 'categories' as NavTab, label: 'Services', icon: Layers, badge: 0 },
    { id: 'bookings' as NavTab, label: 'Bookings', icon: History, badge: 0 },
    { id: 'favorites' as NavTab, label: 'Saved', icon: Heart, badge: favoritesCount },
    { id: 'profile' as NavTab, label: 'Profile', icon: User, badge: 0 }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] px-2 safe-area-bottom h-20 md:h-24">
      <div className="flex items-center justify-between w-full h-full max-w-7xl mx-auto">
        {navItems.map(item => {
          const isActive = activeTab === item.id || (item.id === 'dashboard' && activeTab === 'home' && role === 'provider');
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className="flex-1 flex flex-col items-center justify-center h-full relative group focus:outline-hidden transition-all duration-300 active:scale-90"
            >
              <div
                className={`relative w-12 h-10 md:w-16 md:h-12 rounded-xl md:rounded-2xl transition-all duration-500 flex items-center justify-center ${
                  isActive
                    ? 'bg-[#087F5B] text-white shadow-xl shadow-[#087F5B]/30 scale-105'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon 
                  className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-500 ${
                    isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'
                  }`} 
                />
                {Boolean(item.badge > 0) && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#101C2C] text-[8px] md:text-[9px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 border-2 border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              
              <span
                className={`text-[8px] md:text-[10px] mt-1.5 md:mt-2 font-black uppercase tracking-widest md:tracking-[0.2em] transition-all duration-500 text-center px-1 truncate w-full ${
                  isActive ? 'text-[#087F5B] opacity-100' : 'text-slate-400 opacity-80'
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 md:w-1.5 h-1 md:h-1.5 bg-[#087F5B] rounded-full shadow-[0_0_12px_#087F5B]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
