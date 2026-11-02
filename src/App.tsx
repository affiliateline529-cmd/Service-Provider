import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Shield, Star, MapPin, Phone, MessageSquare, Heart,
  Sparkles, Filter, ArrowUpDown, ChevronRight, Store, Home as HomeIcon,
  PlusCircle, Download, CheckCircle2, AlertCircle, RefreshCw,
  Layers, Users, X, Clock, HelpCircle, ExternalLink, Award
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

function MainApp() {
  const { currentUser, isFavorite, isAdmin, isProvider } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Data States
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  // Filters State for Catalogue
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

  // Category search in categories tab
  const [categorySearch, setCategorySearch] = useState('');

  // Handle URL deep links (?biz=... or ?business=...) & affiliate tracking (?ref=...)
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
    } catch {
      // Fallback
    }
  };

  const handleCloseBusiness = () => {
    setSelectedBusinessId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('biz');
      url.searchParams.delete('business');
      window.history.pushState({}, '', url.toString());
    } catch {
      // Fallback
    }
  };

  // Fetch businesses from backend API
  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/businesses?status=approved');
      const data = await res.json();
      if (data.success && data.data) {
        setBusinesses(data.data);
      }

      // Also check pending count for admin badge
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

  // Quick search suggestion handler
  const handleApplySearch = (query: string, category?: string, area?: string) => {
    setSearchQuery(query);
    if (category) setSelectedCategory(category);
    if (area) setSelectedArea(area);
    setActiveTab('catalogue');
  };

  // Switch category and jump to catalogue
  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSearchQuery('');
    setActiveTab('catalogue');
  };

  // Switch area and jump to catalogue
  const handleSelectArea = (areaName: string) => {
    setSelectedArea(areaName);
    setActiveTab('catalogue');
  };

  // Filtered businesses for catalogue
  const filteredCatalogue = useMemo(() => {
    let result = [...businesses];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Area filter
    if (selectedArea !== 'all') {
      result = result.filter(b => b.karachiArea.toLowerCase() === selectedArea.toLowerCase());
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter(b => b.businessType === selectedType);
    }

    // Search query with multi-token parsing (e.g. "Electrician in Gulshan-e-Iqbal")
    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      const tokens = q
        .replace(/\bin\b/g, ' ')
        .replace(/\bat\b/g, ' ')
        .replace(/\bnear\b/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 1);

      result = result.filter(b => {
        const full = [
          b.businessName,
          b.category,
          b.karachiArea,
          b.description,
          b.fullAddress,
          ...(b.servicesOffered || [])
        ].join(' ').toLowerCase();

        if (full.includes(q)) return true;
        return tokens.every(tok => full.includes(tok));
      });
    }

    // Sorting
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else if (sortBy === 'reviews') {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.businessName.localeCompare(b.businessName));
    } else {
      // Default: Sponsored & Premium first, then rating
      result.sort((a, b) => {
        const aScore = (a.isPremium ? 3 : 0) + (a.isSponsored ? 2 : 0) + (a.isFeatured ? 1 : 0);
        const bScore = (b.isPremium ? 3 : 0) + (b.isSponsored ? 2 : 0) + (b.isFeatured ? 1 : 0);
        if (bScore !== aScore) return bScore - aScore;
        return b.rating - a.rating;
      });
    }

    return result;
  }, [businesses, selectedCategory, selectedArea, selectedType, searchQuery, sortBy]);

  // Saved / Favorite businesses
  const favoriteBusinesses = useMemo(() => {
    return businesses.filter(b => isFavorite(b.id));
  }, [businesses, isFavorite]);

  // Featured & Sponsored businesses for home carousel
  const featuredBusinesses = useMemo(() => {
    return businesses.filter(b => b.isFeatured || b.isSponsored || b.isPremium);
  }, [businesses]);

  // Top rated providers
  const topRatedProviders = useMemo(() => {
    return [...businesses].sort((a, b) => b.rating - a.rating).slice(0, 6);
  }, [businesses]);

  // Popular shops
  const popularShops = useMemo(() => {
    return businesses.filter(b => b.businessType === 'shop').slice(0, 6);
  }, [businesses]);

  // Recently added
  const recentlyAdded = useMemo(() => {
    return [...businesses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
  }, [businesses]);

  // Clear filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedArea('all');
    setSelectedType('all');
    setSortBy('default');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedArea !== 'all' || selectedType !== 'all' || sortBy !== 'default';

  return (
    <div className={`min-h-screen ${isMobileFrame ? 'bg-slate-900 py-4 sm:py-6 flex items-center justify-center' : 'bg-slate-100'}`}>
      {/* Container - Mobile frame simulation or Full Screen */}
      <div
        className={`w-full bg-slate-50 flex flex-col relative transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[440px] h-[92vh] max-h-[890px] rounded-[42px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden'
            : 'max-w-6xl mx-auto min-h-screen shadow-lg'
        }`}
      >
        {/* Android Punch Hole Camera (In mobile frame) */}
        {isMobileFrame && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 w-4 h-4 bg-black rounded-full border border-slate-700/60 pointer-events-none" />
        )}

        {/* Top Header */}
        <AndroidHeader
          onOpenSearch={() => {
            setActiveTab('catalogue');
            const searchInput = document.getElementById('catalogue-search-input');
            if (searchInput) searchInput.focus();
          }}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenAdmin={() => setShowAdminModal(true)}
          onOpenApkGuide={() => setShowApkGuide(true)}
          isMobileFrame={isMobileFrame}
          onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
          pendingCount={pendingCount}
        />

        {/* Scrollable Main Views Area */}
        <main className="flex-1 overflow-y-auto pb-6">
          {/* ==================== 1. HOME SCREEN ==================== */}
          {activeTab === 'home' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Hero Search Section */}
              <div className="bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white px-4 pt-4 pb-6 rounded-b-3xl shadow-sm space-y-3.5">
                <div>
                  <span className="text-[11px] font-semibold tracking-wider text-emerald-300 uppercase flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Karachi, Pakistan Catalogue</span>
                  </span>
                  <h2 className="text-xl font-extrabold tracking-tight mt-0.5">
                    Find Trusted Services & Shops
                  </h2>
                  <p className="text-xs text-blue-200">
                    Electricians, AC Technicians, Plumbers, Mechanics & 35+ services across Karachi
                  </p>
                </div>

                {/* Search Bar Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') setActiveTab('catalogue');
                    }}
                    placeholder="Try 'Electrician in Gulshan' or 'AC Repair DHA'..."
                    className="w-full text-xs pl-10 pr-24 py-3 rounded-2xl bg-white text-slate-800 shadow-md placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    onClick={() => setActiveTab('catalogue')}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1"
                  >
                    <span>Search</span>
                  </button>
                </div>

                {/* Popular Quick Searches */}
                <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px] pt-1 pb-0.5 no-scrollbar">
                  <span className="text-blue-300 font-semibold shrink-0">Popular:</span>
                  {[
                    { label: '⚡ Electrician Gulshan', q: 'Electrician', a: 'Gulshan-e-Iqbal' },
                    { label: '❄️ AC Repair F.B Area', q: 'AC Repair', a: 'Federal B Area' },
                    { label: '📱 Saddar Mobile', q: 'Mobile', a: 'Saddar' },
                    { label: '🔧 Plumber Nazimabad', q: 'Plumber', a: 'North Nazimabad' },
                    { label: '🚗 Car Mechanic DHA', q: 'Mechanic', a: 'DHA (Defence)' }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplySearch(chip.q, undefined, chip.a)}
                      className="shrink-0 bg-white/10 hover:bg-white/20 border border-white/15 text-white px-2.5 py-1 rounded-full transition"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Call-to-Action Dual Cards (Register Business & Login) */}
              <div className="px-4 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-left shadow-sm hover:shadow-md transition group active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-2">
                    <Store className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs font-extrabold leading-tight">Register Your Business</div>
                  <div className="text-[10px] text-emerald-100 mt-0.5">Free Karachi Shop Listing</div>
                </button>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left shadow-2xs hover:shadow-md transition group active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
                    <Users className="w-4 h-4 text-blue-700" />
                  </div>
                  <div className="text-xs font-extrabold text-slate-800 leading-tight">
                    {currentUser ? `Hi, ${currentUser.name.split(' ')[0]}` : 'Customer Login'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Rate & Save Providers</div>
                </button>
              </div>

              {/* Popular Services Grid (Major Categories) */}
              <div className="px-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Popular Services in Karachi
                  </h3>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-0.5"
                  >
                    <span>View All (37)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {KARACHI_CATEGORIES.filter(c => c.popular).slice(0, 8).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.name)}
                      className="bg-white p-2.5 rounded-2xl border border-slate-200/80 hover:border-blue-300 shadow-2xs hover:shadow-xs flex flex-col items-center text-center transition group active:scale-95"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white flex items-center justify-center transition mb-1.5">
                        <CategoryIcon name={cat.iconName} className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-tight group-hover:text-blue-700">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sponsored / Featured Karachi Listings Carousel */}
              {featuredBusinesses.length > 0 && (
                <div className="space-y-2.5">
                  <div className="px-4 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                        Promoted in Karachi
                      </h3>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded-md">
                        Sponsored
                      </span>
                    </div>

                    <button
                      onClick={() => setShowAdModal(true)}
                      className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 hover:bg-amber-100 transition"
                    >
                      Promote Your Shop
                    </button>
                  </div>

                  {/* Horizontal Scroll Deck */}
                  <div className="flex space-x-3.5 px-4 overflow-x-auto pb-2 no-scrollbar">
                    {featuredBusinesses.map(biz => (
                      <div key={biz.id} className="w-72 shrink-0">
                        <BusinessCard
                          business={biz}
                          onSelect={b => handleOpenBusiness(b.id)}
                          onContact={b => setContactBusiness(b)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Karachi Areas Quick Filter Explorer */}
              <div className="px-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Browse by Karachi Neighborhoods
                  </h3>
                  <span className="text-[11px] text-slate-400">Strictly Karachi, PK</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {KARACHI_AREAS.filter(a => a.popular).slice(0, 10).map(area => (
                    <button
                      key={area.name}
                      onClick={() => handleSelectArea(area.name)}
                      className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-xl font-medium transition flex items-center space-x-1 active:scale-95"
                    >
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{area.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setActiveTab('catalogue')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl font-medium transition"
                  >
                    + More Areas
                  </button>
                </div>
              </div>

              {/* Top-Rated Service Providers */}
              <div className="px-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Top-Rated Service Providers
                    </h3>
                    <p className="text-[11px] text-slate-500">Highest rated verified technicians</p>
                  </div>
                  <button
                    onClick={() => {
                      setSortBy('rating');
                      setActiveTab('catalogue');
                    }}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-0.5"
                  >
                    <span>See All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {topRatedProviders.slice(0, 4).map(biz => (
                    <BusinessCard
                      key={biz.id}
                      business={biz}
                      onSelect={b => handleOpenBusiness(b.id)}
                      onContact={b => setContactBusiness(b)}
                    />
                  ))}
                </div>
              </div>

              {/* Popular Shops in Karachi */}
              <div className="px-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Popular Physical Shops in Karachi
                    </h3>
                    <p className="text-[11px] text-slate-500">Retail storefronts, markets & marts</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedType('shop');
                      setActiveTab('catalogue');
                    }}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-0.5"
                  >
                    <span>See All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {popularShops.slice(0, 4).map(biz => (
                    <BusinessCard
                      key={biz.id}
                      business={biz}
                      onSelect={b => handleOpenBusiness(b.id)}
                      onContact={b => setContactBusiness(b)}
                    />
                  ))}
                </div>
              </div>

              {/* Recently Added Karachi Businesses */}
              <div className="px-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Recently Added Businesses
                    </h3>
                    <p className="text-[11px] text-slate-500">Freshly verified listings</p>
                  </div>
                  <button
                    onClick={() => {
                      setSortBy('newest');
                      setActiveTab('catalogue');
                    }}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-0.5"
                  >
                    <span>See All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {recentlyAdded.slice(0, 4).map(biz => (
                    <BusinessCard
                      key={biz.id}
                      business={biz}
                      onSelect={b => handleOpenBusiness(b.id)}
                      onContact={b => setContactBusiness(b)}
                    />
                  ))}
                </div>
              </div>

              {/* Karachi Affiliate & Earning Program Banner (Command Feature) */}
              <div className="px-4 pt-1">
                <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] bg-white text-amber-900 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Karachi Partner Network
                        </span>
                        <span className="text-[10px] text-amber-100 font-bold">Earn Cash Weekly</span>
                      </div>
                      <h4 className="text-base font-extrabold text-white leading-tight">
                        Earn PKR 500 – PKR 2,500 per Shop Referral
                      </h4>
                      <p className="text-xs text-amber-100 max-w-sm leading-relaxed">
                        Refer Karachi shopkeepers, electricians, salons, or mechanics to register on our catalogue. Withdraw your earnings directly via JazzCash or Easypaisa!
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => setShowAffiliateModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-white text-amber-900 hover:bg-amber-50 font-extrabold text-xs shadow-xs transition active:scale-95 flex items-center space-x-1.5"
                      >
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>Open Affiliate Portal</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Promotional Footer / Banner */}
              <div className="px-4 pt-2">
                <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white rounded-3xl p-5 text-center space-y-3 shadow-md">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold">Do You Own a Shop or Service in Karachi?</h4>
                    <p className="text-xs text-slate-300 max-w-xs mx-auto mt-1">
                      Register your physical shop or home-based service today. Zero commission fees.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition"
                  >
                    Register Your Business Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. CATALOGUE SCREEN ==================== */}
          {activeTab === 'catalogue' && (
            <div className="p-4 space-y-4 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Karachi Business Catalogue
                  </h2>
                  <p className="text-xs text-slate-500">
                    Browse all verified shops and service providers
                  </p>
                </div>

                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>

              {/* Search Bar Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="catalogue-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by business name, service, area, or category..."
                  className="w-full text-xs pl-10 pr-10 py-3 rounded-2xl border border-slate-200 bg-white shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filters Bar: Category, Karachi Area, Sort By, Business Type */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories (37)</option>
                    {KARACHI_CATEGORIES.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Karachi Area Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
                    Karachi Area
                  </label>
                  <select
                    value={selectedArea}
                    onChange={e => setSelectedArea(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Karachi Areas</option>
                    {KARACHI_AREAS.map(a => (
                      <option key={a.name} value={a.name}>
                        {a.name} ({a.district})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
                    Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={e => setSelectedType(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="shop">Physical Shop</option>
                    <option value="home_based">Home-Based Provider</option>
                  </select>
                </div>

                {/* Sorting */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="default">Featured & Highest</option>
                    <option value="rating">Highest Star Rating</option>
                    <option value="reviews">Most Reviewed</option>
                    <option value="newest">Recently Added</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Pills & Reset */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 font-semibold">Active:</span>
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                      <span>{selectedCategory}</span>
                      <button onClick={() => setSelectedCategory('all')}>×</button>
                    </span>
                  )}
                  {selectedArea !== 'all' && (
                    <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                      <span>{selectedArea}</span>
                      <button onClick={() => setSelectedArea('all')}>×</button>
                    </span>
                  )}
                  {selectedType !== 'all' && (
                    <span className="inline-flex items-center space-x-1 bg-purple-100 text-purple-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                      <span>{selectedType === 'shop' ? 'Shops' : 'Home-based'}</span>
                      <button onClick={() => setSelectedType('all')}>×</button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center space-x-1 bg-slate-200 text-slate-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                      <span>"{searchQuery}"</span>
                      <button onClick={() => setSearchQuery('')}>×</button>
                    </span>
                  )}
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-red-600 hover:underline font-bold ml-1"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Results Count Banner */}
              <div className="text-xs font-bold text-slate-600 pt-1">
                Showing {filteredCatalogue.length} verified listings in Karachi
              </div>

              {/* Cards Grid */}
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500">Loading Karachi catalogue...</p>
                </div>
              ) : filteredCatalogue.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-300 space-y-3">
                  <Store className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800">
                    No Matching Listings in Karachi Found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    We couldn't find any business matching your search filters in {selectedArea !== 'all' ? selectedArea : 'Karachi'}. Try broadening your search or clear some filters.
                  </p>
                  <div className="pt-2 flex items-center justify-center space-x-2">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition"
                    >
                      Register This Business
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredCatalogue.map(biz => (
                    <BusinessCard
                      key={biz.id}
                      business={biz}
                      onSelect={b => handleOpenBusiness(b.id)}
                      onContact={b => setContactBusiness(b)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== 3. CATEGORIES SCREEN ==================== */}
          {activeTab === 'categories' && (
            <div className="p-4 space-y-4 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Service & Shop Categories (37)
                </h2>
                <p className="text-xs text-slate-500">
                  Tap any category to explore providers registered in Karachi
                </p>
              </div>

              {/* Category Search Filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={e => setCategorySearch(e.target.value)}
                  placeholder="Filter categories (e.g. Electrician, Salon, Mechanic)..."
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {KARACHI_CATEGORIES.filter(c =>
                  c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                  c.description.toLowerCase().includes(categorySearch.toLowerCase())
                ).map(cat => {
                  const count = businesses.filter(b => b.category.toLowerCase() === cat.name.toLowerCase()).length;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.name)}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-xs transition cursor-pointer flex items-center justify-between group active:scale-[0.98]"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white flex items-center justify-center transition">
                          <CategoryIcon name={cat.iconName} className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">
                            {cat.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {cat.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== 4. FAVORITES SCREEN ==================== */}
          {activeTab === 'favorites' && (
            <div className="p-4 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Saved Favorite Businesses
                  </h2>
                  <p className="text-xs text-slate-500">
                    Your bookmarked Karachi service providers and shops
                  </p>
                </div>
                <span className="text-xs bg-rose-50 text-rose-700 font-bold px-2.5 py-1 rounded-full border border-rose-200">
                  {favoriteBusinesses.length} Saved
                </span>
              </div>

              {favoriteBusinesses.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-300 space-y-3">
                  <div className="w-12 h-12 bg-rose-50 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No Favorites Saved Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    While browsing the Karachi catalogue, tap the heart icon on any business card to bookmark them for fast contact later!
                  </p>
                  <button
                    onClick={() => setActiveTab('catalogue')}
                    className="px-5 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition"
                  >
                    Browse Catalogue
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favoriteBusinesses.map(biz => (
                    <BusinessCard
                      key={biz.id}
                      business={biz}
                      onSelect={b => handleOpenBusiness(b.id)}
                      onContact={b => setContactBusiness(b)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== 5. ACCOUNT / BUSINESS PORTAL SCREEN ==================== */}
          {activeTab === 'account' && (
            <div className="p-4 space-y-5 animate-in fade-in duration-200">
              {currentUser ? (
                <div className="space-y-4">
                  {/* User Profile Card */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-emerald-600 text-white text-xl font-bold flex items-center justify-center uppercase shadow-sm">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-slate-900 leading-tight">
                            {currentUser.name}
                          </h3>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                            {currentUser.role.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{currentUser.email}</p>
                        <p className="text-xs text-slate-500">{currentUser.mobile}</p>
                      </div>
                    </div>
                  </div>

                  {/* Business Provider Portal Actions */}
                  {currentUser.role === 'provider' && (
                    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl p-5 border border-emerald-200 space-y-3">
                      <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                        <Store className="w-4 h-4" />
                        <span>Business Owner Tools (Karachi)</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Manage your listing, request promotional badges (Featured/Sponsored), and view incoming customer inquiries.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setShowAdModal(true)}
                          className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition"
                        >
                          Promote Listing
                        </button>
                        <button
                          onClick={() => setShowRegisterModal(true)}
                          className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-50 transition"
                        >
                          Add Another Shop
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Admin Shortcut */}
                  {isAdmin && (
                    <div className="bg-amber-50 rounded-3xl p-5 border border-amber-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                          <Shield className="w-4 h-4 text-amber-700" />
                          <span>Karachi Administrator Controls</span>
                        </div>
                        {pendingCount > 0 && (
                          <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                            {pendingCount} Pending Approvals
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Approve new businesses, moderate customer reviews, manage advertisement payments, and maintain data.
                      </p>
                      <button
                        onClick={() => setShowAdminModal(true)}
                        className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        Open Full Admin Control Center
                      </button>
                    </div>
                  )}

                  {/* Quick Action List */}
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <Store className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-slate-800">Register a New Business or Shop</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setShowAdModal(true)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span className="font-semibold text-slate-800">Advertise & Get Featured in Karachi</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setShowAffiliateModal(true)}
                      className="w-full p-4 flex items-center justify-between hover:bg-amber-50/50 transition text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <Award className="w-4 h-4 text-amber-600" />
                        <div>
                          <span className="font-semibold text-slate-800 block">Affiliate & Referral Program</span>
                          <span className="text-[10px] text-emerald-700 font-bold">Earn PKR 500 – 2,500 / Shop</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          PKR 2,500 Avail.
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </button>

                    <button
                      onClick={() => setShowApkGuide(true)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <Download className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-slate-800">Install App on Android (APK Guide)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  {/* Demo Logins Switcher Box */}
                  <div className="bg-slate-100 rounded-3xl p-4 border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-600 mb-2">Switch Test Account:</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => useAuth().switchDemoUser('customer')}
                        className="py-2 px-1 rounded-xl bg-white border border-slate-200 text-center hover:bg-slate-50 transition"
                      >
                        <div className="text-[11px] font-bold text-slate-800">Customer</div>
                        <div className="text-[9px] text-slate-500 truncate">Shehbaz</div>
                      </button>
                      <button
                        onClick={() => useAuth().switchDemoUser('provider')}
                        className="py-2 px-1 rounded-xl bg-white border border-slate-200 text-center hover:bg-slate-50 transition"
                      >
                        <div className="text-[11px] font-bold text-slate-800">Business</div>
                        <div className="text-[9px] text-slate-500 truncate">Tariq M.</div>
                      </button>
                      <button
                        onClick={() => useAuth().switchDemoUser('admin')}
                        className="py-2 px-1 rounded-xl bg-amber-50 border border-amber-300 text-center hover:bg-amber-100 transition"
                      >
                        <div className="text-[11px] font-bold text-amber-900">Admin</div>
                        <div className="text-[9px] text-amber-700 truncate">Karachi HQ</div>
                      </button>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => useAuth().logout()}
                    className="w-full py-3 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition"
                  >
                    Log Out of Account
                  </button>
                </div>
              ) : (
                /* Guest View */
                <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 space-y-4">
                  <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Welcome to Service Provider Karachi
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                      Log in to submit ratings, write feedback, bookmark favorite businesses, or register your shop.
                    </p>
                  </div>
                  <div className="space-y-2 max-w-xs mx-auto">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition"
                    >
                      Customer Login / Sign Up
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                    >
                      Register Your Business (Shop Owner)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Android Bottom Navigation */}
        <AndroidBottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          favoritesCount={favoriteBusinesses.length}
        />

        {/* Android Home Bar Indicator (When in mobile frame) */}
        {isMobileFrame && (
          <div className="bg-white py-1 flex items-center justify-center border-t border-slate-100">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>
        )}

        {/* ================= MODALS ================= */}

        {/* Business Details Modal */}
        {selectedBusinessId && (
          <BusinessDetailsModal
            businessId={selectedBusinessId}
            onClose={handleCloseBusiness}
            onUpdateBusiness={updated => {
              setBusinesses(prev => prev.map(b => b.id === updated.id ? updated : b));
            }}
          />
        )}

        {/* Quick Contact Action Sheet */}
        {contactBusiness && (
          <ContactActionModal
            business={contactBusiness}
            onClose={() => setContactBusiness(null)}
          />
        )}

        {/* Business Registration Modal */}
        {showRegisterModal && (
          <BusinessRegistrationModal
            onClose={() => setShowRegisterModal(false)}
            onRegistered={() => {
              fetchBusinesses();
            }}
          />
        )}

        {/* Authentication Modal */}
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
          />
        )}

        {/* Administrator Control Center */}
        {showAdminModal && (
          <AdminPanelModal
            onClose={() => setShowAdminModal(false)}
            onRefreshData={fetchBusinesses}
          />
        )}

        {/* Advertising & Monetization Modal */}
        {showAdModal && (
          <AdvertisingModal
            businesses={businesses}
            onClose={() => setShowAdModal(false)}
            onSuccess={fetchBusinesses}
          />
        )}

        {/* Android APK Installation Guide */}
        {showApkGuide && (
          <ApkGuideModal
            onClose={() => setShowApkGuide(false)}
          />
        )}

        {/* Karachi Affiliate & Referral Earning Modal */}
        {showAffiliateModal && (
          <AffiliateModal
            onClose={() => setShowAffiliateModal(false)}
          />
        )}
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
