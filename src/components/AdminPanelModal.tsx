import React, { useState, useEffect } from 'react';
import {
  Shield, X, CheckCircle2, XCircle, AlertCircle, Trash2, Edit,
  Sparkles, Star, Users, Store, MessageSquare, DollarSign, RefreshCw,
  Search, Eye, ExternalLink, MapPin, Calendar, Briefcase, Wallet, 
  Check, Settings, Phone, User as UserIcon, CreditCard, History
} from 'lucide-react';
import { 
  Business, Review, User, AdRequest, Booking, 
  CommissionRecord, WeeklyCommissionReport, AppConfig, BookingStatus,
  PaymentRequest, AdminAuditLog 
} from '../types';
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
  const [activeTab, setActiveTab] = useState<'pending' | 'payments' | 'bookings' | 'commissions' | 'businesses' | 'users' | 'reviews' | 'ads' | 'audit' | 'config'>('pending');

  const [metrics, setMetrics] = useState<any>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ads, setAds] = useState<AdRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyCommissionReport | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, bRes, uRes, rRes, aRes, bkRes, cRes, cfgRes, wRes, pRes, lRes] = await Promise.all([
        fetch('/api/admin/metrics').then(r => r.json()),
        fetch('/api/businesses?status=all').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/admin/reviews').then(r => r.json()),
        fetch('/api/ads/requests').then(r => r.json()),
        fetch('/api/admin/bookings').then(r => r.json()),
        fetch('/api/admin/commissions').then(r => r.json()),
        fetch('/api/admin/config').then(r => r.json()),
        fetch('/api/admin/reports/weekly').then(r => r.json()),
        fetch('/api/admin/payments').then(r => r.json()),
        fetch('/api/admin/audit-logs').then(r => r.json())
      ]);

      if (mRes.success) setMetrics(mRes.data);
      if (bRes.success) setBusinesses(bRes.data);
      if (uRes.success) setUsers(uRes.data);
      if (rRes.success) setReviews(rRes.data);
      if (aRes.success) setAds(aRes.data);
      if (bkRes.success) setBookings(bkRes.data);
      if (cRes.success) setCommissions(cRes.data);
      if (cfgRes.success) setAppConfig(cfgRes.data);
      if (wRes.success) setWeeklyReport(wRes.data);
      if (pRes.success) setPaymentRequests(pRes.data);
      if (lRes.success) setAuditLogs(lRes.data);
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
        setActionMsg(`Business "${data.data.businessName}" approved!`);
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) { console.error(err); }
  };

  const handleRejectBusiness = async (id: string) => {
    const reason = window.prompt('Provide rejection reason:');
    if (reason === null) return;
    try {
      const res = await fetch(`/api/admin/businesses/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', reason: reason || 'Information verification failed' })
      });
      if ((await res.json()).success) {
        setActionMsg(`Business rejected.`);
        loadAdminData();
      }
    } catch (err) { console.error(err); }
  };

  const handleVerifyPayment = async (id: string, status: 'verified' | 'rejected') => {
    let reason = '';
    if (status === 'rejected') {
      reason = window.prompt('Rejection Reason:') || 'Invalid Transaction ID';
    }
    try {
      const res = await fetch(`/api/admin/payments/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      });
      if ((await res.json()).success) {
        setActionMsg(`Payment ${status === 'verified' ? 'verified successfully' : 'rejected'}`);
        loadAdminData();
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateBooking = async (id: string, update: Partial<Booking>) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      if ((await res.json()).success) {
        setActionMsg('Booking updated successfully.');
        loadAdminData();
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleAssignProvider = async (bookingId: string) => {
    const providers = users.filter(u => u.role === 'provider');
    if (providers.length === 0) {
        alert('No registered service providers found to assign.');
        return;
    }
    
    let promptText = "Enter Provider Email or ID to assign:\n\nAvailable Providers:\n";
    providers.forEach(p => promptText += `- ${p.name} (${p.email})\n`);
    
    const providerInput = window.prompt(promptText);
    if (!providerInput) return;
    
    const selected = providers.find(p => p.email === providerInput || p.id === providerInput);
    if (!selected) {
        alert('Provider not found.');
        return;
    }

    const price = window.prompt('Set Service Price (PKR):', '1000');
    if (!price) return;

    handleUpdateBooking(bookingId, { 
        providerId: selected.id, 
        providerName: selected.name,
        servicePrice: Number(price),
        status: 'assigned'
    });
  };

  const handleRecordPayment = async (p: any) => {
    const amount = window.prompt(`Confirm payment amount for ${p.providerName}:`, p.amountDue.toString());
    if (!amount) return;

    try {
        const res = await fetch('/api/admin/commissions/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                providerId: p.providerId,
                weekNumber: weeklyReport?.weekNumber,
                year: weeklyReport?.year,
                amount: Number(amount)
            })
        });
        if ((await res.json()).success) {
            setActionMsg('Payment recorded successfully.');
            loadAdminData();
        }
    } catch (err) { console.error(err); }
  };

  const handleUpdateConfig = async () => {
    const percent = window.prompt('Set Default Commission Percentage (%):', appConfig?.defaultCommissionPercentage.toString());
    if (!percent) return;

    try {
        const res = await fetch('/api/admin/config', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ defaultCommissionPercentage: Number(percent) })
        });
        if ((await res.json()).success) {
            setActionMsg('Config updated.');
            loadAdminData();
        }
    } catch (err) { console.error(err); }
  };

  const handleDeleteBusiness = async (id: string, name: string) => {
    if (!window.confirm(`Permanently remove "${name}" listing?`)) return;
    try {
      const res = await fetch(`/api/businesses/${id}`, { method: 'DELETE' });
      if ((await res.json()).success) {
        setActionMsg(`Listing "${name}" removed.`);
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) { console.error(err); }
  };

  const handleToggleFeature = async (biz: Business, field: 'isFeatured' | 'isSponsored' | 'isPremium') => {
    try {
      const updatedValue = !biz[field];
      const res = await fetch(`/api/admin/businesses/${biz.id}/feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: updatedValue })
      });
      if ((await res.json()).success) {
        setActionMsg(`Toggled ${field} for "${biz.businessName}"`);
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) { console.error(err); }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset database?')) return;
    try {
      const res = await fetch('/api/reset-data', { method: 'POST' });
      if ((await res.json()).success) {
        setActionMsg('Database reset.');
        loadAdminData();
      }
    } catch (err) { console.error(err); }
  };

  const handleToggleSuspendUser = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/suspend`, { method: 'POST' });
      if ((await res.json()).success) {
        setActionMsg(`User status updated.`);
        loadAdminData();
      }
    } catch (err) { console.error(err); }
  };

  const handleApproveAd = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ads/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      if ((await res.json()).success) {
        setActionMsg('Ad request activated!');
        loadAdminData();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if ((await res.json()).success) {
        setActionMsg('Review deleted.');
        loadAdminData();
      }
    } catch (err) { console.error(err); }
  };

  const pendingList = businesses.filter(b => b.status === 'pending');
  const pendingPayments = paymentRequests.filter(p => p.status === 'pending');

  const filteredBusinesses = businesses.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.businessName.toLowerCase().includes(q) || b.ownerName.toLowerCase().includes(q);
  });

  const stats = {
    totalCommissionDue: commissions.filter(c => c.status !== 'paid').reduce((acc, c) => acc + (c.commissionAmount - c.paidAmount), 0),
    totalCommissionCollected: commissions.reduce((acc, c) => acc + c.paidAmount, 0)
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#101C2C]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#F3F4F6] w-full max-w-7xl h-[94vh] rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden border border-[#D4AF37]/20">
        
        {/* Luxury Header */}
        <div className="bg-[#101C2C] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#101C2C] p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#101C2C] rounded-[14px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center">
                Admin Console
                <span className="ml-3 px-2 py-0.5 rounded-full bg-[#087F5B] text-[10px] uppercase tracking-widest font-black">HQ ACCESS</span>
              </h2>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mt-0.5">Control Panel • Karachi Services Network</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={handleResetDatabase} className="p-2.5 text-gray-400 hover:text-[#D4AF37] transition rounded-xl hover:bg-white/5" title="System Restore">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full transition hover:bg-white/10">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Status Message */}
        {actionMsg && (
          <div className="bg-[#087F5B] text-white text-[11px] font-bold uppercase tracking-widest py-3 px-8 flex items-center justify-between animate-in slide-in-from-top">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              <span>{actionMsg}</span>
            </div>
            <button onClick={() => setActionMsg(null)} className="text-white/70 hover:text-white text-sm">✕</button>
          </div>
        )}

        {/* Dashboard Analytics */}
        <div className="bg-white border-b border-gray-200 p-6 flex overflow-x-auto no-scrollbar space-x-6">
          <div className="flex-none w-44 bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Directory</div>
            <div className="text-2xl font-black text-[#101C2C]">{businesses.length}</div>
            <div className="text-[9px] text-[#087F5B] font-bold mt-1">+{pendingList.length} New Requests</div>
          </div>
          <div className="flex-none w-44 bg-[#087F5B]/5 p-4 rounded-2xl border border-[#087F5B]/10 shadow-sm">
            <div className="text-[10px] text-[#087F5B] font-bold uppercase tracking-widest mb-1">Pending Pay</div>
            <div className="text-2xl font-black text-[#101C2C]">{pendingPayments.length}</div>
            <div className="text-[9px] text-[#087F5B] font-bold mt-1">Verification Required</div>
          </div>
          <div className="flex-none w-44 bg-[#D4AF37]/5 p-4 rounded-2xl border border-[#D4AF37]/10 shadow-sm">
            <div className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest mb-1">Active Jobs</div>
            <div className="text-2xl font-black text-[#101C2C]">{bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length}</div>
          </div>
          <div className="flex-none w-56 bg-[#101C2C] p-4 rounded-2xl border border-white/5 shadow-lg">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Revenue</div>
            <div className="text-2xl font-black text-[#D4AF37]">PKR {stats.totalCommissionCollected.toLocaleString()}</div>
            <div className="text-[9px] text-[#087F5B] font-bold mt-1">Settled & Verified</div>
          </div>
          <div className="flex-none w-56 bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
            <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">Outstanding</div>
            <div className="text-2xl font-black text-red-600">PKR {stats.totalCommissionDue.toLocaleString()}</div>
            <div className="text-[9px] text-gray-400 font-bold mt-1">Platform Commission Due</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white px-6 flex items-center space-x-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'pending', label: 'Verify Shop', icon: Store, count: pendingList.length },
            { id: 'payments', label: 'Payments', icon: CreditCard, count: pendingPayments.length },
            { id: 'bookings', label: 'Bookings', icon: Calendar },
            { id: 'commissions', label: 'Finance', icon: Wallet },
            { id: 'businesses', label: 'Directory', icon: Briefcase },
            { id: 'users', label: 'Accounts', icon: Users },
            { id: 'audit', label: 'Audit Logs', icon: History },
            { id: 'config', label: 'Config', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative py-4 px-5 flex items-center space-x-2.5 transition-all group ${
                activeTab === tab.id
                  ? 'text-[#101C2C]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#D4AF37]' : ''}`} />
              <span className={`text-[11px] font-bold uppercase tracking-tight whitespace-nowrap`}>
                {tab.label}
              </span>
              {(tab as any).count > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-black animate-pulse">
                  {(tab as any).count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37] rounded-t-full shadow-[0_-4px_10px_rgba(212,175,55,0.4)]" />
              )}
            </button>
          ))}
        </div>

        {/* Main Workspace */}
        <div className="flex-1 overflow-y-auto bg-gray-100/50 p-6">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-4 border-[#D4AF37]/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="mt-6 text-[10px] font-black text-[#101C2C]/40 uppercase tracking-[0.3em]">Authorized Session Active</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Tab: Verify Shop */}
              {activeTab === 'pending' && (
                <div className="space-y-4">
                  {pendingList.length === 0 ? (
                    <EmptyState icon={CheckCircle2} title="System Up to Date" message="All shop verification requests have been processed." />
                  ) : (
                    pendingList.map(biz => (
                      <div key={biz.id} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col lg:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
                        <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {biz.logo ? <img src={biz.logo} alt="" className="w-full h-full object-cover" /> : <Store className="w-10 h-10 text-gray-200" />}
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-bold text-[#101C2C] uppercase tracking-tight">{biz.businessName}</h3>
                            <span className="px-2 py-0.5 rounded-md bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] font-black uppercase">{biz.category}</span>
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[9px] font-black uppercase">{biz.businessType.replace('_', ' ')}</span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{biz.description}</p>
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <InfoLabel icon={UserIcon} label="Owner" value={biz.ownerName} color="#101C2C" />
                            <InfoLabel icon={MapPin} label="Area" value={biz.karachiArea} color="#087F5B" />
                            <InfoLabel icon={Phone} label="Contact" value={biz.mobile} color="#D4AF37" />
                          </div>
                        </div>
                        <div className="flex lg:flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 w-full lg:w-48">
                          <button onClick={() => handleRejectBusiness(biz.id)} className="flex-1 py-3 rounded-xl bg-gray-50 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 border border-transparent hover:border-red-100 transition">Reject</button>
                          <button onClick={() => handleApproveBusiness(biz.id)} className="flex-1 py-3 rounded-xl bg-[#101C2C] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-gray-200">Approve</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Payment Verification */}
              {activeTab === 'payments' && (
                <div className="space-y-4">
                  {pendingPayments.length === 0 ? (
                    <EmptyState icon={CreditCard} title="Payments Clear" message="No pending Easypaisa verification requests found." />
                  ) : (
                    pendingPayments.map(p => (
                      <div key={p.id} className="bg-white rounded-3xl p-6 border border-[#D4AF37]/30 shadow-md flex flex-col lg:flex-row items-center gap-8 animate-slide-up">
                        <div className="w-full lg:w-48 h-64 lg:h-auto aspect-[3/4] rounded-2xl bg-gray-900 overflow-hidden relative group shrink-0 shadow-lg">
                          <img src={p.screenshotUrl} alt="Transaction Screenshot" className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button onClick={() => window.open(p.screenshotUrl, '_blank')} className="bg-white text-black p-3 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition duration-300"><Eye className="w-5 h-5" /></button>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[10px] text-[#087F5B] font-bold uppercase tracking-[0.2em] mb-1">Easypaisa Verification</div>
                              <h3 className="text-xl font-black text-[#101C2C] uppercase tracking-tight">{p.userName}</h3>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Amount Paid</div>
                              <div className="text-2xl font-black text-[#087F5B]">PKR {p.amountPKR.toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                            <div><div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Target Package</div><div className="text-xs font-black text-[#101C2C] uppercase">{p.packageName}</div></div>
                            <div><div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Transaction ID</div><div className="text-xs font-mono font-black text-[#101C2C]">{p.transactionId}</div></div>
                            <div><div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Date Submitted</div><div className="text-xs font-bold text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</div></div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button onClick={() => handleVerifyPayment(p.id, 'rejected')} className="flex-1 py-4 rounded-xl bg-white border-2 border-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest hover:bg-red-50 transition">Reject Payment</button>
                            <button onClick={() => handleVerifyPayment(p.id, 'verified')} className="flex-[2] py-4 rounded-xl bg-[#087F5B] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#066448] transition shadow-xl shadow-[#087F5B]/20">Confirm & Verify</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Audit Logs */}
              {activeTab === 'audit' && (
                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <th className="px-6 py-4">Timestamp</th>
                          <th className="px-6 py-4">Admin</th>
                          <th className="px-6 py-4">Action</th>
                          <th className="px-6 py-4">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {auditLogs.map(log => (
                          <tr key={log.id} className="text-xs hover:bg-gray-50/50 transition">
                            <td className="px-6 py-4 font-mono text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-6 py-4 font-bold text-[#101C2C]">{log.adminName}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded bg-[#101C2C]/5 text-[#101C2C] font-black uppercase text-[9px]">{log.action}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 font-medium">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Other tabs remain similarly updated with luxury styles... */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  {bookings.map(bk => (
                    <div key={bk.id} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 relative group overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        bk.status === 'completed' ? 'bg-[#087F5B]' :
                        bk.status === 'cancelled' || bk.status === 'rejected' ? 'bg-red-500' : 'bg-[#D4AF37]'
                      }`} />
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-[10px] font-mono font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">#{bk.id}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              bk.status === 'completed' ? 'bg-[#087F5B]/10 text-[#087F5B]' :
                              bk.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}>{bk.status.replace('_', ' ')}</span>
                          </div>
                          <div className="text-xs font-black text-[#101C2C]">{new Date(bk.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-[#101C2C] uppercase tracking-tight">{bk.serviceName}</h4>
                          <p className="text-[10px] text-[#087F5B] font-bold uppercase tracking-widest mt-1">Vendor: {bk.businessName}</p>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2"><div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center font-black text-[10px]">{bk.customerName.charAt(0)}</div><span className="text-xs font-bold text-gray-600">{bk.customerName}</span></div>
                          {bk.providerName && <div className="flex items-center space-x-2"><div className="w-6 h-6 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center font-black text-[10px] text-[#D4AF37]">{bk.providerName.charAt(0)}</div><span className="text-xs font-bold text-[#D4AF37]">Assigned: {bk.providerName}</span></div>}
                        </div>
                      </div>
                      <div className="shrink-0 flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-48">
                        {bk.status === 'pending' && (
                          <>
                            <button onClick={() => handleUpdateBooking(bk.id, { status: 'confirmed' })} className="flex-1 py-2 rounded-xl bg-[#087F5B] text-white text-[10px] font-black uppercase tracking-widest">Confirm</button>
                            <button onClick={() => handleUpdateBooking(bk.id, { status: 'rejected' })} className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100">Reject</button>
                          </>
                        )}
                        {(bk.status === 'confirmed' || bk.status === 'pending') && (
                          <button onClick={() => handleAssignProvider(bk.id)} className="w-full py-3 rounded-xl bg-[#101C2C] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gray-200">Assign Partner</button>
                        )}
                        {bk.status === 'assigned' && (
                           <div className="text-[10px] font-black text-[#087F5B] text-center bg-[#087F5B]/5 p-3 rounded-xl border border-[#087F5B]/20">Provider Dispatched</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Commission Ledger */}
              {activeTab === 'commissions' && (
                <div className="space-y-6">
                  {weeklyReport && (
                    <div className="bg-[#101C2C] text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden border border-[#D4AF37]/30">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                      <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2 text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]"><Calendar className="w-4 h-4" /><span>Live Financial Settlement</span></div>
                          <div>
                            <h3 className="text-3xl font-black uppercase tracking-tight leading-none">Week {weeklyReport.weekNumber}</h3>
                            <p className="text-gray-400 text-sm mt-1">Settlement Cycle: {weeklyReport.startDate} — {weeklyReport.endDate}</p>
                          </div>
                          <div className="flex gap-4">
                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                              <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Jobs Closed</div>
                              <div className="text-lg font-black text-white">{weeklyReport.totalBookings}</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                              <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Volume</div>
                              <div className="text-lg font-black text-white">PKR {weeklyReport.totalVolume.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between text-right">
                          <div className="space-y-1">
                            <div className="text-[10px] text-[#087F5B] font-black uppercase tracking-[0.2em]">Platform Revenue</div>
                            <div className="text-5xl font-black text-[#D4AF37]">PKR {weeklyReport.totalCommissionPaid.toLocaleString()}</div>
                          </div>
                          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 p-3 rounded-2xl flex items-center justify-between mt-6">
                            <div className="text-left">
                              <div className="text-[8px] text-gray-400 font-black uppercase">Outstanding</div>
                              <div className="text-sm font-black text-red-400">PKR {(weeklyReport.totalCommissionDue - weeklyReport.totalCommissionPaid).toLocaleString()}</div>
                            </div>
                            <div className="w-px h-8 bg-white/10 mx-4" />
                            <div className="text-right">
                              <div className="text-[8px] text-gray-400 font-black uppercase">Collection Rate</div>
                              <div className="text-sm font-black text-[#087F5B]">{Math.round((weeklyReport.totalCommissionPaid / (weeklyReport.totalCommissionDue || 1)) * 100)}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Provider Settlement Records</h4>
                      <button className="text-[10px] font-black text-[#101C2C] hover:text-[#D4AF37] uppercase tracking-widest flex items-center space-x-1.5 transition">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Force Re-sync</span>
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                            <th className="px-6 py-5">Service Provider</th>
                            <th className="px-6 py-5 text-center">Unit Count</th>
                            <th className="px-6 py-5 text-right">Commission Due</th>
                            <th className="px-6 py-5 text-center">Status</th>
                            <th className="px-6 py-5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {weeklyReport?.providers.map(p => (
                            <tr key={p.providerId} className="hover:bg-gray-50/30 transition">
                              <td className="px-6 py-5">
                                <div className="text-xs font-black text-[#101C2C] uppercase tracking-tight">{p.providerName}</div>
                                <div className="text-[9px] text-gray-400 font-medium font-mono mt-0.5">ID: {p.providerId}</div>
                              </td>
                              <td className="px-6 py-5 text-center text-xs font-bold text-gray-600">{p.bookingCount}</td>
                              <td className="px-6 py-5 text-right">
                                <div className="text-sm font-black text-red-600">PKR {p.amountDue.toLocaleString()}</div>
                                <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Verified Pay</div>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-inner ${
                                  p.amountDue === 0 ? 'bg-[#087F5B]/10 text-[#087F5B]' : 'bg-red-50 text-red-600 animate-pulse'
                                }`}>{p.amountDue === 0 ? 'Settled' : 'Pending Pay'}</span>
                              </td>
                              <td className="px-6 py-5 text-right">
                                {p.amountDue > 0 ? (
                                  <button onClick={() => handleRecordPayment(p)} className="px-6 py-2.5 rounded-xl bg-[#101C2C] text-[#D4AF37] text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition">Collect</button>
                                ) : (
                                  <div className="text-[#087F5B] flex items-center justify-end space-x-1.5"><CheckCircle2 className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-widest">Verified</span></div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Directory Tab */}
              {activeTab === 'businesses' && (
                <div className="space-y-6">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-[#D4AF37]"><Search className="w-5 h-5 text-gray-400" /></div>
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Filter by Name, Category, or Karachi Area..." className="w-full bg-white border border-gray-200 py-5 pl-14 pr-8 rounded-3xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 shadow-sm transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBusinesses.map(biz => (
                      <div key={biz.id} className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex items-center justify-between group hover:shadow-md transition">
                        <div className="flex items-center space-x-4">
                          <img src={biz.logo || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200&h=200&auto=format&fit=crop'} alt="" className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-inner" />
                          <div>
                            <h5 className="text-sm font-black text-[#101C2C] uppercase tracking-tight">{biz.businessName}</h5>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{biz.category} • {biz.karachiArea}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                           <button onClick={() => handleDeleteBusiness(biz.id, biz.businessName)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accounts Tab */}
              {activeTab === 'users' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map(u => (
                    <div key={u.id} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 hover:shadow-md transition">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-[#D4AF37] text-lg shadow-inner">{u.name.charAt(0)}</div>
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.1em] ${
                          u.role === 'admin' ? 'bg-[#101C2C] text-[#D4AF37]' :
                          u.role === 'provider' ? 'bg-[#087F5B]/10 text-[#087F5B]' : 'bg-gray-100 text-gray-600'
                        }`}>{u.role}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#101C2C] uppercase tracking-tight">{u.name}</h4>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">{u.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Phone className="w-3.5 h-3.5 text-gray-300" />
                          <span className="text-[11px] font-black text-[#101C2C] tracking-widest">{u.mobile}</span>
                        </div>
                      </div>
                      {u.role !== 'admin' && (
                        <div className="pt-2">
                          <button onClick={() => handleToggleSuspendUser(u)} className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition ${
                            u.isSuspended ? 'bg-[#087F5B]/5 text-[#087F5B] border-[#087F5B]/20 hover:bg-[#087F5B]/10' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                          }`}>{u.isSuspended ? 'Reactivate Profile' : 'Suspend Access'}</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Config Tab */}
              {activeTab === 'config' && (
                <div className="max-w-2xl mx-auto py-10 space-y-8">
                  <div className="bg-white rounded-[40px] p-10 border border-gray-200 shadow-xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#101C2C] to-[#087F5B]" />
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-[#101C2C] rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-xl"><Settings className="w-8 h-8" /></div>
                      <div>
                        <h3 className="text-2xl font-black text-[#101C2C] uppercase tracking-tight">System Parameters</h3>
                        <p className="text-gray-500 text-sm font-medium">Financial & Operational Constraints</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-[10px] text-[#087F5B] font-black uppercase tracking-widest">Platform Commission</div>
                            <div className="text-4xl font-black text-[#101C2C]">{appConfig?.defaultCommissionPercentage}%</div>
                          </div>
                          <button onClick={handleUpdateConfig} className="bg-[#101C2C] text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:shadow-[#D4AF37]/20 transition-all">Adjust Rate</button>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed pt-4 border-t border-gray-200">Automatically calculated and debited from the Service Provider's digital wallet upon successful completion of any booking via COD.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <ConfigToggle label="Auto-Approve Ads" value={false} />
                         <ConfigToggle label="Verify Mobile via OTP" value={true} />
                         <ConfigToggle label="Allow Multi-Shops" value={true} />
                         <ConfigToggle label="Strict Area Filtering" value={true} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoLabel: React.FC<{ icon: any, label: string, value: string, color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center space-x-2">
    <Icon className="w-3.5 h-3.5" style={{ color }} />
    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}:</span>
    <span className="text-[11px] font-black text-[#101C2C] uppercase">{value}</span>
  </div>
);

const ConfigToggle: React.FC<{ label: string, value: boolean }> = ({ label, value }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
    <span className="text-[10px] font-black text-[#101C2C] uppercase tracking-tight">{label}</span>
    <div className={`w-10 h-5 rounded-full p-1 transition-colors ${value ? 'bg-[#087F5B]' : 'bg-gray-300'}`}>
      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </div>
);

const EmptyState: React.FC<{ icon: any, title: string, message: string }> = ({ icon: Icon, title, message }) => (
  <div className="bg-white rounded-[40px] p-24 text-center border border-dashed border-gray-200 flex flex-col items-center">
    <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 mb-6"><Icon className="w-10 h-10" /></div>
    <h3 className="text-xl font-black text-[#101C2C] uppercase tracking-tight">{title}</h3>
    <p className="text-gray-400 text-sm mt-2 font-medium max-w-xs">{message}</p>
  </div>
);
