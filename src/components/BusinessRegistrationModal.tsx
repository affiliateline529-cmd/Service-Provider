import React, { useState } from 'react';
import {
  X, Store, Home, Shield, CheckCircle2, AlertCircle, Upload,
  Image as ImageIcon, MapPin, Clock, Phone, Mail, User, Layers,
  Sparkles, Check, ArrowRight, Wallet, Info, Camera
} from 'lucide-react';
import { KARACHI_CATEGORIES } from '../data/categories';
import { KARACHI_AREAS } from '../data/karachiAreas';
import { Business, RegistrationPackage } from '../types';
import { useAuth } from '../context/AuthContext';

interface BusinessRegistrationModalProps {
  onClose: () => void;
  onRegistered: (business: Business) => void;
}

const REGISTRATION_PACKAGES: RegistrationPackage[] = [
  {
    id: 'basic',
    name: 'Basic Registration',
    pricePKR: 500,
    maxShops: 3,
    features: ['One-time registration fee', 'Maximum 3 shops', 'Basic shop profile', 'Verified Tag'],
    description: 'Perfect for small local shops'
  },
  {
    id: 'premium',
    name: 'Premium Elite',
    pricePKR: 3000,
    maxShops: 10,
    features: ['No registration fee', 'Maximum 10 shops', 'Premium listing design', 'Booking management', 'Elite Support'],
    description: 'Grow your business with superior visibility'
  },
  {
    id: 'golden',
    name: 'Golden Partnership',
    pricePKR: 10000,
    maxShops: -1,
    features: ['No registration fee', 'Unlimited shops', 'Golden profile badge', 'All Premium features', 'Priority Ranking'],
    description: 'Unlimited access for large enterprises'
  }
];

export const BusinessRegistrationModal: React.FC<BusinessRegistrationModalProps> = ({
  onClose,
  onRegistered
}) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState<'package' | 'payment' | 'details' | 'success'>('package');
  
  // Registration State
  const [selectedPackage, setSelectedPackage] = useState<RegistrationPackage>(REGISTRATION_PACKAGES[0]);
  const [transactionId, setTransactionId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('https://images.unsplash.com/photo-1554224155-1696413575b9?auto=format&fit=crop&w=400&q=80');

  // Business Details State
  const [ownerName, setOwnerName] = useState(currentUser?.name || '');
  const [businessName, setBusinessName] = useState('');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [category, setCategory] = useState(KARACHI_CATEGORIES[0].name);
  const [businessType, setBusinessType] = useState<'shop' | 'home_based'>('shop');
  const [description, setDescription] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [karachiArea, setKarachiArea] = useState(KARACHI_AREAS[0].name);
  const [openingHours, setOpeningHours] = useState('09:00 AM - 09:00 PM');
  const [servicesInput, setServicesInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<Business | null>(null);

  const handleNextStep = () => {
    if (step === 'package') setStep('payment');
    else if (step === 'payment') {
      if (!transactionId.trim()) {
        setError('Please enter your Easypaisa Transaction ID.');
        return;
      }
      setStep('details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const servicesArray = servicesInput.split(',').map(s => s.trim()).filter(Boolean);

      // 1. Submit Payment Request first
      const payRes = await fetch('/api/payments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          packageId: selectedPackage.id,
          transactionId: transactionId.trim(),
          screenshotUrl
        })
      });

      // 2. Submit Business Details
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: currentUser?.id,
          ownerName: ownerName.trim(),
          businessName: businessName.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          category,
          businessType,
          description: description.trim(),
          fullAddress: fullAddress.trim(),
          karachiArea,
          openingHours,
          servicesOffered: servicesArray,
          photos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'],
          logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessData(data.data);
        setStep('success');
        onRegistered(data.data);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError('Registration sequence failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#101C2C]/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl min-h-screen sm:min-h-0 sm:rounded-[48px] shadow-2xl relative flex flex-col my-auto overflow-hidden">
        
        {/* Luxury Header */}
        <div className="bg-[#101C2C] p-8 flex items-center justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl -mr-16 -mt-16 rounded-full" />
          
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#f1d37a] p-[1px]">
              <div className="w-full h-full bg-[#101C2C] rounded-[15px] flex items-center justify-center">
                <Store className="w-7 h-7 text-[#D4AF37]" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <h2 className="text-white font-black uppercase tracking-tighter italic text-base leading-none text-left">Partner Onboarding</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic text-left">
                Step {step === 'package' ? '1' : step === 'payment' ? '2' : step === 'details' ? '3' : '4'} of 4
              </p>
            </div>
          </div>
          
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-white rounded-2xl bg-white/5 transition z-10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-black uppercase tracking-widest flex items-center space-x-3">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: PACKAGE SELECTION */}
          {step === 'package' && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-[#101C2C] uppercase tracking-tighter italic">Select Your Tier</h3>
                <p className="text-xs text-slate-500 font-medium">Choose a registration package that fits your business scale.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {REGISTRATION_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative p-6 rounded-[32px] border-2 transition-all text-left group ${
                      selectedPackage.id === pkg.id 
                        ? 'bg-[#101C2C] border-[#D4AF37] shadow-2xl -translate-y-1' 
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-base font-black uppercase italic tracking-tighter ${selectedPackage.id === pkg.id ? 'text-[#D4AF37]' : 'text-[#101C2C]'}`}>{pkg.name}</h4>
                          {pkg.id === 'golden' && <Sparkles className="w-4 h-4 text-[#D4AF37]" />}
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPackage.id === pkg.id ? 'text-slate-400' : 'text-slate-500'}`}>{pkg.description}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-black ${selectedPackage.id === pkg.id ? 'text-white' : 'text-[#101C2C]'}`}>PKR {pkg.pricePKR.toLocaleString()}</div>
                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Initial Investment</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-2">
                      {pkg.features.map((feat, i) => (
                        <div key={i} className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedPackage.id === pkg.id ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-500'}`}>
                          <Check className="w-2.5 h-2.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {selectedPackage.id === pkg.id && (
                      <div className="absolute top-4 right-4 animate-fade-in">
                        <div className="w-6 h-6 rounded-full bg-[#087F5B] flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-4 rounded-2xl bg-[#101C2C] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#101C2C]/20 transition-all flex items-center justify-center space-x-2 active:scale-95"
              >
                <span>Initialize Payment</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>
          )}

          {/* STEP 2: PAYMENT VERIFICATION */}
          {step === 'payment' && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-[#101C2C] uppercase tracking-tighter italic">Easypaisa Settlement</h3>
                <p className="text-xs text-slate-500 font-medium">Please transfer PKR <span className="font-black text-[#101C2C]">{selectedPackage.pricePKR.toLocaleString()}</span> to the address below.</p>
              </div>

              <div className="bg-[#101C2C] p-8 rounded-[40px] text-center space-y-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#087F5B]/10 blur-3xl -mr-16 -mt-16 rounded-full" />
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-2">
                  <Wallet className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Receiver Account</div>
                  <div className="text-2xl font-black text-[#D4AF37] tracking-tighter">0345-1234567</div>
                  <div className="text-xs font-black text-white uppercase tracking-widest mt-1 italic">Karachi Service Provider HQ</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <h3 className="text-[10px] font-black text-[#101C2C] uppercase tracking-[0.2em] italic">Transaction Audit</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      placeholder="Easypaisa Transaction ID (e.g. 148293048)"
                      required
                      className="w-full bg-[#F3F4F6] border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#101C2C] focus:outline-hidden focus:border-[#D4AF37] transition placeholder:text-slate-400"
                    />
                  </div>
                  
                  <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 border-dashed flex flex-col items-center space-y-4 cursor-pointer hover:bg-slate-100 transition">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Camera className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-[#101C2C] uppercase tracking-widest">Upload Payment Screenshot</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Proof of Settlement Required</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button onClick={() => setStep('package')} className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest">Back</button>
                <button
                  onClick={handleNextStep}
                  className="flex-[2] py-4 rounded-2xl bg-[#101C2C] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#101C2C]/20 transition-all flex items-center justify-center space-x-2 active:scale-95"
                >
                  <span>Verify Payment</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BUSINESS DETAILS */}
          {step === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-[#101C2C] uppercase tracking-tighter italic">Establish Your Listing</h3>
                <p className="text-xs text-slate-500 font-medium">Finalize your profile details for the Karachi catalogue.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-[#087F5B]" />
                  <h3 className="text-[10px] font-black text-[#101C2C] uppercase tracking-[0.2em] italic">Owner Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="Owner Name"
                    required
                    className="w-full bg-[#F3F4F6] border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#101C2C] focus:outline-hidden focus:border-[#D4AF37]"
                  />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="Official Mobile"
                    required
                    className="w-full bg-[#F3F4F6] border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#101C2C] focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Store className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-[10px] font-black text-[#101C2C] uppercase tracking-[0.2em] italic">Business Identity</h3>
                </div>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="Official Business / Shop Name"
                  required
                  className="w-full bg-[#F3F4F6] border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#101C2C] focus:outline-hidden focus:border-[#D4AF37]"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#F3F4F6] border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-[#101C2C]"
                  >
                    {KARACHI_CATEGORIES.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                  <select
                    value={karachiArea}
                    onChange={e => setKarachiArea(e.target.value)}
                    className="w-full bg-[#F3F4F6] border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-[#101C2C]"
                  >
                    {KARACHI_AREAS.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <h3 className="text-[10px] font-black text-[#101C2C] uppercase tracking-[0.2em] italic">Scope of Services</h3>
                </div>
                <input
                  type="text"
                  value={servicesInput}
                  onChange={e => setServicesInput(e.target.value)}
                  placeholder="e.g. AC Maintenance, Repair, Installation (Separated by comma)"
                  required
                  className="w-full bg-[#F3F4F6] border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#101C2C] focus:outline-hidden focus:border-[#D4AF37]"
                />
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Marketplace Description & Credentials..."
                  required
                  rows={3}
                  className="w-full bg-[#F3F4F6] border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#101C2C] focus:outline-hidden focus:border-[#D4AF37] resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <button type="button" onClick={() => setStep('payment')} className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest">Back</button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 rounded-2xl bg-[#087F5B] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#087F5B]/20 transition-all flex items-center justify-center space-x-2 active:scale-95"
                >
                  {loading ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Complete Onboarding</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && successData && (
            <div className="py-12 px-4 text-center space-y-8 animate-fade-in">
              <div className="w-24 h-24 bg-[#087F5B]/10 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-[#087F5B]" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-[#101C2C] uppercase tracking-tighter italic">Membership Initiated</h3>
                <p className="text-xs text-slate-500 font-medium px-8 leading-relaxed">
                  Welcome to the elite tier, <span className="font-black text-[#101C2C]">{successData.ownerName}</span>. Your application for <span className="font-black text-[#101C2C]">{successData.businessName}</span> is now being reviewed by our concierge team.
                </p>
              </div>

              <div className="bg-[#101C2C] rounded-[40px] p-8 text-left space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Verification Status</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Payment Status:</span>
                    <span className="text-[10px] font-black uppercase italic text-[#D4AF37]">Verifying Funds</span>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Catalogue Status:</span>
                    <span className="text-[10px] font-black uppercase italic text-blue-400">Queueing Profile</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-[#101C2C] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#101C2C]/20 transition active:scale-95"
              >
                Enter Partner Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
