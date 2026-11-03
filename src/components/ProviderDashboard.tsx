import React, { useState, useEffect } from 'react';
import { 
  X, Briefcase, Clock, CheckCircle2, AlertCircle, 
  DollarSign, Wallet, Calendar, User, MapPin, 
  Phone, ChevronRight, RefreshCw, Check, MessageSquare, Shield, Zap, Star, XCircle
} from 'lucide-react';
import { Booking, CommissionRecord, BookingStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { ChatModal } from './ChatModal';

interface ProviderDashboardProps {
  onClose: () => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'commissions'>('jobs');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modals & Popups
  const [selectedChatBooking, setSelectedChatBooking] = useState<Booking | null>(null);
  const [statusPopup, setStatusPopup] = useState<{ type: 'success' | 'busy' | 'rejected', show: boolean }>({ type: 'success', show: false });

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
      } else {
        const res = await fetch(`/api/provider/commissions/${currentUser.id}`);
        const data = await res.json();
        if (data.success) setCommissions(data.data);
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
        
        // Show relevant popup (Section 17 requirement)
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

  const stats = {
    pending: bookings.filter(b => b.status === 'assigned').length,
    active: bookings.filter(b => b.status === 'in_progress' || b.status === 'on_the_way').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    dueCommission: commissions.filter(c => c.status === 'due').reduce((acc, c) => acc + (c.commissionAmount - c.paidAmount), 0),
    paidCommission: commissions.reduce((acc, c) => acc + c.paidAmount, 0)
  };

  const packageBadge = currentUser?.activePackageId ? (
    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
      <Zap className="w-3 h-3 text-[#D4AF37]" />
      <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">{currentUser.activePackageId} Package</span>
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 bg-[#101C2C]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#F3F4F6] w-full max-w-5xl h-[92vh] rounded-[40px] shadow-2xl relative flex flex-col overflow-hidden border border-[#D4AF37]/20">
        
        {/* Luxury Header */}
        <div className="bg-[#101C2C] p-6 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#101C2C] p-0.5 shadow-lg">
                <div className="w-full h-full bg-[#101C2C] rounded-[14px] flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-[#D4AF37]" />
                </div>
            </div>
            <div>
              <h2 className="text-white font-black uppercase tracking-tighter italic text-lg leading-tight">Partner Terminal</h2>
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Job Control Center</p>
                {packageBadge}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-white/5 text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white px-6 flex items-center space-x-1 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'jobs', label: 'Assigned Jobs', icon: Briefcase, count: stats.pending + stats.active },
            { id: 'commissions', label: 'Financials', icon: Wallet }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative py-4 px-6 flex items-center space-x-2.5 transition-all group ${
                activeTab === tab.id ? 'text-[#101C2C]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#D4AF37]' : ''}`} />
              <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
              {(tab as any).count > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[8px] font-black">{tab.count}</span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100/50 p-6 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Active Requests" value={stats.pending} color="#101C2C" />
            <StatCard label="In Progress" value={stats.active} color="#087F5B" />
            <StatCard label="Commission Due" value={`PKR ${stats.dueCommission.toLocaleString()}`} color="#ef4444" />
            <StatCard label="Life-Time Earnings" value={`PKR ${(stats.paidCommission + stats.dueCommission).toLocaleString()}`} color="#D4AF37" />
          </div>

          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing Job Ledger...</p>
             </div>
          ) : (
            <>
              {activeTab === 'jobs' && (
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-gray-200">
                      <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-6"><Clock className="w-10 h-10 text-gray-200" /></div>
                      <h3 className="text-xl font-black text-[#101C2C] uppercase tracking-tight italic">No Assignments Found</h3>
                      <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto mt-2">New service requests from Karachi customers will appear here automatically.</p>
                    </div>
                  ) : (
                    bookings.map(booking => (
                      <div key={booking.id} className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-shadow duration-300">
                        <div className="p-6 space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-[10px] font-mono font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase tracking-tighter">JOB #{booking.id.split('-')[1]}</span>
                              <StatusBadge status={booking.status} />
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Service Date</div>
                              <div className="text-[11px] font-black text-[#101C2C] uppercase">{new Date(booking.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xl font-black text-[#101C2C] uppercase tracking-tight italic">{booking.serviceName}</h4>
                            <p className="text-[10px] text-[#087F5B] font-bold uppercase tracking-[0.2em] mt-1">Platform Request • Verified Address</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-3xl border border-gray-100">
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-[10px] text-blue-600 shadow-sm">{booking.customerName.charAt(0)}</div>
                                <span className="text-xs font-black text-[#101C2C] uppercase tracking-tight">{booking.customerName}</span>
                              </div>
                              <div className="flex items-center space-x-3 pl-11">
                                <Phone className="w-3.5 h-3.5 text-[#087F5B]" />
                                <span className="text-xs font-bold text-gray-600 tracking-widest">{booking.customerMobile}</span>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-1" />
                                <span className="text-xs text-gray-700 font-bold leading-relaxed">{booking.customerAddress}</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                             <div className="flex items-center space-x-4">
                                {booking.servicePrice && (
                                    <div className="bg-[#101C2C] text-[#D4AF37] px-4 py-2 rounded-xl border border-[#D4AF37]/30">
                                        <div className="text-[8px] font-black uppercase opacity-60">Job Value</div>
                                        <div className="text-sm font-black">PKR {booking.servicePrice.toLocaleString()}</div>
                                    </div>
                                )}
                                <button 
                                  onClick={() => setSelectedChatBooking(booking)}
                                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border-2 border-gray-100 text-[#101C2C] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all group"
                                >
                                    <MessageSquare className="w-4 h-4 group-hover:animate-bounce" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Private Chat</span>
                                </button>
                             </div>

                             <div className="flex items-center gap-2 w-full sm:w-auto">
                                {booking.status === 'assigned' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(booking.id, 'rejected')} disabled={!!actionLoading} className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-white border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition">Decline</button>
                                        <button onClick={() => handleUpdateStatus(booking.id, 'in_progress')} disabled={!!actionLoading} className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-[#101C2C] text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition shadow-xl shadow-gray-200">Accept Job</button>
                                    </>
                                )}
                                {booking.status === 'in_progress' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(booking.id, 'on_the_way')} disabled={!!actionLoading} className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#D4AF37] text-[#101C2C] text-[10px] font-black uppercase tracking-widest shadow-lg">On The Way</button>
                                        <button onClick={() => handleUpdateStatus(booking.id, 'completed')} disabled={!!actionLoading} className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-[#087F5B] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#087F5B]/20">Finish Job</button>
                                    </>
                                )}
                                {booking.status === 'on_the_way' && (
                                    <button onClick={() => handleUpdateStatus(booking.id, 'completed')} disabled={!!actionLoading} className="w-full sm:w-auto px-10 py-3 rounded-xl bg-[#087F5B] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#087F5B]/20">Mark as Completed</button>
                                )}
                             </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'commissions' && (
                <div className="space-y-6">
                  {/* Financial Overview Card */}
                  <div className="bg-[#101C2C] text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden border border-[#D4AF37]/20">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 blur-3xl -mr-32 -mt-32 rounded-full" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]"><DollarSign className="w-4 h-4" /><span>Earnings Report</span></div>
                            <h3 className="text-3xl font-black uppercase tracking-tight italic leading-tight">Income Ledger</h3>
                            <div className="flex gap-4">
                                <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
                                    <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Weekly Volume</div>
                                    <div className="text-xl font-black text-white">PKR {commissions.filter(c => c.status === 'due').reduce((acc, c) => acc + c.totalAmount, 0).toLocaleString()}</div>
                                </div>
                                <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
                                    <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Platform Fee</div>
                                    <div className="text-xl font-black text-red-400">PKR {stats.dueCommission.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex flex-col justify-end">
                            <div className="text-[10px] text-[#087F5B] font-black uppercase tracking-[0.2em]">Net Withdrawable</div>
                            <div className="text-5xl font-black text-white italic">PKR {stats.paidCommission.toLocaleString()}</div>
                            <p className="text-[9px] text-gray-500 font-bold uppercase mt-2">Verified Settlements Only</p>
                        </div>
                    </div>
                  </div>

                  {/* Ledger Table */}
                  <div className="bg-white rounded-[32px] border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Details</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Value</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Fee</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {commissions.map(comm => (
                                    <tr key={comm.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-5">
                                            <div className="text-xs font-black text-[#101C2C] uppercase tracking-tight italic">Service Job #{comm.bookingId.split('-')[1]}</div>
                                            <div className="text-[9px] text-gray-400 font-bold mt-0.5">{new Date(comm.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-xs text-[#101C2C]">PKR {comm.totalAmount.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="text-xs font-black text-red-600">PKR {comm.commissionAmount.toLocaleString()}</div>
                                            <div className="text-[8px] text-gray-400 font-bold uppercase">{comm.commissionPercentage}% Rate</div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                                comm.status === 'paid' ? 'bg-[#087F5B]/10 text-[#087F5B]' : 'bg-red-50 text-red-600'
                                            }`}>{comm.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-inner flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]"><Shield className="w-7 h-7" /></div>
                        <div>
                            <h4 className="text-sm font-black text-[#101C2C] uppercase tracking-tight">Security Deposit & Wallet</h4>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">Managed by Karachi HQ</p>
                        </div>
                    </div>
                    <button className="px-8 py-3.5 rounded-xl bg-[#101C2C] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-200 hover:scale-105 transition-transform">Withdraw Funds</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Global Footer Navigation Overlay (Optional but nice for quick close) */}
        <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
            <button onClick={onClose} className="px-8 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#101C2C] text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition">Close Console</button>
        </div>

        {/* Section 17 Status Popups */}
        {statusPopup.show && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center space-y-6 animate-scale-in">
                    <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center mx-auto shadow-xl ${
                        statusPopup.type === 'success' ? 'bg-[#087F5B] text-white' : 'bg-red-500 text-white'
                    }`}>
                        {statusPopup.type === 'success' ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-[#101C2C] uppercase tracking-tight italic">
                            {statusPopup.type === 'success' ? 'Job Completed' : 'Status Updated'}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            {statusPopup.type === 'success' 
                                ? 'The job has been successfully marked as completed. Commission has been debited.'
                                : 'The job status has been updated according to your selection.'}
                        </p>
                    </div>
                    <button 
                      onClick={() => setStatusPopup({ ...statusPopup, show: false })}
                      className="w-full py-4 rounded-2xl bg-[#101C2C] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition"
                    >
                        Acknowledge
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
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, color: string }> = ({ label, value, color }) => (
  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
    <div className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">{label}</div>
    <div className="text-xl font-black italic tracking-tighter" style={{ color }}>{value}</div>
  </div>
);

const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
    const styles = {
        pending: 'bg-gray-100 text-gray-600',
        confirmed: 'bg-blue-100 text-blue-700',
        assigned: 'bg-amber-100 text-amber-700',
        in_progress: 'bg-indigo-100 text-indigo-700',
        on_the_way: 'bg-[#D4AF37]/10 text-[#D4AF37]',
        completed: 'bg-[#087F5B]/10 text-[#087F5B]',
        cancelled: 'bg-red-100 text-red-600',
        rejected: 'bg-red-100 text-red-600'
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
            {status.replace('_', ' ')}
        </span>
    );
};
