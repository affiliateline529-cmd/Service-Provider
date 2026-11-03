import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ArrowRight, RefreshCw, Smartphone, Mail } from 'lucide-react';

interface OTPVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'email_old' | 'email_new' | 'mobile_old' | 'mobile_new';
  value: string;
  onSuccess: () => void;
}

export default function OTPVerificationDialog({ isOpen, onClose, userId, type, value, onSuccess }: OTPVerificationDialogProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    setError('');
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type, value }),
      });
      const data = await response.json();
      if (data.success) {
        setTimer(60);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type, code }),
      });
      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmail = type.includes('email');

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
          
          <div className="w-16 h-16 bg-[#087F5B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-[#087F5B]" />
          </div>
          
          <h3 className="text-xl font-bold text-[#101C2C]">Verify Your Identity</h3>
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit code sent to your {isEmail ? 'email' : 'mobile number'}
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full text-sm font-medium text-[#101C2C]">
            {isEmail ? <Mail className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            {value}
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between gap-2 mb-6">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-100 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                maxLength={1}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center mb-4 font-medium">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || otp.join('').length < 6}
            className="w-full py-4 bg-[#101C2C] text-white rounded-2xl font-bold shadow-lg shadow-black/20 hover:bg-[#1a2b42] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Verify & Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={handleResend}
              disabled={timer > 0 || resending}
              className={`text-sm font-bold ${timer > 0 || resending ? 'text-gray-400' : 'text-[#087F5B] hover:text-[#0a946a]'}`}
            >
              {resending ? 'Resending...' : timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
