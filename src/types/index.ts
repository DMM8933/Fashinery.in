export interface ProductImageItem {
  id: string;
  url: string;
  storagePath?: string;
  name?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductColorOption {
  id: string;
  name: string;
  hexCode?: string;
  images?: string[];
  galleryImages?: ProductImageItem[];
  isEnabled?: boolean;
}

export interface ProductSizeOption {
  id: string;
  name: string;
  isEnabled?: boolean;
}

export interface ProductVariant {
  id: string;
  colorId?: string;
  color: string;
  sizeId?: string;
  size: string;
  sku: string;
  stock: number;
  sellingPrice: number;
  mrp: number;
  image?: string;
  isEnabled?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  subCategory?: string;
  brand: string;
  shortDescription: string;
  description: string;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  stock: number;
  lowStockThreshold: number;
  sizes: string[];
  colors: string[];
  colorOptions?: ProductColorOption[];
  sizeOptions?: ProductSizeOption[];
  variants?: ProductVariant[];
  fabric: string;
  weight?: string;
  dimensions?: string;
  images: string[];
  galleryImages?: ProductImageItem[];
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  published: boolean;
  rating: number;
  reviewCount: number;
  sizeChart?: {
    size: string;
    bust: string;
    waist: string;
    hip: string;
    length: string;
  }[];
  shippingInfo?: string;
  returnInfo?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  imageStoragePath?: string;
  sortOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  desktopImage: string;
  desktopImageStoragePath?: string;
  mobileImage?: string;
  mobileImageStoragePath?: string;
  buttonText?: string;
  buttonUrl?: string;
  position: 'hero' | 'promo' | 'offer' | 'popup';
  sortOrder: number;
  isActive: boolean;
  discountBadge?: string;
  startDate?: string;
  endDate?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  perCustomerLimit?: number;
  isActive: boolean;
  startDate?: string;
  validUntil?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  mrp: number;
  quantity: number;
  size: string;
  color: string;
  sku: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested'
  | 'Return Approved'
  | 'Returned'
  | 'Refunded'
  | 'Cancellation Requested'
  | 'Exchange Requested'
  | 'Pending Payment'
  | 'Pending'
  | 'Confirmed'
  | 'Processing';

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'UPI / Online Payment'
  | 'Card'
  | 'Razorpay / Online'
  | 'Online Payment (Razorpay)';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'Partially Refunded';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  changedAt: string;
  changedBy: string;
  changedByEmail?: string;
}

export interface PaymentHistoryItem {
  status: PaymentStatus;
  changedAt: string;
  changedBy: string;
  reason?: string;
  source?: string;
}

export interface CancellationRequestInfo {
  reason: string;
  customReason?: string;
  requestedAt: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectedReason?: string;
}

export interface AuditLogItem {
  action: string;
  adminId: string;
  adminEmail?: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: string;
  paymentMarkedBy?: string;
  paymentMarkedAt?: string;
  paymentManualConfirmation?: boolean;
  paymentConfirmationReason?: string;
  paymentVerificationSource?: string;
  paymentHistory?: PaymentHistoryItem[];
  statusHistory?: OrderStatusHistoryItem[];
  auditLogs?: AuditLogItem[];
  cancellationRequest?: CancellationRequestInfo;
  trackingUrl?: string;
  courierPartner?: string;
  trackingNumber?: string;
  courier?: string;
  notes?: string;
  returnReason?: string;
  returnNotes?: string;
  returnRequestedAt?: string;
  returnType?: 'return' | 'exchange';
  returnStatus?: 'pending' | 'approved' | 'rejected' | 'completed';
  cancelledAt?: string;
  cancellationReason?: string;
  customerCancellationReason?: string;
  cancellationDetails?: string;
  cancelledBy?: 'Customer' | 'Admin' | 'customer' | 'admin';
  cancellationApprovedBy?: string;
  cancellationApprovedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function isValidTrackingUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const CANCELLATION_REASONS = [
  'Ordered by mistake',
  'Found a better price',
  'Delivery taking too long',
  'Changed my mind',
  'Other',
] as const;

export type CancellationReason = typeof CANCELLATION_REASONS[number];

export const RETURN_REASONS = [
  'Size does not fit',
  'Damaged/Defective product',
  'Different from image',
  'Incorrect item received',
  'Quality not as expected',
  'Other',
] as const;

export type ReturnReason = typeof RETURN_REASONS[number];

export function isOrderCancellable(order?: Order | null): boolean {
  if (!order) return false;
  const nonCancellableStatuses: OrderStatus[] = [
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Return Requested',
    'Returned',
    'Refunded',
  ];
  return !nonCancellableStatuses.includes(order.orderStatus);
}

export function validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): { isValid: boolean; error?: string } {
  if (currentStatus === newStatus) return { isValid: true };

  // Once an order is Cancelled, Returned, or Refunded, it is terminal and cannot be changed.
  if (currentStatus === 'Cancelled') {
    return { isValid: false, error: 'Cannot update status: This order has already been Cancelled.' };
  }
  if (currentStatus === 'Returned') {
    return { isValid: false, error: 'Cannot update status: This order has already been Returned.' };
  }
  if (currentStatus === 'Refunded') {
    return { isValid: false, error: 'Cannot update status: This order has already been Refunded.' };
  }

  // Progress indexes for active path
  const progressOrder: OrderStatus[] = [
    'Order Placed',
    'Pending',
    'Order Confirmed',
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const getNormalizedIndex = (status: OrderStatus): number => {
    if (status === 'Order Placed' || status === 'Pending') return 0;
    if (status === 'Order Confirmed' || status === 'Confirmed' || status === 'Processing') return 1;
    if (status === 'Packed') return 2;
    if (status === 'Shipped') return 3;
    if (status === 'Out for Delivery') return 4;
    if (status === 'Delivered') return 5;
    return -1;
  };

  const currentIndex = getNormalizedIndex(currentStatus);
  const newIndex = getNormalizedIndex(newStatus);

  // Prevent backward transitions in the delivery progress chain
  if (currentIndex !== -1 && newIndex !== -1) {
    if (newIndex < currentIndex) {
      return {
        isValid: false,
        error: `Cannot change status backward from "${currentStatus}" to "${newStatus}".`,
      };
    }
  }

  // Delivered orders can only transition to return-related statuses or refund-related statuses
  if (currentStatus === 'Delivered') {
    const allowedAfterDelivery: OrderStatus[] = [
      'Return Requested',
      'Return Approved',
      'Returned',
      'Refunded',
      'Exchange Requested',
    ];
    if (!allowedAfterDelivery.includes(newStatus)) {
      return {
        isValid: false,
        error: `A Delivered order can only transition to return or refund actions, not back to "${newStatus}".`,
      };
    }
  }

  return { isValid: true };
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId?: string;
  userName: string;
  userCity?: string;
  isVerified?: boolean;
  title?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured?: boolean;
  createdAt: string;
}

export interface SiteSettings {
  businessName: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  currency: string;
  shippingCharge: number;
  freeShippingThreshold: number;
  returnPeriodDays: number;
  announcementText: string;
  announcementActive: boolean;
  announcementLink?: string;
  supportHours?: string;
  footerDescription?: string;
  // Configurable Policy Timelines
  freeShippingEnabled?: boolean;
  cancellationWindowHours?: number;
  refundProcessingTime?: string;
  exchangeWindowDays?: number;
  shippingProcessingTime?: string;
  deliveryEstimate?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialPinterest?: string;
  socialWhatsApp?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  heroHeading?: string;
  heroSubheading?: string;
  communityGallery?: CommunityGalleryItem[];
}

export interface CommunityGalleryItem {
  id: string;
  imageUrl: string;
  storagePath: string;
  sortOrder: number;
  active: boolean;
  instagramUrl?: string; // Optional individual post URL, defaults to https://www.instagram.com/fashinery.in/
  title?: string;
  likes?: string;
  handle?: string;
}

export const OFFICIAL_FASHINERY_INSTAGRAM = 'https://www.instagram.com/fashinery.in/';

export const DEFAULT_COMMUNITY_GALLERY: CommunityGalleryItem[] = [
  {
    id: 'comm-1',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    storagePath: '',
    sortOrder: 0,
    active: true,
    instagramUrl: 'https://www.instagram.com/fashinery.in/',
    title: 'Heritage Banarasi Silk Look',
    likes: '1.4k',
    handle: '@fashinery.in',
  },
  {
    id: 'comm-2',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    storagePath: '',
    sortOrder: 1,
    active: true,
    instagramUrl: 'https://www.instagram.com/fashinery.in/',
    title: 'Festive Embroidered Lehenga Look',
    likes: '2.1k',
    handle: '@fashinery.in',
  },
  {
    id: 'comm-3',
    imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80',
    storagePath: '',
    sortOrder: 2,
    active: true,
    instagramUrl: 'https://www.instagram.com/fashinery.in/',
    title: 'Bridal Celebration Drape',
    likes: '980',
    handle: '@fashinery.in',
  },
  {
    id: 'comm-4',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    storagePath: '',
    sortOrder: 3,
    active: true,
    instagramUrl: 'https://www.instagram.com/fashinery.in/',
    title: 'Contemporary Luxury Ensemble',
    likes: '3.2k',
    handle: '@fashinery.in',
  },
];

export interface Policy {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  draftContent?: string;
  imageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  status?: 'published' | 'draft' | 'unpublished';
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  category: 'Orders' | 'Payments' | 'Shipping' | 'Returns' | 'Refunds' | 'Exchanges' | 'Products' | 'Account' | 'General';
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  mrp: number;
  size: string;
  color: string;
  quantity: number;
  sku: string;
  maxStock: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  orderId?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  adminNotes?: string;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export type AdminRole = 'superadmin' | 'admin' | 'editor';

export interface AdminUser {
  id: string; // Document ID (usually the Firebase Auth UID)
  uid: string;
  email: string;
  name?: string;
  role: AdminRole;
  isActive: boolean;
  addedBy?: string;
  addedAt: string;
  updatedAt?: string;
}

export interface CustomerAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface CustomerProfile {
  id: string;
  uid: string;
  name: string;
  displayName?: string;
  phone: string;
  email?: string;
  authEmail?: string;
  hasEmail: boolean;
  role: 'customer';
  createdAt: string;
  updatedAt?: string;
  addresses?: CustomerAddress[];
}
