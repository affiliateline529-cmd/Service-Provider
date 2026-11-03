export interface Business {
  id: string;
  ownerName: string;
  businessName: string;
  mobile: string;
  email: string;
  category: string;
  description: string;
  fullAddress: string;
  karachiArea: string;
  openingHours: string;
  servicesOffered: string[];
  businessType: 'shop' | 'home_based';
  photos: string[];
  logo: string;
  whatsappNumber: string;
  rating: number;
  reviewCount: number;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured?: boolean;
  isSponsored?: boolean;
  isPremium?: boolean;
  createdAt: string;
  rejectionReason?: string;
  packageId?: string; // Tied to a package
}

export interface Review {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export type UserRole = 'customer' | 'provider' | 'admin';

export interface User {
  id: string;
  username: string; // Permanently fixed
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  savedFavorites: string[];
  isSuspended?: boolean;
  createdAt: string;
  businessId?: string;
  activePackageId?: string;
  packageExpiryDate?: string;
  providerVerified?: boolean;
  profilePhoto?: string;
  lastProfilePhotoUpdate?: string; // 24-hour restriction
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  password?: string; // Hashed or plain for this demo
}

export interface CategoryItem {
  id: string;
  name: string;
  iconName: string;
  description: string;
  popular?: boolean;
}

export interface KarachiAreaInfo {
  name: string;
  district: string;
  popular?: boolean;
}

export interface AdPackage {
  id: string;
  name: string;
  tagline: string;
  pricePKR: number;
  durationDays: number;
  badgeType: 'featured' | 'sponsored' | 'premium';
  features: string[];
}

export interface AdRequest {
  id: string;
  businessId: string;
  businessName: string;
  packageId: string;
  packageName: string;
  amountPKR: number;
  paymentMethod: 'JazzCash' | 'Easypaisa' | 'Bank Transfer / Raast';
  senderNumberOrAccount: string;
  transactionId: string;
  status: 'pending' | 'active' | 'rejected';
  createdAt: string;
}

export interface RegistrationPackage {
  id: 'basic' | 'premium' | 'golden';
  name: string;
  pricePKR: number;
  maxShops: number; // -1 for unlimited
  features: string[];
  description: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  packageId: 'basic' | 'premium' | 'golden';
  packageName: string;
  amountPKR: number;
  paymentMethod: 'Easypaisa';
  transactionId: string;
  screenshotUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  verifiedAt?: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface AppNotification {
  id: string;
  userId: string; // Target user
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'system' | 'chat';
  link?: string; // Redirect to screen
  isRead: boolean;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  businessName: string;
  category: string;
  karachiArea: string;
  earnedPKR: number;
  status: 'verified' | 'pending' | 'rejected';
  date: string;
}

export interface PayoutRequest {
  id: string;
  affiliateId: string;
  affiliateName: string;
  amountPKR: number;
  paymentMethod: 'JazzCash' | 'Easypaisa';
  accountNumber: string;
  accountTitle: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}

export interface AffiliateData {
  referralCode: string;
  totalEarningsPKR: number;
  availableBalancePKR: number;
  totalReferredShops: number;
  verifiedShops: number;
  referrals: AffiliateReferral[];
  payouts: PayoutRequest[];
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'assigned' 
  | 'in_progress' 
  | 'on_the_way'
  | 'completed' 
  | 'cancelled' 
  | 'rejected';

export interface Booking {
  id: string;
  businessId: string;
  businessName: string;
  customerId?: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  customerEmail?: string;
  serviceName: string;
  servicePrice?: number;
  status: BookingStatus;
  providerId?: string; // Assigned provider (user ID)
  providerName?: string;
  paymentMethod: 'COD';
  createdAt: string;
  updatedAt: string;
  completionDate?: string;
  notes?: string;
  rejectionReason?: string;
}

export interface CommissionRecord {
  id: string;
  bookingId: string;
  businessId: string;
  providerId: string;
  providerName: string;
  totalAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  status: 'due' | 'paid' | 'partially_paid';
  paidAmount: number;
  createdAt: string;
  weekNumber: number; // e.g. 202445
  year: number;
}

export interface WeeklyCommissionReport {
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  totalBookings: number;
  totalVolume: number;
  totalCommissionDue: number;
  totalCommissionPaid: number;
  providers: {
    providerId: string;
    providerName: string;
    bookingCount: number;
    amountDue: number;
    amountPaid: number;
    status: 'due' | 'paid' | 'partially_paid';
  }[];
}

export interface AppConfig {
  defaultCommissionPercentage: number;
  easypaisaNumber: string;
  easypaisaTitle: string;
  bookingResponseTimeMinutes: number;
}
