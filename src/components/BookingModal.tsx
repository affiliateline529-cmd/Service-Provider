import React, { useState } from 'react';
import { 
  X, Calendar, MapPin, Phone, User, Mail, 
  CheckCircle2, Clock, ShieldCheck, CreditCard,
  ArrowRight, Sparkles, Shield
} from 'lucide-react';
import { Business, Booking } from '../types';
import { useAuth } from '../context/AuthContext';

interface BookingModalProps {
  business: Business;
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ 
  business, 
  onClose, 
  onSuccess 
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Booking | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerMobile, setCustomerMobile] = useState(currentUser?.mobile || '');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [serviceName, setServiceName] = useState(business.servicesOffered[0] || 'General Service');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName || !customerMobile || !customerAddress || !serviceName) {
      setError('Please provide all necessary details for your premium booking.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          businessName: business.businessName,
          customerId: currentUser?.id,
          customerName: customerName.trim(),
          customerMobile: customerMobile.trim(),
          customerAddress: customerAddress.trim(),
          customerEmail: customerEmail.trim(),
          serviceName
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSuccess(data.data);
        onSuccess(data.data);
      } else {
        setError(data.message || 'The booking request could not be processed.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('Connection to the elite marketplace server failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[70] bg-[#101C2C]/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white w-full max-w-md rounded-[40px] p-10 text-center shadow-2xl space-y-8 relative overflow-hidden">
          {/* Success Decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#D4AF37] via-[#087F5B] to-[#D4AF37]" />
          
          <div className="w-24 h-24 bg-[#087F5B]/10 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-[#087F5B]" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-[#101C2C] uppercase tracking-tighter italic">Reservation Confirmed</h3>
            <p className="text-xs text-slate-500 font-medium px-4 leading-relaxed">
              Your elite service request has been transmitted to <span className="font-black text-[#101C2C]">{business.businessName}</span>.
            </p>
          </div>
          
          <div className="bg-[#F3F4F6] rounded-[32px] p-6 text-left space-y-4 border border-slate-200 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Digital Token:</span>
              <span className="text-xs font-mono font-black text-[#101C2C] bg-white px-3 py-1 rounded-lg border border-slate-100">{success.id.split('-')[1]}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-4">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Signature Service:</span>
              <span className="text-xs font-black text-[#087F5B] uppercase italic">{success.serviceName}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-4">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Platform Status:</span>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-[#101C2C] uppercase tracking-widest italic">{success.status}</span>
              </div>
            </div>
          </div>

          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Our concierge will contact you within {business.openingHours ? 'working hours' : '30 minutes'} for final deployment.
          </p>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-[#101C2C] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#101C2C]/20 transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Finish</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative flex flex-col overflow-hidden my-auto max-h-[95vh] border border-white/5">
        
        {/* Premium Header */}
        <div className="px-8 py-6 bg-[#101C2C] flex items-center justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl -mr-16 -mt-16 rounded-full" />
          
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#f1d37a] p-[1px]">
              <div className="w-full h-full bg-[#101C2C] rounded-[15px] flex items-center justify-center">
                <Calendar className="w-7 h-7 text-[#D4AF37]" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <h2 className="text-white font-black uppercase tracking-tighter italic text-base leading-none">Premium Booking</h2>
              <p className="text-[10px] text-[#087F5B] font-black uppercase tracking-widest mt-1 italic truncate max-w-[180px]">
                {business.businessName}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-white rounded-2xl bg-white/5 transition z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 no-scrollbar">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-200/20 text-red-600 text-xs font-bold flex items-center space-x-3">
              <X className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Service Excellence Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-[10px] font-black text-[#101C2C] uppercase tracking-[0.2em] italic">Service Selection</h3>
              </div>
              
              <div className="relative group">
                <select
                  value={serviceName}
                  onChange={e => setServiceName(e.target.value)}
                  className="w-full bg-[#F3F4F6] border-2 border-transparent rounded-[24px] px-6 py-4 text-sm font-black text-[#101C2C] focus:outline-hidden focus:border-[#D4AF37] focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  {business.servicesOffered.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ArrowRight className="w-4 h-4 text-[#D4AF37] rotate-90" />
                </div>
              </div>
            </div>

            {/* Profile Credentials */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-[#087F5B]" />
                <h3 className="text-[10px] font-black text-[#101C2C] uppercase tracking-[0.2em] italic">Client Credentials</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-5 top-4.5" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="w-full bg-[#F3F4F6] border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#101C2C] focus:outline-hidden focus:border-[#D4AF37] transition placeholder:text-slate-400"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-5 top-4.5" />
                  <input
                    type="tel"
                    value={customerMobile}
                    onChange={e => setCustomerMobile(e.target.value)}
                    placeholder="Mobile Contact"
                    required
                    className="w-full bg-[#F3F4F6] border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#101C2C] focus:outline-hidden focus:border-[#D4AF37] transition placeholder:text-slate-400"
                  />
                </div>
              </div>
              
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-5 top-4.5" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="Official Email (Optional)"
                  className="w-full bg-[#F3F4F6] border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#101C2C] focus:outline-hidden focus:border-[#D4AF37] transition placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Deployment Logistics */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <h3 className="text-[10px] font-black text-[#101C2C] uppercase tracking-[0.2em] italic">Deployment Logistics</h3>
              </div>
              
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-5 top-4.5" />
                <textarea
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  placeholder="Karachi Deployment Address (House, Block, Area...)"
                  required
                  rows={2}
                  className="w-full bg-[#F3F4F6] border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#101C2C] focus:outline-hidden focus:border-[#D4AF37] transition placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>

            {/* Financial Terms */}
            <div className="bg-[#087F5B]/5 rounded-[32px] p-6 border border-[#087F5B]/10 flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-[#087F5B]" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black text-[#101C2C] uppercase tracking-tight italic">Premium Settlement Mode</span>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                  Cash on Delivery protocol active. No advance payment required for Karachi Elite deployment.
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Global Footer Actions */}
        <div className="px-8 py-8 border-t border-slate-100 bg-[#F3F4F6]/50 flex flex-col sm:flex-row gap-4 safe-area-bottom">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-white transition active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="booking-form"
            disabled={loading}
            className="flex-[1.5] py-4 rounded-2xl bg-[#101C2C] text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#101C2C]/20 transition-all hover:bg-black disabled:opacity-50 flex items-center justify-center space-x-3 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Clock className="w-4.5 h-4.5 animate-spin text-[#D4AF37]" />
                <span>Processing Request...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4.5 h-4.5 text-[#D4AF37]" />
                <span>Initiate Reservation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
