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

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'customer' | 'provider' | 'admin';
  savedFavorites: string[];
  isSuspended?: boolean;
  createdAt: string;
  businessId?: string;
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
