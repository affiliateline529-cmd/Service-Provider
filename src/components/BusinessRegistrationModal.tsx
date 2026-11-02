import React, { useState } from 'react';
import {
  X, Store, Home, Shield, CheckCircle2, AlertCircle, Upload,
  Image as ImageIcon, MapPin, Clock, Phone, Mail, User, Layers
} from 'lucide-react';
import { KARACHI_CATEGORIES } from '../data/categories';
import { KARACHI_AREAS } from '../data/karachiAreas';
import { Business } from '../types';

interface BusinessRegistrationModalProps {
  onClose: () => void;
  onRegistered: (business: Business) => void;
}

// Preset photo options for quick Karachi business storefronts
const PRESET_STORE_PHOTOS = [
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80'
];

export const BusinessRegistrationModal: React.FC<BusinessRegistrationModalProps> = ({
  onClose,
  onRegistered
}) => {
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState(KARACHI_CATEGORIES[0].name);
  const [businessType, setBusinessType] = useState<'shop' | 'home_based'>('shop');
  const [description, setDescription] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [karachiArea, setKarachiArea] = useState(KARACHI_AREAS[0].name);
  const [openingHours, setOpeningHours] = useState('09:00 AM - 09:00 PM (Mon-Sat)');
  const [servicesInput, setServicesInput] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [photoUrl, setPhotoUrl] = useState(PRESET_STORE_PHOTOS[0]);
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<Business | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ownerName.trim() || !businessName.trim() || !mobile.trim() || !fullAddress.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);

    try {
      const servicesArray = servicesInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName: ownerName.trim(),
          businessName: businessName.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          password,
          category,
          businessType,
          description: description.trim(),
          fullAddress: fullAddress.trim(),
          karachiArea,
          openingHours,
          servicesOffered: servicesArray.length > 0 ? servicesArray : ['General Service', 'Emergency Repairs'],
          photos: [photoUrl],
          logo: logoUrl,
          whatsappNumber: whatsappNumber.trim() || mobile.trim()
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSuccessData(data.data);
        onRegistered(data.data);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error registering business');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Karachi Business & Service Registration
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Register Your Business / Shop
            </h2>
            <p className="text-xs text-slate-500">
              Join thousands of Karachi customers looking for verified services every day.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {successData ? (
          <div className="py-8 px-4 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Registration Submitted Successfully!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                Thank you, <strong>{successData.ownerName}</strong>! Your listing for{' '}
                <strong>{successData.businessName}</strong> in <strong>{successData.karachiArea}</strong>{' '}
                has been recorded.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex items-center space-x-2 text-amber-800 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Pending Administrator Approval</span>
              </div>
              <p className="text-amber-700 leading-relaxed text-[11px]">
                To maintain high quality and prevent fraudulent listings in Karachi, all new businesses are verified by our administrator team before going live on the public catalogue. You can preview or approve this instantly in the Admin Panel.
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs shadow-md transition"
            >
              Done & Return to Catalogue
            </button>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 space-y-5 pt-3">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Notice about Pending status */}
            <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200/70 text-xs text-blue-900 flex items-start space-x-2.5">
              <Shield className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Standard Karachi Verification: </span>
                New business profiles remain in <span className="underline font-bold">Pending status</span> until approved by the administrator. Free listing with zero commission!
              </div>
            </div>

            {/* Business Type Selector (Physical Shop vs Home-based) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Business Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBusinessType('shop')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border text-xs font-bold transition ${
                    businessType === 'shop'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Store className="w-4 h-4 text-blue-600" />
                  <span>Physical Shop / Storefront</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBusinessType('home_based')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border text-xs font-bold transition ${
                    businessType === 'home_based'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Home className="w-4 h-4 text-emerald-600" />
                  <span>Home-Based Service Provider</span>
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Owner / Representative Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="e.g. Ustad Tariq Mehmood"
                    required
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business / Shop Name *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. Al-Madina Electric & UPS Solutions"
                    required
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Category & Karachi Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {KARACHI_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Karachi Area / Neighborhood *
                </label>
                <select
                  value={karachiArea}
                  onChange={e => setKarachiArea(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {KARACHI_AREAS.map(a => (
                    <option key={a.name} value={a.name}>
                      {a.name} ({a.district} District)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (Call) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="0300-1234567"
                    required
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder="03001234567"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="owner@gmail.com"
                    required
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Choose a password for managing your Karachi business listing"
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Full Street Address & Opening Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Complete Business Address *
                </label>
                <input
                  type="text"
                  value={fullAddress}
                  onChange={e => setFullAddress(e.target.value)}
                  placeholder="e.g. Shop # 14, Block 13-D/1, Main Disco Bakery Road, Gulshan"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Opening Hours *
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={e => setOpeningHours(e.target.value)}
                  placeholder="e.g. 09:00 AM - 10:00 PM (Daily)"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Services Offered */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Services Offered (Separated by commas) *
              </label>
              <input
                type="text"
                value={servicesInput}
                onChange={e => setServicesInput(e.target.value)}
                placeholder="e.g. House Wiring, UPS Inverter Setup, Emergency Faults, Ceiling Fan Repair"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Enter multiple services separated by commas. These will be searchable by customers.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Description & Experience *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Tell Karachi customers about your business, experience, guarantees, and why they should choose you..."
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Photos & Logo Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Business Cover Photo (Choose or provide URL)
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-2">
                {PRESET_STORE_PHOTOS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoUrl(url)}
                    className={`h-12 rounded-xl overflow-hidden border-2 transition ${
                      photoUrl === url ? 'border-blue-600 scale-105' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="Or paste custom image URL"
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            {/* Form Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-emerald-700 hover:from-blue-800 hover:to-emerald-800 text-white text-xs font-bold shadow-md transition disabled:opacity-50 active:scale-95"
              >
                {loading ? 'Submitting Registration...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
