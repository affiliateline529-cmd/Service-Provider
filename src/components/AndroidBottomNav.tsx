import React from 'react';
import { Home, LayoutGrid, Layers, Heart, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 
  | 'home' | 'categories' | 'bookings' | 'favorites' | 'profile' // Customer
  | 'dashboard' | 'shops' | 'earnings'; // Provider additions

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

  const customerItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home, badge: 0 },
    { id: 'categories' as NavTab, label: 'Services', icon: Layers, badge: 0 },
    { id: 'bookings' as NavTab, label: 'Bookings', icon: History, badge: 0 },
    { id: 'favorites' as NavTab, label: 'Saved', icon: Heart, badge: favoritesCount },
    { id: 'profile' as NavTab, label: 'Profile', icon: User, badge: 0 }
  ];

  const providerItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, badge: 0 },
    { id: 'shops' as NavTab, label: 'Shops', icon: ShoppingBag, badge: 0 },
    { id: 'bookings' as NavTab, label: 'Bookings', icon: History, badge: 0 },
    { id: 'earnings' as NavTab, label: 'Earnings', icon: Wallet, badge: 0 },
    { id: 'profile' as NavTab, label: 'Profile', icon: User, badge: 0 }
  ];

  const navItems = role === 'provider' ? providerItems : customerItems;

  return (
    <nav className="sticky bottom-0 z-30 bg-white border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] px-4 py-2 safe-area-bottom">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className="flex flex-col items-center justify-center py-1 relative group focus:outline-hidden transition-all duration-300 active:scale-90"
            >
              <div
                className={`relative w-12 h-8 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                  isActive
                    ? 'bg-[#101C2C]/5 text-[#101C2C]'
                    : 'text-slate-400 hover:text-[#101C2C]/60'
                }`}
              >
                <Icon 
                  className={`w-5.5 h-5.5 transition-all duration-300 ${
                    isActive ? 'stroke-[2.5px] text-[#087F5B]' : 'stroke-2'
                  }`} 
                />
                {Boolean(item.badge > 0) && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#101C2C] text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 border-2 border-white">
                    {item.badge}
                  </span>
                )}
                
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute -bottom-1.5 w-1 h-1 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]" />
                )}
              </div>
              <span
                className={`text-[9px] mt-1.5 font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive ? 'text-[#101C2C] scale-105' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
