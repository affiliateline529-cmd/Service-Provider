import React, { useState, useEffect } from 'react';
import {
  X, Star, MapPin, Phone, MessageSquare, Heart, Clock,
  ShieldCheck, Share2, Store, Home, CheckCircle2, ChevronRight,
  Sparkles, AlertCircle, Edit, Trash2, Copy, Check, ExternalLink,
  Send, Mail, Smartphone, Globe, Calendar, Zap, Shield
} from 'lucide-react';
import { Business, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { ReviewModal } from './ReviewModal';

interface BusinessDetailsModalProps {
  businessId: string;
  onClose: () => void;
  onUpdateBusiness?: (business: Business) => void;
  onBook: (business: Business) => void;
}

export const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({
  businessId,
  onClose,
  onUpdateBusiness,
  onBook
}) => {
  const { currentUser, isFavorite, toggleFavorite, isAdmin } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchBusinessDetails();
  }, [businessId]);

  const fetchBusinessDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setBusiness(data.data);
        setReviews(data.data.reviews || []);
        if (onUpdateBusiness) onUpdateBusiness(data.data);
      }
    } catch (err) {
      console.error('Error fetching business details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = (savedReview: Review) => {
    fetchBusinessDetails();
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        fetchBusinessDetails();
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  if (loading && !business) {
    return (
      <div className="fixed inset-0 z-50 bg-[#101C2C]/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 relative">
             <div className="absolute inset-0 border-4 border-[#D4AF37]/20 rounded-full" />
             <div className="absolute inset-0 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">Accessing Elite Profile...</p>
        </div>
      </div>
    );
  }

  if (!business) return null;

  const deepLink = `${window.location.origin}${window.location.pathname}?biz=${business.id}`;
  const shareTitle = `${business.businessName} - ${business.category} in ${business.karachiArea}, Karachi`;
  const shareText = `Check out ${business.businessName} (${business.category}) in ${business.karachiArea}, Karachi on the Service Provider catalogue! ⭐ ${business.rating > 0 ? business.rating : 'New'} rating.`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(deepLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const favorite = isFavorite(business.id);
  const photos = business.photos && business.photos.length > 0 ? business.photos : [business.logo];

  return (
    <div className="fixed inset-0 z-50 bg-[#101C2C]/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#F3F4F6] w-full max-w-2xl min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:rounded-[48px] shadow-2xl relative flex flex-col overflow-hidden my-auto border border-[#D4AF37]/20">
        
        {/* Luxury Top Header Bar */}
        <div className="sticky top-0 z-20 bg-[#101C2C]/95 backdrop-blur-md px-6 py-4 border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#101C2C] p-[1px] shrink-0">
               <div className="w-full h-full bg-[#101C2C] rounded-[7px] flex items-center justify-center font-black text-[10px] text-[#D4AF37]">{business.businessName.charAt(0)}</div>
            </div>
            <div className="truncate">
                <span className="text-sm font-black text-white uppercase tracking-tighter italic truncate block">{business.businessName}</span>
                <div className="flex items-center space-x-2 mt-0.5">
                   <span className="w-1.5 h-1.5 bg-[#087F5B] rounded-full" />
                   <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest shrink-0">{business.karachiArea} • VERIFIED</span>
                </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button onClick={() => setShowShareModal(true)} className="p-2.5 rounded-xl bg-white/5 text-[#D4AF37] hover:bg-white/10 transition active:scale-95"><Share2 className="w-4.5 h-4.5" /></button>
            <button onClick={() => toggleFavorite(business.id)} className={`p-2.5 rounded-xl transition active:scale-95 ${favorite ? 'text-red-500 bg-red-500/10' : 'text-gray-400 bg-white/5'}`}><Heart className={`w-4.5 h-4.5 ${favorite ? 'fill-current' : ''}`} /></button>
            <button onClick={onClose} className="p-2.5 rounded-full bg-white/10 text-white hover:bg-red-50 transition ml-2"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pb-24">
          
          {/* Elite Photo Gallery */}
          <div className="relative h-72 sm:h-80 group">
            <img src={photos[selectedPhotoIndex] || business.logo} alt={business.businessName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101C2C] via-transparent to-[#101C2C]/40" />
            
            {/* Gallery Navigation Controls */}
            {photos.length > 1 && (
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-10 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  {photos.map((_, i) => (
                    <button key={i} onClick={() => setSelectedPhotoIndex(i)} className={`h-1.5 rounded-full transition-all duration-300 ${selectedPhotoIndex === i ? 'w-6 bg-[#D4AF37]' : 'w-1.5 bg-white/50'}`} />
                  ))}
               </div>
            )}

            {/* Float Badge */}
            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center space-x-2">
                   {business.businessType === 'shop' ? <Store className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Home className="w-3.5 h-3.5 text-[#087F5B]" />}
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">{business.businessType.replace('_', ' ')}</span>
                </div>
                {(business.isPremium || business.isSponsored) && (
                    <div className="bg-[#D4AF37] px-3 py-1.5 rounded-xl shadow-2xl flex items-center space-x-2 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-[#101C2C]" />
                        <span className="text-[10px] font-black text-[#101C2C] uppercase tracking-widest italic">Signature Partner</span>
                    </div>
                )}
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none">
                <div className="flex items-end space-x-4">
                    <img src={business.logo || photos[0]} alt="" className="w-20 h-20 rounded-3xl border-4 border-[#101C2C] object-cover bg-white shadow-2xl" />
                    <div className="pb-1 space-y-1">
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none">{business.businessName}</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Curated by {business.ownerName}</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            
            {/* Performance Ledger */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Satisfaction Score</span>
                        <div className="flex text-amber-400"><Star className="w-3 h-3 fill-current" /></div>
                    </div>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-black text-[#101C2C]">{business.rating || 'New'}</span>
                        <span className="text-[10px] font-bold text-gray-400">/ 5.0</span>
                    </div>
                    <p className="text-[9px] font-bold text-[#087F5B] uppercase">{business.reviewCount} Verified Responses</p>
                </div>
                <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Global Status</span>
                        <div className="w-2 h-2 bg-[#087F5B] rounded-full animate-pulse" />
                    </div>
                    <div className="text-2xl font-black text-[#101C2C] uppercase tracking-tighter italic">Active</div>
                    <div className="flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                        <span className="text-[9px] font-bold text-[#D4AF37] uppercase">Official Marketplace</span>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                   <div className="h-px flex-1 bg-gray-200" />
                   <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Business Profile</h2>
                   <div className="h-px flex-1 bg-gray-200" />
                </div>
                <div className="bg-[#101C2C] p-7 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl -mr-16 -mt-16" />
                    <p className="text-sm text-gray-300 font-medium leading-relaxed italic relative z-10">"{business.description}"</p>
                    <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-white/5 relative z-10">
                        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <Zap className="w-3 h-3 text-[#D4AF37]" />
                            <span className="text-[9px] font-black text-[#D4AF37] uppercase">{business.category}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            <span>Available {business.openingHours}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location & Contact Ledger */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ContactTile icon={MapPin} label="Karachi Hub" value={business.fullAddress} area={business.karachiArea} color="#ef4444" />
                <ContactTile icon={Phone} label="Verified Line" value={business.mobile} detail="Encrypted Direct Dial" color="#087F5B" />
            </div>

            {/* Signature Offerings */}
            {business.servicesOffered && (
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-[#101C2C] uppercase tracking-[0.2em] flex items-center space-x-3">
                        <span>Signature Solutions</span>
                        <div className="h-px flex-1 bg-gray-100" />
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {business.servicesOffered.map((srv, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group hover:border-[#D4AF37] transition-all">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-colors">
                                        <CheckCircle2 className="w-4 h-4 text-[#087F5B] group-hover:text-[#D4AF37]" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">{srv}</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#D4AF37]" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Client Testimonials */}
            <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black text-[#101C2C] uppercase tracking-tighter italic">Client Testimonials</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{reviews.length} Verified Submissions</p>
                    </div>
                    <button onClick={() => setShowReviewModal(true)} className="px-5 py-2.5 rounded-xl bg-[#101C2C] text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-[#D4AF37]/20 transition-all">Review Hub</button>
                 </div>

                 {reviews.length === 0 ? (
                    <div className="p-12 text-center rounded-[40px] bg-white border border-dashed border-gray-200">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300"><MessageSquare className="w-6 h-6" /></div>
                        <p className="text-xs text-gray-400 font-medium">No testimonials recorded yet.</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                        {reviews.map(rev => (
                            <div key={rev.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4 animate-slide-up">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#101C2C] flex items-center justify-center font-black text-white text-xs shadow-xl">{rev.customerName.charAt(0)}</div>
                                        <div>
                                            <div className="text-xs font-black text-[#101C2C] uppercase tracking-tight italic">{rev.customerName}</div>
                                            <div className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">{new Date(rev.createdAt).toLocaleDateString()} • Verified Guest</div>
                                        </div>
                                    </div>
                                    <div className="flex text-amber-400">{Array.from({length: 5}).map((_,i) => <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-100'}`} />)}</div>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed font-medium italic">"{rev.comment}"</p>
                                {isAdmin && <button onClick={() => handleDeleteReview(rev.id)} className="text-red-500 text-[10px] font-black uppercase tracking-widest pt-2 flex items-center space-x-1.5"><Trash2 className="w-3.5 h-3.5" /><span>Moderate Submission</span></button>}
                            </div>
                        ))}
                    </div>
                 )}
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-5 flex items-center gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <button 
                onClick={() => setShowShareModal(true)} 
                className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-[#101C2C] hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all active:scale-95 group shrink-0"
            >
                <Share2 className="w-6 h-6 group-hover:scale-110 transition" />
            </button>
            <button 
                onClick={() => onBook(business)} 
                className="flex-1 h-14 bg-[#101C2C] text-[#D4AF37] rounded-2xl flex items-center justify-center space-x-3 shadow-2xl hover:shadow-[#D4AF37]/30 transition-all active:scale-95 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Calendar className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-[0.2em] italic">Reserve Signature Service</span>
            </button>
        </div>

      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-60 bg-[#101C2C]/90 backdrop-blur-lg flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="bg-[#F3F4F6] w-full max-w-md rounded-t-[48px] sm:rounded-[40px] p-8 space-y-8 animate-in slide-in-from-bottom border border-[#D4AF37]/20">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-[#D4AF37]">
                            <Share2 className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Direct Dispatch</span>
                        </div>
                        <h3 className="text-xl font-black text-[#101C2C] uppercase tracking-tighter italic leading-none">Share Profile Link</h3>
                    </div>
                    <button onClick={() => setShowShareModal(false)} className="p-3 rounded-full bg-white text-gray-400 hover:text-[#101C2C] shadow-sm"><X className="w-5 h-5" /></button>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl space-y-6">
                    <div className="flex items-center space-x-4">
                        <img src={business.logo || photos[0]} alt="" className="w-14 h-14 rounded-2xl object-cover border border-gray-50 shadow-inner" />
                        <div>
                            <div className="text-sm font-black text-[#101C2C] uppercase tracking-tight italic">{business.businessName}</div>
                            <div className="text-[10px] text-[#087F5B] font-bold uppercase tracking-widest">{business.karachiArea} • Signature Selection</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-gray-50 px-4 py-3.5 rounded-2xl border border-gray-100 group">
                            <span className="text-[10px] font-mono text-gray-400 truncate max-w-[200px]">{deepLink}</span>
                            <button onClick={handleCopyLink} className="flex items-center space-x-2 text-[#101C2C] hover:text-[#D4AF37] transition">
                                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span className="text-[10px] font-black uppercase tracking-widest">{copiedLink ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                        {copiedLink && <p className="text-[9px] font-black text-[#087F5B] uppercase tracking-widest text-center animate-pulse">Encoded Link Copied to System Clipboard</p>}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <ShareIcon icon={MessageSquare} label="WhatsApp" color="#087F5B" href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n👉 ${deepLink}`)}`} />
                    <ShareIcon icon={Globe} label="Facebook" color="#1877F2" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(deepLink)}`} />
                    <ShareIcon icon={Mail} label="Email" color="#D4AF37" href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + "\n\n" + deepLink)}`} />
                    <ShareIcon icon={Smartphone} label="SMS" color="#101C2C" href={`sms:?body=${encodeURIComponent(shareText + " " + deepLink)}`} />
                </div>

                <button onClick={() => setShowShareModal(false)} className="w-full py-4 rounded-2xl bg-white border border-gray-200 text-[#101C2C] font-black text-xs uppercase tracking-widest active:scale-95 transition">Cancel</button>
            </div>
        </div>
      )}

      {showReviewModal && (
        <ReviewModal
          business={business}
          existingReview={reviews.find(r => (currentUser && r.customerId === currentUser.id))}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

const ContactTile: React.FC<{ icon: any, label: string, value: string, detail?: string, area?: string, color: string }> = ({ icon: Icon, label, value, detail, area, color }) => (
  <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex items-start space-x-4">
    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0" style={{ color }}><Icon className="w-5 h-5" /></div>
    <div className="min-w-0">
        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</div>
        <div className="text-xs font-black text-[#101C2C] uppercase tracking-tight mt-0.5 truncate">{value}</div>
        {area && <div className="text-[10px] font-bold text-[#087F5B] uppercase mt-0.5">{area} District</div>}
        {detail && <div className="text-[10px] font-bold text-gray-400 mt-0.5 italic">{detail}</div>}
    </div>
  </div>
);

const ShareIcon: React.FC<{ icon: any, label: string, color: string, href: string }> = ({ icon: Icon, label, color, href }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-2 group">
    <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center border border-gray-100 group-hover:-translate-y-1 group-hover:shadow-xl transition-all" style={{ color }}>
      <Icon className="w-6 h-6" />
    </div>
    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
  </a>
);
