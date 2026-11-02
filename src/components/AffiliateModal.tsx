import React, { useState, useEffect } from 'react';
import {
  X, Award, Copy, Check, MessageSquare, DollarSign, Wallet,
  Store, CheckCircle2, AlertCircle, ArrowUpRight, Share2,
  Users, Gift, ChevronRight, Smartphone, Building
} from 'lucide-react';
import { AffiliateData, PayoutRequest } from '../types';
import { useAuth } from '../context/AuthContext';

interface AffiliateModalProps {
  onClose: () => void;
}

export const AffiliateModal: React.FC<AffiliateModalProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState('1000');
  const [paymentMethod, setPaymentMethod] = useState<'JazzCash' | 'Easypaisa'>('JazzCash');
  const [accountNumber, setAccountNumber] = useState(currentUser?.mobile || '0333-2891045');
  const [accountTitle, setAccountTitle] = useState(currentUser?.name || 'Shehbaz Abro');
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    fetchAffiliateData();
  }, [currentUser]);

  const fetchAffiliateData = async () => {
    setLoading(true);
    const userId = currentUser?.id || 'user-customer-1';
    try {
      const res = await fetch(`/api/affiliate/${userId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error fetching affiliate stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const referralCode = data?.referralCode || `KHI-REF-7860`;
  const referralUrl = `${window.location.origin}${window.location.pathname}?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const shareText = `Assalam-o-Alaikum! List your shop or service business for free on the Karachi Service Provider catalogue and get direct customer calls from your area!\n\nUse my invite link to register with priority verification:\n${referralUrl}\n(Referral Code: ${referralCode})`;
  const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);

    const amount = Number(withdrawAmount);
    if (!amount || amount < 500) {
      setWithdrawError('Minimum withdrawal amount is PKR 500.');
      return;
    }
    if (data && amount > data.availableBalancePKR) {
      setWithdrawError(`Amount exceeds your available balance of PKR ${data.availableBalancePKR.toLocaleString()}.`);
      return;
    }

    setWithdrawLoading(true);
    try {
      const res = await fetch('/api/affiliate/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliateId: currentUser?.id || 'user-customer-1',
          affiliateName: currentUser?.name || 'Shehbaz Abro',
          amountPKR: amount,
          paymentMethod,
          accountNumber: accountNumber.trim(),
          accountTitle: accountTitle.trim()
        })
      });
      const resData = await res.json();
      if (resData.success) {
        setWithdrawSuccess(resData.message);
        fetchAffiliateData();
      } else {
        setWithdrawError(resData.message || 'Withdrawal failed');
      }
    } catch (err: any) {
      setWithdrawError(err.message || 'Network error');
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Karachi Affiliate & Referral Network
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                Earn Cash by Referring Karachi Businesses
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 pt-3 text-xs">
          {/* Earnings Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-3 rounded-2xl shadow-xs">
              <div className="text-[10px] text-emerald-100 uppercase font-semibold">Available Balance</div>
              <div className="text-lg font-black mt-0.5">
                PKR {data?.availableBalancePKR.toLocaleString() || '2,500'}
              </div>
              <span className="text-[10px] text-emerald-100">Ready to withdraw</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Earned</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                PKR {data?.totalEarningsPKR.toLocaleString() || '3,500'}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Paid & Verified</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Shops Referred</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                {data?.totalReferredShops || 3}
              </div>
              <span className="text-[10px] text-slate-500">Across Karachi</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Verified Active</div>
              <div className="text-lg font-extrabold text-blue-900 mt-0.5">
                {data?.verifiedShops || 3}
              </div>
              <span className="text-[10px] text-blue-700 font-semibold">Live in catalogue</span>
            </div>
          </div>

          {/* Referral Link & Code Box */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                  <Gift className="w-4 h-4" />
                  <span>Your Personal Karachi Referral Link</span>
                </span>
                <p className="text-[11px] text-blue-200 mt-0.5">
                  Share this link with shopkeepers, electricians, salons, or mechanics in Karachi.
                </p>
              </div>

              {/* Code Chip */}
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <span className="text-[10px] text-blue-200">Code:</span>
                <span className="font-mono font-bold text-amber-300">{referralCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:text-emerald-400 transition"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* URL bar */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-[11px] font-mono text-emerald-200 truncate select-all">
                {referralUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs transition flex items-center space-x-1 shrink-0 active:scale-95"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Instant WhatsApp Share Button */}
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Share Invite to Karachi WhatsApp Groups & Contacts</span>
            </a>
          </div>

          {/* How It Works & Commission Tiers */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Affiliate Commission Tiers (Karachi, Pakistan)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Tier 1 • Free Shop</span>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5">PKR 500</div>
                <p className="text-[10px] text-slate-500 mt-0.5">When referred shop is approved by admin</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-300">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Tier 2 • Sponsored Ad</span>
                <div className="text-sm font-extrabold text-amber-900 mt-0.5">PKR 1,000 (20%)</div>
                <p className="text-[10px] text-slate-500 mt-0.5">When shop buys Sponsored Listing</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-300">
                <span className="text-[10px] font-bold text-purple-700 uppercase">Tier 3 • Premium</span>
                <div className="text-sm font-extrabold text-purple-900 mt-0.5">PKR 2,500 (25%)</div>
                <p className="text-[10px] text-slate-500 mt-0.5">When shop upgrades to Premium Partner</p>
              </div>
            </div>
          </div>

          {/* Withdraw Earnings Form */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <Wallet className="w-4 h-4 text-blue-700" />
                <span>Withdraw Cash to JazzCash or Easypaisa</span>
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Min. PKR 500
              </span>
            </div>

            {withdrawSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{withdrawSuccess}</span>
              </div>
            )}

            {withdrawError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('JazzCash')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    paymentMethod === 'JazzCash'
                      ? 'bg-red-50 border-red-500 text-red-700 shadow-xs'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  JazzCash Account
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Easypaisa')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    paymentMethod === 'Easypaisa'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Easypaisa Account
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Amount (PKR)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Mobile Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Account Title
                  </label>
                  <input
                    type="text"
                    value={accountTitle}
                    onChange={e => setAccountTitle(e.target.value)}
                    placeholder="e.g. Shehbaz Abro"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={withdrawLoading || !data || data.availableBalancePKR < 500}
                className="w-full py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
              >
                {withdrawLoading ? 'Submitting Request...' : `Withdraw PKR ${Number(withdrawAmount || 0).toLocaleString()} Now`}
              </button>
            </form>
          </div>

          {/* Recent Referrals Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-xs">
              Your Referred Karachi Businesses ({data?.referrals?.length || 0})
            </h3>
            <div className="space-y-1.5">
              {(data?.referrals || []).map(ref => (
                <div
                  key={ref.id}
                  className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{ref.businessName}</div>
                    <div className="text-[10px] text-slate-500">
                      {ref.category} • {ref.karachiArea} • {ref.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-emerald-700">+PKR {ref.earnedPKR.toLocaleString()}</div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full uppercase">
                      {ref.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
