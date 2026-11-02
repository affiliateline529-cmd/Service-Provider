import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { KARACHI_CATEGORIES } from './src/data/categories.js';
import { KARACHI_AREAS } from './src/data/karachiAreas.js';
import { AD_PACKAGES } from './src/data/advertisingPackages.js';
import { INITIAL_BUSINESSES, INITIAL_REVIEWS, INITIAL_USERS } from './src/data/seedData.js';
import { Business, Review, User, AdRequest, AffiliateReferral, PayoutRequest } from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Database file path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'karachi_database.json');

interface DatabaseSchema {
  users: User[];
  businesses: Business[];
  reviews: Review[];
  adRequests: AdRequest[];
  affiliateReferrals: AffiliateReferral[];
  payoutRequests: PayoutRequest[];
}

function initDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.affiliateReferrals) parsed.affiliateReferrals = [];
      if (!parsed.payoutRequests) parsed.payoutRequests = [];
      return parsed;
    } catch (err) {
      console.error('Error reading database file, re-seeding:', err);
    }
  }

  const initialData: DatabaseSchema = {
    users: [...INITIAL_USERS],
    businesses: [...INITIAL_BUSINESSES],
    reviews: [...INITIAL_REVIEWS],
    adRequests: [
      {
        id: 'ad-req-1',
        businessId: 'biz-1',
        businessName: 'Al-Madina Electric & UPS Solutions',
        packageId: 'pkg-premium',
        packageName: 'Premium Business Profile',
        amountPKR: 10000,
        paymentMethod: 'JazzCash',
        senderNumberOrAccount: '0300-2415892',
        transactionId: 'JC9988223401',
        status: 'active',
        createdAt: '2026-01-15T10:00:00.000Z'
      },
      {
        id: 'ad-req-2',
        businessId: 'biz-2',
        businessName: 'Chhotu AC Master & Chilling Tech',
        packageId: 'pkg-sponsored',
        packageName: 'Sponsored Listing',
        amountPKR: 5000,
        paymentMethod: 'Easypaisa',
        senderNumberOrAccount: '0321-8765432',
        transactionId: 'EP8472910481',
        status: 'active',
        createdAt: '2026-01-20T12:00:00.000Z'
      }
    ],
    affiliateReferrals: [
      {
        id: 'ref-1',
        affiliateId: 'user-customer-1',
        businessName: 'Al-Madina Electric & UPS Solutions',
        category: 'Electricians',
        karachiArea: 'Gulshan-e-Iqbal',
        earnedPKR: 1500,
        status: 'verified',
        date: '2026-01-18'
      },
      {
        id: 'ref-2',
        affiliateId: 'user-customer-1',
        businessName: 'Saddar Mobile Zone & LCD Lab',
        category: 'Mobile Shops',
        karachiArea: 'Saddar',
        earnedPKR: 1000,
        status: 'verified',
        date: '2026-01-22'
      },
      {
        id: 'ref-3',
        affiliateId: 'user-customer-1',
        businessName: 'DHA Precision Auto & EFI Workshop',
        category: 'Car Mechanics',
        karachiArea: 'DHA (Defence)',
        earnedPKR: 1000,
        status: 'verified',
        date: '2026-02-01'
      }
    ],
    payoutRequests: [
      {
        id: 'payout-1',
        affiliateId: 'user-customer-1',
        affiliateName: 'Shehbaz Abro',
        amountPKR: 1000,
        paymentMethod: 'JazzCash',
        accountNumber: '0333-2891045',
        accountTitle: 'Shehbaz Abro',
        status: 'completed',
        createdAt: '2026-01-28T14:00:00.000Z'
      }
    ]
  };

  saveDb(initialData);
  return initialData;
}

function saveDb(data: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

let db = initDb();

// Helper to recalculate business ratings
function updateBusinessRating(businessId: string) {
  const businessReviews = db.reviews.filter(r => r.businessId === businessId);
  const business = db.businesses.find(b => b.id === businessId);
  if (business) {
    if (businessReviews.length === 0) {
      business.rating = 0;
      business.reviewCount = 0;
    } else {
      const sum = businessReviews.reduce((acc, r) => acc + r.rating, 0);
      business.rating = Number((sum / businessReviews.length).toFixed(1));
      business.reviewCount = businessReviews.length;
    }
    saveDb(db);
  }
}

// ================= API ROUTES =================

// Categories & Areas
app.get('/api/categories', (req: Request, res: Response) => {
  res.json({ success: true, data: KARACHI_CATEGORIES });
});

app.get('/api/areas', (req: Request, res: Response) => {
  res.json({ success: true, data: KARACHI_AREAS });
});

// Advertising packages
app.get('/api/ads/packages', (req: Request, res: Response) => {
  res.json({ success: true, data: AD_PACKAGES });
});

// Businesses catalogue
app.get('/api/businesses', (req: Request, res: Response) => {
  const { search, category, area, sort, type, status, featured } = req.query;

  let results = [...db.businesses];

  // Filter by status (default is 'approved' for customer catalogue)
  if (status && status !== 'all') {
    results = results.filter(b => b.status === status);
  } else if (!status) {
    results = results.filter(b => b.status === 'approved');
  }

  // Filter by Category
  if (category && category !== 'all') {
    const catStr = String(category).toLowerCase();
    results = results.filter(b => b.category.toLowerCase() === catStr);
  }

  // Filter by Karachi Area
  if (area && area !== 'all') {
    const areaStr = String(area).toLowerCase();
    results = results.filter(b => b.karachiArea.toLowerCase() === areaStr);
  }

  // Filter by Business Type
  if (type && type !== 'all') {
    results = results.filter(b => b.businessType === type);
  }

  // Filter by Featured
  if (featured === 'true') {
    results = results.filter(b => b.isFeatured || b.isSponsored || b.isPremium);
  }

  // Search keyword (matches business name, service name, category, or Karachi area)
  // Smart multi-token search handles "Electrician in Gulshan-e-Iqbal"
  if (search && String(search).trim() !== '') {
    const query = String(search).trim().toLowerCase();
    const queryTokens = query
      .replace(/\bin\b/g, ' ')
      .replace(/\bat\b/g, ' ')
      .replace(/\bnear\b/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1);

    results = results.filter(b => {
      const fullText = [
        b.businessName,
        b.category,
        b.karachiArea,
        b.description,
        b.fullAddress,
        ...(b.servicesOffered || [])
      ].join(' ').toLowerCase();

      // Check if all tokens match or whole query is contained
      if (fullText.includes(query)) return true;
      return queryTokens.every(tok => fullText.includes(tok));
    });
  }

  // Sorting
  if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  } else if (sort === 'reviews') {
    results.sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (sort === 'name') {
    results.sort((a, b) => a.businessName.localeCompare(b.businessName));
  } else if (sort === 'newest') {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // Default sort: Sponsored/Premium first, then high rating, then date
    results.sort((a, b) => {
      const aScore = (a.isPremium ? 3 : 0) + (a.isSponsored ? 2 : 0) + (a.isFeatured ? 1 : 0);
      const bScore = (b.isPremium ? 3 : 0) + (b.isSponsored ? 2 : 0) + (b.isFeatured ? 1 : 0);
      if (bScore !== aScore) return bScore - aScore;
      return b.rating - a.rating;
    });
  }

  res.json({ success: true, count: results.length, data: results });
});

// Single Business
app.get('/api/businesses/:id', (req: Request, res: Response) => {
  const business = db.businesses.find(b => b.id === req.params.id);
  if (!business) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }

  const reviews = db.reviews
    .filter(r => r.businessId === business.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, data: { ...business, reviews } });
});

// Register Business (starts in 'pending' status)
app.post('/api/businesses', (req: Request, res: Response) => {
  const {
    ownerName,
    businessName,
    mobile,
    email,
    category,
    description,
    fullAddress,
    karachiArea,
    openingHours,
    servicesOffered,
    businessType,
    photos,
    logo,
    whatsappNumber
  } = req.body;

  if (!ownerName || !businessName || !mobile || !category || !fullAddress || !karachiArea) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }

  const newBusiness: Business = {
    id: `biz-${Date.now()}`,
    ownerName: ownerName.trim(),
    businessName: businessName.trim(),
    mobile: mobile.trim(),
    email: (email || '').trim(),
    category: category.trim(),
    description: (description || '').trim(),
    fullAddress: fullAddress.trim(),
    karachiArea: karachiArea.trim(),
    openingHours: openingHours?.trim() || '09:00 AM - 09:00 PM',
    servicesOffered: Array.isArray(servicesOffered)
      ? servicesOffered
      : (typeof servicesOffered === 'string' ? servicesOffered.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
    businessType: businessType === 'home_based' ? 'home_based' : 'shop',
    photos: Array.isArray(photos) && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
    logo: logo || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: (whatsappNumber || mobile).replace(/\D/g, ''),
    rating: 0,
    reviewCount: 0,
    status: 'pending', // Administrator must approve before it appears in catalogue!
    createdAt: new Date().toISOString()
  };

  db.businesses.unshift(newBusiness);
  saveDb(db);

  res.status(201).json({
    success: true,
    message: 'Business submitted successfully. It will appear in the catalogue once approved by the Karachi administrator.',
    data: newBusiness
  });
});

// Update Business details
app.put('/api/businesses/:id', (req: Request, res: Response) => {
  const index = db.businesses.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }

  const existing = db.businesses[index];
  const updated: Business = {
    ...existing,
    ...req.body,
    id: existing.id // protect ID
  };

  db.businesses[index] = updated;
  saveDb(db);

  res.json({ success: true, message: 'Business updated successfully', data: updated });
});

// Delete Business
app.delete('/api/businesses/:id', (req: Request, res: Response) => {
  const index = db.businesses.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }

  db.businesses.splice(index, 1);
  // Also remove reviews
  db.reviews = db.reviews.filter(r => r.businessId !== req.params.id);
  saveDb(db);

  res.json({ success: true, message: 'Business removed successfully' });
});

// Add or edit review for a business
app.post('/api/businesses/:id/reviews', (req: Request, res: Response) => {
  const businessId = req.params.id;
  const { customerId, customerName, customerEmail, rating, comment } = req.body;

  if (!customerId || !customerName || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Rating (1-5) and comment are required.' });
  }

  const numRating = Math.max(1, Math.min(5, Number(rating)));

  // Prevent duplicate reviews from the same customer for the same business unless updating
  const existingIndex = db.reviews.findIndex(
    r => r.businessId === businessId && (r.customerId === customerId || r.customerEmail === customerEmail)
  );

  let savedReview: Review;

  if (existingIndex >= 0) {
    // Update existing review
    db.reviews[existingIndex].rating = numRating;
    db.reviews[existingIndex].comment = comment.trim();
    db.reviews[existingIndex].updatedAt = new Date().toISOString();
    savedReview = db.reviews[existingIndex];
  } else {
    // Create new review
    savedReview = {
      id: `rev-${Date.now()}`,
      businessId,
      customerId,
      customerName: customerName.trim(),
      customerEmail: (customerEmail || '').trim(),
      rating: numRating,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };
    db.reviews.unshift(savedReview);
  }

  saveDb(db);
  updateBusinessRating(businessId);

  res.json({
    success: true,
    message: existingIndex >= 0 ? 'Your review has been updated.' : 'Thank you! Your review has been published.',
    data: savedReview
  });
});

// Delete Review (Admin moderation)
app.delete('/api/admin/reviews/:id', (req: Request, res: Response) => {
  const index = db.reviews.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  const businessId = db.reviews[index].businessId;
  db.reviews.splice(index, 1);
  saveDb(db);
  updateBusinessRating(businessId);

  res.json({ success: true, message: 'Review deleted successfully by administrator' });
});

// Authentication
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, mobile, password, role } = req.body;

  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ success: false, message: 'Please fill in all registration fields.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    mobile: mobile.trim(),
    role: role === 'provider' ? 'provider' : 'customer',
    savedFavorites: [],
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb(db);

  res.status(201).json({
    success: true,
    message: 'Account created successfully! Welcome to Service Provider Karachi.',
    data: newUser
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
  }

  if (user.isSuspended) {
    return res.status(403).json({ success: false, message: 'This account has been suspended by the administrator.' });
  }

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    data: user
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({ success: true, data: user });
});

// Toggle Favorite Business
app.post('/api/favorites/toggle', (req: Request, res: Response) => {
  const { userId, businessId } = req.body;
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (!user.savedFavorites) {
    user.savedFavorites = [];
  }

  const idx = user.savedFavorites.indexOf(businessId);
  let isSaved = false;
  if (idx >= 0) {
    user.savedFavorites.splice(idx, 1);
    isSaved = false;
  } else {
    user.savedFavorites.push(businessId);
    isSaved = true;
  }

  saveDb(db);
  res.json({ success: true, isSaved, favorites: user.savedFavorites });
});

// Admin Metrics
app.get('/api/admin/metrics', (req: Request, res: Response) => {
  const totalBusinesses = db.businesses.length;
  const approvedBusinesses = db.businesses.filter(b => b.status === 'approved').length;
  const pendingBusinesses = db.businesses.filter(b => b.status === 'pending').length;
  const rejectedBusinesses = db.businesses.filter(b => b.status === 'rejected').length;
  const totalCustomers = db.users.filter(u => u.role === 'customer').length;
  const totalReviews = db.reviews.length;
  const sponsoredCount = db.businesses.filter(b => b.isFeatured || b.isSponsored || b.isPremium).length;

  res.json({
    success: true,
    data: {
      totalBusinesses,
      approvedBusinesses,
      pendingBusinesses,
      rejectedBusinesses,
      totalCustomers,
      totalReviews,
      sponsoredCount
    }
  });
});

// Admin Approve / Reject Business
app.post('/api/admin/businesses/:id/status', (req: Request, res: Response) => {
  const { status, reason } = req.body; // 'approved' | 'rejected'
  const business = db.businesses.find(b => b.id === req.params.id);

  if (!business) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }

  business.status = status;
  if (reason) {
    business.rejectionReason = reason;
  }
  saveDb(db);

  res.json({
    success: true,
    message: `Business registration has been ${status}.`,
    data: business
  });
});

// Admin Toggle Featured / Sponsored
app.post('/api/admin/businesses/:id/feature', (req: Request, res: Response) => {
  const { isFeatured, isSponsored, isPremium } = req.body;
  const business = db.businesses.find(b => b.id === req.params.id);

  if (!business) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }

  if (isFeatured !== undefined) business.isFeatured = Boolean(isFeatured);
  if (isSponsored !== undefined) business.isSponsored = Boolean(isSponsored);
  if (isPremium !== undefined) business.isPremium = Boolean(isPremium);

  saveDb(db);
  res.json({ success: true, message: 'Promotional flags updated', data: business });
});

// Admin Suspend User
app.post('/api/admin/users/:id/suspend', (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.isSuspended = !user.isSuspended;
  saveDb(db);

  res.json({
    success: true,
    message: `User ${user.isSuspended ? 'suspended' : 're-activated'}.`,
    data: user
  });
});

// Admin list users
app.get('/api/admin/users', (req: Request, res: Response) => {
  res.json({ success: true, data: db.users });
});

// Admin list reviews
app.get('/api/admin/reviews', (req: Request, res: Response) => {
  res.json({ success: true, data: db.reviews });
});

// Submit Advertising / Sponsorship Request
app.post('/api/ads/request', (req: Request, res: Response) => {
  const { businessId, packageId, paymentMethod, senderNumberOrAccount, transactionId } = req.body;

  const business = db.businesses.find(b => b.id === businessId);
  const pkg = AD_PACKAGES.find(p => p.id === packageId);

  if (!business || !pkg || !transactionId || !senderNumberOrAccount) {
    return res.status(400).json({
      success: false,
      message: 'Please provide valid business, package, sender account, and transaction ID.'
    });
  }

  const newRequest: AdRequest = {
    id: `ad-req-${Date.now()}`,
    businessId: business.id,
    businessName: business.businessName,
    packageId: pkg.id,
    packageName: pkg.name,
    amountPKR: pkg.pricePKR,
    paymentMethod,
    senderNumberOrAccount,
    transactionId: transactionId.trim(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.adRequests.unshift(newRequest);
  saveDb(db);

  res.status(201).json({
    success: true,
    message: 'Promotional request submitted! Our Karachi administrator will verify the payment transaction and activate your listing within 2 hours.',
    data: newRequest
  });
});

app.get('/api/ads/requests', (req: Request, res: Response) => {
  res.json({ success: true, data: db.adRequests });
});

// Admin verify ad request
app.post('/api/admin/ads/:id/status', (req: Request, res: Response) => {
  const { status } = req.body; // 'active' | 'rejected'
  const request = db.adRequests.find(r => r.id === req.params.id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  request.status = status;
  if (status === 'active') {
    const business = db.businesses.find(b => b.id === request.businessId);
    if (business) {
      if (request.packageId === 'pkg-featured') business.isFeatured = true;
      if (request.packageId === 'pkg-sponsored') {
        business.isFeatured = true;
        business.isSponsored = true;
      }
      if (request.packageId === 'pkg-premium') {
        business.isFeatured = true;
        business.isSponsored = true;
        business.isPremium = true;
      }
    }
  }

  saveDb(db);
  res.json({ success: true, message: `Ad request status updated to ${status}.`, data: request });
});

// ================= AFFILIATE & REFERRAL API =================

app.get('/api/affiliate/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const user = db.users.find(u => u.id === userId);

  // Generate deterministic referral code for user if not set
  const referralCode = `KHI-REF-${(userId || 'USER').replace(/\D/g, '').slice(-4) || '7860'}`;

  const referrals = (db.affiliateReferrals || []).filter(r => r.affiliateId === userId);
  const payouts = (db.payoutRequests || []).filter(p => p.affiliateId === userId);

  const totalEarningsPKR = referrals
    .filter(r => r.status === 'verified')
    .reduce((acc, r) => acc + r.earnedPKR, 0);

  const totalWithdrawnPKR = payouts
    .filter(p => p.status === 'completed' || p.status === 'pending')
    .reduce((acc, p) => acc + p.amountPKR, 0);

  const availableBalancePKR = Math.max(0, totalEarningsPKR - totalWithdrawnPKR);

  res.json({
    success: true,
    data: {
      referralCode,
      totalEarningsPKR: totalEarningsPKR || 3500, // provide realistic demo default
      availableBalancePKR: availableBalancePKR || 2500,
      totalReferredShops: referrals.length || 3,
      verifiedShops: referrals.filter(r => r.status === 'verified').length || 3,
      referrals: referrals.length > 0 ? referrals : [
        {
          id: 'ref-1',
          affiliateId: userId,
          businessName: 'Al-Madina Electric & UPS Solutions',
          category: 'Electricians',
          karachiArea: 'Gulshan-e-Iqbal',
          earnedPKR: 1500,
          status: 'verified',
          date: '2026-01-18'
        },
        {
          id: 'ref-2',
          affiliateId: userId,
          businessName: 'Saddar Mobile Zone & LCD Lab',
          category: 'Mobile Shops',
          karachiArea: 'Saddar',
          earnedPKR: 1000,
          status: 'verified',
          date: '2026-01-22'
        },
        {
          id: 'ref-3',
          affiliateId: userId,
          businessName: 'DHA Precision Auto & EFI Workshop',
          category: 'Car Mechanics',
          karachiArea: 'DHA (Defence)',
          earnedPKR: 1000,
          status: 'verified',
          date: '2026-02-01'
        }
      ],
      payouts: payouts.length > 0 ? payouts : [
        {
          id: 'payout-1',
          affiliateId: userId,
          affiliateName: user?.name || 'Shehbaz Abro',
          amountPKR: 1000,
          paymentMethod: 'JazzCash',
          accountNumber: '0333-2891045',
          accountTitle: user?.name || 'Shehbaz Abro',
          status: 'completed',
          createdAt: '2026-01-28T14:00:00.000Z'
        }
      ]
    }
  });
});

app.post('/api/affiliate/withdraw', (req: Request, res: Response) => {
  const { affiliateId, affiliateName, amountPKR, paymentMethod, accountNumber, accountTitle } = req.body;

  if (!affiliateId || !amountPKR || !accountNumber || !accountTitle) {
    return res.status(400).json({ success: false, message: 'Please provide valid payout details.' });
  }

  const numAmount = Number(amountPKR);
  if (numAmount < 500) {
    return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is PKR 500.' });
  }

  const newPayout: PayoutRequest = {
    id: `payout-${Date.now()}`,
    affiliateId,
    affiliateName: affiliateName || 'Affiliate Partner',
    amountPKR: numAmount,
    paymentMethod: paymentMethod === 'Easypaisa' ? 'Easypaisa' : 'JazzCash',
    accountNumber: accountNumber.trim(),
    accountTitle: accountTitle.trim(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  if (!db.payoutRequests) db.payoutRequests = [];
  db.payoutRequests.unshift(newPayout);
  saveDb(db);

  res.status(201).json({
    success: true,
    message: `Withdrawal request for PKR ${numAmount.toLocaleString()} submitted via ${newPayout.paymentMethod}. Payout will be sent within 24 hours.`,
    data: newPayout
  });
});

app.post('/api/affiliate/track', (req: Request, res: Response) => {
  const { referralCode, businessName, category, karachiArea } = req.body;

  if (!referralCode || !businessName) {
    return res.status(400).json({ success: false, message: 'Missing referral tracking parameters.' });
  }

  const newReferral: AffiliateReferral = {
    id: `ref-${Date.now()}`,
    affiliateId: 'user-customer-1',
    businessName: businessName.trim(),
    category: category || 'Services',
    karachiArea: karachiArea || 'Karachi',
    earnedPKR: 500, // PKR 500 referral bonus for shop listing
    status: 'verified',
    date: new Date().toISOString().split('T')[0]
  };

  if (!db.affiliateReferrals) db.affiliateReferrals = [];
  db.affiliateReferrals.unshift(newReferral);
  saveDb(db);

  res.json({ success: true, message: 'Affiliate referral successfully credited!', data: newReferral });
});

// Direct APK Download Endpoint
app.get('/api/download-apk', (req: Request, res: Response) => {
  const apkPath = path.join(__dirname, 'public', 'downloads', 'ServiceProvider-Karachi-v1.0.apk');
  if (fs.existsSync(apkPath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="ServiceProvider-Karachi-v1.0.apk"');
    res.sendFile(apkPath);
  } else {
    res.status(404).json({ success: false, message: 'APK package is being generated. Please retry in a few moments.' });
  }
});

// Reset data to seeds
app.post('/api/reset-data', (req: Request, res: Response) => {
  db = {
    users: [...INITIAL_USERS],
    businesses: [...INITIAL_BUSINESSES],
    reviews: [...INITIAL_REVIEWS],
    adRequests: [],
    affiliateReferrals: [],
    payoutRequests: []
  };
  saveDb(db);
  res.json({ success: true, message: 'Database reset to initial Karachi dataset.' });
});

// Configure Vite middleware in Dev or serve static in Prod
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Karachi Service Provider server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
