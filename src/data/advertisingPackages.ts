import { AdPackage } from '../types';

export const AD_PACKAGES: AdPackage[] = [
  {
    id: 'pkg-featured',
    name: 'Featured Listing',
    tagline: 'Stand out in your Karachi neighborhood & category',
    pricePKR: 2500,
    durationDays: 30,
    badgeType: 'featured',
    features: [
      'Prominent "Featured" Badge on Business Card',
      'Boosted visibility above standard listings in category',
      'Direct WhatsApp click-to-chat button',
      'Verified Karachi Service Provider mark',
      'Monthly performance view count report'
    ]
  },
  {
    id: 'pkg-sponsored',
    name: 'Sponsored Listing',
    tagline: 'High visibility across Home Screen and Catalogue',
    pricePKR: 5000,
    durationDays: 30,
    badgeType: 'sponsored',
    features: [
      'Highlighted "Sponsored Ad" border & gold badge',
      'Featured on the Home Screen Promoted Carousel',
      'High priority ranking in Karachi area searches',
      'Up to 6 high-resolution service gallery photos',
      'Quick Call & WhatsApp actions on all cards'
    ]
  },
  {
    id: 'pkg-premium',
    name: 'Premium Business Profile',
    tagline: 'Maximum inquiries & brand dominance in Karachi',
    pricePKR: 10000,
    durationDays: 60,
    badgeType: 'premium',
    features: [
      '#1 Top Ranking in Category & Area search results',
      'Permanent "Premium Verified" badge',
      'Custom Promotional Banner on your Profile page',
      'Instant direct inquiry lead delivery via WhatsApp',
      'Featured in "Top Rated Karachi Services" section',
      'Dedicated Admin Priority Support'
    ]
  }
];

export const PAYMENT_METHODS_INFO = {
  jazzcash: {
    title: 'JazzCash Mobile Account',
    accountNumber: '0300-8273641',
    accountTitle: 'Service Provider Karachi / Admin',
    instructions: 'Send payment via JazzCash App or *786# to the mobile number above. Save the 12-digit Transaction ID.'
  },
  easypaisa: {
    title: 'Easypaisa Account',
    accountNumber: '0345-2198765',
    accountTitle: 'Service Provider Karachi',
    instructions: 'Send payment via Easypaisa App to the number above. Keep the 11-digit TRX ID receipt for verification.'
  },
  bank: {
    title: 'Bank Transfer / Raast ID',
    bankName: 'Meezan Bank Limited',
    accountTitle: 'Service Provider Karachi Services',
    accountNumber: '01020304050601',
    iban: 'PK55MEZN0001020304050601',
    raastId: '03008273641',
    instructions: 'Transfer via any Pakistani Banking App using Raast or IBAN. Note down the bank reference number.'
  }
};
