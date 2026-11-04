import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Package,
  Layers,
  Sparkles,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { KARACHI_AREA_NAMES } from '../data/karachiAreas';

interface DashboardHeaderProps {
  onSearch: (query: string, type: 'services' | 'products') => void;
  onLocationChange: (area: string) => void;
  selectedLocation: string;
  onToggleSidebar: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onSearch,
  onLocationChange,
  selectedLocation,
  onToggleSidebar
}) => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'services' | 'products'>('services');
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, searchType);
  };

  return (
    <header className="h-20 md:h-24 bg-[#101C2C] border-b border-white/5 sticky top-0 z-30 px-3 md:px-6 flex items-center justify-between w-full overflow-hidden">
      <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
        {/* Brand Logo Shield */}
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#f1d37a] p-[2px] shadow-lg shadow-[#D4AF37]/10 shrink-0">
          <div className="w-full h-full bg-[#101C2C] rounded-[10px] md:rounded-[14px] flex items-center justify-center">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-[#D4AF37]" strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <h1 className="text-sm md:text-xl font-black tracking-tighter uppercase italic leading-none text-white truncate">
            Service <span className="text-[#D4AF37]">Karachi</span>
          </h1>
          {/* Location Selector */}
          <button 
            onClick={() => setShowLocationMenu(!showLocationMenu)}
            className="flex items-center space-x-1 mt-0.5 md:mt-1 group whitespace-nowrap"
          >
            <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#087F5B] shrink-0" />
            <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest md:tracking-[0.2em] group-hover:text-white transition truncate max-w-[80px] md:max-w-none">
              {selectedLocation === 'all' ? 'KARACHI' : selectedLocation.toUpperCase()}
            </span>
            <ChevronDown className="w-2 md:w-2.5 h-2 md:h-2.5 text-slate-600 group-hover:text-[#D4AF37] transition shrink-0" />
          </button>

          {showLocationMenu && (
            <div className="absolute left-3 md:left-6 mt-16 md:mt-20 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 max-h-96 overflow-y-auto no-scrollbar z-50 animate-scale-in">
              <button 
                onClick={() => { onLocationChange('all'); setShowLocationMenu(false); }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                All Karachi
              </button>
              {KARACHI_AREA_NAMES.map((area) => (
                <button 
                  key={area}
                  onClick={() => { onLocationChange(area); setShowLocationMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {area}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-1.5 md:space-x-3 shrink-0">
        {/* Search Icon Button */}
        <button className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all active:scale-95">
          <Search className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Notifications */}
        <button className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center relative transition-all active:scale-95">
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          <span className="absolute top-3 md:top-3.5 right-3 md:right-3.5 w-1.5 md:w-2 h-1.5 md:h-2 bg-red-500 rounded-full border-2 border-[#101C2C]" />
        </button>

        {/* Admin/Shield Icon */}
        <button className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center transition-all active:scale-95">
          <Shield className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Profile / Avatar */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#087F5B] flex items-center justify-center text-white overflow-hidden transition-all active:scale-95 border-2 border-transparent hover:border-[#D4AF37]/50"
          >
            {currentUser?.profilePhoto ? (
              <img src={currentUser.profilePhoto} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs md:text-sm font-black italic uppercase">{currentUser?.name?.charAt(0) || 'U'}</span>
            )}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-4 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 overflow-hidden animate-scale-in">
              <div className="px-5 py-3 border-b border-slate-50">
                <p className="text-xs font-black text-[#101C2C] truncate uppercase italic">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{currentUser?.email}</p>
              </div>
              <div className="py-2">
                <button className="w-full text-left px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-3 transition-colors">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                  <span>My Profile</span>
                </button>
                <button className="w-full text-left px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-3 transition-colors">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </button>
                <div className="h-px bg-slate-50 my-1 mx-5" />
                <button className="w-full text-left px-5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center space-x-3 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
