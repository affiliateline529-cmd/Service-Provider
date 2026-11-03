import React, { useState } from 'react';
import { 
  X, Search, Calendar, CheckCircle2, Clock, 
  MapPin, User, AlertCircle, RefreshCw, Smartphone, Shield, MessageSquare, Zap, ChevronRight
} from 'lucide-react';
import { Booking } from '../types';
import { ChatModal } from './ChatModal';

interface BookingTrackerModalProps {
  onClose: () => void;
}

export const BookingTrackerModal: React.FC<BookingTrackerModalProps> = ({ onClose }) => {
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId.trim()) return;

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId.trim().toUpperCase()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setBooking(data.data);
      } else {
        setError(data.message || 'Reference ID not found. Verify your entry.');
      }
    } catch (err) {
      setError('Connection failure. Karachi Node unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-[#101C2C]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#F3F4F6] w-full max-w-md rounded-[40px] shadow-2xl relative flex flex-col overflow-hidden my-auto border border-[#D4AF37]/20">
        
        {/* Luxury Header */}
        <div className="bg-[#101C2C] p-6 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#101C2C] p-0.5">
                <div className="w-full h-full bg-[#101C2C] rounded-[14px] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#D4AF37]" />
                </div>
            </div>
            <div>
                <h2 className="text-white font-black uppercase tracking-tighter italic text-sm">Order Intelligence</h2>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Karachi Dispatch Tracker</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-white/5 text-gray-400 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          
          {/* Tracking Form */}
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Universal Tracking ID</label>
                <div className="flex gap-2">
                    <input
                      type="text"
                      value={bookingId}
                      onChange={e => setBookingId(e.target.value.toUpperCase())}
                      placeholder="BK-XXXXXXXX"
                      required
                      className="flex-1 text-sm px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 font-mono font-black text-[#101C2C] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] uppercase placeholder:text-gray-300 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-14 h-14 rounded-2xl bg-[#101C2C] flex items-center justify-center text-[#D4AF37] shadow-xl hover:shadow-[#D4AF37]/20 transition-all active:scale-90 disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
                    </button>
                </div>
                {!booking && !error && <p className="text-[9px] text-gray-400 font-medium italic text-center">Verify the status of your Karachi service request in real-time.</p>}
            </div>
          </form>Form

          {error && (
            <div className="p-5 rounded-3xl bg-red-50 border border-red-100 text-red-700 text-xs flex items-center space-x-3 animate-in shake-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-bold uppercase tracking-tight">{error}</span>
            </div>
          )}

          {booking && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* Status Command Card */}
              <div className="bg-[#101C2C] rounded-[40px] p-7 shadow-2xl relative overflow-hidden border border-[#D4AF37]/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                
                <div className="relative z-10 flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Current Protocol</div>
                        <div className="flex items-center space-x-2">
                             <div className="w-2 h-2 bg-[#087F5B] rounded-full animate-pulse shadow-[0_0_8px_#087F5B]" />
                             <h3 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none">{booking.status.replace('_', ' ')}</h3>
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Reference</div>
                        <div className="text-xs font-mono font-black text-white">#{booking.id.split('-')[1]}</div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-1">
                        <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Assigned Specialist</div>
                        <div className="text-xs font-black text-[#D4AF37] uppercase tracking-tight">{booking.providerName || 'Pending HQ Sync'}</div>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Service Profile</div>
                        <div className="text-xs font-black text-white uppercase truncate">{booking.serviceName}</div>
                    </div>
                </div>

                {/* Chat Call-to-Action */}
                {booking.providerId && (
                   <button 
                     onClick={() => setShowChat(true)}
                     className="mt-6 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center space-x-3 hover:bg-white/10 transition group"
                   >
                       <MessageSquare className="w-4 h-4 text-[#D4AF37] group-hover:animate-bounce" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Open Secure Channel</span>
                   </button>
                )}
              </div>

              {/* High-Fidelity Timeline */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                   <div className="h-px flex-1 bg-gray-200" />
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Lifecycle Timeline</h4>
                   <div className="h-px flex-1 bg-gray-200" />
                </div>
                
                <div className="space-y-8 relative">
                    <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-100" />

                    {[
                        { status: 'pending', label: 'Manifest Created', desc: 'Order received at Karachi HQ Console' },
                        { status: 'confirmed', label: 'Order Verified', desc: 'Payment eligibility & availability confirmed' },
                        { status: 'assigned', label: 'Technician Dispatched', desc: 'Specialist is en-route to your location' },
                        { status: 'completed', label: 'Service Finalized', desc: 'Verification of work and payment closure' }
                    ].map((step, idx) => {
                        const statusFlow = ['pending', 'confirmed', 'assigned', 'on_the_way', 'in_progress', 'completed'];
                        const currentIdx = statusFlow.indexOf(booking.status === 'on_the_way' || booking.status === 'in_progress' ? 'assigned' : booking.status);
                        const stepIdx = statusFlow.indexOf(step.status);
                        
                        const isDone = currentIdx >= stepIdx;
                        const isCurrent = booking.status === step.status || (step.status === 'assigned' && (booking.status === 'on_the_way' || booking.status === 'in_progress'));

                        if (booking.status === 'rejected' && step.status === 'confirmed') return null;
                        if (booking.status === 'cancelled' && step.status === 'assigned') return null;

                        return (
                            <div key={idx} className={`flex items-start space-x-6 relative z-10 transition-all duration-500 ${isDone ? 'opacity-100' : 'opacity-30 translate-x-2'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                    isCurrent ? 'bg-[#101C2C] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110' :
                                    isDone ? 'bg-[#087F5B] border-[#087F5B] text-white' :
                                    'bg-white border-gray-200 text-gray-300'
                                }`}>
                                    {isDone && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'animate-pulse bg-[#D4AF37]' : 'bg-current'}`} />}
                                </div>
                                <div className="space-y-1">
                                    <div className={`text-xs font-black uppercase tracking-tight italic ${isCurrent ? 'text-[#101C2C]' : 'text-gray-800'}`}>{step.label}</div>
                                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
              </div>

              {/* Service Assurance */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center space-x-4">
                 <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 flex items-center justify-center text-[#087F5B] shadow-inner"><Zap className="w-6 h-6" /></div>
                 <div>
                    <div className="text-[10px] font-black text-[#101C2C] uppercase tracking-widest">Guaranteed Completion</div>
                    <p className="text-[9px] text-gray-400 font-medium mt-0.5">Your signature service is backed by platform insurance.</p>
                 </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
            <button onClick={onClose} className="px-8 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-[#101C2C] font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition active:scale-95">Exit Terminal</button>
        </div>

        {/* Chat Modal Integration */}
        {showChat && booking && (
            <ChatModal 
              booking={booking} 
              onClose={() => setShowChat(false)} 
            />
        )}
      </div>
    </div>
  );
};
