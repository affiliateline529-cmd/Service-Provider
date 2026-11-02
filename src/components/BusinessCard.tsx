import React from 'react';
import {
  Star, MapPin, Phone, MessageSquare, Heart, ShieldCheck,
  Sparkles, CheckCircle2, ChevronRight, Store, Home
} from 'lucide-react';
import { Business } from '../types';
import { useAuth } from '../context/AuthContext';

interface BusinessCardProps {
  business: Business;
  onSelect: (business: Business) => void;
  onContact: (business: Business) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onSelect,
  onContact
}) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const favorite = isFavorite(business.id);

  // Default thumbnail
  const thumbnail = business.photos && business.photos.length > 0
    ? business.photos[0]
    : business.logo || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(business.id);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContact(business);
  };

  const cleanWaNumber = (business.whatsappNumber || business.mobile).replace(/\D/g, '');
  const waUrl = `https://wa.me/92${cleanWaNumber.startsWith('0') ? cleanWaNumber.substring(1) : cleanWaNumber}?text=${encodeURIComponent(`Assalam-o-Alaikum, I found your business "${business.businessName}" on the Karachi Service Provider catalogue. I would like to inquire about your services.`)}`;

  return (
    <div
      onClick={() => onSelect(business)}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between ${
        business.isPremium
          ? 'border-amber-400/80 ring-1 ring-amber-400/40 bg-gradient-to-b from-amber-50/20 to-white'
          : business.isSponsored
          ? 'border-blue-400/70 ring-1 ring-blue-400/30'
          : business.isFeatured
          ? 'border-emerald-300'
          : 'border-slate-200 hover:border-blue-300'
      }`}
    >
      {/* Top Banner for Sponsored / Featured / Verified */}
      {(business.isPremium || business.isSponsored || business.isFeatured) && (
        <div className="flex items-center justify-between px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-semibold tracking-wide">
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {business.isPremium ? 'PREMIUM KARACHI VERIFIED' : business.isSponsored ? 'SPONSORED AD' : 'FEATURED LISTING'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-100">Recommended</span>
        </div>
      )}

      {/* Card Header & Visual Media */}
      <div className="relative">
        <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
          <img
            src={thumbnail}
            alt={business.businessName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Business Type Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
            <span className="inline-flex items-center space-x-1 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full font-medium">
              {business.businessType === 'shop' ? (
                <>
                  <Store className="w-3 h-3 text-blue-300" />
                  <span>Physical Shop</span>
                </>
              ) : (
                <>
                  <Home className="w-3 h-3 text-emerald-300" />
                  <span>Home-Based Provider</span>
                </>
              )}
            </span>
          </div>

          {/* Favorite Toggle Button */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition shadow-sm ${
              favorite
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 hover:bg-white text-slate-700'
            }`}
            title={favorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
          </button>

          {/* Logo Avatar overlaid on lower-left of banner */}
          <div className="absolute -bottom-4 left-3.5 flex items-end space-x-2">
            <img
              src={business.logo || thumbnail}
              alt={business.businessName}
              className="w-12 h-12 rounded-xl border-2 border-white object-cover bg-white shadow-md"
            />
          </div>

          {/* Area Tag overlaid on lower-right */}
          <div className="absolute bottom-2 right-3">
            <span className="inline-flex items-center space-x-1 bg-emerald-700/90 backdrop-blur-md text-emerald-100 text-xs px-2.5 py-0.5 rounded-full font-medium">
              <MapPin className="w-3 h-3 text-emerald-300 shrink-0" />
              <span>{business.karachiArea}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 pt-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Status */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              {business.category}
            </span>
            <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">Verified in Karachi</span>
            </div>
          </div>

          {/* Business Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition line-clamp-1 leading-snug">
            {business.businessName}
          </h3>

          {/* Star Rating & Review Count */}
          <div className="flex items-center space-x-2 mt-1.5 mb-2">
            <div className="flex items-center space-x-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200/80">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span className="text-xs font-bold">{business.rating > 0 ? business.rating : 'New'}</span>
            </div>
            <span className="text-xs text-slate-500">
              {business.reviewCount > 0
                ? `(${business.reviewCount} customer reviews)`
                : '(No reviews yet)'}
            </span>
          </div>

          {/* Short Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {business.description}
          </p>

          {/* Services Offered Badges */}
          {business.servicesOffered && business.servicesOffered.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {business.servicesOffered.slice(0, 3).map((srv, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 truncate max-w-[140px]"
                >
                  ✓ {srv}
                </span>
              ))}
              {business.servicesOffered.length > 3 && (
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                  +{business.servicesOffered.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: Contact & View Details */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 mt-auto">
          <button
            onClick={handleContactClick}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contact</span>
          </button>

          <button
            onClick={() => onSelect(business)}
            className="flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition border border-blue-200 active:scale-95"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
