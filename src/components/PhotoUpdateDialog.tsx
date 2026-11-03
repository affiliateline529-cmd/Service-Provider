import React, { useState, useEffect } from 'react';
import { X, Camera, RefreshCw, AlertCircle, Clock, Check } from 'lucide-react';
import { User } from '../types';

interface PhotoUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess: (newPhoto: string) => void;
}

export default function PhotoUpdateDialog({ isOpen, onClose, user, onSuccess }: PhotoUpdateDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  useEffect(() => {
    if (user.lastProfilePhotoUpdate) {
      const updateTimer = setInterval(() => {
        const lastUpdate = new Date(user.lastProfilePhotoUpdate!);
        const nextUpdate = new Date(lastUpdate.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();
        
        if (now < nextUpdate) {
          const diff = nextUpdate.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setRemainingTime(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setRemainingTime(null);
          clearInterval(updateTimer);
        }
      }, 1000);
      return () => clearInterval(updateTimer);
    }
  }, [user.lastProfilePhotoUpdate]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!previewUrl) return;

    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/profile/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, photoUrl: previewUrl }),
      });
      const data = await response.json();
      if (data.success) {
        onSuccess(data.profilePhoto);
        onClose();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRestricted = !!remainingTime;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="relative p-6 text-center border-b border-gray-100">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
          
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-[#D4AF37]" />
          </div>
          
          <h3 className="text-xl font-bold text-[#101C2C]">Update Profile Photo</h3>
          <p className="text-sm text-gray-500 mt-1">
            Choose a professional photo to build trust
          </p>
        </div>

        <div className="p-6">
          <div className="relative w-48 h-48 mx-auto mb-6 group">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-50 bg-gray-100 flex items-center justify-center shadow-inner">
              {previewUrl || user.profilePhoto ? (
                <img 
                  src={previewUrl || user.profilePhoto} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-12 h-12 text-gray-300" />
              )}
            </div>
            
            {!isRestricted && (
              <label className="absolute bottom-2 right-2 w-12 h-12 bg-[#D4AF37] text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-[#b8952d] active:scale-95 transition-all">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
                <Camera className="w-6 h-6" />
              </label>
            )}
          </div>

          {isRestricted ? (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-6 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">24-Hour Restriction Active</p>
                <p className="text-xs text-amber-700 mt-1">
                  You can update your photo again in:
                </p>
                <p className="text-lg font-mono font-bold text-amber-600 mt-1">
                  {remainingTime}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 space-y-4">
              <p className="text-xs text-gray-400 text-center uppercase tracking-widest font-bold">
                Max Size: 2MB | Format: JPG, PNG
              </p>
              {error && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2 text-red-600 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={isSubmitting || !previewUrl || isRestricted}
            className="w-full py-4 bg-[#101C2C] text-white rounded-2xl font-bold shadow-lg shadow-black/20 hover:bg-[#1a2b42] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                Save New Photo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
