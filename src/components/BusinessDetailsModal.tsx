import React, { useState, useEffect } from 'react';
import {
  X, Star, MapPin, Phone, MessageSquare, Heart, Clock,
  ShieldCheck, Share2, Store, Home, CheckCircle2, ChevronRight,
  Sparkles, AlertCircle, Edit, Trash2
} from 'lucide-react';
import { Business, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { ReviewModal } from './ReviewModal';

interface BusinessDetailsModalProps {
  businessId: string;
  onClose: () => void;
  onUpdateBusiness?: (business: Business) => void;
}

export const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({
  businessId,
  onClose,
  onUpdateBusiness
}) => {
  const { currentUser, isFavorite, toggleFavorite, isAdmin } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

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
    // Refresh details to get updated ratings & review count
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

  const handleShare = () => {
    if (navigator.share && business) {
      navigator.share({
        title: `${business.businessName} - Karachi`,
        text: `Check out ${business.businessName} in ${business.karachiArea}, Karachi on Service Provider catalogue!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  if (loading && !business) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Loading Karachi Business Profile...</p>
        </div>
      </div>
    );
  }

  if (!business) return null;

  const favorite = isFavorite(business.id);
  const cleanMobile = business.mobile.replace(/\D/g, '');
  const cleanWaNumber = (business.whatsappNumber || business.mobile).replace(/\D/g, '');
  const waUrl = `https://wa.me/92${cleanWaNumber.startsWith('0') ? cleanWaNumber.substring(1) : cleanWaNumber}?text=${encodeURIComponent(`Assalam-o-Alaikum, I found "${business.businessName}" on the Karachi Service Provider catalogue. I would like to inquire about your services in ${business.karachiArea}.`)}`;

  // Find if current user already reviewed this business
  const myExistingReview = reviews.find(
    r => (currentUser && r.customerId === currentUser.id) || (currentUser && r.customerEmail === currentUser.email)
  );

  const photos = business.photos && business.photos.length > 0 ? business.photos : [business.logo];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden my-auto">
        {/* Top Header Bar inside modal */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-xs font-bold text-blue-900 truncate">
              {business.businessName}
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full shrink-0">
              {business.karachiArea}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition"
              title="Share Listing"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Favorite */}
            <button
              onClick={() => toggleFavorite(business.id)}
              className={`p-2 rounded-full transition ${
                favorite ? 'text-rose-500 bg-rose-50' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Save to Favorites"
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {shareSuccess && (
          <div className="bg-emerald-600 text-white text-xs py-1 px-4 text-center font-medium animate-in fade-in">
            ✓ Link copied to clipboard!
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Main Photo Gallery */}
          <div className="relative bg-slate-900 h-64 sm:h-72">
            <img
              src={photos[selectedPhotoIndex] || business.logo}
              alt={business.businessName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Badges on Gallery */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className="bg-black/70 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center space-x-1">
                {business.businessType === 'shop' ? (
                  <>
                    <Store className="w-3.5 h-3.5 text-blue-300" />
                    <span>Physical Shop in Karachi</span>
                  </>
                ) : (
                  <>
                    <Home className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Home-Based Service Provider</span>
                  </>
                )}
              </span>

              {(business.isPremium || business.isSponsored || business.isFeatured) && (
                <span className="bg-amber-500 text-white text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center space-x-1 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>{business.isPremium ? 'Premium Partner' : business.isSponsored ? 'Sponsored' : 'Featured'}</span>
                </span>
              )}
            </div>

            {/* Business Logo & Name overlay */}
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div className="flex items-end space-x-3">
                <img
                  src={business.logo || photos[0]}
                  alt={business.businessName}
                  className="w-16 h-16 rounded-2xl border-2 border-white object-cover bg-white shadow-lg"
                />
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-white leading-tight drop-shadow-sm">
                    {business.businessName}
                  </h1>
                  <p className="text-xs text-blue-200 font-medium">Owner: {business.ownerName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Thumbnails if multiple */}
          {photos.length > 1 && (
            <div className="flex space-x-2 px-4 py-2.5 bg-slate-100 overflow-x-auto">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    selectedPhotoIndex === idx ? 'border-blue-600 scale-105' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Core Info Bar */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Rating, Category & Verification Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-amber-400 text-white px-2.5 py-1 rounded-lg font-bold text-sm shadow-xs">
                  <Star className="w-4 h-4 fill-white" />
                  <span>{business.rating > 0 ? business.rating : 'New'}</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {business.rating > 0 ? `${business.rating} Out of 5.0 Stars` : 'No ratings yet'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Based on {business.reviewCount} Karachi verified customer reviews
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-blue-800 bg-white px-3 py-1 rounded-xl border border-blue-200">
                  {business.category}
                </span>
                <span className="flex items-center space-x-1 text-xs text-emerald-800 font-semibold bg-emerald-100 px-2.5 py-1 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified</span>
                </span>
              </div>
            </div>

            {/* Address & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Karachi Location:</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{business.fullAddress}</p>
                  <span className="inline-block mt-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Area: {business.karachiArea}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Opening Hours:</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{business.openingHours}</p>
                  <span className="inline-block mt-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    Open for Orders & Booking
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
                <span>About This Karachi Business</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                {business.description}
              </p>
            </div>

            {/* Available Services Offered */}
            {business.servicesOffered && business.servicesOffered.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-2.5">
                  Available Services & Solutions ({business.servicesOffered.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {business.servicesOffered.map((srv, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Reviews & Feedback Section */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Customer Ratings & Reviews ({reviews.length})
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Authentic feedback from Karachi customers
                  </p>
                </div>

                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{myExistingReview ? 'Edit Your Review' : 'Write a Review'}</span>
                </button>
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">
                    No reviews yet. Be the first customer in Karachi to review {business.businessName}!
                  </p>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="mt-2 text-xs font-bold text-blue-700 hover:underline"
                  >
                    Click here to write the first review
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map(rev => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center uppercase">
                            {rev.customerName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              {rev.customerName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(rev.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Admin delete option */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition"
                              title="Delete abusive or fake review (Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed pl-9">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Android Bottom Action Bar */}
        <div className="sticky bottom-0 z-20 bg-white border-t border-slate-200 px-4 py-3 shadow-lg flex items-center justify-between gap-3">
          <a
            href={`tel:${business.mobile}`}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs shadow-md transition active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>Call Now ({business.mobile})</span>
          </a>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Review Modal Dialog */}
      {showReviewModal && (
        <ReviewModal
          business={business}
          existingReview={myExistingReview}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};
