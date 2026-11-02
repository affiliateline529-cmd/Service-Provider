import React from 'react';
import { Home, LayoutGrid, Layers, Heart, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'home' | 'catalogue' | 'categories' | 'favorites' | 'account';

interface AndroidBottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  favoritesCount: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onChangeTab,
  favoritesCount
}) => {
  const { currentUser, isAdmin } = useAuth();

  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'catalogue' as NavTab, label: 'Catalogue', icon: LayoutGrid },
    { id: 'categories' as NavTab, label: 'Categories', icon: Layers },
    { id: 'favorites' as NavTab, label: 'Saved', icon: Heart, badge: favoritesCount },
    {
      id: 'account' as NavTab,
      label: isAdmin ? 'Admin' : currentUser ? 'Profile' : 'Login',
      icon: isAdmin ? ShieldCheck : User
    }
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 relative group focus:outline-hidden"
            >
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-100 text-blue-800 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'text-blue-900 font-bold' : 'text-slate-600 font-medium'
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
