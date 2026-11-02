import React, { useState } from 'react';
import {
  Phone, MessageSquare, Copy, Check, X, MapPin, Clock,
  ShieldCheck, Share2
} from 'lucide-react';
import { Business } from '../types';

interface ContactActionModalProps {
  business: Business | null;
  onClose: () => void;
}

export const ContactActionModal: React.FC<ContactActionModalProps> = ({
  business,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!business) return null;

  const cleanMobile = business.mobile.replace(/\D/g, '');
  const cleanWaNumber = (business.whatsappNumber || business.mobile).replace(/\D/g, '');
  const waUrl = `https://wa.me/92${cleanWaNumber.startsWith('0') ? cleanWaNumber.substring(1) : cleanWaNumber}?text=${encodeURIComponent(`Assalam-o-Alaikum, I saw your listing "${business.businessName}" on Karachi Service Provider app. I would like to inquire about your services in ${business.karachiArea}.`)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(business.mobile);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative transform transition-all">
        {/* Android pull handle */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5 pr-6">
          <img
            src={business.logo || (business.photos && business.photos[0])}
            alt={business.businessName}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {business.businessName}
              </h3>
            </div>
            <p className="text-xs text-blue-700 font-medium">{business.category}</p>
            <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{business.karachiArea}, Karachi</span>
            </div>
          </div>
        </div>

        {/* Quick Information Cards */}
        <div className="bg-slate-50 rounded-2xl p-3.5 mb-5 space-y-2 border border-slate-100 text-xs">
          <div className="flex items-center space-x-2 text-slate-700">
            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="font-semibold text-slate-800">Hours:</span>
            <span>{business.openingHours}</span>
          </div>
          <div className="flex items-start space-x-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Address: </span>
              <span>{business.fullAddress}</span>
            </div>
          </div>
        </div>

        {/* Direct Action CTAs */}
        <div className="space-y-3">
          {/* Call Now Button */}
          <a
            href={`tel:${business.mobile}`}
            className="w-full flex items-center justify-center space-x-2.5 py-3.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition active:scale-[0.98]"
          >
            <Phone className="w-4 h-4" />
            <span>Call Now ({business.mobile})</span>
          </a>

          {/* WhatsApp Direct Chat */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center space-x-2.5 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition active:scale-[0.98]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>

          {/* Copy Number */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Number Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Phone Number</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-400 mt-4">
          ✓ Verified Karachi service provider • No intermediary commission fees
        </p>
      </div>
    </div>
  );
};
