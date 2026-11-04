import React, { useState, useEffect } from 'react';
import { 
  X, Briefcase, Clock, CheckCircle2, AlertCircle, 
  DollarSign, Wallet, Calendar, User, MapPin, 
  Phone, ChevronRight, RefreshCw, Check, MessageSquare, Shield, Zap, Star, XCircle,
  Package, Plus, Trash2, Edit3, Image as ImageIcon, TrendingUp
} from 'lucide-react';
import { Booking, CommissionRecord, BookingStatus, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { ChatModal } from './ChatModal';

interface ProviderDashboardProps {
  onClose?: () => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'commissions' | 'products'>('jobs');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modals & Popups
  const [selectedChatBooking, setSelectedChatBooking] = useState<Booking | null>(null);
  const [statusPopup, setStatusPopup] = useState<{ type: 'success' | 'busy' | 'rejected', show: boolean }>({ type: 'success', show: false });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category: '', image: '' });

  useEffect(() => {
    fetchData();
  }, [currentUser, activeTab]);

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      if (activeTab === 'jobs') {
        const res = await fetch(`/api/provider/bookings/${currentUser.id}`);
        const data = await res.json();
        if (data.success) setBookings(data.data);
      } else if (activeTab === 'commissions') {
        const res = await fetch(`/api/provider/commissions/${currentUser.id}`);
        const data = await res.json();
        if (data.success) setCommissions(data.data);
      } else {
        const res = await fetch(`/api/products`);
        const data = await res.json();
        if (data.success) setProducts(data.data);
      }
    } catch (err) {
      console.error('Error fetching provider data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        
        if (newStatus === 'completed') {
            setStatusPopup({ type: 'success', show: true });
        } else if (newStatus === 'rejected' || newStatus === 'cancelled') {
            setStatusPopup({ type: 'rejected', show: true });
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setActionLoading('add-product');
    try {
      const bRes = await fetch('/api/businesses?status=approved');
      const bData = await bRes.json();
      const myBiz = bData.data?.find((b: any) => b.ownerName === currentUser.name);

      if (!myBiz) {
        alert('Please register a shop first to add products.');
        return;
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, businessId: myBiz.id })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => [data.data, ...prev]);
        setShowAddProduct(false);
        setNewProduct({ name: '', description: '', price: '', category: '', image: '' });
      }
    } catch (err) {
      console.error('Error adding product:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    pending: bookings.filter(b => b.status === 'assigned').length,
    active: bookings.filter(b => b.status === 'in_progress' || b.status === 'on_the_way').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    dueCommission: commissions.filter(c => c.status === 'due').reduce((acc, c) => acc + (c.commissionAmount - c.paidAmount), 0),
    paidCommission: commissions.reduce((acc, c) => acc + c.paidAmount, 0)
  };

  return (
    <div className="w-full space-y-8 animate-fade-in pb-12">
      {/* Luxury Header */}
      <div className="bg-[#101C2C] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border border-[#D4AF37]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#D4AF37] to-[#101C2C] p-0.5 shadow-2xl">
              <div className="w-full h-full bg-[#101C2C] rounded-[1.8rem] flex items-center justify-center text-[#D4AF37]">
                <Briefcase className="w-10 h-10" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Partner Console</h2>
              <div className="flex items-center space-x-4 mt-3">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Business Command Center</p>
                {currentUser?.activePackageId && (
                  <div className="flex items-center space-x-2 px-4 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30">
                    <Zap className="w-3 h-3 text-[#D4AF37]" />
                    <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">{currentUser.activePackageId} Account</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Generate Report</button>
            <button className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#101C2C] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#D4AF37]/20 hover:scale-105 transition-transform">Support</button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white px-8 flex items-center space-x-2 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
        {[
          { id: 'jobs', label: 'Assigned Jobs', icon: Briefcase, count: stats.pending + stats.active },
          { id: 'products', label: 'My Products', icon: Package, count: products.length },
          { id: 'commissions', label: 'Financials', icon: Wallet }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative py-6 px-8 flex items-center space-x-3 transition-all group ${
              activeTab === tab.id ? 'text-[#101C2C]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#D4AF37]' : ''}`} />
            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-[10px] font-black shadow-lg shadow-red-500/20">{tab.count}</span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#D4AF37] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Job Queue" value={stats.pending} color="#101C2C" icon={Clock} />
        <StatCard label="Live Jobs" value={stats.active} color="#087F5B" icon={Briefcase} />
        <StatCard label="Fees Owed" value={`PKR ${stats.dueCommission}`} color="#ef4444" icon={AlertCircle} />
        <StatCard label="Total Volume" value={`PKR ${stats.paidCommission + stats.dueCommission}`} color="#D4AF37" icon={TrendingUp} />
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center space-y-6 bg-white rounded-[3rem] shadow-sm border border-slate-100">
          <div className="w-16 h-16 border-8 border-[#D4AF37] border-t-transparent rounded-full animate-spin shadow-xl" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Synchronizing Data Streams...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'jobs' && (
            <div className="grid grid-cols-1 gap-6">
              {bookings.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-200">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><Clock className="w-12 h-12 text-slate-200" /></div>
                  <h3 className="text-2xl font-black text-[#101C2C] uppercase tracking-tighter italic">Queue is Empty</h3>
                  <p className="text-slate-400 font-medium mx-auto mt-4 leading-relaxed">Incoming customer service requests from Karachi will automatically populate your queue here.</p>
                </div>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <div className="p-8 space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Identity #{booking.id.split('-')[1]}</span>
                          </div>
                          <StatusBadge status={booking.status} />
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Assigned On</p>
                          <p className="text-sm font-black text-[#101C2C] uppercase tracking-tighter italic">{new Date(booking.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                          <h4 className="text-3xl font-black text-[#101C2C] uppercase tracking-tighter italic leading-none">{booking.serviceName}</h4>
                          <div className="flex items-center space-x-3 mt-4">
                            <div className="w-3 h-3 bg-[#087F5B] rounded-full animate-pulse" />
                            <p className="text-[10px] text-[#087F5B] font-black uppercase tracking-[0.2em]">Live Platform Request • Verified Location</p>
                          </div>
                        </div>
                        {booking.servicePrice && (
                          <div className="bg-[#101C2C] text-[#D4AF37] p-6 rounded-[2rem] border border-[#D4AF37]/30 shadow-xl shadow-gray-200 min-w-[200px]">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Service Value</p>
                            <p className="text-3xl font-black italic">PKR {booking.servicePrice.toLocaleString()}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-lg text-blue-600 shadow-sm">{booking.customerName.charAt(0)}</div>
                            <div>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Customer</p>
                              <p className="text-sm font-black text-[#101C2C] uppercase tracking-tight">{booking.customerName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 pl-16">
                            <Phone className="w-4 h-4 text-[#087F5B]" />
                            <p className="text-sm font-bold text-slate-600 tracking-[0.2em]">{booking.customerMobile}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-red-500 shadow-sm shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Service Address</p>
                            <p className="text-xs text-slate-700 font-bold leading-relaxed">{booking.customerAddress}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4 border-t border-slate-50">
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => setSelectedChatBooking(booking)}
                            className="flex items-center space-x-3 px-8 py-4 rounded-2xl bg-white border-2 border-slate-100 text-[#101C2C] font-black text-[10px] uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all group shadow-sm"
                          >
                            <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span>Client Direct Messaging</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          {booking.status === 'assigned' && (
                            <>
                              <button onClick={() => handleUpdateStatus(booking.id, 'rejected')} disabled={!!actionLoading} className="px-8 py-4 rounded-2xl bg-white border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">Decline Job</button>
                              <button onClick={() => handleUpdateStatus(booking.id, 'in_progress')} disabled={!!actionLoading} className="px-12 py-4 rounded-2xl bg-[#101C2C] text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-gray-300 hover:scale-105 active:scale-95 transition-all">Accept Assignment</button>
                            </>
                          )}
                          {booking.status === 'in_progress' && (
                            <>
                              <button onClick={() => handleUpdateStatus(booking.id, 'on_the_way')} disabled={!!actionLoading} className="px-8 py-4 rounded-2xl bg-[#D4AF37] text-[#101C2C] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#D4AF37]/20 hover:scale-105 transition-all">Dispatching Now</button>
                              <button onClick={() => handleUpdateStatus(booking.id, 'completed')} disabled={!!actionLoading} className="px-12 py-4 rounded-2xl bg-[#087F5B] text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">Finalize Job</button>
                            </>
                          )}
                          {booking.status === 'on_the_way' && (
                            <button onClick={() => handleUpdateStatus(booking.id, 'completed')} disabled={!!actionLoading} className="w-full lg:w-auto px-16 py-4 rounded-2xl bg-[#087F5B] text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:scale-105 transition-all">Complete Service</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div>
                  <h3 className="text-2xl font-black text-[#101C2C] uppercase tracking-tighter italic">Product Inventory</h3>
                  <p className="text-sm text-slate-500 font-medium">Manage items available for purchase at your centers</p>
                </div>
                <button 
                  onClick={() => setShowAddProduct(true)}
                  className="px-8 py-4 rounded-full bg-[#087F5B] text-white flex items-center space-x-3 shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">New Product Entry</span>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-200">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><Package className="w-12 h-12 text-slate-200" /></div>
                  <h3 className="text-2xl font-black text-[#101C2C] uppercase tracking-tighter italic">No Products Listed</h3>
                  <p className="text-slate-400 font-medium mx-auto mt-4 leading-relaxed">Add spare parts, accessories or equipment to increase your platform revenue.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map(product => (
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
                          <span className={`text-[8px] font-black uppercase tracking-widest ${product.stockStatus === 'in_stock' ? 'text-[#087F5B]' : 'text-red-500'}`}>
                            {product.stockStatus === 'in_stock' ? 'Available' : 'Out of Stock'}
                          </span>
                        </div>
                        <h5 className="text-lg font-black text-[#101C2C] uppercase tracking-tight italic line-clamp-1">{product.name}</h5>
                        <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{product.description}</p>
                        <div className="flex items-center gap-2 pt-2">
                          <button className="flex-1 py-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center space-x-2">
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Edit</span>
                          </button>
                          <button className="w-12 h-12 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'commissions' && (
            <div className="space-y-8 animate-fade-in pb-12">
              <div className="bg-[#101C2C] text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden border border-[#D4AF37]/20">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 blur-3xl -mr-32 -mt-32 rounded-full" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-12">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]"><DollarSign className="w-5 h-5" /><span>Revenue Audit Ledger</span></div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Financial <br />Performance</h3>
                    <div className="flex flex-wrap gap-4">
                      <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] min-w-[200px]">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] mb-3">Gross Revenue</p>
                        <p className="text-3xl font-black text-white italic">PKR {commissions.filter(c => c.status === 'due').reduce((acc, c) => acc + c.totalAmount, 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] min-w-[200px]">
                        <p className="text-[9px] text-red-400 font-black uppercase tracking-[0.3em] mb-3">Platform Fees</p>
                        <p className="text-3xl font-black text-red-400 italic">PKR {stats.dueCommission.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-end">
                    <p className="text-[10px] text-[#087F5B] font-black uppercase tracking-[0.3em] mb-2">Net Settled Earnings</p>
                    <p className="text-6xl font-black text-white italic leading-none">PKR {stats.paidCommission.toLocaleString()}</p>
                    <div className="mt-6 flex items-center justify-end space-x-3">
                      <div className="w-3 h-3 bg-[#087F5B] rounded-full" />
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Verified Payouts Only</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h4 className="text-lg font-black text-[#101C2C] uppercase tracking-tighter italic">Recent Settlements</h4>
                  <button className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest hover:underline">Download Statement</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Transaction</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Invoice Value</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Commission Fee</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {commissions.map(comm => (
                        <tr key={comm.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <p className="text-xs font-black text-[#101C2C] uppercase tracking-tight italic">Consignment #{comm.bookingId.split('-')[1]}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{new Date(comm.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          </td>
                          <td className="px-8 py-6 text-right font-black text-sm text-[#101C2C] italic">PKR {comm.totalAmount.toLocaleString()}</td>
                          <td className="px-8 py-6 text-right">
                            <p className="text-sm font-black text-red-600">PKR {comm.commissionAmount.toLocaleString()}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{comm.commissionPercentage}% Plat. Fee</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              comm.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}>{comm.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shadow-inner"><Shield className="w-8 h-8" /></div>
                  <div>
                    <h4 className="text-xl font-black text-[#101C2C] uppercase tracking-tighter italic">Settlement Portal</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Verified by Karachi HQ Security Protocol</p>
                  </div>
                </div>
                <button className="px-12 py-5 rounded-2xl bg-[#101C2C] text-white text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-gray-200 hover:scale-105 active:scale-95 transition-all">Initiate Withdrawal</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal Overlay */}
      {showAddProduct && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-[#101C2C] p-8 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Product Registration</h3>
                <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mt-1">List a new item in your inventory</p>
              </div>
              <button onClick={() => setShowAddProduct(false)} className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input 
                    type="text" 
                    required
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="e.g. Copper Wire Reel" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-[#101C2C] focus:bg-white focus:ring-2 focus:ring-[#D4AF37] outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Retail Price (PKR)</label>
                  <input 
                    type="number" 
                    required
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="2500" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-[#101C2C] focus:bg-white focus:ring-2 focus:ring-[#D4AF37] outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  required
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-[#101C2C] focus:bg-white focus:ring-2 focus:ring-[#D4AF37] outline-none"
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Description</label>
                <textarea 
                  required
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Describe your product features and usage..." 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-[#101C2C] h-32 focus:bg-white focus:ring-2 focus:ring-[#D4AF37] outline-none resize-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL (Optional)</label>
                <div className="relative">
                  <ImageIcon className="w-5 h-5 text-slate-400 absolute left-6 top-4" />
                  <input 
                    type="url" 
                    value={newProduct.image}
                    onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                    placeholder="https://images.unsplash.com/..." 
                    className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-[#101C2C] focus:bg-white focus:ring-2 focus:ring-[#D4AF37] outline-none" 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={actionLoading === 'add-product'}
                className="w-full py-5 rounded-2xl bg-[#101C2C] text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-gray-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-4"
              >
                {actionLoading === 'add-product' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /><span>Register Product</span></>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Status Popups */}
      {statusPopup.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center space-y-6 animate-scale-in border border-slate-100">
            <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl ${
              statusPopup.type === 'success' ? 'bg-[#087F5B] text-white' : 'bg-red-500 text-white'
            }`}>
              {statusPopup.type === 'success' ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[#101C2C] uppercase tracking-tighter italic">
                {statusPopup.type === 'success' ? 'Protocol Verified' : 'Status Modified'}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {statusPopup.type === 'success' 
                  ? 'The assignment has been successfully completed. Commission audit log has been updated.'
                  : 'The assignment protocol has been modified according to your input.'}
              </p>
            </div>
            <button 
              onClick={() => setStatusPopup({ ...statusPopup, show: false })}
              className="w-full py-5 rounded-2xl bg-[#101C2C] text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition-all"
            >
              Acknowledge Entry
            </button>
          </div>
        </div>
      )}

      {/* Chat Modal Integration */}
      {selectedChatBooking && (
        <ChatModal 
          booking={selectedChatBooking} 
          onClose={() => setSelectedChatBooking(null)} 
        />
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, color: string, icon: any }> = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 hover:shadow-xl transition-all group">
    <div className="flex items-center justify-between">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
      <Icon className="w-5 h-5 text-slate-200 group-hover:text-[#D4AF37] transition-colors" />
    </div>
    <div className="text-2xl font-black italic tracking-tighter" style={{ color }}>{value}</div>
  </div>
);

const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
    const styles = {
        pending: 'bg-slate-100 text-slate-600',
        confirmed: 'bg-blue-100 text-blue-700',
        assigned: 'bg-amber-100 text-amber-700',
        in_progress: 'bg-indigo-100 text-indigo-700',
        on_the_way: 'bg-[#D4AF37]/10 text-[#D4AF37]',
        completed: 'bg-[#087F5B]/10 text-[#087F5B]',
        cancelled: 'bg-red-100 text-red-600',
        rejected: 'bg-red-100 text-red-600'
    };
    return (
        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${styles[status] || 'bg-slate-100 text-slate-500'}`}>
            {status.replace('_', ' ')}
        </span>
    );
};
