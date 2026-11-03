import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { KARACHI_CATEGORIES } from './src/data/categories.js';
import { KARACHI_AREAS } from './src/data/karachiAreas.js';
import { AD_PACKAGES } from './src/data/advertisingPackages.js';
import { INITIAL_BUSINESSES, INITIAL_REVIEWS, INITIAL_USERS } from './src/data/seedData.js';
import { 
  Business, Review, User, AdRequest, AffiliateReferral, PayoutRequest,
  Booking, CommissionRecord, WeeklyCommissionReport, AppConfig,
  RegistrationPackage, PaymentRequest, ChatMessage, AppNotification, AdminAuditLog
} from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Database file path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'karachi_database.json');

const REGISTRATION_PACKAGES: RegistrationPackage[] = [
  {
    id: 'basic',
    name: 'Basic Registration',
    pricePKR: 500,
    maxShops: 3,
    features: ['One-time registration fee', 'Maximum 3 shops', 'Basic shop profile', 'Address & contact details'],
    description: 'Perfect for small local shops'
  },
  {
    id: 'premium',
    name: 'Premium Package',
    pricePKR: 3000,
    maxShops: 10,
    features: ['No PKR 500 reg fee', 'Maximum 10 shops', 'Premium listing design', 'Booking management'],
    description: 'Grow your business with better visibility'
  },
  {
    id: 'golden',
    name: 'Golden Package',
    pricePKR: 10000,
    maxShops: -1, // unlimited
    features: ['No PKR 500 reg fee', 'Unlimited shops', 'Golden premium profile', 'All Premium features'],
    description: 'Unlimited access for large enterprises'
  }
];

interface OTPRecord {
  id: string;
  userId: string;
  type: 'email_old' | 'email_new' | 'mobile_old' | 'mobile_new';
  value: string;
  code: string;
  expiresAt: string;
  verified: boolean;
}

interface DatabaseSchema {
  users: User[];
  businesses: Business[];
  reviews: Review[];
  adRequests: AdRequest[];
  affiliateReferrals: AffiliateReferral[];
  payoutRequests: PayoutRequest[];
  bookings: Booking[];
  commissions: CommissionRecord[];
  config: AppConfig;
  paymentRequests: PaymentRequest[];
  chatMessages: ChatMessage[];
  notifications: AppNotification[];
  auditLogs: AdminAuditLog[];
  otps: OTPRecord[];
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
      if (!parsed.bookings) parsed.bookings = [];
      if (!parsed.commissions) parsed.commissions = [];
      if (!parsed.config) parsed.config = { 
        defaultCommissionPercentage: 15,
        easypaisaNumber: '0345-1234567',
        easypaisaTitle: 'Karachi Service Provider HQ',
        bookingResponseTimeMinutes: 30
      };
      if (!parsed.paymentRequests) parsed.paymentRequests = [];
      if (!parsed.chatMessages) parsed.chatMessages = [];
      if (!parsed.notifications) parsed.notifications = [];
      if (!parsed.auditLogs) parsed.auditLogs = [];
      if (!parsed.otps) parsed.otps = [];
      return parsed;
    } catch (err) {
      console.error('Error reading database file, re-seeding:', err);
    }
  }

  const initialData: DatabaseSchema = {
    users: [...INITIAL_USERS],
    businesses: [...INITIAL_BUSINESSES],
    reviews: [...INITIAL_REVIEWS],
    bookings: [],
    commissions: [],
    config: { 
      defaultCommissionPercentage: 15,
      easypaisaNumber: '0345-1234567',
      easypaisaTitle: 'Karachi Service Provider HQ',
      bookingResponseTimeMinutes: 30
    },
    adRequests: [],
    affiliateReferrals: [],
    payoutRequests: [],
    paymentRequests: [],
    chatMessages: [],
    notifications: [],
    auditLogs: [],
    otps: []
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

// Helper to get week number and year
function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
}

// Helper to send notifications
function sendNotification(userId: string, title: string, message: string, type: AppNotification['type'], link?: string) {
  const notification: AppNotification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    title,
    message,
    type,
    link,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.unshift(notification);
  saveDb(db);
}

// Helper for audit logs
function logAdminAction(adminId: string, adminName: string, action: string, details: string, targetId?: string) {
  const log: AdminAuditLog = {
    id: `log-${Date.now()}`,
    adminId,
    adminName,
    action,
    targetId,
    details,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
  saveDb(db);
}

// ================= API ROUTES =================

// Registration Packages
app.get('/api/packages', (req, res) => {
  res.json({ success: true, data: REGISTRATION_PACKAGES });
});

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
    ownerId,
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
    whatsappNumber,
    isAdminCreated
  } = req.body;

  if (!ownerName || !businessName || !mobile || !category || !fullAddress || !karachiArea) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }

  const user = db.users.find(u => u.id === ownerId);
  if (!isAdminCreated && user) {
    const pkg = REGISTRATION_PACKAGES.find(p => p.id === user.activePackageId);
    const existingShopsCount = db.businesses.filter(b => b.ownerName === ownerName).length; // simple check
    if (pkg && pkg.maxShops !== -1 && existingShopsCount >= pkg.maxShops) {
      return res.status(403).json({ success: false, message: `Your ${pkg.name} allows a maximum of ${pkg.maxShops} shops. Please upgrade your package.` });
    }
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
    status: isAdminCreated ? 'approved' : 'pending',
    createdAt: new Date().toISOString()
  };

  db.businesses.unshift(newBusiness);
  saveDb(db);

  // Notify Admin
  if (!isAdminCreated) {
    db.users.filter(u => u.role === 'admin').forEach(admin => {
      sendNotification(admin.id, 'New Shop Registration', `A new shop "${newBusiness.businessName}" has been registered and is pending approval.`, 'system');
    });
  }

  res.status(201).json({
    success: true,
    message: isAdminCreated ? 'Business registered successfully.' : 'Business submitted successfully. It will appear in the catalogue once approved by the Karachi administrator.',
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
  db.reviews = db.reviews.filter(r => r.businessId !== req.params.id);
  saveDb(db);

  res.json({ success: true, message: 'Business removed successfully' });
});

// Reviews
app.post('/api/businesses/:id/reviews', (req: Request, res: Response) => {
  const businessId = req.params.id;
  const { customerId, customerName, customerEmail, rating, comment } = req.body;

  if (!customerId || !customerName || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Rating (1-5) and comment are required.' });
  }

  const numRating = Math.max(1, Math.min(5, Number(rating)));
  const existingIndex = db.reviews.findIndex(
    r => r.businessId === businessId && (r.customerId === customerId || r.customerEmail === customerEmail)
  );

  let savedReview: Review;

  if (existingIndex >= 0) {
    db.reviews[existingIndex].rating = numRating;
    db.reviews[existingIndex].comment = comment.trim();
    db.reviews[existingIndex].updatedAt = new Date().toISOString();
    savedReview = db.reviews[existingIndex];
  } else {
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
    username: email.split('@')[0] + Math.floor(Math.random() * 100),
    name: name.trim(),
    email: normalizedEmail,
    mobile: mobile.trim(),
    role: role === 'provider' ? 'provider' : 'customer',
    savedFavorites: [],
    createdAt: new Date().toISOString(),
    password // store plain for demo
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

  if (user.password && user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
  }

  if (user.isSuspended) {
    return res.status(403).json({ success: false, message: 'This account has been suspended by the administrator.' });
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    data: userWithoutPassword
  });
});

// Profile Management & Security
app.post('/api/auth/otp/send', (req, res) => {
  const { userId, type, value } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  // Generate a simple 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 minutes

  // Clear existing OTPs of same type for this user
  db.otps = db.otps.filter(o => !(o.userId === userId && o.type === type));

  const otpRecord: OTPRecord = {
    id: `otp-${Date.now()}`,
    userId,
    type,
    value,
    code,
    expiresAt,
    verified: false
  };

  db.otps.push(otpRecord);
  saveDb(db);

  // In a real app, send via SMS/Email. Here we just return success.
  console.log(`[OTP] Sent ${code} to ${value} for ${type}`);
  
  res.json({ success: true, message: `Verification code sent to ${value}.` });
});

app.post('/api/auth/otp/verify', (req, res) => {
  const { userId, type, code } = req.body;
  const otp = db.otps.find(o => 
    o.userId === userId && 
    o.type === type && 
    o.code === code && 
    new Date(o.expiresAt) > new Date()
  );

  if (!otp) {
    return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
  }

  otp.verified = true;
  saveDb(db);

  res.json({ success: true, message: 'Code verified successfully.' });
});

app.post('/api/profile/update', (req, res) => {
  const { userId, name, email, mobile, emailVerified, mobileVerified } = req.body;
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found.' });

  const user = db.users[userIndex];
  
  // Basic updates
  if (name) user.name = name;
  
  // Sensitive updates require verification flags (passed from frontend after OTP success)
  if (email && emailVerified) {
    user.email = email.toLowerCase();
    user.isEmailVerified = true;
    // Clear OTPs
    db.otps = db.otps.filter(o => o.userId === userId && (o.type === 'email_old' || o.type === 'email_new'));
  }

  if (mobile && mobileVerified) {
    user.mobile = mobile;
    user.isMobileVerified = true;
    // Clear OTPs
    db.otps = db.otps.filter(o => o.userId === userId && (o.type === 'mobile_old' || o.type === 'mobile_new'));
  }

  saveDb(db);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, message: 'Profile updated successfully.', data: userWithoutPassword });
});

app.post('/api/profile/photo', (req, res) => {
  const { userId, photoUrl } = req.body;
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found.' });

  const user = db.users[userIndex];

  // Check 24h restriction
  if (user.lastProfilePhotoUpdate) {
    const lastUpdate = new Date(user.lastProfilePhotoUpdate);
    const now = new Date();
    const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      const remaining = 24 - diffHours;
      return res.status(403).json({ 
        success: false, 
        message: `You can only update your profile photo once every 24 hours. Please wait ${Math.ceil(remaining)} more hours.`,
        nextUpdateAvailable: new Date(lastUpdate.getTime() + 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  user.profilePhoto = photoUrl;
  user.lastProfilePhotoUpdate = new Date().toISOString();
  saveDb(db);

  res.json({ success: true, message: 'Profile photo updated.', profilePhoto: user.profilePhoto });
});

app.post('/api/auth/change-password', (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found.' });

  const user = db.users[userIndex];

  if (user.password && user.password !== currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  saveDb(db);

  res.json({ success: true, message: 'Password changed successfully.' });
});

// Payments proof submission
app.post('/api/payments/request', (req, res) => {
  const { userId, packageId, transactionId, screenshotUrl } = req.body;
  
  const user = db.users.find(u => u.id === userId);
  const pkg = REGISTRATION_PACKAGES.find(p => p.id === packageId);
  
  if (!user || !pkg || !transactionId || !screenshotUrl) {
    return res.status(400).json({ success: false, message: 'Missing payment details.' });
  }

  const request: PaymentRequest = {
    id: `pay-${Date.now()}`,
    userId,
    userName: user.name,
    packageId: pkg.id,
    packageName: pkg.name,
    amountPKR: pkg.pricePKR,
    paymentMethod: 'Easypaisa',
    transactionId,
    screenshotUrl,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.paymentRequests.unshift(request);
  saveDb(db);

  // Notify Admins
  db.users.filter(u => u.role === 'admin').forEach(admin => {
    sendNotification(admin.id, 'New Payment Request', `${user.name} submitted a payment for the ${pkg.name}.`, 'payment');
  });

  res.json({ success: true, message: 'Payment proof submitted. Admin will verify it shortly.', data: request });
});

// Admin verification of payment
app.post('/api/admin/payments/:id/verify', (req, res) => {
  const { status, rejectionReason, adminId } = req.body;
  const admin = db.users.find(u => u.id === adminId && u.role === 'admin');
  if (!admin) return res.status(403).json({ success: false, message: 'Unauthorized.' });

  const requestIndex = db.paymentRequests.findIndex(r => r.id === req.params.id);
  if (requestIndex === -1) return res.status(404).json({ success: false, message: 'Request not found.' });
  
  const request = db.paymentRequests[requestIndex];
  request.status = status;
  request.verifiedAt = new Date().toISOString();
  if (rejectionReason) request.rejectionReason = rejectionReason;

  if (status === 'verified') {
    const user = db.users.find(u => u.id === request.userId);
    if (user) {
      user.activePackageId = request.packageId;
      // Set 1 year expiry or as configured
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      user.packageExpiryDate = expiry.toISOString();
      user.providerVerified = true;
      
      sendNotification(user.id, 'Package Activated!', `Your ${request.packageName} is now active. You can now add more shops.`, 'payment');
    }
  } else {
    sendNotification(request.userId, 'Payment Rejected', `Your payment for ${request.packageName} was rejected: ${rejectionReason}`, 'payment');
  }

  logAdminAction(admin.id, admin.name, `payment_${status}`, `Verified payment ${request.id} for user ${request.userId}`, request.id);
  saveDb(db);
  res.json({ success: true, message: `Payment ${status}.` });
});

// Booking
app.post('/api/bookings', (req: Request, res: Response) => {
  const { 
    businessId, businessName, customerId, customerName, 
    customerMobile, customerAddress, customerEmail, serviceName 
  } = req.body;

  if (!businessId || !customerName || !customerMobile || !customerAddress || !serviceName) {
    return res.status(400).json({ success: false, message: 'Please fill in all booking fields.' });
  }

  const business = db.businesses.find(b => b.id === businessId);
  const provider = db.users.find(u => u.name === business?.ownerName); // simple match for demo

  const newBooking: Booking = {
    id: `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    businessId,
    businessName,
    customerId,
    customerName,
    customerMobile,
    customerAddress,
    customerEmail,
    serviceName,
    status: 'pending',
    paymentMethod: 'COD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.bookings.unshift(newBooking);
  saveDb(db);

  // Notifications
  sendNotification(customerId, 'Booking Submitted', `Your booking for ${serviceName} at ${businessName} has been submitted.`, 'booking');
  if (provider) {
    sendNotification(provider.id, 'New Booking Received', `${customerName} wants to book ${serviceName}. Please respond.`, 'booking');
  }
  db.users.filter(u => u.role === 'admin').forEach(admin => {
    sendNotification(admin.id, 'New Booking', `${customerName} booked ${serviceName} from ${businessName}.`, 'booking');
  });

  res.status(201).json({ 
    success: true, 
    message: 'Booking request sent successfully! You can track it using your Booking ID.',
    data: newBooking 
  });
});

app.patch('/api/bookings/:id', (req: Request, res: Response) => {
  const bookingIndex = db.bookings.findIndex(b => b.id === req.params.id);
  if (bookingIndex === -1) return res.status(404).json({ success: false, message: 'Booking not found.' });

  const booking = db.bookings[bookingIndex];
  const { status, providerId, providerName, servicePrice, notes, rejectionReason } = req.body;

  const oldStatus = booking.status;
  if (status) booking.status = status;
  if (rejectionReason) booking.rejectionReason = rejectionReason;
  if (providerId) {
    booking.providerId = providerId;
    booking.providerName = providerName || 'Service Provider';
    if (!booking.status || booking.status === 'confirmed') booking.status = 'assigned';
  }
  if (servicePrice !== undefined) booking.servicePrice = Number(servicePrice);
  if (notes) booking.notes = notes;
  
  booking.updatedAt = new Date().toISOString();

  // Notifications on status change
  if (status && status !== oldStatus) {
    if (booking.customerId) {
      sendNotification(booking.customerId, `Booking ${status.replace('_', ' ')}`, `Your booking status is now ${status.replace('_', ' ')}.`, 'booking');
    }
  }

  // Commission logic on complete
  if (status === 'completed' && booking.servicePrice) {
    const { week, year } = getWeekNumber(new Date());
    const commissionPercent = db.config.defaultCommissionPercentage;
    const commissionAmount = (booking.servicePrice * commissionPercent) / 100;

    const exists = db.commissions.some(c => c.bookingId === booking.id);
    if (!exists && booking.providerId) {
        const newCommission: CommissionRecord = {
            id: `COMM-${Date.now()}`,
            bookingId: booking.id,
            businessId: booking.businessId,
            providerId: booking.providerId,
            providerName: booking.providerName || 'Unknown',
            totalAmount: booking.servicePrice,
            commissionPercentage: commissionPercent,
            commissionAmount: commissionAmount,
            status: 'due',
            paidAmount: 0,
            createdAt: new Date().toISOString(),
            weekNumber: week,
            year: year
        };
        db.commissions.unshift(newCommission);
    }
    booking.completionDate = new Date().toISOString();
  }

  saveDb(db);
  res.json({ success: true, message: 'Booking updated successfully.', data: booking });
});

// Chat
app.post('/api/chat/send', (req, res) => {
  const { bookingId, senderId, senderRole, content } = req.body;
  const booking = db.bookings.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

  const message: ChatMessage = {
    id: `msg-${Date.now()}`,
    bookingId,
    senderId,
    senderRole,
    content,
    timestamp: new Date().toISOString(),
    status: 'sent'
  };

  db.chatMessages.push(message);
  saveDb(db);

  // Notify receiver
  const targetId = senderRole === 'customer' ? booking.providerId : booking.customerId;
  if (targetId) {
    sendNotification(targetId, 'New Message', `${senderRole === 'customer' ? 'Customer' : 'Provider'} sent you a message regarding Booking #${bookingId}`, 'chat');
  }

  res.json({ success: true, data: message });
});

app.get('/api/chat/:bookingId', (req, res) => {
  const messages = db.chatMessages.filter(m => m.bookingId === req.params.bookingId);
  res.json({ success: true, data: messages });
});

// Notifications
app.get('/api/notifications/:userId', (req, res) => {
  const notifications = db.notifications.filter(n => n.userId === req.params.userId);
  res.json({ success: true, data: notifications });
});

app.post('/api/notifications/:id/read', (req, res) => {
  const n = db.notifications.find(n => n.id === req.params.id);
  if (n) {
    n.isRead = true;
    saveDb(db);
  }
  res.json({ success: true });
});

// Admin list payments
app.get('/api/admin/payments', (req, res) => {
  res.json({ success: true, data: db.paymentRequests });
});

// Admin: Get all bookings
app.get('/api/admin/bookings', (req: Request, res: Response) => {
  res.json({ success: true, data: db.bookings });
});

// Admin: Get all commission records
app.get('/api/admin/commissions', (req: Request, res: Response) => {
    res.json({ success: true, data: db.commissions });
});

// Admin: Get weekly report
app.get('/api/admin/reports/weekly', (req: Request, res: Response) => {
    const { week, year } = req.query;
    const targetWeek = week ? Number(week) : getWeekNumber(new Date()).week;
    const targetYear = year ? Number(year) : getWeekNumber(new Date()).year;

    const weeklyCommissions = db.commissions.filter(c => c.weekNumber === targetWeek && c.year === targetYear);
    const providersMap = new Map<string, any>();

    weeklyCommissions.forEach(c => {
        if (!providersMap.has(c.providerId)) {
            providersMap.set(c.providerId, {
                providerId: c.providerId,
                providerName: c.providerName,
                bookingCount: 0,
                amountDue: 0,
                amountPaid: 0,
                status: 'due'
            });
        }
        const p = providersMap.get(c.providerId);
        p.bookingCount += 1;
        p.amountDue += (c.commissionAmount - c.paidAmount);
        p.amountPaid += c.paidAmount;
    });

    const report: WeeklyCommissionReport = {
        weekNumber: targetWeek,
        year: targetYear,
        startDate: '',
        endDate: '',
        totalBookings: weeklyCommissions.length,
        totalVolume: weeklyCommissions.reduce((acc, c) => acc + c.totalAmount, 0),
        totalCommissionDue: weeklyCommissions.reduce((acc, c) => acc + (c.commissionAmount - c.paidAmount), 0),
        totalCommissionPaid: weeklyCommissions.reduce((acc, c) => acc + c.paidAmount, 0),
        providers: Array.from(providersMap.values())
    };

    res.json({ success: true, data: report });
});

// Admin: Mark commission as paid
app.post('/api/admin/commissions/pay', (req: Request, res: Response) => {
    const { providerId, weekNumber, year, amount } = req.body;
    
    if (!providerId || !weekNumber || !year || !amount) {
        return res.status(400).json({ success: false, message: 'Invalid payment details.' });
    }

    const records = db.commissions.filter(c => 
        c.providerId === providerId && 
        c.weekNumber === Number(weekNumber) && 
        c.year === Number(year) &&
        c.status !== 'paid'
    );

    let remainingPaid = Number(amount);
    records.forEach(r => {
        if (remainingPaid <= 0) return;
        const due = r.commissionAmount - r.paidAmount;
        if (remainingPaid >= due) {
            remainingPaid -= due;
            r.paidAmount = r.commissionAmount;
            r.status = 'paid';
        } else {
            r.paidAmount += remainingPaid;
            r.status = 'partially_paid';
            remainingPaid = 0;
        }
    });

    saveDb(db);
    res.json({ success: true, message: 'Payment recorded successfully.' });
});

// Provider routes
app.get('/api/provider/bookings/:providerId', (req: Request, res: Response) => {
  const bookings = db.bookings.filter(b => b.providerId === req.params.providerId);
  res.json({ success: true, data: bookings });
});

app.get('/api/provider/commissions/:providerId', (req: Request, res: Response) => {
    const records = db.commissions.filter(c => c.providerId === req.params.providerId);
    res.json({ success: true, data: records });
});

// Admin list metrics
app.get('/api/admin/metrics', (req, res) => {
  res.json({
    success: true,
    data: {
      totalCustomers: db.users.filter(u => u.role === 'customer').length,
      totalProviders: db.users.filter(u => u.role === 'provider').length,
      totalBusinesses: db.businesses.length,
      totalBookings: db.bookings.length,
      pendingBookings: db.bookings.filter(b => b.status === 'pending').length,
      completedBookings: db.bookings.filter(b => b.status === 'completed').length,
      pendingPayments: db.paymentRequests.filter(r => r.status === 'pending').length,
      totalRevenue: db.commissions.reduce((acc, c) => acc + c.paidAmount, 0)
    }
  });
});

// Config
app.get('/api/admin/config', (req: Request, res: Response) => {
    res.json({ success: true, data: db.config });
});

app.patch('/api/admin/config', (req: Request, res: Response) => {
    const { defaultCommissionPercentage, easypaisaNumber, easypaisaTitle } = req.body;
    if (defaultCommissionPercentage !== undefined) db.config.defaultCommissionPercentage = Number(defaultCommissionPercentage);
    if (easypaisaNumber) db.config.easypaisaNumber = easypaisaNumber;
    if (easypaisaTitle) db.config.easypaisaTitle = easypaisaTitle;
    saveDb(db);
    res.json({ success: true, data: db.config });
});

// Reset
app.post('/api/reset-data', (req: Request, res: Response) => {
  db = {
    users: [...INITIAL_USERS],
    businesses: [...INITIAL_BUSINESSES],
    reviews: [...INITIAL_REVIEWS],
    adRequests: [],
    affiliateReferrals: [],
    payoutRequests: [],
    bookings: [],
    commissions: [],
    config: { 
      defaultCommissionPercentage: 15,
      easypaisaNumber: '0345-1234567',
      easypaisaTitle: 'Karachi Service Provider HQ',
      bookingResponseTimeMinutes: 30
    },
    paymentRequests: [],
    chatMessages: [],
    notifications: [],
    auditLogs: [],
    otps: []
  };
  saveDb(db);
  res.json({ success: true, message: 'Database reset.' });
});

// Server Setup
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
