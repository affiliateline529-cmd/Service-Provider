import React, { useState } from 'react';
import { 
  X, User, Mail, Smartphone, Shield, Key, ChevronRight, 
  Camera, CheckCircle2, AlertCircle, RefreshCw, LogOut, Trash2
} from 'lucide-react';
import { User as UserType } from '../types';
import OTPVerificationDialog from './OTPVerificationDialog';
import PhotoUpdateDialog from './PhotoUpdateDialog';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdateUser: (updatedUser: UserType) => void;
  onLogout: () => void;
}

export default function ProfileSettingsModal({ isOpen, onClose, user, onUpdateUser, onLogout }: ProfileSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OTP Flow State
  const [otpConfig, setOtpConfig] = useState<{
    isOpen: boolean;
    type: 'email_old' | 'email_new' | 'mobile_old' | 'mobile_new';
    value: string;
    nextStep?: () => void;
  }>({ isOpen: false, type: 'email_old', value: '' });

  // Password Change State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Photo Dialog State
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);

  // New Email/Mobile State
  const [pendingValue, setPendingValue] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingMobile, setIsEditingMobile] = useState(false);

  if (!isOpen) return null;

  const handleUpdateName = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name: newName }),
      });
      const data = await response.json();
      if (data.success) {
        onUpdateUser(data.data);
        setIsEditingName(false);
        setSuccess('Name updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Update failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEmailChange = async () => {
    if (!pendingValue || !pendingValue.includes('@')) {
      setError('Please enter a valid new email.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Step 1: Verify Old Email
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, type: 'email_old', value: user.email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpConfig({
          isOpen: true,
          type: 'email_old',
          value: user.email,
          nextStep: async () => {
            // Step 2: Verify New Email
            const res2 = await fetch('/api/auth/otp/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, type: 'email_new', value: pendingValue }),
            });
            const data2 = await res2.json();
            if (data2.success) {
              setOtpConfig({
                isOpen: true,
                type: 'email_new',
                value: pendingValue,
                nextStep: async () => {
                  // Final Step: Update in DB
                  const res3 = await fetch('/api/profile/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      userId: user.id, 
                      email: pendingValue, 
                      emailVerified: true 
                    }),
                  });
                  const data3 = await res3.json();
                  if (data3.success) {
                    onUpdateUser(data3.data);
                    setIsEditingEmail(false);
                    setPendingValue('');
                    setOtpConfig({ ...otpConfig, isOpen: false });
                    setSuccess('Email updated successfully!');
                  }
                }
              });
            }
          }
        });
      }
    } catch (err) {
      setError('Failed to initiate email change.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startMobileChange = async () => {
    if (!pendingValue || pendingValue.length < 10) {
      setError('Please enter a valid new mobile number.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, type: 'mobile_old', value: user.mobile }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpConfig({
          isOpen: true,
          type: 'mobile_old',
          value: user.mobile,
          nextStep: () => {
            fetch('/api/auth/otp/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, type: 'mobile_new', value: pendingValue }),
            }).then(r => r.json()).then(d => {
              if (d.success) {
                setOtpConfig({
                  isOpen: true,
                  type: 'mobile_new',
                  value: pendingValue,
                  nextStep: async () => {
                    const res3 = await fetch('/api/profile/update', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        userId: user.id, 
                        mobile: pendingValue, 
                        mobileVerified: true 
                      }),
                    });
                    const data3 = await res3.json();
                    if (data3.success) {
                      onUpdateUser(data3.data);
                      setIsEditingMobile(false);
                      setPendingValue('');
                      setOtpConfig({ ...otpConfig, isOpen: false });
                      setSuccess('Mobile number updated successfully!');
                    }
                  }
                });
              }
            });
          }
        });
      }
    } catch (err) {
      setError('Failed to initiate mobile change.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      setError('New passwords do not match.');
      return;
    }
    if (passwordForm.new.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new
        }),
      });
      const data = await response.json();
      if (data.success) {
        setIsChangingPassword(false);
        setPasswordForm({ current: '', new: '', confirm: '' });
        setSuccess('Password changed successfully!');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Update failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#F3F4F6] w-full max-w-lg sm:rounded-[2.5rem] h-[92vh] sm:h-auto sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-500">
        {/* Header */}
        <div className="bg-[#101C2C] p-6 pb-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#D4AF37] shadow-lg">
                <img 
                  src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=101C2C&color=D4AF37`} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <button 
                onClick={() => setIsPhotoDialogOpen(true)}
                className="absolute bottom-0 right-0 p-1.5 bg-[#D4AF37] text-white rounded-full shadow-md hover:scale-110 transition-transform"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-[#D4AF37] text-sm font-medium flex items-center gap-1">
                @{user.username}
                <CheckCircle2 className="w-3.5 h-3.5 fill-[#D4AF37] text-[#101C2C]" />
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider">
                  {user.role} Account
                </span>
                {user.isEmailVerified && (
                  <span className="px-2 py-0.5 bg-[#087F5B]/20 text-[#087F5B] rounded text-[10px] font-bold uppercase tracking-wider">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mt-8 p-1 bg-white/5 rounded-2xl">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-[#101C2C]' : 'text-white/60 hover:text-white'}`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-white text-[#101C2C]' : 'text-white/60 hover:text-white'}`}
            >
              Security
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold animate-in shake-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-[#087F5B]/10 p-4 rounded-2xl border border-[#087F5B]/20 flex items-center gap-3 text-[#087F5B] text-sm font-bold animate-in zoom-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              {success}
            </div>
          )}

          {activeTab === 'profile' ? (
            <div className="space-y-6">
              {/* Username - Read Only */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</label>
                    <p className="font-bold text-[#101C2C]">@{user.username}</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 italic font-medium leading-relaxed">
                  * Username is permanently fixed and cannot be changed for security reasons.
                </p>
              </div>

              {/* Full Name */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                      {isEditingName ? (
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="font-bold text-[#101C2C] border-b-2 border-[#D4AF37] outline-none"
                          autoFocus
                        />
                      ) : (
                        <p className="font-bold text-[#101C2C]">{user.name}</p>
                      )}
                    </div>
                  </div>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsEditingName(false)}
                        className="text-gray-400 text-sm font-bold p-2"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleUpdateName}
                        disabled={isSubmitting}
                        className="bg-[#101C2C] text-white px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        {isSubmitting ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Save'}
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsEditingName(true)}
                      className="text-[#087F5B] text-xs font-bold hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                      {isEditingEmail ? (
                        <input
                          type="email"
                          value={pendingValue}
                          onChange={(e) => setPendingValue(e.target.value)}
                          placeholder="New email"
                          className="font-bold text-[#101C2C] border-b-2 border-[#D4AF37] outline-none"
                          autoFocus
                        />
                      ) : (
                        <p className="font-bold text-[#101C2C]">{user.email}</p>
                      )}
                    </div>
                  </div>
                  {isEditingEmail ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setIsEditingEmail(false); setPendingValue(''); }}
                        className="text-gray-400 text-sm font-bold p-2"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={startEmailChange}
                        disabled={isSubmitting}
                        className="bg-[#101C2C] text-white px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        Verify
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsEditingEmail(true)}
                      className="text-[#087F5B] text-xs font-bold hover:underline"
                    >
                      Update
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number</label>
                      {isEditingMobile ? (
                        <input
                          type="tel"
                          value={pendingValue}
                          onChange={(e) => setPendingValue(e.target.value)}
                          placeholder="03XX-XXXXXXX"
                          className="font-bold text-[#101C2C] border-b-2 border-[#D4AF37] outline-none"
                          autoFocus
                        />
                      ) : (
                        <p className="font-bold text-[#101C2C]">{user.mobile}</p>
                      )}
                    </div>
                  </div>
                  {isEditingMobile ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setIsEditingMobile(false); setPendingValue(''); }}
                        className="text-gray-400 text-sm font-bold p-2"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={startMobileChange}
                        disabled={isSubmitting}
                        className="bg-[#101C2C] text-white px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        Verify
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsEditingMobile(true)}
                      className="text-[#087F5B] text-xs font-bold hover:underline"
                    >
                      Update
                    </button>
                  )}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="w-full py-4 flex items-center justify-center gap-3 text-red-500 font-bold bg-white rounded-3xl border border-red-50 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Change Password Trigger */}
              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      <Key className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#101C2C]">Change Password</p>
                      <p className="text-xs text-gray-500">Update your account password</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                </button>
              ) : (
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-[#101C2C]">Set New Password</h4>
                    <button onClick={() => setIsChangingPassword(false)} className="text-gray-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <Key className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Current Password"
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        className="w-full pl-11 pr-4 py-4 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#D4AF37]/20 border border-transparent focus:border-[#D4AF37]"
                      />
                    </div>
                    <div className="relative">
                      <Shield className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        placeholder="New Password"
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                        className="w-full pl-11 pr-4 py-4 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#D4AF37]/20 border border-transparent focus:border-[#D4AF37]"
                      />
                    </div>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        className="w-full pl-11 pr-4 py-4 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#D4AF37]/20 border border-transparent focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={isSubmitting || !passwordForm.current || !passwordForm.new}
                    className="w-full py-4 bg-[#101C2C] text-white rounded-2xl font-bold shadow-lg shadow-black/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Update Password'}
                  </button>
                </div>
              )}

              {/* Account Security Tips */}
              <div className="bg-[#087F5B]/5 p-6 rounded-[2rem] border border-[#087F5B]/10">
                <h4 className="text-[#087F5B] font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Checklist
                </h4>
                <ul className="space-y-3">
                  {[
                    'Enable two-factor authentication',
                    'Use a strong, unique password',
                    'Never share your OTP with anyone',
                    'Check your recent login activities'
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#087F5B] font-medium leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Delete Account */}
              <button className="w-full py-4 flex items-center justify-center gap-3 text-red-400 font-bold hover:text-red-500 transition-colors">
                <Trash2 className="w-5 h-5" />
                Permanently Deactivate Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub-modals */}
      <OTPVerificationDialog
        isOpen={otpConfig.isOpen}
        onClose={() => setOtpConfig({ ...otpConfig, isOpen: false })}
        userId={user.id}
        type={otpConfig.type}
        value={otpConfig.value}
        onSuccess={() => otpConfig.nextStep?.()}
      />

      <PhotoUpdateDialog
        isOpen={isPhotoDialogOpen}
        onClose={() => setIsPhotoDialogOpen(false)}
        user={user}
        onSuccess={(newPhoto) => {
          onUpdateUser({ ...user, profilePhoto: newPhoto, lastProfilePhotoUpdate: new Date().toISOString() });
        }}
      />
    </div>
  );
}
