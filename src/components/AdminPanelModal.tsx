import React, { useState, useEffect } from 'react';
import {
  Shield, X, CheckCircle2, XCircle, AlertCircle, Trash2, Edit,
  Sparkles, Star, Users, Store, MessageSquare, DollarSign, RefreshCw,
  Search, Eye, ExternalLink, MapPin
} from 'lucide-react';
import { Business, Review, User, AdRequest } from '../types';
import { KARACHI_CATEGORIES } from '../data/categories';
import { useAuth } from '../context/AuthContext';

interface AdminPanelModalProps {
  onClose: () => void;
  onRefreshData?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  onClose,
  onRefreshData
}) => {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'businesses' | 'users' | 'reviews' | 'ads'>('pending');

  const [metrics, setMetrics] = useState<any>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ads, setAds] = useState<AdRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, bRes, uRes, rRes, aRes] = await Promise.all([
        fetch('/api/admin/metrics').then(r => r.json()),
        fetch('/api/businesses?status=all').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/admin/reviews').then(r => r.json()),
        fetch('/api/ads/requests').then(r => r.json())
      ]);

      if (mRes.success) setMetrics(mRes.data);
      if (bRes.success) setBusinesses(bRes.data);
      if (uRes.success) setUsers(uRes.data);
      if (rRes.success) setReviews(rRes.data);
      if (aRes.success) setAds(aRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBusiness = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/businesses/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`Business "${data.data.businessName}" approved! Now visible in Karachi catalogue.`);
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectBusiness = async (id: string) => {
    const reason = window.prompt('Provide rejection reason (e.g. Unverified address, incomplete contact):');
    if (reason === null) return;

    try {
      const res = await fetch(`/api/admin/businesses/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', reason: reason || 'Information verification failed' })
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`Business rejected.`);
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBusiness = async (id: string, name: string) => {
    if (!window.confirm(`Permanently remove "${name}" listing?`)) return;
    try {
      const res = await fetch(`/api/businesses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`Listing "${name}" removed.`);
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeature = async (biz: Business, field: 'isFeatured' | 'isSponsored' | 'isPremium') => {
    try {
      const updatedValue = !biz[field];
      const res = await fetch(`/api/admin/businesses/${biz.id}/feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: updatedValue })
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`Toggled ${field} for "${biz.businessName}"`);
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActionMsg('Review deleted by administrator');
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSuspendUser = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/suspend`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`User ${user.name} is now ${data.data.isSuspended ? 'SUSPENDED' : 'ACTIVE'}.`);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveAd = async (adId: string) => {
    try {
      const res = await fetch(`/api/admin/ads/${adId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg('Payment verified & Sponsorship activated!');
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset database to authentic Karachi default dataset?')) return;
    try {
      const res = await fetch('/api/reset-data', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionMsg('Database restored to initial seeds!');
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingList = businesses.filter(b => b.status === 'pending');
  const filteredBusinesses = businesses.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.businessName.toLowerCase().includes(q) ||
      b.ownerName.toLowerCase().includes(q) ||
      b.karachiArea.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[92vh] rounded-3xl shadow-2xl relative flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white leading-tight">
                  Karachi Administrator Control Center
                </h2>
                <span className="bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Admin Master
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Moderation, Registrations, Reviews & Monetization
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetDatabase}
              className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              title="Reset to fresh Karachi sample data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Seeds</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Flash Alert */}
        {actionMsg && (
          <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 flex items-center justify-between animate-in fade-in">
            <span>✓ {actionMsg}</span>
            <button onClick={() => setActionMsg(null)} className="text-emerald-100 hover:text-white font-bold ml-2">
              ×
            </button>
          </div>
        )}

        {/* Metric Cards Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-6 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Businesses</span>
            <div className="text-lg font-extrabold text-slate-900">{metrics?.totalBusinesses || businesses.length}</div>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-[10px] font-bold text-amber-700 uppercase flex items-center space-x-1">
              <span>Pending Queue</span>
              {pendingList.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
            </span>
            <div className="text-lg font-extrabold text-amber-900">{pendingList.length}</div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Customers</span>
            <div className="text-lg font-extrabold text-slate-900">{users.length}</div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Reviews</span>
            <div className="text-lg font-extrabold text-slate-900">{reviews.length}</div>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Sponsored Ads</span>
            <div className="text-lg font-extrabold text-emerald-900">
              {businesses.filter(b => b.isSponsored || b.isPremium).length}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition whitespace-nowrap ${
              activeTab === 'pending'
                ? 'border-amber-500 text-amber-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Pending Approvals ({pendingList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('businesses')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition whitespace-nowrap ${
              activeTab === 'businesses'
                ? 'border-blue-700 text-blue-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-4 h-4 text-blue-600" />
            <span>All Karachi Businesses ({businesses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition whitespace-nowrap ${
              activeTab === 'ads'
                ? 'border-emerald-600 text-emerald-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Monetization & Ads ({ads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-blue-700 text-blue-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Reviews Moderation ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-blue-700 text-blue-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Customers & Accounts ({users.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          {/* TAB 1: PENDING APPROVALS */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingList.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800">Pending Queue is Empty</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    All submitted Karachi business registrations have been verified and processed.
                  </p>
                </div>
              ) : (
                pendingList.map(biz => (
                  <div
                    key={biz.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{biz.businessName}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                          Pending Verification
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                          {biz.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {biz.description}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                        <span>👤 Owner: <strong>{biz.ownerName}</strong></span>
                        <span>📍 Area: <strong>{biz.karachiArea}</strong></span>
                        <span>📞 Mobile: <strong>{biz.mobile}</strong></span>
                        <span>💬 WA: <strong>{biz.whatsappNumber}</strong></span>
                        <span>🏢 Address: <strong>{biz.fullAddress}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <button
                        onClick={() => handleRejectBusiness(biz.id)}
                        className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveBusiness(biz.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                      >
                        Approve & Publish
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: ALL BUSINESSES */}
          {activeTab === 'businesses' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter businesses by name, category, or Karachi area..."
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                {filteredBusinesses.map(biz => (
                  <div
                    key={biz.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <img
                          src={biz.logo || (biz.photos && biz.photos[0])}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-slate-900">{biz.businessName}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                biz.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : biz.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {biz.status.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {biz.category} • {biz.karachiArea} • {biz.mobile}
                          </span>
                        </div>
                      </div>

                      {/* Promotion Badges Toggles */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => handleToggleFeature(biz, 'isFeatured')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                            biz.isFeatured
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Featured {biz.isFeatured ? '✓' : ''}
                        </button>

                        <button
                          onClick={() => handleToggleFeature(biz, 'isSponsored')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                            biz.isSponsored
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Sponsored {biz.isSponsored ? '✓' : ''}
                        </button>

                        <button
                          onClick={() => handleToggleFeature(biz, 'isPremium')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                            biz.isPremium
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Premium {biz.isPremium ? '✓' : ''}
                        </button>

                        <button
                          onClick={() => handleDeleteBusiness(biz.id, biz.businessName)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADVERTISING & MONETIZATION */}
          {activeTab === 'ads' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 mb-1">
                  Karachi Sponsorship & Advertising Requests
                </h3>
                <p className="text-[11px] text-slate-500">
                  Business owners submit JazzCash / Easypaisa / Raast transaction IDs for approval.
                </p>
              </div>

              {ads.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-500">
                  No advertising requests yet.
                </div>
              ) : (
                ads.map(ad => (
                  <div
                    key={ad.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{ad.businessName}</span>
                        <div className="text-[11px] text-blue-700 font-semibold">{ad.packageName} - PKR {ad.amountPKR.toLocaleString()}</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ad.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ad.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>Payment Method: <strong>{ad.paymentMethod}</strong></div>
                      <div>Sender Mobile: <strong>{ad.senderNumberOrAccount}</strong></div>
                      <div>TRX ID: <strong className="font-mono text-blue-800">{ad.transactionId}</strong></div>
                    </div>

                    {ad.status === 'pending' && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleApproveAd(ad.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                        >
                          Verify Payment & Activate Ad
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 mb-1">
                  Customer Reviews Moderation
                </h3>
                <p className="text-[11px] text-slate-500">
                  Inspect ratings and remove fraudulent, abusive, or fake reviews.
                </p>
              </div>

              {reviews.map(rev => {
                const biz = businesses.find(b => b.id === rev.businessId);
                return (
                  <div
                    key={rev.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800">{rev.customerName}</span>
                        <span className="text-[11px] text-slate-400 ml-2">on "{biz?.businessName || 'Business'}"</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-bold text-slate-800 ml-1">{rev.rating}.0</span>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5: USERS & ACCOUNTS */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 mb-1">Registered Accounts</h3>
                <p className="text-[11px] text-slate-500">Manage customer and service provider accounts.</p>
              </div>

              {users.map(u => (
                <div
                  key={u.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">{u.name}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                        {u.role.toUpperCase()}
                      </span>
                      {u.isSuspended && (
                        <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                          SUSPENDED
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">{u.email} • {u.mobile}</div>
                  </div>

                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleSuspendUser(u)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        u.isSuspended
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                      }`}
                    >
                      {u.isSuspended ? 'Reactivate' : 'Suspend'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
