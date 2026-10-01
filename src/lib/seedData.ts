import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, setDoc, writeBatch } from 'firebase/firestore';
import { removeUndefinedFields } from './firebase';
import { Banner, Category, Coupon, FAQItem, Policy, Product, Review, SiteSettings, DEFAULT_COMMUNITY_GALLERY } from '../types';
import { COMPREHENSIVE_POLICIES, INITIAL_FAQS } from '../data/contentData';

export { INITIAL_FAQS };

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  businessName: 'FASHINERY',
  tagline: 'Elegance in Every Look',
  logoUrl: '/assets/fashinery-custom-logo.jpg',
  faviconUrl: '',
  email: 'care.fashinery@gmail.com',
  phone: '93720 85090',
  whatsapp: '+91 93720 85090',
  address: 'Kurar Village, Shivaji Nagar, Malad East, Mumbai, Maharashtra, India - 400997',
  currency: '₹',
  shippingCharge: 0,
  freeShippingThreshold: 0,
  freeShippingEnabled: true,
  returnPeriodDays: 7,
  cancellationWindowHours: 24,
  refundProcessingTime: '5-7 business days',
  exchangeWindowDays: 7,
  shippingProcessingTime: '1-2 business days',
  deliveryEstimate: '2-5 business days',
  supportHours: 'Monday to Saturday: 10:00 AM – 7:00 PM IST',
  footerDescription: 'Fashion for every mood, moment and occasion.',
  announcementText: '✦ ELEGANCE IN EVERY LOOK | ✦ FREE SHIPPING ON ALL ORDERS | ✦ EASY 7-DAY DOORSTEP RETURNS',
  announcementActive: true,
  socialInstagram: 'https://www.instagram.com/fashinery.in/',
  socialFacebook: 'https://facebook.com/fashinery',
  socialPinterest: 'https://pinterest.com/fashinery',
  seoTitle: 'Fashinery | Elegance in Every Look - Women’s Luxury Fashion',
  seoDescription: 'Fashinery: Elegance in Every Look. Discover thoughtfully curated Indian women’s fashion blending elegance, comfort, and contemporary style. Free shipping on all orders.',
  seoKeywords: 'women fashion, sarees, lehengas, designer kurtis, ethnic dresses, wedding collection, luxury womenswear',
  heroHeading: 'Fashion That Feels Like You',
  heroSubheading: 'Elegance in Every Look — Discover thoughtfully curated styles designed to bring confidence, comfort and elegance to every occasion.',
  communityGallery: DEFAULT_COMMUNITY_GALLERY,
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-sarees',
    name: 'Sarees',
    slug: 'sarees',
    description: 'Heritage Banarasi, Kanjeevaram, Organza & Chiffon Drapes',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-lehengas',
    name: 'Lehengas',
    slug: 'lehengas',
    description: 'Intricately Embroidered Bridal, Velvet & Festive Lehengas',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-kurtis',
    name: 'Kurtis',
    slug: 'kurtis',
    description: 'Artisanal Anarkalis, Flared Tunics & Everyday Silk Kurtas',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-dresses',
    name: 'Dresses',
    slug: 'dresses',
    description: 'Bespoke Evening Gowns, Georgette Maxis & Modern Silhouettes',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'cat-tops',
    name: 'Tops',
    slug: 'tops',
    description: 'Satin Peplum Blouses, Chanderi Tunics & Modern Shirts',
    image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'cat-bottomwear',
    name: 'Bottom Wear',
    slug: 'bottom-wear',
    description: 'Silk Brocade Shararas, Palazzos & Tailored Trousers',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    sortOrder: 6,
    isActive: true,
  },
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-hero-1',
    title: 'Royal Heritage Silk Sarees',
    subtitle: 'THE BRIDAL & FESTIVE COUTURE 2026',
    description: 'Handwoven pure katan silks adorned with antique golden zari motifs for cherished moments.',
    desktopImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85',
    mobileImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
    buttonText: 'Explore Collection',
    buttonUrl: '/shop?category=sarees',
    position: 'hero',
    sortOrder: 1,
    isActive: true,
    discountBadge: 'NEW SEASON',
  },
  {
    id: 'banner-hero-2',
    title: 'Embroidered Velvet Lehengas',
    subtitle: 'OPULENCE REDEFINED',
    description: 'Lavish hand-embroidery, delicate mirror embellishments, and artisanal silhouettes.',
    desktopImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=85',
    mobileImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
    buttonText: 'Discover Lehengas',
    buttonUrl: '/shop?category=lehengas',
    position: 'hero',
    sortOrder: 2,
    isActive: true,
    discountBadge: 'LIMITED EDITION',
  },
  {
    id: 'banner-hero-3',
    title: 'Effortless Contemporary Luxury',
    subtitle: 'SUMMER RETREAT CAPSULE',
    description: 'Featherlight silks, breathable linens, and flowing evening gowns designed for refined ease.',
    desktopImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=85',
    mobileImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85',
    buttonText: 'Shop Dresses & Sets',
    buttonUrl: '/shop?category=dresses',
    position: 'hero',
    sortOrder: 3,
    isActive: true,
    discountBadge: 'TRENDING NOW',
  },
  {
    id: 'banner-promo-1',
    title: 'Artisanal Craftsmanship at Heart',
    subtitle: 'MID-SEASON CELEBRATION',
    description: 'Enjoy complimentary express shipping across India and an additional 10% off on your first bridal curation.',
    desktopImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=85',
    buttonText: 'Explore Festive Capsule',
    buttonUrl: '/shop?tag=new',
    position: 'promo',
    sortOrder: 1,
    isActive: true,
    discountBadge: 'UP TO 35% OFF',
  },
  {
    id: 'banner-offer-1',
    title: 'Festive Grandeur Offer',
    subtitle: 'FLAT ₹1,000 OFF ON ORDERS ABOVE ₹5,999',
    description: 'Use code FESTIVE1000 at checkout for privileged designer reductions.',
    desktopImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85',
    buttonText: 'Claim Festive Offer',
    buttonUrl: '/shop',
    position: 'offer',
    sortOrder: 1,
    isActive: true,
    discountBadge: 'CODE: FESTIVE1000',
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-saree-1',
    name: 'Kashi Heritage Banarasi Katan Silk Saree',
    slug: 'kashi-heritage-banarasi-katan-silk-saree',
    sku: 'FSH-SAR-001',
    categoryId: 'cat-sarees',
    categoryName: 'Sarees',
    subCategory: 'Banarasi',
    brand: 'Fashinery Haute',
    shortDescription: 'Pure handwoven katan silk saree embellished with regal Kadwa floral jaal in antique gold zari.',
    description: 'Woven by master artisans in the historic looms of Varanasi, this Kashi Heritage Banarasi saree is crafted from pure katan silk. The deep crimson body is enveloped in an intricate golden floral kadwa jaal, accented with a lavish pallu and complemented by an unstitched brocade blouse piece. Perfect for weddings, receptions, and family heirlooms.',
    mrp: 24999,
    sellingPrice: 17499,
    discountPercent: 30,
    stock: 8,
    lowStockThreshold: 3,
    sizes: ['Free Size (5.5m + 0.8m Blouse)'],
    colors: ['Royal Crimson', 'Midnight Navy', 'Emerald Zari'],
    colorOptions: [
      { id: 'col-saree-1', name: 'Royal Crimson', hexCode: '#8B0000', isEnabled: true },
      { id: 'col-saree-2', name: 'Midnight Navy', hexCode: '#191970', isEnabled: true },
      { id: 'col-saree-3', name: 'Emerald Zari', hexCode: '#046307', isEnabled: true },
    ],
    sizeOptions: [
      { id: 'sz-saree-1', name: 'Free Size (5.5m + 0.8m Blouse)', isEnabled: true },
    ],
    variants: [
      {
        id: 'var-saree-1',
        color: 'Royal Crimson',
        size: 'Free Size (5.5m + 0.8m Blouse)',
        sku: 'FSH-SAR-001-CRM',
        stock: 8,
        sellingPrice: 17499,
        mrp: 24999,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
        isEnabled: true,
      },
      {
        id: 'var-saree-2',
        color: 'Midnight Navy',
        size: 'Free Size (5.5m + 0.8m Blouse)',
        sku: 'FSH-SAR-001-NVY',
        stock: 5,
        sellingPrice: 17499,
        mrp: 24999,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
        isEnabled: true,
      },
      {
        id: 'var-saree-3',
        color: 'Emerald Zari',
        size: 'Free Size (5.5m + 0.8m Blouse)',
        sku: 'FSH-SAR-001-EMR',
        stock: 6,
        sellingPrice: 17499,
        mrp: 24999,
        image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=85',
        isEnabled: true,
      },
    ],
    fabric: '100% Pure Katan Silk with Antique Gold Zari',
    weight: '850 g',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=85',
    ],
    featured: true,
    bestseller: true,
    newArrival: true,
    published: true,
    rating: 4.9,
    reviewCount: 28,
    sizeChart: [
      { size: 'Standard', bust: 'Fits all', waist: 'Adjustable', hip: 'Free', length: '5.5 meters' }
    ],
    shippingInfo: 'Dispatched within 24-48 hours. Express insured delivery across India in 3-5 business days.',
    returnInfo: 'Eligible for 7-day doorstep return. Please generate return request online via your Fashinery account or WhatsApp support before dispatch.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-lehenga-1',
    name: 'Gulabi Mahal Zardozi Embroidered Bridal Lehenga',
    slug: 'gulabi-mahal-zardozi-embroidered-bridal-lehenga',
    sku: 'FSH-LHG-002',
    categoryId: 'cat-lehengas',
    categoryName: 'Lehengas',
    subCategory: 'Bridal Couture',
    brand: 'Fashinery Bridal',
    shortDescription: 'A statement blush rose micro-velvet lehenga with resham threadwork, sequins, and twin net dupattas.',
    description: 'Imbued with royal romance, the Gulabi Mahal bridal set showcases a 16-kali kalidar flare adorned with handcrafted zardozi, hand-cut sequins, and shimmering dabka embroidery. Includes a sweetheart neckline choli, an embroidered waist belt, and two lightweight organza dupattas for ceremonial grandeur.',
    mrp: 49999,
    sellingPrice: 34999,
    discountPercent: 30,
    stock: 4,
    lowStockThreshold: 2,
    sizes: ['S (34)', 'M (36)', 'L (38)', 'XL (40)', 'Custom Fit'],
    colors: ['Blush Rose', 'Royal Wine', 'Ivory Gold'],
    colorOptions: [
      { id: 'col-lhg-1', name: 'Blush Rose', hexCode: '#DE5D83', isEnabled: true },
      { id: 'col-lhg-2', name: 'Royal Wine', hexCode: '#722F37', isEnabled: true },
      { id: 'col-lhg-3', name: 'Ivory Gold', hexCode: '#E8D8A0', isEnabled: true },
    ],
    sizeOptions: [
      { id: 'sz-lhg-1', name: 'S (34)', isEnabled: true },
      { id: 'sz-lhg-2', name: 'M (36)', isEnabled: true },
      { id: 'sz-lhg-3', name: 'L (38)', isEnabled: true },
      { id: 'sz-lhg-4', name: 'XL (40)', isEnabled: true },
      { id: 'sz-lhg-5', name: 'Custom Fit', isEnabled: true },
    ],
    variants: [
      { id: 'var-lhg-1', color: 'Blush Rose', size: 'S (34)', sku: 'FSH-LHG-002-BR-S', stock: 4, sellingPrice: 34999, mrp: 49999, isEnabled: true },
      { id: 'var-lhg-2', color: 'Blush Rose', size: 'M (36)', sku: 'FSH-LHG-002-BR-M', stock: 6, sellingPrice: 34999, mrp: 49999, isEnabled: true },
      { id: 'var-lhg-3', color: 'Blush Rose', size: 'L (38)', sku: 'FSH-LHG-002-BR-L', stock: 3, sellingPrice: 34999, mrp: 49999, isEnabled: true },
      { id: 'var-lhg-4', color: 'Royal Wine', size: 'M (36)', sku: 'FSH-LHG-002-RW-M', stock: 4, sellingPrice: 34999, mrp: 49999, isEnabled: true },
      { id: 'var-lhg-5', color: 'Royal Wine', size: 'L (38)', sku: 'FSH-LHG-002-RW-L', stock: 2, sellingPrice: 34999, mrp: 49999, isEnabled: true },
      { id: 'var-lhg-6', color: 'Ivory Gold', size: 'Custom Fit', sku: 'FSH-LHG-002-IG-CUS', stock: 5, sellingPrice: 36999, mrp: 52999, isEnabled: true },
    ],
    fabric: 'Fine Micro Velvet & Organza Silk',
    weight: '2.4 kg',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85',
    ],
    featured: true,
    bestseller: true,
    newArrival: false,
    published: true,
    rating: 5.0,
    reviewCount: 19,
    sizeChart: [
      { size: 'S', bust: '34 in', waist: '28 in', hip: '38 in', length: '42 in' },
      { size: 'M', bust: '36 in', waist: '30 in', hip: '40 in', length: '42 in' },
      { size: 'L', bust: '38 in', waist: '32 in', hip: '42 in', length: '43 in' },
      { size: 'XL', bust: '40 in', waist: '34 in', hip: '44 in', length: '43 in' },
    ],
    shippingInfo: 'Custom handcrafted piece. Dispatched within 3-4 days with white-glove packaging.',
    returnInfo: 'Eligible for 7-day return policy. Product must remain unaltered with original tags intact.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-kurti-1',
    name: 'Chandni Noor Chanderi Silk Anarkali Set',
    slug: 'chandni-noor-chanderi-silk-anarkali-set',
    sku: 'FSH-KUR-003',
    categoryId: 'cat-kurtis',
    categoryName: 'Kurtis',
    subCategory: 'Anarkali Suits',
    brand: 'Fashinery Everyday',
    shortDescription: 'Flared ivory Chanderi silk anarkali with gota patti neckline, matching cigarette pants, and organza dupatta.',
    description: 'An ode to understated elegance, the Chandni Noor three-piece suit is woven from airy Chanderi silk. Features a gracefully gathered floor-sweeping kalidar silhouette accented with subtle marodi and gota patti threadwork along the keyhole neckline and cuffs.',
    mrp: 8999,
    sellingPrice: 5999,
    discountPercent: 33,
    stock: 15,
    lowStockThreshold: 4,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Moonlight Ivory', 'Pastel Sage', 'Powder Peach'],
    fabric: 'Pure Chanderi Silk with Soft Mulmul Lining',
    weight: '620 g',
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=1000&q=85',
    ],
    featured: true,
    bestseller: false,
    newArrival: true,
    published: true,
    rating: 4.8,
    reviewCount: 34,
    sizeChart: [
      { size: 'XS', bust: '32 in', waist: '26 in', hip: '36 in', length: '48 in' },
      { size: 'S', bust: '34 in', waist: '28 in', hip: '38 in', length: '48 in' },
      { size: 'M', bust: '36 in', waist: '30 in', hip: '40 in', length: '49 in' },
      { size: 'L', bust: '38 in', waist: '32 in', hip: '42 in', length: '49 in' },
      { size: 'XL', bust: '40 in', waist: '34 in', hip: '44 in', length: '50 in' },
      { size: 'XXL', bust: '42 in', waist: '36 in', hip: '46 in', length: '50 in' },
    ],
    shippingInfo: 'Ready to ship. Delivered across India within 3-4 working days.',
    returnInfo: '7-day hassle-free doorstep returns and exchanges through Fashinery customer portal.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-dress-1',
    name: 'Athena Pleated Mulberry Silk Maxi Gown',
    slug: 'athena-pleated-mulberry-silk-maxi-gown',
    sku: 'FSH-DRS-004',
    categoryId: 'cat-dresses',
    categoryName: 'Dresses',
    subCategory: 'Evening Gowns',
    brand: 'Fashinery Atelier',
    shortDescription: 'Fluid micro-pleated champagne silk maxi with cowl back and detachable embellished sash belt.',
    description: 'Designed for gala evenings and rooftop soirees, this gown drapes with architectural poise. Crafted from fluid mulberry silk, it features hand-pleated sunburst detailing across the bodice and a sensual drape down to an ankle-grazing hemline.',
    mrp: 14999,
    sellingPrice: 9999,
    discountPercent: 33,
    stock: 9,
    lowStockThreshold: 3,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Champagne Pearl', 'Midnight Emerald', 'Onyx Noir'],
    fabric: '100% Pure Mulberry Silk Georgette',
    weight: '480 g',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
    ],
    featured: true,
    bestseller: false,
    newArrival: true,
    published: true,
    rating: 4.9,
    reviewCount: 14,
    sizeChart: [
      { size: 'XS', bust: '32 in', waist: '25 in', hip: '35 in', length: '54 in' },
      { size: 'S', bust: '34 in', waist: '27 in', hip: '37 in', length: '54 in' },
      { size: 'M', bust: '36 in', waist: '29 in', hip: '39 in', length: '55 in' },
      { size: 'L', bust: '38 in', waist: '31 in', hip: '41 in', length: '55 in' },
    ],
    shippingInfo: 'Fast dispatch. Gift boxed with garment protection bag.',
    returnInfo: '7-day returns. Must be unworn with all security ribbons and tags attached.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-top-1',
    name: 'Sora Sculpted Organza Peplum Top',
    slug: 'sora-sculpted-organza-peplum-top',
    sku: 'FSH-TOP-005',
    categoryId: 'cat-tops',
    categoryName: 'Tops',
    subCategory: 'Blouses & Tops',
    brand: 'Fashinery Atelier',
    shortDescription: 'Tailored organza blouse featuring puff lantern sleeves and hand-embroidered pearl cuff details.',
    description: 'The Sora Peplum Top fuses crisp architectural tailoring with whimsical femininity. Featuring a structured high collar, pleated peplum flare, and delicate pearl buttons down the front placket.',
    mrp: 4999,
    sellingPrice: 3299,
    discountPercent: 34,
    stock: 12,
    lowStockThreshold: 4,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Opal Blush', 'Ivory Whisper'],
    fabric: 'Structured Silk Organza with Cotton Voile Lining',
    weight: '300 g',
    images: [
      'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85',
    ],
    featured: false,
    bestseller: true,
    newArrival: false,
    published: true,
    rating: 4.7,
    reviewCount: 22,
    sizeChart: [
      { size: 'XS', bust: '32 in', waist: '26 in', hip: '34 in', length: '22 in' },
      { size: 'S', bust: '34 in', waist: '28 in', hip: '36 in', length: '23 in' },
      { size: 'M', bust: '36 in', waist: '30 in', hip: '38 in', length: '23 in' },
      { size: 'L', bust: '38 in', waist: '32 in', hip: '40 in', length: '24 in' },
    ],
    shippingInfo: 'Standard dispatch in 24 hours.',
    returnInfo: '7-day doorstep return policy.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-bottom-1',
    name: 'Zareen Jacquard Weave Kalidar Sharara Pants',
    slug: 'zareen-jacquard-weave-kalidar-sharara-pants',
    sku: 'FSH-BTM-006',
    categoryId: 'cat-bottomwear',
    categoryName: 'Bottom Wear',
    subCategory: 'Shararas & Palazzos',
    brand: 'Fashinery Haute',
    shortDescription: 'Voluminous tiered sharara trousers woven in rich golden zari jacquard silk with elasticated back.',
    description: 'Command timeless grace with our Zareen Sharara pants. Each tier is hand-gathered to deliver sweeping flare with every step, finished with delicate scalloped gold hem borders.',
    mrp: 6499,
    sellingPrice: 4499,
    discountPercent: 30,
    stock: 14,
    lowStockThreshold: 4,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Vintage Gold', 'Ruby Scarlet', 'Teal Sapphire'],
    fabric: 'Banarasi Art Jacquard Silk',
    weight: '510 g',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
    ],
    featured: false,
    bestseller: true,
    newArrival: true,
    published: true,
    rating: 4.8,
    reviewCount: 16,
    sizeChart: [
      { size: 'S', bust: '-', waist: '28-30 in', hip: '40 in', length: '39 in' },
      { size: 'M', bust: '-', waist: '30-32 in', hip: '42 in', length: '40 in' },
      { size: 'L', bust: '-', waist: '32-34 in', hip: '44 in', length: '40 in' },
      { size: 'XL', bust: '-', waist: '34-36 in', hip: '46 in', length: '41 in' },
    ],
    shippingInfo: 'Standard dispatch in 24-48 hours.',
    returnInfo: '7-day easy exchange or return with door-step pickup.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-saree-2',
    name: 'Vrindavan Hand-Painted Organza Saree',
    slug: 'vrindavan-hand-painted-organza-saree',
    sku: 'FSH-SAR-007',
    categoryId: 'cat-sarees',
    categoryName: 'Sarees',
    subCategory: 'Organza',
    brand: 'Fashinery Haute',
    shortDescription: 'Pastel lilac whisper-light organza saree featuring watercolor botanical blooms and cutwork scalloped borders.',
    description: 'A poetic masterpiece for day festivities, this saree is hand-painted with pastel botanical flora on pure lightweight silk organza. Finished with shimmering gota cutwork scalloped borders and comes with an unstitched raw silk blouse piece.',
    mrp: 18999,
    sellingPrice: 12999,
    discountPercent: 31,
    stock: 6,
    lowStockThreshold: 2,
    sizes: ['Free Size (5.5m + 0.8m Blouse)'],
    colors: ['Pastel Lilac', 'Mint Green', 'Rose Quartz'],
    fabric: 'Pure Silk Organza with Fine Gota Cutwork',
    weight: '450 g',
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
    ],
    featured: true,
    bestseller: false,
    newArrival: true,
    published: true,
    rating: 4.9,
    reviewCount: 18,
    sizeChart: [
      { size: 'Standard', bust: 'Fits all', waist: 'Adjustable', hip: 'Free', length: '5.5 meters' }
    ],
    shippingInfo: 'Dispatched within 24 hours. Express shipping across India.',
    returnInfo: '7-day return policy. Product must be unstitched and untampered.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-dress-2',
    name: 'Noor Jahan Tiered Floral Chiffon Maxi',
    slug: 'noor-jahan-tiered-floral-chiffon-maxi',
    sku: 'FSH-DRS-008',
    categoryId: 'cat-dresses',
    categoryName: 'Dresses',
    subCategory: 'Maxi Dresses',
    brand: 'Fashinery Everyday',
    shortDescription: 'Bohemian luxury floral print maxi with bishop sleeves, tiered skirt, and self-fabric tie belt.',
    description: 'Imbued with breezy romanticism, the Noor Jahan maxi dress combines fluid georgette chiffon with nostalgic vintage floral prints. A flattering smocked waistline and billowing bishop sleeves make this an effortless choice for garden parties.',
    mrp: 6999,
    sellingPrice: 4799,
    discountPercent: 31,
    stock: 11,
    lowStockThreshold: 3,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Dusty Rose Flora', 'Vintage Sage'],
    fabric: 'Bemberg Georgette Chiffon with Micro Crepe Lining',
    weight: '520 g',
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85',
    ],
    featured: false,
    bestseller: true,
    newArrival: true,
    published: true,
    rating: 4.8,
    reviewCount: 31,
    sizeChart: [
      { size: 'XS', bust: '32 in', waist: '26 in', hip: '36 in', length: '52 in' },
      { size: 'S', bust: '34 in', waist: '28 in', hip: '38 in', length: '52 in' },
      { size: 'M', bust: '36 in', waist: '30 in', hip: '40 in', length: '53 in' },
      { size: 'L', bust: '38 in', waist: '32 in', hip: '42 in', length: '53 in' },
      { size: 'XL', bust: '40 in', waist: '34 in', hip: '44 in', length: '54 in' },
    ],
    shippingInfo: 'Fast dispatch within 24 hours. Express air delivery.',
    returnInfo: '7-day doorstep return policy. Exchange available.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coupon-fashion10',
    code: 'FASHION10',
    description: '10% instant discount on luxury sarees & ethnic wear above ₹1,999',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 1999,
    maxDiscount: 1500,
    usageLimit: 500,
    usedCount: 42,
    perCustomerLimit: 3,
    isActive: true,
    startDate: '2026-01-01',
    validUntil: '2026-12-31',
  },
  {
    id: 'coupon-welcome500',
    code: 'WELCOME500',
    description: 'Flat ₹500 discount on your wedding & bridal orders above ₹2,999',
    discountType: 'fixed',
    discountValue: 500,
    minOrderValue: 2999,
    maxDiscount: 500,
    usageLimit: 1000,
    usedCount: 119,
    perCustomerLimit: 1,
    isActive: true,
    startDate: '2026-01-01',
    validUntil: '2026-12-31',
  },
  {
    id: 'coupon-festive1000',
    code: 'FESTIVE1000',
    description: 'Flat ₹1,000 royal celebration savings on orders above ₹5,999',
    discountType: 'fixed',
    discountValue: 1000,
    minOrderValue: 5999,
    maxDiscount: 1000,
    usageLimit: 300,
    usedCount: 27,
    perCustomerLimit: 2,
    isActive: true,
    startDate: '2026-01-01',
    validUntil: '2026-12-31',
  }
];

export const INITIAL_POLICIES: Policy[] = COMPREHENSIVE_POLICIES;

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-saree-1',
    productName: 'Kashi Heritage Banarasi Katan Silk Saree',
    userName: 'Ananya Deshmukh',
    rating: 5,
    comment: 'The craftsmanship on this Banarasi saree is breathtaking. The pure silk has that royal drape, and the zari work is authentic and subtle without being loud. Received endless compliments at my brother’s reception!',
    status: 'approved',
    isFeatured: true,
    createdAt: '2026-03-01T10:30:00Z',
  },
  {
    id: 'rev-2',
    productId: 'prod-lehenga-1',
    productName: 'Gulabi Mahal Zardozi Embroidered Bridal Lehenga',
    userName: 'Pooja Singhania',
    rating: 5,
    comment: 'Ordered this for my Sangeet and Fashinery customized the blouse fit to absolute perfection! The velvet flare is so rich and the twin dupattas made draping so effortless. Worth every single rupee.',
    status: 'approved',
    isFeatured: true,
    createdAt: '2026-03-05T14:20:00Z',
  },
  {
    id: 'rev-3',
    productId: 'prod-kurti-1',
    productName: 'Chandni Noor Chanderi Silk Anarkali Set',
    userName: 'Meera Iyer',
    rating: 5,
    comment: 'Extremely comfortable, pure chanderi fabric with very delicate gota detailing. Delivery to Bengaluru took just 3 days. Super happy with the quality and packaging!',
    status: 'approved',
    isFeatured: true,
    createdAt: '2026-03-07T09:15:00Z',
  },
];

/**
 * Checks if the store collections are initialized. If empty and admin is signed in, seeds initial data.
 */
export async function seedDatabaseIfNeeded(database: any, isStoreAdmin = false, force = false) {
  try {
    const productsRef = collection(database, 'products');
    const testSnap = await getDocs(query(productsRef, limit(1)));

    if (!force && !testSnap.empty) {
      // Already seeded and not forced
      return;
    }

    // Only attempt Firestore writes if current user is an authenticated store owner / admin
    if (!isStoreAdmin && !force) {
      return;
    }

    console.log('Ensuring initial Fashinery database collections without overwriting user data...');

    // 1. Site Settings (only set if global does not exist)
    const settingsRef = doc(database, 'siteSettings', 'global');
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, removeUndefinedFields(INITIAL_SITE_SETTINGS));
    }

    // 2. Categories (only add if missing)
    for (const cat of INITIAL_CATEGORIES) {
      const catRef = doc(database, 'categories', cat.id);
      const catSnap = await getDoc(catRef);
      if (!catSnap.exists()) {
        await setDoc(catRef, removeUndefinedFields(cat));
      }
    }

    // 3. Products (only add if missing)
    for (const prod of INITIAL_PRODUCTS) {
      const prodRef = doc(database, 'products', prod.id);
      const prodSnap = await getDoc(prodRef);
      if (!prodSnap.exists()) {
        await setDoc(prodRef, removeUndefinedFields(prod));
      }
    }

    // 4. Banners (only add if missing)
    for (const ban of INITIAL_BANNERS) {
      const banRef = doc(database, 'banners', ban.id);
      const banSnap = await getDoc(banRef);
      if (!banSnap.exists()) {
        await setDoc(banRef, removeUndefinedFields(ban));
      }
    }

    // 5. Coupons (only add if missing)
    for (const coup of INITIAL_COUPONS) {
      const coupRef = doc(database, 'coupons', coup.id);
      const coupSnap = await getDoc(coupRef);
      if (!coupSnap.exists()) {
        await setDoc(coupRef, removeUndefinedFields(coup));
      }
    }

    // 6. Policies (only add if missing)
    for (const pol of INITIAL_POLICIES) {
      const polRef = doc(database, 'policies', pol.id);
      const polSnap = await getDoc(polRef);
      if (!polSnap.exists()) {
        await setDoc(polRef, removeUndefinedFields(pol));
      }
    }

    // 7. Reviews (only add if missing)
    for (const rev of INITIAL_REVIEWS) {
      const revRef = doc(database, 'reviews', rev.id);
      const revSnap = await getDoc(revRef);
      if (!revSnap.exists()) {
        await setDoc(revRef, removeUndefinedFields(rev));
      }
    }

    // 8. FAQs (only add if missing)
    for (const faq of INITIAL_FAQS) {
      const faqRef = doc(database, 'faqs', faq.id);
      const faqSnap = await getDoc(faqRef);
      if (!faqSnap.exists()) {
        await setDoc(faqRef, removeUndefinedFields(faq));
      }
    }

    // 9. Bootstrapped admin entry for initial Super Admin
    const adminRef = doc(database, 'admins', 'dheeraj8933');
    const adminSnap = await getDoc(adminRef);
    if (!adminSnap.exists()) {
      const superAdminDoc = {
        id: 'dheeraj8933',
        uid: 'dheeraj8933',
        email: 'dheeraj8933@gmail.com',
        name: 'Dheeraj (Super Admin)',
        role: 'superadmin',
        isActive: true,
        addedBy: 'system-genesis',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(adminRef, removeUndefinedFields(superAdminDoc));
    }

    console.log('Fashinery database check completed successfully!');
  } catch (error) {
    console.warn('Database seeding check note: ', error);
  }
}
