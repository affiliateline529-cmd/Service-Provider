import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Shield, Star, MapPin, Phone, MessageSquare, Heart,
  Sparkles, Filter, ArrowUpDown, ChevronRight, Store, Home as HomeIcon,
  PlusCircle, Download, CheckCircle2, AlertCircle, RefreshCw,
  Layers, Users, X, Clock, HelpCircle, ExternalLink, Award, ArrowRight,
  Wallet, History
} from 'lucide-react';
import { Business, CategoryItem, KarachiAreaInfo } from './types';
import { KARACHI_CATEGORIES } from './data/categories';
import { KARACHI_AREAS, KARACHI_AREA_NAMES } from './data/karachiAreas';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidBottomNav, NavTab } from './components/AndroidBottomNav';
import { BusinessCard } from './components/BusinessCard';
import { BusinessDetailsModal } from './components/BusinessDetailsModal';
import { ContactActionModal } from './components/ContactActionModal';
import { BusinessRegistrationModal } from './components/BusinessRegistrationModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AdvertisingModal } from './components/AdvertisingModal';
import { ApkGuideModal } from './components/ApkGuideModal';
import { AffiliateModal } from './components/AffiliateModal';
import { CategoryIcon } from './components/CategoryIcon';
import { BookingModal } from './components/BookingModal';
import { ProviderDashboard } from './components/ProviderDashboard';
import { SplashScreen } from './components/SplashScreen';
import ProfileScreen from './components/ProfileScreen';
import { BookingTrackerModal } from './components/BookingTrackerModal';

function MainApp() {
  const { currentUser, isFavorite, isAdmin, isProvider, role } = useAuth();

  // App Lifecycle
  const [showSplash, setShowSplash] = useState(true);
  const [isInitiallyLoaded, setIsInitiallyLoaded] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>(role === 'provider' ? 'dashboard' : 'home');
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Data States
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'shop' | 'home_based'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'reviews' | 'newest' | 'name'>('default');

  // Modals
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [contactBusiness, setContactBusiness] = useState<Business | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showApkGuide, setShowApkGuide] = useState(false);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBookingBusiness, setSelectedBookingBusiness] = useState<Business | null>(null);

  useEffect(() => {
    if (!showSplash) {
      setIsInitiallyLoaded(true);
    }
  }, [showSplash]);

  // Category search
  const [categorySearch, setCategorySearch] = useState('');

  // Handle URL deep links & affiliate tracking
  useEffect(() => {
    const checkDeepLink = () => {
      const params = new URLSearchParams(window.location.search);
      const bizId = params.get('biz') || params.get('business');
      if (bizId) {
        setSelectedBusinessId(bizId);
      }
      const refCode = params.get('ref');
      if (refCode) {
        localStorage.setItem('karachi_affiliate_ref', refCode);
      }
    };
    checkDeepLink();
    window.addEventListener('popstate', checkDeepLink);
    return () => window.removeEventListener('popstate', checkDeepLink);
  }, []);

  const handleOpenBusiness = (biz: Business | string) => {
    const id = typeof biz === 'string' ? biz : biz.id;
    setSelectedBusinessId(id);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('biz', id);
      window.history.pushState({ bizId: id }, '', url.toString());
    } catch { }
  };

  const handleCloseBusiness = () => {
    setSelectedBusinessId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('biz');
      url.searchParams.delete('business');
      window.history.pushState({}, '', url.toString());
    } catch { }
  };

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/businesses?status=approved');
      const data = await res.json();
      if (data.success && data.data) {
        setBusinesses(data.data);
      }
      const mRes = await fetch('/api/admin/metrics');
      const mData = await mRes.json();
      if (mData.success && mData.data) {
        setPendingCount(mData.data.pendingBusinesses || 0);
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSearchQuery('');
    setActiveTab('home');
  };

  const handleSelectArea = (areaName: string) => {
    setSelectedArea(areaName);
    setActiveTab('home');
  };

  const filteredCatalogue = useMemo(() => {
    let result = [...businesses];
    if (selectedCategory !== 'all') {
      result = result.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (selectedArea !== 'all') {
      result = result.filter(b => b.karachiArea.toLowerCase() === selectedArea.toLowerCase());
    }
    if (selectedType !== 'all') {
      result = result.filter(b => b.businessType === selectedType);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(b => {
        const full = [b.businessName, b.category, b.karachiArea, b.description, b.fullAddress, ...(b.servicesOffered || [])].join(' ').toLowerCase();
        return full.includes(q);
      });
    }
    return result;
  }, [businesses, selectedCategory, selectedArea, selectedType, searchQuery]);

  const favoriteBusinesses = useMemo(() => businesses.filter(b => isFavorite(b.id)), [businesses, isFavorite]);
  const featuredBusinesses = useMemo(() => businesses.filter(b => b.isFeatured || b.isSponsored || b.isPremium), [businesses]);
  const recentlyAdded = useMemo(() => [...businesses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6), [businesses]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedArea('all');
    setSelectedType('all');
    setSortBy('default');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedArea !== 'all';

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      {!currentUser && isInitiallyLoaded && (
        <AuthModal onClose={() => {}} isForced={true} />
      )}

      <div className={`min-h-screen ${isMobileFrame ? 'bg-[#101C2C] py-4 sm:py-6 flex items-center justify-center' : 'bg-slate-100'} animate-fade-in`}>
        <div
          className={`w-full bg-[#F3F4F6] flex flex-col relative transition-all duration-300 ${
            isMobileFrame
              ? 'max-w-[440px] h-[92vh] max-h-[890px] rounded-[42px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden'
              : 'max-w-6xl mx-auto min-h-screen shadow-lg'
          }`}
        >
          <AndroidHeader
            onOpenSearch={() => { setActiveTab('home'); setTimeout(() => document.getElementById('home-search-input')?.focus(), 100); }}
            onOpenAuth={() => {
              if (currentUser) {
                setActiveTab('profile');
              } else {
                setShowAuthModal(true);
              }
            }}
            onOpenAdmin={() => setShowAdminModal(true)}
            onOpenApkGuide={() => setShowApkGuide(true)}
            onOpenTracker={() => setActiveTab('bookings')}
            onOpenProviderDashboard={() => setActiveTab('dashboard')}
            isMobileFrame={isMobileFrame}
            onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
            pendingCount={pendingCount}
          />

          <main className="flex-1 overflow-y-auto">
            {/* ==================== HOME SCREEN ==================== */}
            {activeTab === 'home' && (
              <div className="space-y-8 animate-fade-in pb-24">
                <div className="relative h-[280px] overflow-hidden rounded-b-[48px] shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80" alt="Premium Services" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101C2C] via-[#101C2C]/40 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Karachi Elite Services</span>
                      </div>
                      <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter">Find Excellence <br /><span className="text-[#D4AF37]">In Karachi</span></h2>
                    </div>
                    <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                      <input id="home-search-input" type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search services or shops..." className="w-full bg-white rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#101C2C] shadow-xl outline-none focus:ring-2 focus:ring-[#D4AF37]" />
                    </div>
                  </div>
                </div>

                <div className="px-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-[#101C2C] uppercase tracking-tighter italic border-l-4 border-[#087F5B] pl-3">Popular Services</h3>
                    <button onClick={() => setActiveTab('categories')} className="text-[10px] font-bold text-[#087F5B] uppercase tracking-widest">See All</button>
                  </div>
                  <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
                    {KARACHI_CATEGORIES.slice(0, 8).map((cat, idx) => (
                      <button key={idx} onClick={() => handleSelectCategory(cat.name)} className="flex flex-col items-center space-y-2 shrink-0 group">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:border-[#D4AF37] border border-transparent transition-all"><CategoryIcon name={cat.name} className="w-6 h-6 text-[#101C2C]" /></div>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter w-14 text-center line-clamp-1">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters ? (
                  <div className="px-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-[#101C2C] uppercase tracking-tighter italic">Search Results</h3>
                      <button onClick={resetFilters} className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Clear</button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {filteredCatalogue.map(biz => (
                        <BusinessCard key={biz.id} business={biz} onSelect={b => handleOpenBusiness(b.id)} onBook={b => { setSelectedBookingBusiness(b); setShowBookingModal(true); }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="px-6"><h3 className="text-sm font-black text-[#101C2C] uppercase tracking-tighter italic border-l-4 border-[#D4AF37] pl-3">Elite Selections</h3></div>
                      <div className="flex space-x-4 px-6 overflow-x-auto no-scrollbar pb-4">
                        {featuredBusinesses.map(biz => (
                          <div key={biz.id} className="w-72 shrink-0">
                            <BusinessCard business={biz} onSelect={b => handleOpenBusiness(b.id)} onBook={b => { setSelectedBookingBusiness(b); setShowBookingModal(true); }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 space-y-4">
                      <h3 className="text-sm font-black text-[#101C2C] uppercase tracking-tighter italic border-l-4 border-[#087F5B] pl-3">Recently Verified</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {recentlyAdded.map(biz => (
                          <BusinessCard key={biz.id} business={biz} onSelect={b => handleOpenBusiness(b.id)} onBook={b => { setSelectedBookingBusiness(b); setShowBookingModal(true); }} />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ==================== DASHBOARD (PROVIDER) ==================== */}
            {activeTab === 'dashboard' && currentUser && <ProviderDashboard onClose={() => setActiveTab('home')} />}

            {/* ==================== CATEGORIES SCREEN ==================== */}
            {activeTab === 'categories' && (
              <div className="p-6 space-y-6 pb-24">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-[#101C2C] mb-4">All Services</h2>
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                    <input type="text" placeholder="Filter services..." className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl text-sm font-medium outline-none border border-transparent focus:border-[#D4AF37]" onChange={(e) => setCategorySearch(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {KARACHI_CATEGORIES.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())).map((cat, idx) => (
                    <button key={idx} onClick={() => handleSelectCategory(cat.name)} className="flex flex-col items-center space-y-3 group">
                      <div className="w-20 h-20 rounded-[2rem] bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:shadow-lg group-hover:border-[#D4AF37] transition-all duration-300"><CategoryIcon name={cat.name} className="w-8 h-8 text-[#101C2C]" /></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center px-1">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== BOOKINGS SCREEN ==================== */}
            {activeTab === 'bookings' && (
              <div className="flex flex-col h-full bg-[#F3F4F6] pb-24 overflow-y-auto">
                <div className="p-6 bg-[#101C2C] rounded-b-[3rem] shadow-xl mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">My Bookings</h2>
                  <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">Track your service requests</p>
                </div>
                <div className="px-6"><BookingTrackerModal onClose={() => setActiveTab('home')} /></div>
              </div>
            )}

            {/* ==================== FAVORITES SCREEN ==================== */}
            {activeTab === 'favorites' && (
              <div className="p-6 space-y-4 pb-24">
                <div className="flex items-center justify-between mb-2">
                  <div><h2 className="text-xl font-bold text-[#101C2C]">Saved Shops</h2><p className="text-xs text-gray-500">Your bookmarked services</p></div>
                  <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-500"><Heart className="w-5 h-5 fill-red-500" /></div>
                </div>
                {favoriteBusinesses.length === 0 ? (
                  <div className="bg-white rounded-[2.5rem] p-12 text-center border border-dashed border-gray-200"><Heart className="w-12 h-12 text-gray-100 mx-auto mb-4" /><p className="text-sm font-bold text-gray-400">No favorites yet.</p></div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {favoriteBusinesses.map(biz => (
                      <BusinessCard key={biz.id} business={biz} onSelect={b => handleOpenBusiness(b.id)} onBook={b => { setSelectedBookingBusiness(b); setShowBookingModal(true); }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ==================== PROFILE SCREEN ==================== */}
            {activeTab === 'profile' && currentUser && (
              <div className="h-full pb-24">
                <ProfileScreen user={currentUser} onUpdateUser={(u) => { window.location.reload(); }} onLogout={() => { localStorage.removeItem('karachi_service_user'); window.location.reload(); }} onNavigate={(tab) => setActiveTab(tab as any)} />
              </div>
            )}

            {/* ==================== SHOPS (PROVIDER) ==================== */}
            {activeTab === 'shops' && currentUser && (
              <div className="p-6 pb-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#101C2C]">My Shops</h2>
                  <button onClick={() => setShowRegisterModal(true)} className="bg-[#087F5B] text-white p-3 rounded-2xl"><PlusCircle className="w-6 h-6" /></button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {businesses.filter(b => b.ownerName === currentUser.name).map(biz => (
                    <BusinessCard 
                      key={biz.id} 
                      business={biz} 
                      onSelect={() => handleOpenBusiness(biz)}
                      onBook={() => {
                        setSelectedBookingBusiness(biz);
                        setShowBookingModal(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ==================== EARNINGS (PROVIDER) ==================== */}
            {activeTab === 'earnings' && currentUser && (
              <div className="flex flex-col h-full bg-[#F3F4F6] pb-24 overflow-y-auto">
                <div className="p-6 bg-[#101C2C] rounded-b-[3rem] shadow-xl mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">Earnings</h2>
                  <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">Track your weekly commission</p>
                </div>
                <div className="px-6">
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-6 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Earnings</p>
                    <p className="text-3xl font-black text-[#101C2C] my-2">PKR 14,500</p>
                    <div className="h-px bg-gray-50 my-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Due</p><p className="text-lg font-bold text-red-500">PKR 2,175</p></div>
                      <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Paid</p><p className="text-lg font-bold text-[#087F5B]">PKR 12,325</p></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          <AndroidBottomNav activeTab={activeTab} onChangeTab={setActiveTab} favoritesCount={favoriteBusinesses.length} />
          {isMobileFrame && <div className="bg-white py-1 flex items-center justify-center border-t border-slate-100"><div className="w-32 h-1 bg-slate-300 rounded-full" /></div>}
        </div>

        {/* Modals */}
        {selectedBusinessId && (
          <BusinessDetailsModal businessId={selectedBusinessId} onClose={handleCloseBusiness} onUpdateBusiness={updated => { setBusinesses(prev => prev.map(b => b.id === updated.id ? updated : b)); }} onBook={b => { setSelectedBookingBusiness(b); setShowBookingModal(true); }} />
        )}
        {showRegisterModal && <BusinessRegistrationModal onClose={() => setShowRegisterModal(false)} onRegistered={fetchBusinesses} />}
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        {showAdminModal && <AdminPanelModal onClose={() => setShowAdminModal(false)} onRefreshData={fetchBusinesses} />}
        {showAdModal && <AdvertisingModal businesses={businesses} onClose={() => setShowAdModal(false)} onSuccess={fetchBusinesses} />}
        {showApkGuide && <ApkGuideModal onClose={() => setShowApkGuide(false)} />}
        {showAffiliateModal && <AffiliateModal onClose={() => setShowAffiliateModal(false)} />}
        {showBookingModal && selectedBookingBusiness && (
          <BookingModal business={selectedBookingBusiness} onClose={() => { setShowBookingModal(false); setSelectedBookingBusiness(null); }} onSuccess={fetchBusinesses} />
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
