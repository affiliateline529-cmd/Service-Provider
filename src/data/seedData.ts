import { Business, Review, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Administrator (Karachi HQ)',
    email: 'admin@serviceprovider.pk',
    mobile: '0300-8273641',
    role: 'admin',
    savedFavorites: ['biz-1', 'biz-3', 'biz-7'],
    createdAt: '2026-01-01T10:00:00.000Z'
  },
  {
    id: 'user-customer-1',
    name: 'Shehbaz Abro',
    email: 'shehbaz@example.com',
    mobile: '0333-2891045',
    role: 'customer',
    savedFavorites: ['biz-1', 'biz-4', 'biz-10'],
    createdAt: '2026-01-15T12:30:00.000Z'
  },
  {
    id: 'user-customer-2',
    name: 'Ayesha Siddiqui',
    email: 'ayesha.khi@gmail.com',
    mobile: '0321-9482711',
    role: 'customer',
    savedFavorites: ['biz-6', 'biz-12'],
    createdAt: '2026-02-10T14:20:00.000Z'
  },
  {
    id: 'user-provider-1',
    name: 'Ustad Tariq Mehmood',
    email: 'tariq@electrician.pk',
    mobile: '0300-2415892',
    role: 'provider',
    savedFavorites: [],
    businessId: 'biz-1',
    createdAt: '2026-01-05T09:15:00.000Z'
  }
];

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz-1',
    ownerName: 'Ustad Tariq Mehmood',
    businessName: 'Al-Madina Electric & UPS Solutions',
    mobile: '0300-2415892',
    email: 'tariq@electrician.pk',
    category: 'Electricians',
    description: 'Expert residential and commercial electrician services in Gulshan-e-Iqbal and surrounding areas. Specializing in DB box wiring, circuit breaker maintenance, UPS and solar inverter installations, LED ceiling lights, and emergency short-circuit fault diagnosis. 15+ years serving Karachi homes with guaranteed safety standards.',
    fullAddress: 'Shop # 14, Block 13-D/1, Main Disco Bakery Road, Gulshan-e-Iqbal, Karachi',
    karachiArea: 'Gulshan-e-Iqbal',
    openingHours: '09:00 AM - 10:00 PM (Daily)',
    servicesOffered: [
      'House Wiring & DB Box Repair',
      'UPS & Solar Inverter Setup',
      'Emergency Short Circuit Detection',
      'Ceiling Fan & Chandelier Fitting',
      'Generator Changeover Switch Installation'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03002415892',
    rating: 4.9,
    reviewCount: 38,
    status: 'approved',
    isFeatured: true,
    isSponsored: true,
    isPremium: true,
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'biz-2',
    ownerName: 'Engr. Kamran Farooqui',
    businessName: 'Chhotu AC Master & Chilling Tech',
    mobile: '0321-8765432',
    email: 'kamran.ac@yahoo.com',
    category: 'AC Repair and Installation',
    description: 'Premier air conditioning service across Federal B Area and North Nazimabad. Authorized inverter AC gas charging (R410A / R32), chemical jet servicing, split AC dismantling, copper piping, PCB circuit repairing, and compressor overhauling. Quick 45-minute doorstep service across Karachi.',
    fullAddress: 'Plot C-22, Block 14, Near Water Pump Chowrangi, Federal B Area, Karachi',
    karachiArea: 'Federal B Area',
    openingHours: '08:30 AM - 11:00 PM (Mon-Sun)',
    servicesOffered: [
      'Split & Inverter AC Chemical Jet Service',
      'Original R410A / R32 Gas Refilling',
      'AC Dismantling and New Wall Mounting',
      'Inverter DC Circuit Board Repair',
      'Compressor Replacement with Warranty'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03218765432',
    rating: 4.8,
    reviewCount: 52,
    status: 'approved',
    isFeatured: true,
    isSponsored: true,
    createdAt: '2026-01-12T10:00:00.000Z'
  },
  {
    id: 'biz-3',
    ownerName: 'Muhammad Salman Khan',
    businessName: 'Saddar Mobile Zone & LCD Lab',
    mobile: '0334-3129845',
    email: 'salman.saddarmobile@gmail.com',
    category: 'Mobile Shops',
    description: 'Trusted mobile repair and accessories hub in the heart of Saddar, Karachi. Specializing in original OLED/AMOLED screen replacement, water damage revival, battery replacement, PTA registration assistance, and genuine branded charging accessories. Certified technician with micro-soldering gear.',
    fullAddress: 'Shop # G-42, Ground Floor, Star City Mall, Abdullah Haroon Road, Saddar, Karachi',
    karachiArea: 'Saddar',
    openingHours: '11:00 AM - 10:00 PM (Mon-Sat)',
    servicesOffered: [
      'iPhone & Android Screen Replacement',
      'Battery & Charging Port Fixing',
      'PTA Tax Guidance & IME Verification',
      'Water Damage Micro-Soldering',
      'Tempered Glass & Premium Cases'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03343129845',
    rating: 4.7,
    reviewCount: 44,
    status: 'approved',
    isFeatured: true,
    isSponsored: false,
    createdAt: '2026-01-14T11:00:00.000Z'
  },
  {
    id: 'biz-4',
    ownerName: 'Rashid Ali Mistri',
    businessName: 'Karachi Sanitary & Motor Plumbing Works',
    mobile: '0313-2559012',
    email: 'rashid.plumbingkhi@gmail.com',
    category: 'Plumbers',
    description: 'Expert water motor pumping repair (Donkey pump & Centrifugal pump), underground and overhead water tank cleanings, geyser installations, bathroom commode and mixer tap fittings. Available for emergency leaks across North Nazimabad and Nazimabad.',
    fullAddress: 'Shop 8, Block H, Near Hydri Super Market, North Nazimabad, Karachi',
    karachiArea: 'North Nazimabad',
    openingHours: '08:00 AM - 09:30 PM (Daily)',
    servicesOffered: [
      'Water Motor & Donkey Pump Rewinding',
      'Bathroom Sanitary Ware & Mixer Fitting',
      'Gas & Electric Geyser Installation',
      'Underground & Roof Water Tank Cleaning',
      'Pipe Leakage Detection with No Wall Damage'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03132559012',
    rating: 4.9,
    reviewCount: 29,
    status: 'approved',
    isFeatured: false,
    isSponsored: false,
    createdAt: '2026-01-18T14:00:00.000Z'
  },
  {
    id: 'biz-5',
    ownerName: 'M. Waqas Ansari',
    businessName: 'Uni-Center Laptop & Gaming PC Hub',
    mobile: '0302-8901234',
    email: 'waqas.pc@unicenter.pk',
    category: 'Computer and Laptop Repair',
    description: 'Karachi’s reliable hardware and software repair shop for Dell, HP, Lenovo, MacBook and custom gaming rigs. Thermal paste reapplication, motherboard chip-level repair, NVMe SSD upgrades, and Windows 11 optimization. Free diagnosis upon walk-in.',
    fullAddress: 'Mezzanine Floor, Uni Center, I.I. Chundrigar Road, Saddar, Karachi',
    karachiArea: 'Saddar',
    openingHours: '11:00 AM - 08:30 PM (Closed Sunday)',
    servicesOffered: [
      'MacBook & Laptop Screen/Keyboard Replacement',
      'Gaming PC Assembling & Thermal Benchmarking',
      'Motherboard Mosfet & IC Micro-Soldering',
      'NVMe SSD & RAM Upgrade with OS Migration',
      'Data Recovery from Dead Hard Drives'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03028901234',
    rating: 4.8,
    reviewCount: 31,
    status: 'approved',
    isFeatured: false,
    isSponsored: false,
    createdAt: '2026-01-20T16:00:00.000Z'
  },
  {
    id: 'biz-6',
    ownerName: 'Syeda Fatima Rizvi',
    businessName: 'Clifton Glamour Beauty Salon & Spa',
    mobile: '0305-6712398',
    email: 'fatima.glamourclifton@gmail.com',
    category: 'Beauty Salons',
    description: 'Exclusive beauty lounge catering to women in Clifton and DHA. Certified international cosmetologists offering bridal & party makeovers, HydraFacials, keratin hair treatments, manicure/pedicure, herbal waxing, and mehndi designs in a serene hygienic atmosphere.',
    fullAddress: 'Bungalow 43-B, Block 4, Near Bilawal House Chowrangi, Clifton, Karachi',
    karachiArea: 'Clifton',
    openingHours: '11:00 AM - 08:00 PM (Tue-Sun)',
    servicesOffered: [
      'Bridal & Valima Signature Makeup',
      'HydraFacial & Deep Pore Cleanse',
      'Hair Keratin, Rebonding & Protein Treatment',
      'Spa Manicure, Pedicure & Nail Art',
      'Full Body Waxing & Herbal Threading'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03056712398',
    rating: 5.0,
    reviewCount: 46,
    status: 'approved',
    isFeatured: true,
    isSponsored: true,
    isPremium: true,
    createdAt: '2026-01-22T09:30:00.000Z'
  },
  {
    id: 'biz-7',
    ownerName: 'Ustad Irfan Mechanic',
    businessName: 'DHA Precision Auto & EFI Workshop',
    mobile: '0300-9821430',
    email: 'irfan.dhaauto@gmail.com',
    category: 'Car Mechanics',
    description: 'State of the art Japanese and European car workshop in DHA Phase 2 Extension. Computerized scanner EFI engine tuning, automatic transmission servicing, hybrid battery health checks, suspension overhaul, and disc rotor skimming.',
    fullAddress: 'Plot 18-C, Commercial Street 14, DHA Phase 2 Ext, Karachi',
    karachiArea: 'DHA (Defence)',
    openingHours: '09:30 AM - 09:00 PM (Daily)',
    servicesOffered: [
      'Computerized EFI Scanner Engine Diagnostics',
      'Automatic / CVT Gearbox Fluid Flush',
      'Brake Pad Replacement & Rotor Skimming',
      'Full Suspension Bushing & Shock Absorbers',
      'Hybrid Battery Cell Balancing & Inverter Check'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03009821430',
    rating: 4.8,
    reviewCount: 39,
    status: 'approved',
    isFeatured: true,
    isSponsored: false,
    createdAt: '2026-01-25T11:00:00.000Z'
  },
  {
    id: 'biz-8',
    ownerName: 'Haji Nisar Ahmed',
    businessName: 'Burns Road Dehli Pakwan & Caterers',
    mobile: '0322-4411987',
    email: 'nisar.dehli@burnsroad.pk',
    category: 'Restaurants',
    description: 'Authentic Karachi traditional culinary heritage. Serving legendary Beef Nalli Biryani, Chicken Dum Biryani, Shahi Qorma, Seekh Kabab, and piping hot Sheermal. Full catering arrangements for Karachi weddings, milad, corporate lunches, and family daawats.',
    fullAddress: 'Near Fresco Sweets, Burns Road Food Street, Saddar, Karachi',
    karachiArea: 'Saddar',
    openingHours: '12:00 PM - 02:00 AM (Daily)',
    servicesOffered: [
      'Deg Orders (Chicken, Beef & Mutton Biryani)',
      'Wedding & Daawat Catering (Full Setup)',
      'Live BBQ & Sheermal Stalls',
      'Customized Sweet Dish (Kheer & Rabri) Pots',
      'Corporate Lunch Box Bulk Deliveries'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03224411987',
    rating: 4.9,
    reviewCount: 68,
    status: 'approved',
    isFeatured: true,
    isSponsored: true,
    createdAt: '2026-01-26T13:00:00.000Z'
  },
  {
    id: 'biz-9',
    ownerName: 'Khurram Shehzad',
    businessName: 'Jauhar Home Appliances Quick Fix',
    mobile: '0331-5509988',
    email: 'khurram.appliances@gmail.com',
    category: 'Home Appliances Repair',
    description: 'On-demand home technician for automatic washing machines, microwave ovens, double-door refrigerators, deep freezers, and water dispensers. Doorstep repair service with 3-month guarantee across Gulistan-e-Jauhar Blocks 1 to 20.',
    fullAddress: 'Shop 4, Block 12, Main Kamran Chowrangi, Gulistan-e-Jauhar, Karachi',
    karachiArea: 'Gulistan-e-Jauhar',
    openingHours: '09:00 AM - 10:00 PM (Daily)',
    servicesOffered: [
      'Automatic Washing Machine Drum & Board Repair',
      'Refrigerator Gas Refill & Thermostat Fixing',
      'Microwave Magnetron & High Voltage Diode Fix',
      'Instant Water Dispenser Cooling/Heating Fix',
      'Deep Freezer Copper Tubing Replacement'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03315509988',
    rating: 4.7,
    reviewCount: 27,
    status: 'approved',
    isFeatured: false,
    isSponsored: false,
    createdAt: '2026-01-28T15:00:00.000Z'
  },
  {
    id: 'biz-10',
    ownerName: 'Zubair Qureshi',
    businessName: 'SafeEye CCTV & Smart Security Karachi',
    mobile: '0301-7788441',
    email: 'info@safeeyecctv.pk',
    category: 'CCTV and Security Systems',
    description: 'Protect your house, shop, factory and school in Karachi. Authorized Hikvision and Dahua distributor. High-definition IP & analog camera installations, night-color vision, smartphone live-streaming configuration, remote access, intercom systems, and biometric time attendance.',
    fullAddress: 'Office # 301, 3rd Floor, Business Avenue, Main PECHS Block 6, Shahrah-e-Faisal, Karachi',
    karachiArea: 'PECHS',
    openingHours: '09:00 AM - 07:00 PM (Mon-Sat)',
    servicesOffered: [
      'HD & IP Camera Installation with Mobile View',
      'Dahua / Hikvision NVR & DVR Setup',
      'Video Intercom & Electric Gate Locks',
      'Biometric Time & Attendance Machines',
      'CCTV Annual Maintenance Contracts (AMC)'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508873696983-2df5703bc398?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03017788441',
    rating: 4.9,
    reviewCount: 35,
    status: 'approved',
    isFeatured: true,
    isSponsored: false,
    createdAt: '2026-01-30T10:00:00.000Z'
  },
  {
    id: 'biz-11',
    ownerName: 'Master Shafiq Ur Rehman',
    businessName: 'Tariq Road Royal Gents & Ladies Tailors',
    mobile: '0333-8822991',
    email: 'master.shafiq@gmail.com',
    category: 'Tailors',
    description: 'Renowned master cutting tailor on Tariq Road. Master of bespoke three-piece suits, designer sherwanis, prince coats, and crisp Shalwar Kameez. Also offering luxury ladies stitching for chiffon, organza, lawn, and bridal pret dresses.',
    fullAddress: 'Shop # 12, Basement, Rabi Center, Main Tariq Road, PECHS, Karachi',
    karachiArea: 'Tariq Road',
    openingHours: '11:00 AM - 11:00 PM (Daily)',
    servicesOffered: [
      'Bespoke 2-Piece & 3-Piece Executive Suits',
      'Traditional Kurta Shalwar & Waistcoats',
      'Designer Wedding Sherwanis & Prince Coats',
      'Ladies Lawn, Chiffon & Silk Designer Stitching',
      'Express 24-Hour Urgent Alteration Service'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03338822991',
    rating: 4.8,
    reviewCount: 41,
    status: 'approved',
    isFeatured: false,
    isSponsored: false,
    createdAt: '2026-02-01T12:00:00.000Z'
  },
  {
    id: 'biz-12',
    ownerName: 'Dr. Shahbaz Alam (Pharm-D)',
    businessName: 'Bahadurabad HealthPlus Pharmacy',
    mobile: '0300-3344556',
    email: 'info@healthpluskarachi.com',
    category: 'Medical Stores',
    description: '24/7 licensed pharmacy located at Bahadurabad Chowrangi. 100% genuine temperature-controlled medicines, insulin, surgical supplies, baby formula, adult diapers, nebulizers, and blood pressure monitors. Free doorstep delivery throughout Bahadurabad, PECHS, and Dhoraji.',
    fullAddress: 'Plot 7, Main Bahadurabad Roundabout, Near Char Minar, Karachi',
    karachiArea: 'Bahadurabad',
    openingHours: '24 Hours / 7 Days Open',
    servicesOffered: [
      'Prescription Medicines with Pharmacist Guidance',
      'Free Home Delivery of Medicines (Karachi)',
      'Insulin & Vaccine Cold-Chain Preservation',
      'Blood Pressure & Sugar Level Testing',
      'Surgical Equipment & Medical Rental Beds'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03003344556',
    rating: 4.9,
    reviewCount: 57,
    status: 'approved',
    isFeatured: true,
    isSponsored: false,
    createdAt: '2026-02-03T14:00:00.000Z'
  },
  {
    id: 'biz-13',
    ownerName: 'Ustad Akram Painter',
    businessName: 'Karachi Colors Home & Wall Painters',
    mobile: '0345-2233441',
    email: 'akram.painterkhi@gmail.com',
    category: 'Painters',
    description: 'Skilled painting contractor providing high-grade interior and exterior finish. Weather sheet coatings for Karachi seaside humidity, plastic emulsion, texture walls, wall putty sanding, wood lacquer polishing, and roof heat-reflective white coating.',
    fullAddress: 'Street 9, Block 16, Federal B Area, Karachi (Home-based Contractor)',
    karachiArea: 'Federal B Area',
    openingHours: '08:00 AM - 08:00 PM (Mon-Sat)',
    servicesOffered: [
      'Interior Plastic Emulsion & Matt Finish',
      'Exterior Weather Shield Anti-Damp Coating',
      'Roof Heat-Proofing White Reflective Paint',
      'Wall Putty Smoothing & Flawless Sanding',
      'Wooden Door Polish, Deco & Lacquer'
    ],
    businessType: 'home_based',
    photos: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03452233441',
    rating: 4.6,
    reviewCount: 22,
    status: 'approved',
    isFeatured: false,
    isSponsored: false,
    createdAt: '2026-02-05T08:30:00.000Z'
  },
  {
    id: 'biz-14',
    ownerName: 'Sir Daniyal Qasim',
    businessName: 'Iqbal Educators & Home Tutors Academy',
    mobile: '0312-9900112',
    email: 'daniyal.iqbaltutors@gmail.com',
    category: 'Tutors and Academies',
    description: 'Providing qualified male and female home tutors and online coaching across Karachi. Specialists in Cambridge O/A Level (Math, Physics, Chemistry, Biology, Economics), Sindh Board Matric & Inter, and entry test preparation (MDCAT, ECAT, IBA, FAST).',
    fullAddress: 'Suite 203, Al-Haram Complex, University Road, Gulshan-e-Iqbal, Karachi',
    karachiArea: 'Gulshan-e-Iqbal',
    openingHours: '10:00 AM - 09:00 PM (Mon-Sat)',
    servicesOffered: [
      'O & A Level Cambridge Home Tutors',
      'Matric & Intermediate Science Coaching',
      'MDCAT / ECAT / IBA Entry Test Guidance',
      'Spoken English & IELTS Preparation',
      'Quran Tarteel & Tajweed Home Teachers'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03129900112',
    rating: 4.9,
    reviewCount: 33,
    status: 'approved',
    isFeatured: false,
    isSponsored: false,
    createdAt: '2026-02-07T11:00:00.000Z'
  },
  {
    id: 'biz-15',
    ownerName: 'Waseem Akram & Sons',
    businessName: 'Korangi Industrial & Domestic Pest Buster',
    mobile: '0300-4455667',
    email: 'waseem.pestcontrol@gmail.com',
    category: 'Pest Control',
    description: 'Government approved termite proofing and odorless fumigation company. Serving residential bungalows, apartments, restaurants, and warehouses across Korangi, Landhi, and Malir. 5-year written warranty for pre-construction and post-construction termite treatments.',
    fullAddress: 'Sector 31-D, Korangi Industrial Area, Near Vita Chowrangi, Karachi',
    karachiArea: 'Korangi',
    openingHours: '08:00 AM - 08:00 PM (Daily)',
    servicesOffered: [
      '5-Year Warranty Termite Proofing Treatment',
      'Odorless Cockroach & Pest Fumigation Gel',
      'Bed Bugs Steam & Chemical Eradication',
      'Water Tank Disinfection & Algae Cleaning',
      'Rodent & Snake Repellent Baiting'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1584727638096-042c45049ebe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03004455667',
    rating: 4.7,
    reviewCount: 20,
    status: 'approved',
    isFeatured: false,
    isSponsored: false,
    createdAt: '2026-02-08T13:30:00.000Z'
  },
  {
    id: 'biz-16',
    ownerName: 'Shahid Nadeem',
    businessName: 'Karachi Bike Doctor & Tuning Center',
    mobile: '0315-7788990',
    email: 'shahid.bikedoctor@gmail.com',
    category: 'Bike Mechanics',
    description: 'Fast and reliable motorcycle repair center. Complete overhaul for Honda CD70, CG125, Pridor, Yamaha YBR125, and Suzuki GS150. Precision carburetor tuning, oil filter change, clutch plate replacement, wiring loom fixes, and alloy rim truing.',
    fullAddress: 'Plot 4, Block 7, Gulshan-e-Iqbal, Near Moti Mahal, Karachi',
    karachiArea: 'Gulshan-e-Iqbal',
    openingHours: '10:00 AM - 10:30 PM (Daily)',
    servicesOffered: [
      'Complete Engine Overhauling & Ring Piston',
      'Computer Carburetor Cleaning & Tuning',
      'Original Japanese Clutch Plate Fitting',
      'Headlight Relay & Wiring Loom Repair',
      'Wheel Alignment & Rim Truing'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03157788990',
    rating: 4.8,
    reviewCount: 36,
    status: 'approved',
    isFeatured: false,
    isSponsored: false,
    createdAt: '2026-02-09T09:00:00.000Z'
  },
  {
    id: 'biz-17',
    ownerName: 'Ali Raza Merchant',
    businessName: 'Sindh Super Mart & Fresh Grocery',
    mobile: '0300-8899112',
    email: 'order@sindhsupermart.pk',
    category: 'Grocery Stores',
    description: 'Full-service air-conditioned grocery store offering premium Basmati rice, pulses, pure desi ghee, fresh Karachi dairy, daily fresh vegetables, frozen foods, spices, and household cleaning supplies. Fast 30-minute home delivery in Scheme 33 and Gulshan-e-Iqbal.',
    fullAddress: 'Commercial Area, Sector 17-A, Main Kiran Hospital Road, Scheme 33, Karachi',
    karachiArea: 'Scheme 33',
    openingHours: '08:00 AM - 11:30 PM (Daily)',
    servicesOffered: [
      'Monthly Rashan Packages with Free Home Delivery',
      'Fresh Farm Milk, Yogurt & Pure Desi Ghee',
      'Imported & Local Spices, Oils & Pulses',
      'Frozen Chicken, Snacks & Dairy Products',
      'Household Toiletries & Cleaning Essentials'
    ],
    businessType: 'shop',
    photos: [
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03008899112',
    rating: 4.6,
    reviewCount: 28,
    status: 'approved',
    isFeatured: false,
    isSponsored: false,
    createdAt: '2026-02-10T12:00:00.000Z'
  },
  {
    id: 'biz-18',
    ownerName: 'Rehan Siddiqui (Pending Verification)',
    businessName: 'Karachi Modern Carpenter Works',
    mobile: '0323-9988114',
    email: 'rehan.carpenter@gmail.com',
    category: 'Carpenters',
    description: 'Custom kitchen cabinets, UV sheet wardrobes, solid wooden main entrance doors, sofa repairs, and bed set polishing across Malir and Airport areas.',
    fullAddress: 'Gali 4, Liaquat Market, Malir City, Karachi',
    karachiArea: 'Malir',
    openingHours: '09:00 AM - 09:00 PM (Mon-Sat)',
    servicesOffered: [
      'Modular Kitchen UV Sheet Cabinetry',
      'Sliding Wardrobes & Bed Set Carpentry',
      'Solid Teak Wood Door Making',
      'Sofa Foam Replacement & Polishing'
    ],
    businessType: 'home_based',
    photos: [
      'https://images.unsplash.com/photo-1502005229762-ee1524228303?auto=format&fit=crop&w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=200&q=80',
    whatsappNumber: '03239988114',
    rating: 0,
    reviewCount: 0,
    status: 'pending', // Pending approval by Admin to demonstrate admin moderation flow!
    createdAt: '2026-02-12T15:20:00.000Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    businessId: 'biz-1',
    customerId: 'user-customer-1',
    customerName: 'Shehbaz Abro',
    customerEmail: 'shehbaz@example.com',
    rating: 5,
    comment: 'Mashallah very honest and professional electrician. Tariq bhai came to our Gulshan house within 30 minutes, fixed the tripping DB box breaker, and properly installed our solar inverter setup. Very reasonable rates for Karachi.',
    createdAt: '2026-01-20T14:15:00.000Z'
  },
  {
    id: 'rev-2',
    businessId: 'biz-1',
    customerId: 'user-customer-2',
    customerName: 'Ayesha Siddiqui',
    customerEmail: 'ayesha.khi@gmail.com',
    rating: 5,
    comment: 'Great service! Fixed our ceiling chandelier and replaced faulty wiring in our drawing room. Very clean work and polite behavior.',
    createdAt: '2026-01-25T16:45:00.000Z'
  },
  {
    id: 'rev-3',
    businessId: 'biz-2',
    customerId: 'user-customer-1',
    customerName: 'Shehbaz Abro',
    customerEmail: 'shehbaz@example.com',
    rating: 5,
    comment: 'Top notch AC servicing. The chemical jet wash made our inverter cool like brand new. They brought their own pressure washer and cleaned up properly.',
    createdAt: '2026-01-28T11:20:00.000Z'
  },
  {
    id: 'rev-4',
    businessId: 'biz-3',
    customerId: 'user-customer-2',
    customerName: 'Ayesha Siddiqui',
    customerEmail: 'ayesha.khi@gmail.com',
    rating: 4,
    comment: 'Replaced my Samsung AMOLED screen on the spot at Star City Mall Saddar. Original quality colors and touch responsiveness. Recommended!',
    createdAt: '2026-02-02T18:00:00.000Z'
  },
  {
    id: 'rev-5',
    businessId: 'biz-6',
    customerId: 'user-customer-2',
    customerName: 'Ayesha Siddiqui',
    customerEmail: 'ayesha.khi@gmail.com',
    rating: 5,
    comment: 'Outstanding bridal prep and HydraFacial! The staff at Clifton Glamour is super cooperative and hygienic. Best salon experience in Clifton.',
    createdAt: '2026-02-04T19:30:00.000Z'
  },
  {
    id: 'rev-6',
    businessId: 'biz-8',
    customerId: 'user-customer-1',
    customerName: 'Shehbaz Abro',
    customerEmail: 'shehbaz@example.com',
    rating: 5,
    comment: 'Classic Burns Road Biryani taste! Ordered 2 degs for our family gathering in PECHS. Everyone loved the aroma and tender beef nalli pieces.',
    createdAt: '2026-02-06T20:10:00.000Z'
  }
];
