import React from 'react';
import { 
  Home, 
  Search, 
  LayoutDashboard, 
  ShoppingBag, 
  Calendar, 
  Heart, 
  User, 
  Settings, 
  LogOut,
  Shield,
  Star,
  PlusCircle,
  History,
  TrendingUp,
  Users,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavTab } from './AndroidBottomNav';

interface SidebarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onLogout: () => void;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onChangeTab, 
  onLogout,
  isCollapsed = false 
}) => {
  const { currentUser, role, isAdmin } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, roles: ['customer', 'provider', 'admin'] },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['provider', 'admin'] },
    { id: 'categories', label: 'Services', icon: Search, roles: ['customer', 'provider', 'admin'] },
    { id: 'bookings', label: 'My Bookings', icon: Calendar, roles: ['customer', 'provider', 'admin'] },
    { id: 'favorites', label: 'Favorites', icon: Heart, roles: ['customer'] },
    { id: 'shops', label: 'My Shops', icon: ShoppingBag, roles: ['provider'] },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp, roles: ['provider'] },
    { id: 'profile', label: 'Profile', icon: User, roles: ['customer', 'provider', 'admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role || 'customer'));

  return (
    <div className={`h-screen bg-[#101C2C] text-white flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} border-r border-slate-800`}>
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 bg-[#087F5B] rounded-xl flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6 text-[#D4AF37]" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="font-black text-lg tracking-tighter leading-none">SERVICE</h1>
            <p className="text-[10px] font-bold text-[#D4AF37] tracking-[0.2em]">PROVIDER</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeTab(item.id as NavTab)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-[#D4AF37] text-[#101C2C] shadow-lg shadow-[#D4AF37]/20' 
                : 'hover:bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-[#101C2C]' : 'group-hover:scale-110 transition-transform'}`} />
            {!isCollapsed && <span className="font-bold text-sm">{item.label}</span>}
          </button>
        ))}

        {isAdmin && (
          <div className="pt-6 mt-6 border-t border-slate-800">
            {!isCollapsed && <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Panel</p>}
            <button
              onClick={() => onChangeTab('admin' as NavTab)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                activeTab === ('admin' as NavTab)
                  ? 'bg-red-500 text-white'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="font-bold text-sm">Admin Panel</span>}
            </button>
          </div>
        )}
      </nav>

      <div className="p-4 space-y-2">
        <button
          onClick={() => onChangeTab('profile')}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0">
            {currentUser?.profilePhoto ? (
              <img src={currentUser.profilePhoto} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="text-left overflow-hidden">
              <p className="text-sm font-bold truncate">{currentUser?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser?.email}</p>
            </div>
          )}
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-400/10 transition-colors group"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
};
