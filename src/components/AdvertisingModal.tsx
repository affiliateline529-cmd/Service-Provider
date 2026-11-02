import React, { useState } from 'react';
import {
  X, Sparkles, CheckCircle2, AlertCircle, DollarSign, Shield,
  CreditCard, Smartphone, Building, ArrowRight
} from 'lucide-react';
import { AD_PACKAGES, PAYMENT_METHODS_INFO } from '../data/advertisingPackages';
import { Business } from '../types';
import { useAuth } from '../context/AuthContext';

interface AdvertisingModalProps {
  businesses: Business[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AdvertisingModal: React.FC<AdvertisingModalProps> = ({
  businesses,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState(AD_PACKAGES[1]); // default Sponsored
  const [selectedBusinessId, setSelectedBusinessId] = useState(businesses[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'JazzCash' | 'Easypaisa' | 'Bank Transfer / Raast'>('JazzCash');
  const [senderAccount, setSenderAccount] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBusinessId) {
      setError('Please select which of your Karachi businesses to promote.');
      return;
    }
    if (!senderAccount.trim() || !transactionId.trim()) {
      setError('Please enter your sender mobile/account and the Transaction ID.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/ads/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusinessId,
          packageId: selectedPkg.id,
          paymentMethod,
          senderNumberOrAccount: senderAccount.trim(),
          transactionId: transactionId.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        onSuccess();
      } else {
        setError(data.message || 'Submission failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const paymentInfo = paymentMethod === 'JazzCash'
    ? PAYMENT_METHODS_INFO.jazzcash
    : paymentMethod === 'Easypaisa'
    ? PAYMENT_METHODS_INFO.easypaisa
    : PAYMENT_METHODS_INFO.bank;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
              Karachi Business Promotion & Ads
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Promote Your Business in Karachi
            </h2>
            <p className="text-xs text-slate-500">
              Get 5x more customer calls and WhatsApp inquiries across Karachi neighborhoods.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 px-4 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Sponsorship Request Submitted!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                Your transaction ID <strong>{transactionId}</strong> has been logged for{' '}
                <strong>{selectedPkg.name}</strong>.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex items-center space-x-2 text-blue-900 font-bold">
                <Shield className="w-4 h-4 text-blue-700" />
                <span>Verification Policy Notice</span>
              </div>
              <p className="text-blue-800 leading-relaxed text-[11px]">
                As per safety guidelines, listings are not marked as paid until our administrator verifies the bank/mobile transfer receipt. Your ad badge will be automatically enabled upon confirmation (or you can switch to the Admin Panel to verify it immediately for testing).
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs shadow-md transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 space-y-5 pt-3">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Choose Business to Promote */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Your Registered Business *
              </label>
              <select
                value={selectedBusinessId}
                onChange={e => setSelectedBusinessId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.businessName} ({b.karachiArea} - {b.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Package Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Choose Promotion Tier *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AD_PACKAGES.map(pkg => {
                  const isSelected = selectedPkg.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">{pkg.name}</span>
                          {pkg.badgeType === 'premium' && (
                            <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded-full">
                              BEST VALUE
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-extrabold text-blue-900 mb-1">
                          PKR {pkg.pricePKR.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">/ {pkg.durationDays} days</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">{pkg.tagline}</p>
                        <ul className="text-[10px] space-y-1 text-slate-600">
                          {pkg.features.map((f, i) => (
                            <li key={i} className="flex items-start space-x-1">
                              <span className="text-emerald-600 font-bold shrink-0">✓</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pakistani Payment Method & Account Details */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Payment Method (Transfer to Official Karachi Account)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['JazzCash', 'Easypaisa', 'Bank Transfer / Raast'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-center transition ${
                      paymentMethod === method
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Account Details Box */}
              <div className="bg-white rounded-xl p-3 border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500 font-medium">Send <strong className="text-slate-900">PKR {selectedPkg.pricePKR.toLocaleString()}</strong> to:</div>
                <div className="font-bold text-blue-900 text-sm">
                  {('accountNumber' in paymentInfo ? (paymentInfo as any).accountNumber : '') || ('iban' in paymentInfo ? (paymentInfo as any).iban : '')}
                </div>
                <div className="text-slate-600 text-[11px]">
                  Title: <strong>{paymentInfo.accountTitle}</strong>
                </div>
                {'instructions' in paymentInfo && (
                  <p className="text-[10px] text-slate-500 pt-1 italic">
                    ℹ️ {(paymentInfo as any).instructions}
                  </p>
                )}
              </div>

              {/* Transaction Verification Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Your Sending Mobile / Account No. *
                  </label>
                  <input
                    type="text"
                    value={senderAccount}
                    onChange={e => setSenderAccount(e.target.value)}
                    placeholder="e.g. 0300-1234567"
                    required
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Transaction ID (TRX ID / Reference) *
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    placeholder="e.g. JC998822104"
                    required
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              Ordinary Karachi listings remain 100% free forever. Sponsored listings are clearly labeled as ads.
            </p>

            {/* Submit */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
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
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : `Submit Payment of PKR ${selectedPkg.pricePKR.toLocaleString()}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
