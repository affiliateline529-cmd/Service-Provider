import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Shield, Star, MapPin, Phone, MessageSquare, Heart,
  Sparkles, Filter, ArrowUpDown, ChevronRight, Store, Home as HomeIcon,
  PlusCircle, Download, CheckCircle2, AlertCircle, RefreshCw,
  Layers, Users, X, Clock, HelpCircle, ExternalLink, Award, ArrowRight,
  Wallet, History, Zap, Calendar, TrendingUp, Package
} from 'lucide-react';
import { Business, CategoryItem, KarachiAreaInfo, Product } from './types';
import { KARACHI_CATEGORIES } from './data/categories';
import { KARACHI_AREAS, KARACHI_AREA_NAMES } from './data/karachiAreas';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { DashboardHeader } from './components/DashboardHeader';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>(role === 'provider' ? 'dashboard' : 'home');

  // Data States
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [publicMetrics, setPublicMetrics] = useState<any>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'services' | 'products'>('services');
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

  const fetchPublicMetrics = async () => {
    try {
      const res = await fetch('/api/public/metrics');
      const data = await res.json();
      if (data.success) setPublicMetrics(data.data);
    } catch (err) {}
  };

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const [bRes, pRes, mRes] = await Promise.all([
        fetch('/api/businesses?status=approved').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/admin/metrics').then(r => r.json())
      ]);

      if (bRes.success) setBusinesses(bRes.data);
      if (pRes.success) setProducts(pRes.data);
      if (mRes.success) setPendingCount(mRes.data.pendingBusinesses || 0);
      
      fetchPublicMetrics();
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (!showSplash) {
      setIsInitiallyLoaded(true);
    }
  }, [showSplash]);

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSearchQuery('');
    setSearchType('services');
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
    if (searchType === 'services' && searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(b => {
        const full = [b.businessName, b.category, b.karachiArea, b.description, b.fullAddress, ...(b.servicesOffered || [])].join(' ').toLowerCase();
        return full.includes(q);
      });
    }
    return result;
  }, [businesses, selectedCategory, selectedArea, selectedType, searchQuery, searchType]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchType === 'products' && searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, searchQuery, searchType]);

  const favoriteBusinesses = useMemo(() => businesses.filter(b => isFavorite(b.id)), [businesses, isFavorite]);
  const featuredBusinesses = useMemo(() => businesses.filter(b => b.isFeatured || b.isSponsored || b.isPremium), [businesses]);
  const recentlyAdded = useMemo(() => [...businesses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6), [businesses]);

  const resetFilters = () => {
    setSearchQuery('');
    setSearchType('services');
    setSelectedCategory('all');
    setSelectedArea('all');
    setSelectedType('all');
    setSortBy('default');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedArea !== 'all';

  const handleLogout = () => {
    localStorage.removeItem('karachi_service_user');
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      {!currentUser && isInitiallyLoaded && (
        <AuthModal onClose={() => {}} isForced={true} />
      )}



      {/* Sidebar for desktop */}
      <div className="hidden lg:block shrink-0">
        <Sidebar 
          activeTab={activeTab} 
          onChangeTab={setActiveTab} 
          onLogout={handleLogout}
          isCollapsed={sidebarCollapsed}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader 
          onSearch={(q, t) => { setSearchQuery(q); setSearchType(t); setActiveTab('home'); }}
          onLocationChange={handleSelectArea}
          selectedLocation={selectedArea}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 w-full overflow-y-auto no-scrollbar bg-slate-50/50 p-4 lg:p-8 pb-32 lg:pb-8">
          <div className="w-full flex-grow">
            {/* ==================== HOME SCREEN ==================== */}
            {activeTab === 'home' && (
              <div className="space-y-12 animate-fade-in pb-12">
                {/* Hero Banner - Redesigned to match screenshot */}
                <div className="relative h-[450px] lg:h-[550px] -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 overflow-hidden bg-[#101C2C]">
                  <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=80" alt="Premium Services" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#101C2C]/50 via-transparent to-[#101C2C]" />
                  
                  <div className="absolute inset-0 p-8 lg:p-20 flex flex-col justify-center items-center text-center space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-[#D4AF37]">
                        <Sparkles className="w-5 h-5 fill-current" />
                        <span className="text-xs lg:text-sm font-black uppercase tracking-[0.4em]">Karachi Elite Services</span>
                      </div>
                      <h2 className="text-5xl lg:text-8xl font-black text-white leading-tight uppercase tracking-tighter">
                        Find Excellence <br />
                        <span className="text-[#D4AF37]">In Karachi</span>
                      </h2>
                    </div>

                    {/* Integrated Search Bar (Matches Screenshot) */}
                    <div className="w-full relative group">
                      <div className="absolute inset-y-0 left-8 flex items-center">
                        <Search className="w-6 h-6 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Electrician"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-20 lg:h-24 bg-white rounded-[2rem] lg:rounded-[3rem] pl-20 pr-8 text-lg lg:text-xl font-bold text-[#101C2C] shadow-2xl outline-none focus:ring-4 focus:ring-[#D4AF37]/20 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Curvature at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-[#F3F4F6] rounded-t-[5rem]" />
                </div>

                {/* Popular Services Section Header (Matches Screenshot) */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-1.5 h-10 bg-[#087F5B] rounded-full" />
                    <h3 className="text-2xl font-black text-[#101C2C] uppercase tracking-tighter italic">Popular Services</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('categories')}
                    className="text-[10px] font-black text-[#087F5B] uppercase tracking-[0.3em] hover:opacity-70 transition"
                  >
                    See All
                  </button>
                </div>

                {/* Dashboard Stats (Quick Access) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                  {[
                    { label: 'Total Services', value: publicMetrics?.totalServices || '40+', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Verified Shops', value: publicMetrics?.totalBusinesses || businesses.length, icon: Shield, color: 'text-[#087F5B]', bg: 'bg-emerald-50' },
                    { label: 'Total Products', value: publicMetrics?.totalProducts || '0', icon: Package, color: 'text-[#D4AF37]', bg: 'bg-amber-50' },
                    { label: 'Total Bookings', value: publicMetrics?.totalBookings || '0', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center space-x-4 transition-all hover:shadow-xl hover:-translate-y-1">
                      <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black text-[#101C2C]">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Service Categories Grid */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-[#101C2C] uppercase tracking-tighter italic border-l-8 border-[#087F5B] pl-4">Elite Categories</h3>
                      <p className="text-sm text-slate-500 font-medium ml-4 mt-1">Discover world-class services at your doorstep</p>
                    </div>
                    <button onClick={() => setActiveTab('categories')} className="flex items-center space-x-2 text-[10px] font-black text-[#087F5B] uppercase tracking-[0.2em] bg-emerald-50 px-6 py-3 rounded-full hover:bg-emerald-100 transition-colors">
                      <span>View All Categories</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {KARACHI_CATEGORIES.slice(0, 8).map((cat, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleSelectCategory(cat.name)} 
                        className="flex flex-col items-center p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 group hover:border-[#D4AF37] hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all duration-300"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-[#101C2C] transition-colors duration-300">
                          <CategoryIcon name={cat.iconName || cat.name} className="w-8 h-8 text-[#101C2C] group-hover:text-[#D4AF37] transition-colors" />
                        </div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter text-center line-clamp-2 leading-tight group-hover:text-[#101C2C]">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-[#101C2C] uppercase tracking-tighter italic">
                        {searchType === 'services' ? 'Service Providers' : 'Product Catalogue'} Results
                      </h3>
                      <button onClick={resetFilters} className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] px-6 py-3 bg-red-50 rounded-full hover:bg-red-100 transition-colors">Clear Filters</button>
                    </div>
                    
                    {searchType === 'services' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCatalogue.map(biz => (
                          <BusinessCard key={biz.id} business={biz} onSelect={b => handleOpenBusiness(b.id)} onBook={b => { setSelectedBookingBusiness(b); setShowBookingModal(true); }} />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                          <div key={product.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="h-48 relative overflow-hidden bg-slate-100">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-100">
                                <p className="text-[10px] font-black text-[#101C2C] uppercase tracking-widest">PKR {product.price.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="p-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] font-black text-[#087F5B] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">{product.category}</span>
                              </div>
                              <h5 className="text-lg font-black text-[#101C2C] uppercase tracking-tight italic line-clamp-1">{product.name}</h5>
                              <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{product.description}</p>
                              <button 
                                onClick={() => handleOpenBusiness(product.businessId)}
                                className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-black text-[9px] uppercase tracking-[0.2em] hover:bg-[#101C2C] hover:text-white transition-all"
                              >
                                View Shop Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(searchType === 'services' ? filteredCatalogue : filteredProducts).length === 0 && (
                      <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-200">
                        <Search className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <p className="text-xl font-black text-slate-400 uppercase tracking-widest">No matching {searchType} found</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      <div className="px-2">
                        <h3 className="text-2xl font-black text-[#101C2C] uppercase tracking-tighter italic border-l-8 border-[#D4AF37] pl-4">Elite Selections</h3>
                        <p className="text-sm text-slate-500 font-medium ml-4 mt-1">Our hand-picked top rated providers</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredBusinesses.map(biz => (
                          <BusinessCard key={biz.id} business={biz} onSelect={b => handleOpenBusiness(b.id)} onBook={b => { setSelectedBookingBusiness(b); setShowBookingModal(true); }} />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="px-2">
                        <h3 className="text-2xl font-black text-[#101C2C] uppercase tracking-tighter italic border-l-8 border-[#087F5B] pl-4">Recently Verified</h3>
                        <p className="text-sm text-slate-500 font-medium ml-4 mt-1">Newly joined professionals in your area</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div className="space-y-8 animate-fade-in pb-12">
                <div className="bg-[#101C2C] p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                  <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Service Directory</h2>
                    <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.3em]">Explore all specialized solutions</p>
                    
                    <div className="mt-8 relative">
                      <Search className="w-6 h-6 text-slate-400 absolute left-5 top-5" />
                      <input 
                        type="text" 
                        placeholder="What service are you looking for?" 
                        className="w-full pl-14 pr-6 py-5 bg-white/10 border border-white/10 rounded-[2rem] text-white font-medium outline-none focus:bg-white/20 focus:border-[#D4AF37] transition-all"
                        onChange={(e) => setCategorySearch(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {KARACHI_CATEGORIES.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())).map((cat, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleSelectCategory(cat.name)} 
                      className="flex flex-col items-center p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 group hover:border-[#D4AF37] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                    >
                      <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-[#101C2C] transition-all duration-300">
                        <CategoryIcon name={cat.iconName || cat.name} className="w-10 h-10 text-[#101C2C] group-hover:text-[#D4AF37] transition-colors" />
                      </div>
                      <span className="text-xs font-black text-slate-600 uppercase tracking-wider text-center px-1 leading-tight group-hover:text-[#101C2C]">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== BOOKINGS SCREEN ==================== */}
            {activeTab === 'bookings' && (
              <div className="w-full animate-fade-in pb-12">
                <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
                  <div className="p-10 bg-[#101C2C]">
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">My Bookings</h2>
                    <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.3em]">Track your service journey</p>
                  </div>
                  <div className="p-8">
                    <BookingTrackerModal onClose={() => setActiveTab('home')} />
                  </div>
                </div>
              </div>
            )}

            {/* ==================== FAVORITES SCREEN ==================== */}
            {activeTab === 'favorites' && (
              <div className="space-y-8 animate-fade-in pb-12">
                <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <div>
                    <h2 className="text-3xl font-black text-[#101C2C] uppercase tracking-tighter italic">Saved Professionals</h2>
                    <p className="text-slate-500 font-medium">Your curated list of trusted service providers</p>
                  </div>
                  <div className="w-16 h-16 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 shadow-inner">
                    <Heart className="w-8 h-8 fill-red-500" />
                  </div>
                </div>
                
                {favoriteBusinesses.length === 0 ? (
                  <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-200">
                    <Heart className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                    <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Your favorites list is empty</p>
                    <button onClick={() => setActiveTab('home')} className="mt-8 px-10 py-4 bg-[#101C2C] text-white rounded-full font-black uppercase tracking-widest hover:bg-[#101C2C]/90 transition-all shadow-xl">Explore Professionals</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {favoriteBusinesses.map(biz => (
                      <BusinessCard key={biz.id} business={biz} onSelect={b => handleOpenBusiness(b.id)} onBook={b => { setSelectedBookingBusiness(b); setShowBookingModal(true); }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ==================== PROFILE SCREEN ==================== */}
            {activeTab === 'profile' && currentUser && (
              <div className="w-full animate-fade-in pb-12">
                <ProfileScreen 
                  user={currentUser} 
                  onUpdateUser={(u) => { window.location.reload(); }} 
                  onLogout={handleLogout} 
                  onNavigate={(tab) => setActiveTab(tab as any)} 
                />
              </div>
            )}

            {/* ==================== SHOPS (PROVIDER) ==================== */}
            {activeTab === 'shops' && currentUser && (
              <div className="space-y-8 animate-fade-in pb-12">
                <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <div>
                    <h2 className="text-3xl font-black text-[#101C2C] uppercase tracking-tighter italic">My Business Units</h2>
                    <p className="text-slate-500 font-medium">Manage your registered shops and service centers</p>
                  </div>
                  <button onClick={() => setShowRegisterModal(true)} className="bg-[#087F5B] text-white px-8 py-4 rounded-full flex items-center space-x-3 hover:bg-[#087F5B]/90 transition-all shadow-xl shadow-emerald-500/20">
                    <PlusCircle className="w-6 h-6" />
                    <span className="font-black uppercase tracking-widest text-xs">Add New Shop</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div className="w-full animate-fade-in pb-12">
                <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
                  <div className="p-10 bg-[#101C2C]">
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Financial Overview</h2>
                    <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.3em]">Track your weekly commission & revenue</p>
                  </div>
                  <div className="p-12 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-slate-50 p-8 rounded-[2.5rem] text-center border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Total Revenue</p>
                        <p className="text-4xl font-black text-[#101C2C]">PKR 14,500</p>
                      </div>
                      <div className="bg-red-50 p-8 rounded-[2.5rem] text-center border border-red-100/50">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] mb-3">Commission Due</p>
                        <p className="text-4xl font-black text-red-500">PKR 2,175</p>
                      </div>
                      <div className="bg-emerald-50 p-8 rounded-[2.5rem] text-center border border-emerald-100/50">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-3">Net Earnings</p>
                        <p className="text-4xl font-black text-[#087F5B]">PKR 12,325</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-lg font-black text-[#101C2C] uppercase tracking-tighter">Weekly Payout Status</h4>
                        <div className="px-4 py-2 bg-emerald-50 text-[#087F5B] rounded-full text-[10px] font-black uppercase tracking-widest">Active Week</div>
                      </div>
                      <div className="space-y-6">
                        {[
                          { date: 'Oct 28 - Nov 03', amount: 'PKR 4,200', status: 'Paid', color: 'emerald' },
                          { date: 'Oct 21 - Oct 27', amount: 'PKR 3,850', status: 'Paid', color: 'emerald' },
                          { date: 'Oct 14 - Oct 20', amount: 'PKR 5,100', status: 'Paid', color: 'emerald' },
                          { date: 'Oct 07 - Oct 13', amount: 'PKR 1,350', status: 'Pending', color: 'amber' },
                        ].map((row, i) => (
                          <div key={i} className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center"><Calendar className="w-5 h-5 text-slate-400" /></div>
                              <span className="font-bold text-slate-600">{row.date}</span>
                            </div>
                            <div className="flex items-center space-x-8">
                              <span className="font-black text-[#101C2C]">{row.amount}</span>
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {row.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
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

      {/* Global Bottom Navigation - Only visible on mobile/tablet */}
      <div className="lg:hidden">
        <AndroidBottomNav activeTab={activeTab} onChangeTab={setActiveTab} favoritesCount={favoriteBusinesses.length} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
