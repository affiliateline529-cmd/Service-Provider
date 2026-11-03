import React from 'react';
import {
  Star, MapPin, Phone, MessageSquare, Heart, ShieldCheck,
  Sparkles, CheckCircle2, ChevronRight, Store, Home, Calendar,
  Shield
} from 'lucide-react';
import { Business } from '../types';
import { useAuth } from '../context/AuthContext';

interface BusinessCardProps {
  business: Business;
  onSelect: (business: Business) => void;
  onBook: (business: Business) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onSelect,
  onBook
}) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const favorite = isFavorite(business.id);

  const thumbnail = business.photos && business.photos.length > 0
    ? business.photos[0]
    : business.logo || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(business.id);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBook(business);
  };

  return (
    <div
      onClick={() => onSelect(business)}
      className="group relative bg-white rounded-[32px] border border-slate-100 transition-all duration-500 overflow-hidden luxury-shadow hover:-translate-y-2 hover:shadow-2xl cursor-pointer flex flex-col"
    >
      {/* Visual Header */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={thumbnail}
          alt={business.businessName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101C2C] via-[#101C2C]/20 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black text-white uppercase tracking-widest flex items-center space-x-1">
              {business.businessType === 'shop' ? <Store className="w-3 h-3 text-[#D4AF37]" /> : <Home className="w-3 h-3 text-[#087F5B]" />}
              <span>{business.businessType === 'shop' ? 'Physical' : 'Mobile'}</span>
            </span>
            {business.isPremium && (
              <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-[#101C2C] text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#D4AF37]/20 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Premium</span>
              </span>
            )}
          </div>
          
          <button
            onClick={handleFavoriteClick}
            className={`p-2.5 rounded-2xl backdrop-blur-md transition-all duration-300 ${
              favorite
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-110'
                : 'bg-white/20 hover:bg-white/40 text-white border border-white/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Metadata Overlays */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={business.logo || thumbnail}
              alt=""
              className="w-10 h-10 rounded-xl border-2 border-white object-cover bg-white shadow-lg"
            />
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1 text-[#D4AF37]">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-black uppercase tracking-tighter">{business.rating > 0 ? business.rating : 'Elite'}</span>
              </div>
              <div className="flex items-center space-x-1 text-white/90">
                <MapPin className="w-2.5 h-2.5 text-[#087F5B]" />
                <span className="text-[9px] font-bold uppercase tracking-widest">{business.karachiArea}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#087F5B] uppercase tracking-[0.2em] italic">{business.category}</span>
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
              <Shield className="w-3 h-3 text-[#101C2C]" />
              <span className="text-[8px] font-black text-[#101C2C] uppercase tracking-widest">Verified</span>
            </div>
          </div>
          
          <h3 className="text-base font-black text-[#101C2C] uppercase tracking-tighter italic leading-tight group-hover:text-[#087F5B] transition-colors">
            {business.businessName}
          </h3>
          
          <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
            {business.description}
          </p>
        </div>

        {/* Elite CTA Buttons */}
        <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
          <button
            onClick={handleBookClick}
            className="flex items-center justify-center space-x-2 py-3 rounded-2xl bg-[#101C2C] text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-[#101C2C]/10"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Book Now</span>
          </button>
          
          <button
            onClick={() => onSelect(business)}
            className="flex items-center justify-center space-x-1 py-3 rounded-2xl bg-white border border-slate-100 text-[#101C2C] text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 group/btn"
          >
            <span>Explore</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#087F5B] group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
