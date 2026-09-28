import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendEmailVerification,
  ActionCodeSettings,
  updateProfile,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  orderBy,
  increment,
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType, removeUndefinedFields } from '../lib/firebase';
import {
  INITIAL_BANNERS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_FAQS,
  INITIAL_POLICIES,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SITE_SETTINGS,
  seedDatabaseIfNeeded,
} from '../lib/seedData';
import {
  AdminRole,
  AdminUser,
  Banner,
  CartItem,
  Category,
  ContactMessage,
  Coupon,
  CustomerAddress,
  CustomerProfile,
  FAQItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Policy,
  Product,
  ProductColorOption,
  ProductSizeOption,
  ProductVariant,
  Review,
  ShippingAddress,
  SiteSettings,
  CommunityGalleryItem,
  DEFAULT_COMMUNITY_GALLERY,
} from '../types';
import {
  validateIndianMobile,
  validateOptionalEmail,
  validateRequiredEmail,
  validatePassword,
  checkPasswordPolicy,
  maskEmail,
  validateSafeURL,
} from '../utils/validation';

export type ActiveView =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'account'
  | 'policy'
  | 'contact'
  | 'about'
  | 'faq'
  | 'track'
  | 'admin'
  | 'admin-login'
  | 'order-success'
  | 'wishlist'
  | 'forgot-password'
  | 'reset-password';

interface StoreContextType {
  // Store Data
  products: Product[];
  categories: Category[];
  banners: Banner[];
  settings: SiteSettings;
  coupons: Coupon[];
  reviews: Review[];
  orders: Order[];
  policies: Policy[];
  faqs: FAQItem[];
  contactMessages: ContactMessage[];
  loading: boolean;
  
  // Navigation & Page State
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  selectedProductSlug: string | null;
  openProductPage: (slugOrId: string) => void;
  selectedCategoryFilter: string | null;
  setSelectedCategoryFilter: (categorySlug: string | null) => void;
  selectedPolicySlug: string;
  setSelectedPolicySlug: (slug: string) => void;
  openPolicyPage: (slug: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  // Cart & Drawers
  cart: CartItem[];
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  isWishlistDrawerOpen: boolean;
  setIsWishlistDrawerOpen: (open: boolean) => void;
  wishlist: string[];
  addToCart: (
    product: Product,
    size: string,
    color: string,
    quantity?: number,
    variantOverride?: Partial<ProductVariant>
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  
  // Pricing & Coupons
  appliedCoupon: Coupon | null;
  couponError: string | null;
  applyCoupon: (codeOrCoupon: string | Coupon) => boolean;
  validateCoupon: (codeOrCoupon: string | Coupon, subtotal?: number) => { isValid: boolean; error?: string; discount: number; coupon?: Coupon };
  removeCoupon: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartShipping: number;
  cartTotal: number;

  // Checkout & Orders
  lastCreatedOrder: Order | null;
  createOrder: (address: ShippingAddress, paymentMethod?: PaymentMethod) => Promise<Order>;
  confirmRazorpayOrder: (verifiedOrder: Order) => void;
  cancelOrder: (
    orderId: string,
    cancellationReason: string,
    cancellationDetails?: string,
    cancelledBy?: 'Customer' | 'Admin'
  ) => Promise<boolean>;
  requestReturn: (orderId: string, reason: string, notes?: string, returnType?: 'return' | 'exchange') => Promise<void>;
  
  // User & Authentication
  user: User | null;
  customerProfile: CustomerProfile | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminRole: AdminRole | null;
  adminUser: AdminUser | null;
  adminUsers: AdminUser[];
  adminMode: boolean;
  authReady: boolean;
  setAdminMode: (active: boolean) => void;
  loginWithGoogle: (isForAdmin?: boolean | unknown) => Promise<void>;
  loginCustomer: (identifier: string, password: string) => Promise<void>;
  registerCustomer: (params: {
    name: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => Promise<void>;
  sendCustomerPasswordReset: (identifier: string) => Promise<{
    success: boolean;
    noEmail?: boolean;
    email?: string;
    maskedEmail?: string;
    message: string;
    cooldownSeconds?: number;
  }>;
  verifyResetCode: (actionCode: string) => Promise<string>;
  confirmReset: (actionCode: string, newPassword: string) => Promise<void>;
  sendCustomerEmailVerification: () => Promise<void>;
  updateCustomerProfile: (data: {
    name?: string;
    phone?: string;
    email?: string;
  }) => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  sendAdminPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;

  // Admin User Management (Super Admin only)
  addAdminUser: (admin: {
    uid?: string;
    email: string;
    name?: string;
    role: AdminRole;
    isActive: boolean;
  }) => Promise<void>;
  updateAdminUserStatus: (adminId: string, isActive: boolean) => Promise<void>;
  updateAdminUserRole: (adminId: string, role: AdminRole) => Promise<void>;
  deleteAdminUser: (adminId: string) => Promise<void>;
  
  // Inquiries & Interactions
  submitContact: (data: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateContactStatus: (id: string, status: 'new' | 'read' | 'replied' | 'archived', adminNotes?: string) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  subscribeNewsletter: (email: string) => Promise<boolean>;
  submitReview: (review: Omit<Review, 'id' | 'createdAt' | 'status'>) => Promise<void>;

  // WhatsApp Integration
  getWhatsAppProductUrl: (product: Product) => string;
  getWhatsAppOrderHelpUrl: (orderNumber: string) => string;
  openGeneralWhatsApp: () => void;

  // Admin Operations
  saveProduct: (product: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  saveCategory: (category: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  saveBanner: (banner: Partial<Banner>) => Promise<void>;
  deleteBanner: (bannerId: string) => Promise<void>;
  saveCoupon: (coupon: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    details?: {
      trackingUrl?: string;
      courierPartner?: string;
      cancellationReason?: string;
      cancelledBy?: 'admin' | 'customer' | 'Customer' | 'Admin';
      notes?: string;
      trackingNumber?: string;
      courier?: string;
    } | string,
    legacyCourier?: string,
    legacyNotes?: string,
    legacyCancellationReason?: string
  ) => Promise<void>;
  saveSiteSettings: (settings: SiteSettings) => Promise<void>;
  saveCommunityGallery: (items: CommunityGalleryItem[]) => Promise<boolean>;
  savePolicy: (policy: Policy) => Promise<void>;
  saveFaq: (faq: Partial<FAQItem>) => Promise<void>;
  deleteFaq: (faqId: string) => Promise<void>;
  moderateReview: (reviewId: string, status: 'approved' | 'rejected') => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  seedDatabase: (force?: boolean) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Collections State (with fallback defaults so UI is never blank)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('fashinery_site_settings');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!parsed.socialInstagram || !parsed.socialInstagram.includes('fashinery.in')) {
            parsed.socialInstagram = 'https://www.instagram.com/fashinery.in/';
          }
          if (!parsed.communityGallery || !Array.isArray(parsed.communityGallery) || parsed.communityGallery.length === 0) {
            parsed.communityGallery = DEFAULT_COMMUNITY_GALLERY;
          }
          return { ...INITIAL_SITE_SETTINGS, ...parsed };
        }
      } catch (e) {
        console.warn('Could not parse cached site settings:', e);
      }
    }
    return INITIAL_SITE_SETTINGS;
  });
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Navigation State
  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedPolicySlug, setSelectedPolicySlug] = useState<string>('shipping');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('fashinery_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fashinery_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  // Auth & Admin
  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminMode, setAdminMode] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Sync Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('fashinery_cart', JSON.stringify(cart));
    } catch (err) {
      console.warn('Could not save cart', err);
    }
  }, [cart]);

  // Sync Wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('fashinery_wishlist', JSON.stringify(wishlist));
    } catch (err) {
      console.warn('Could not save wishlist', err);
    }
  }, [wishlist]);

  // Handle URL hash and pathname changes for easy sharing / admin / reset password routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const search = typeof window !== 'undefined' ? window.location.search : '';

      // Check if URL indicates password reset (either via pathname, hash, or Firebase action query params)
      const isResetUrl =
        pathname === '/reset-password' ||
        pathname.startsWith('/reset-password') ||
        hash === '/reset-password' ||
        hash.startsWith('/reset-password') ||
        hash === 'reset-password' ||
        hash.startsWith('reset-password') ||
        search.includes('mode=resetPassword') ||
        hash.includes('mode=resetPassword') ||
        search.includes('oobCode=') ||
        hash.includes('oobCode=');

      if (isResetUrl) {
        setCurrentView('reset-password');
        setAuthError(null);
        return;
      }

      // Check if URL indicates forgot password page
      const isForgotUrl =
        pathname === '/forgot-password' ||
        pathname.startsWith('/forgot-password') ||
        hash === '/forgot-password' ||
        hash.startsWith('/forgot-password') ||
        hash === 'forgot-password' ||
        hash.startsWith('forgot-password');

      if (isForgotUrl) {
        setCurrentView('forgot-password');
        setAuthError(null);
        return;
      }

      if (!hash || hash === '/' || hash === '/home' || hash === 'home') {
        setCurrentView('home');
        setAuthError(null);
      } else if (hash === '/admin-login' || hash === 'admin-login') {
        setCurrentView('admin-login');
      } else if (hash === '/admin' || hash.startsWith('/admin') || hash === 'admin') {
        setCurrentView('admin');
      } else if (hash.startsWith('/product/')) {
        const slug = hash.replace('/product/', '');
        setSelectedProductSlug(slug);
        setCurrentView('product');
      } else if (hash.startsWith('/shop') || hash === 'shop') {
        setCurrentView('shop');
      } else if (hash.startsWith('/policy/')) {
        const slug = hash.replace('/policy/', '');
        setSelectedPolicySlug(slug);
        setCurrentView('policy');
      } else if (hash === '/about' || hash === 'about') {
        setCurrentView('about');
      } else if (hash === '/faq' || hash === 'faq') {
        setCurrentView('faq');
      } else if (hash === '/track' || hash === 'track') {
        setCurrentView('track');
      } else if (hash === '/contact' || hash === 'contact') {
        setCurrentView('contact');
      } else if (hash === '/account' || hash === 'account') {
        setCurrentView('account');
      } else if (hash === '/cart' || hash === 'cart') {
        setCurrentView('cart');
      } else if (hash === '/checkout' || hash === 'checkout') {
        setCurrentView('checkout');
      } else {
        setCurrentView('home');
        setAuthError(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    handleHashChange();
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Enforce admin protection: Once Firebase Auth is ready, verify administrator authorization
  useEffect(() => {
    if (!authReady) return;

    if (currentView === 'admin') {
      if (!user) {
        // Unauthenticated visitor: route to admin login
        setCurrentView('admin-login');
        if (window.location.hash !== '#/admin-login') {
          window.location.hash = '/admin-login';
        }
      } else if (!isAdmin) {
        // Authenticated customer/unauthorized user: explicitly deny access
        setAuthError('You are not authorized to access the Admin Panel.');
        setCurrentView('admin-login');
        if (window.location.hash !== '#/admin-login') {
          window.location.hash = '/admin-login';
        }
      }
    }
  }, [authReady, currentView, user, isAdmin]);

  // Update URL hash on view changes
  useEffect(() => {
    if (currentView === 'admin') {
      window.location.hash = '/admin';
    } else if (currentView === 'admin-login') {
      window.location.hash = '/admin-login';
    } else if (currentView === 'product' && selectedProductSlug) {
      window.location.hash = `/product/${selectedProductSlug}`;
    } else if (currentView === 'shop') {
      window.location.hash = '/shop';
    } else if (currentView === 'policy') {
      window.location.hash = `/policy/${selectedPolicySlug}`;
    } else if (currentView === 'about') {
      window.location.hash = '/about';
    } else if (currentView === 'faq') {
      window.location.hash = '/faq';
    } else if (currentView === 'track') {
      window.location.hash = '/track';
    } else if (currentView === 'contact') {
      window.location.hash = '/contact';
    } else if (currentView === 'home') {
      if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '') {
        try {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch {
          window.location.hash = '';
        }
      }
    } else {
      window.location.hash = `/${currentView}`;
    }
  }, [currentView, selectedProductSlug, selectedPolicySlug]);

  // Open policy helper
  const openPolicyPage = (slug: string) => {
    if (slug === 'about') {
      setCurrentView('about');
      return;
    }
    if (slug === 'contact') {
      setCurrentView('contact');
      return;
    }
    if (slug === 'faq') {
      setCurrentView('faq');
      return;
    }
    if (slug === 'track') {
      setCurrentView('track');
      return;
    }
    setSelectedPolicySlug(slug);
    setCurrentView('policy');
  };

  // Initialize Firebase listeners & seeding
  useEffect(() => {
    seedDatabaseIfNeeded(db, false).catch(console.error);

    // 1. Auth Listener with strict Firestore Admin Authorization
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setCustomerProfile(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminRole(null);
        setAdminUser(null);
        setAuthReady(true);
        return;
      }

      const isSuperAdminEmail = currentUser.email === 'dheeraj8933@gmail.com';

      // If owner dheeraj8933@gmail.com, immediately guarantee superadmin permissions
      if (isSuperAdminEmail) {
        setIsAdmin(true);
        setIsSuperAdmin(true);
        setAdminRole('superadmin');
      }

      try {
        // Query Firestore /admins/{currentUser.uid}
        let adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));

        // Bootstrap owner dheeraj8933@gmail.com if record doesn't exist yet
        if (!adminSnap.exists() && isSuperAdminEmail) {
          const bootstrapDoc: AdminUser = {
            id: currentUser.uid,
            uid: currentUser.uid,
            email: currentUser.email || 'dheeraj8933@gmail.com',
            name: currentUser.displayName || 'Owner Super Admin',
            role: 'superadmin',
            isActive: true,
            addedBy: 'system-bootstrap',
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try {
            await setDoc(doc(db, 'admins', currentUser.uid), removeUndefinedFields(bootstrapDoc));
            adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
          } catch (bootErr) {
            console.warn('Bootstrap admin doc sync:', bootErr);
          }
        }

        if (isSuperAdminEmail) {
          const adminData = adminSnap.exists() ? (adminSnap.data() as AdminUser) : null;
          setAdminUser(
            adminData || {
              id: currentUser.uid,
              uid: currentUser.uid,
              email: currentUser.email || 'dheeraj8933@gmail.com',
              name: currentUser.displayName || 'Owner Super Admin',
              role: 'superadmin',
              isActive: true,
              addedBy: 'system-bootstrap',
              addedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          );
          setIsAdmin(true);
          setIsSuperAdmin(true);
          setAdminRole('superadmin');
          seedDatabaseIfNeeded(db, true).catch(console.error);
          setAuthReady(true);
          return;
        }

        if (adminSnap.exists()) {
          const adminData = adminSnap.data() as AdminUser;
          if (adminData.isActive === true) {
            setIsAdmin(true);
            setIsSuperAdmin(adminData.role === 'superadmin');
            setAdminRole(adminData.role);
            setAdminUser(adminData);
            seedDatabaseIfNeeded(db, true).catch(console.error);
            setAuthReady(true);
            return;
          }
        }

        // Authenticated user is a regular customer or not an active admin in the admins collection
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminRole(null);
        setAdminUser(null);
        setAuthReady(true);

        // Sync and load Customer Profile
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as CustomerProfile;
            setCustomerProfile(data);

            // If phone exists, ensure phone_lookup is mapped
            if (data.phone) {
              const pVal = validateIndianMobile(data.phone);
              if (pVal.isValid) {
                try {
                  await setDoc(
                    doc(db, 'phone_lookup', pVal.cleanPhone),
                    removeUndefinedFields({
                      phone: pVal.cleanPhone,
                      uid: currentUser.uid,
                      authEmail: data.authEmail || currentUser.email || `${pVal.cleanPhone}@customer.fashinery.in`,
                      hasEmail: Boolean(data.email && !data.email.endsWith('@customer.fashinery.in')),
                      updatedAt: new Date().toISOString(),
                    }),
                    { merge: true }
                  );
                } catch (phErr) {
                  console.warn('Phone lookup sync note:', phErr);
                }
              }
            }
          } else if (currentUser.email !== 'dheeraj8933@gmail.com') {
            const isSynthetic = currentUser.email?.endsWith('@customer.fashinery.in');
            const cleanEmail = isSynthetic ? '' : (currentUser.email || '');
            const newDoc: CustomerProfile = {
              id: currentUser.uid,
              uid: currentUser.uid,
              name: currentUser.displayName || 'Customer',
              displayName: currentUser.displayName || 'Customer',
              phone: currentUser.phoneNumber || '',
              email: cleanEmail,
              authEmail: currentUser.email || '',
              hasEmail: Boolean(cleanEmail),
              role: 'customer',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userRef, removeUndefinedFields(newDoc));
            setCustomerProfile(newDoc);

            if (currentUser.phoneNumber) {
              const pVal = validateIndianMobile(currentUser.phoneNumber);
              if (pVal.isValid) {
                try {
                  await setDoc(
                    doc(db, 'phone_lookup', pVal.cleanPhone),
                    removeUndefinedFields({
                      phone: pVal.cleanPhone,
                      uid: currentUser.uid,
                      authEmail: currentUser.email || '',
                      hasEmail: Boolean(cleanEmail),
                      updatedAt: new Date().toISOString(),
                    }),
                    { merge: true }
                  );
                } catch (phErr) {
                  console.warn('Phone lookup sync note:', phErr);
                }
              }
            }
          }
        } catch (custErr) {
          console.warn('Customer record sync note:', custErr);
        }
      } catch (authErr) {
        console.warn('Admin authorization verification note:', authErr);
        if (isSuperAdminEmail) {
          setIsAdmin(true);
          setIsSuperAdmin(true);
          setAdminRole('superadmin');
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setAdminRole(null);
          setAdminUser(null);
        }
        setAuthReady(true);
      }
    });

    // 2. Products Listener
    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Product[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Product);
          });
          setProducts(list);
        }
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.GET, 'products');
      }
    );

    // 3. Categories Listener
    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Category[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Category);
          });
          list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setCategories(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'categories');
      }
    );

    // 4. Banners Listener
    const unsubBanners = onSnapshot(
      collection(db, 'banners'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Banner[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Banner);
          });
          list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setBanners(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'banners');
      }
    );

    // 5. Site Settings Listener
    const unsubSettings = onSnapshot(
      doc(db, 'siteSettings', 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          const fresh = docSnap.data() as SiteSettings;
          if (!fresh.socialInstagram || !fresh.socialInstagram.includes('fashinery.in')) {
            fresh.socialInstagram = 'https://www.instagram.com/fashinery.in/';
          }
          if (!fresh.communityGallery || !Array.isArray(fresh.communityGallery) || fresh.communityGallery.length === 0) {
            fresh.communityGallery = DEFAULT_COMMUNITY_GALLERY;
          }
          setSettings(fresh);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('fashinery_site_settings', JSON.stringify(fresh));
              if (fresh.logoUrl) {
                localStorage.setItem('fashinery_brand_logo', fresh.logoUrl);
              }
            } catch (storageErr) {
              console.warn('Could not cache site settings:', storageErr);
            }
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'siteSettings/global');
      }
    );

    // 6. Coupons Listener (Firestore single source of truth)
    const unsubCoupons = onSnapshot(
      collection(db, 'coupons'),
      (snapshot) => {
        const list: Coupon[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as Coupon));
        setCoupons(list);

        // Keep applied coupon data updated in real-time
        setAppliedCoupon((prev) => {
          if (!prev) return null;
          const fresh = list.find((c) => c.code.toUpperCase() === prev.code.toUpperCase());
          return fresh || null;
        });
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'coupons');
      }
    );

    // 7. Policies Listener - ensures all initial comprehensive policies are merged
    const unsubPolicies = onSnapshot(
      collection(db, 'policies'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Policy[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Policy);
          });
          const merged = list.map((docPolicy) => {
            const canonical = INITIAL_POLICIES.find(
              (init) => init.slug === docPolicy.slug || init.id === docPolicy.id
            );
            if (
              docPolicy.slug === 'return-refund' ||
              docPolicy.slug === 'returns' ||
              docPolicy.id === 'policy-return-refund'
            ) {
              return canonical ? { ...docPolicy, ...canonical } : docPolicy;
            }
            if (
              canonical &&
              new Date(canonical.updatedAt).getTime() > new Date(docPolicy.updatedAt || 0).getTime()
            ) {
              return { ...docPolicy, ...canonical };
            }
            return docPolicy;
          });
          INITIAL_POLICIES.forEach((init) => {
            if (!merged.some((p) => p.slug === init.slug)) {
              merged.push(init);
            }
          });
          setPolicies(merged);
        } else {
          setPolicies(INITIAL_POLICIES);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'policies');
      }
    );

    // 8. Reviews Listener
    const unsubReviews = onSnapshot(
      collection(db, 'reviews'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Review[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Review);
          });
          setReviews(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'reviews');
      }
    );

    // 9. FAQs Listener
    const unsubFaqs = onSnapshot(
      collection(db, 'faqs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: FAQItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as FAQItem);
          });
          list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setFaqs(list);
        } else {
          setFaqs(INITIAL_FAQS);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'faqs');
      }
    );

    return () => {
      unsubscribeAuth();
      unsubProducts();
      unsubCategories();
      unsubBanners();
      unsubSettings();
      unsubCoupons();
      unsubPolicies();
      unsubReviews();
      unsubFaqs();
    };
  }, []);

  // 10. Admin Contacts Listener
  useEffect(() => {
    if (!isAdmin) return;
    const unsubContacts = onSnapshot(
      collection(db, 'contacts'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ContactMessage[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as ContactMessage);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setContactMessages(list);
        } else {
          setContactMessages([]);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'contacts');
      }
    );
    return () => unsubContacts();
  }, [isAdmin]);

  // 11. Admin Users List Listener (restricted to authorized administrators)
  useEffect(() => {
    if (!isAdmin) {
      setAdminUsers([]);
      return;
    }
    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snapshot) => {
        if (!snapshot.empty) {
          const map = new Map<string, AdminUser>();
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Partial<AdminUser>;
            const adminItem: AdminUser = {
              ...data,
              id: docSnap.id,
              uid: data.uid || docSnap.id,
              email: (data.email || '').trim().toLowerCase(),
              name: data.name || (data.email ? data.email.split('@')[0] : 'Admin User'),
              role: data.role || 'admin',
              isActive: data.isActive !== false,
            } as AdminUser;

            // Deduplicate by clean email or unique doc id
            const dedupeKey = adminItem.email || adminItem.id;
            if (map.has(dedupeKey)) {
              const existing = map.get(dedupeKey)!;
              // Prioritize authentic superadmin or active profile or current logged user
              const preferNew =
                (adminItem.uid === user?.uid && existing.uid !== user?.uid) ||
                (adminItem.id === user?.uid && existing.id !== user?.uid) ||
                (adminItem.role === 'superadmin' && existing.role !== 'superadmin') ||
                (adminItem.isActive && !existing.isActive);
              if (preferNew) {
                map.set(dedupeKey, adminItem);
              }
            } else {
              map.set(dedupeKey, adminItem);
            }
          });
          const list = Array.from(map.values());
          list.sort((a, b) => {
            if (a.role === 'superadmin' && b.role !== 'superadmin') return -1;
            if (b.role === 'superadmin' && a.role !== 'superadmin') return 1;
            return a.email.localeCompare(b.email);
          });
          setAdminUsers(list);
        } else {
          setAdminUsers([]);
        }
      },
      (err) => {
        console.warn('Admins collection listener note:', err);
      }
    );
    return () => unsubAdmins();
  }, [isAdmin, user?.uid]);

  // Helper to canonicalize order fields from Firestore or localStorage
  // Ensures trackingUrl and courierPartner are correctly read regardless of minor naming differences
  const normalizeOrderRecord = (docId: string, data: any): Order => {
    const rawTrackingUrl = (
      data.trackingUrl ||
      data.trackingLink ||
      data.trackingURL ||
      data.tracking_url ||
      ''
    ).trim();

    const rawCourierPartner = (
      data.courierPartner ||
      data.courier ||
      data.courier_partner ||
      data.courierName ||
      ''
    ).trim();

    return {
      ...data,
      id: docId,
      trackingUrl: rawTrackingUrl || data.trackingUrl || undefined,
      courierPartner: rawCourierPartner || data.courierPartner || undefined,
      courier: rawCourierPartner || data.courier || undefined,
    } as Order;
  };

  // 9. Orders Listener (tied securely to auth state)
  useEffect(() => {
    if (!user) {
      try {
        const saved = localStorage.getItem('fashinery_guest_orders');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setOrders(parsed.map((item: any) => normalizeOrderRecord(item.id || item.orderNumber, item)));
          } else {
            setOrders([]);
          }
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      }
      return;
    }

    let unsub: (() => void) | undefined;
    if (isAdmin) {
      unsub = onSnapshot(
        collection(db, 'orders'),
        (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((docSnap) => {
            list.push(normalizeOrderRecord(docSnap.id, docSnap.data()));
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(list);
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, 'orders');
        }
      );
    } else {
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((docSnap) => {
            list.push(normalizeOrderRecord(docSnap.id, docSnap.data()));
          });
          // Merge with any guest orders cached locally for this customer that aren't yet in Firestore
          try {
            const saved = localStorage.getItem('fashinery_guest_orders');
            if (saved) {
              const guestOrders = JSON.parse(saved);
              if (Array.isArray(guestOrders)) {
                for (const g of guestOrders) {
                  if (!list.some((o) => o.id === g.id || o.orderNumber === g.orderNumber)) {
                    list.push(normalizeOrderRecord(g.id || g.orderNumber, g));
                  }
                }
              }
            }
          } catch {
            // benign local parse catch
          }
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(list);
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, 'orders');
        }
      );
    }

    return () => {
      if (unsub) unsub();
    };
  }, [user, isAdmin]);

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Secure Coupon Validation Engine adhering strictly to Firestore active coupons
  const validateCoupon = (
    couponInput: string | Coupon,
    subtotal: number = cartSubtotal
  ): { isValid: boolean; error?: string; discount: number; coupon?: Coupon } => {
    let coupon: Coupon | undefined;
    if (typeof couponInput === 'string') {
      const cleanCode = couponInput.trim().toUpperCase();
      coupon = coupons.find((c) => c.code.trim().toUpperCase() === cleanCode);
    } else {
      coupon = couponInput;
    }

    if (!coupon) {
      return { isValid: false, error: 'Invalid coupon code. Please verify the code and try again.', discount: 0 };
    }

    // 1. Check active/inactive status
    if (!coupon.isActive) {
      return { isValid: false, error: `Coupon ${coupon.code} is currently inactive or disabled.`, discount: 0, coupon };
    }

    // 2. Check start date
    const now = new Date();
    if (coupon.startDate) {
      const start = new Date(coupon.startDate);
      if (!isNaN(start.getTime()) && now < start) {
        return {
          isValid: false,
          error: `Coupon ${coupon.code} is not active yet (begins on ${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}).`,
          discount: 0,
          coupon,
        };
      }
    }

    // 3. Check expiry date
    if (coupon.validUntil) {
      const expiry = new Date(coupon.validUntil);
      if (!isNaN(expiry.getTime())) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(coupon.validUntil.trim())) {
          expiry.setHours(23, 59, 59, 999);
        }
        if (now > expiry) {
          return {
            isValid: false,
            error: `Coupon ${coupon.code} expired on ${new Date(coupon.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`,
            discount: 0,
            coupon,
          };
        }
      }
    }

    // 4. Check minimum order value
    if (subtotal < (coupon.minOrderValue || 0)) {
      const deficit = (coupon.minOrderValue || 0) - subtotal;
      return {
        isValid: false,
        error: `Add ₹${deficit.toLocaleString('en-IN')} more to use coupon ${coupon.code} (Min. order ₹${(coupon.minOrderValue || 0).toLocaleString('en-IN')}).`,
        discount: 0,
        coupon,
      };
    }

    // 5. Check overall usage limit
    if (coupon.usageLimit !== undefined && coupon.usageLimit !== null && coupon.usageLimit > 0) {
      const used = coupon.usedCount || 0;
      if (used >= coupon.usageLimit) {
        return {
          isValid: false,
          error: `Coupon ${coupon.code} has reached its maximum total usage limit.`,
          discount: 0,
          coupon,
        };
      }
    }

    // 6. Check customer usage limit
    if (coupon.perCustomerLimit && coupon.perCustomerLimit > 0) {
      const userIdent = (user?.uid || user?.email || '').toLowerCase().trim();
      if (userIdent) {
        const timesUsed = orders.filter((o) => {
          const matchUser =
            (o.userId && o.userId.toLowerCase() === userIdent) ||
            (o.customerEmail && o.customerEmail.toLowerCase() === userIdent);
          const matchCode = o.couponCode && o.couponCode.toUpperCase() === coupon!.code.toUpperCase();
          return matchUser && matchCode && o.orderStatus !== 'Cancelled';
        }).length;

        if (timesUsed >= coupon.perCustomerLimit) {
          return {
            isValid: false,
            error: `You have already redeemed coupon ${coupon.code} the maximum allowed times (${coupon.perCustomerLimit}x per customer).`,
            discount: 0,
            coupon,
          };
        }
      }
    }

    // 7. Calculate correct discount securely
    let calculated = 0;
    if (coupon.discountType === 'percentage') {
      const raw = (subtotal * coupon.discountValue) / 100;
      calculated = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
    } else {
      // flat or fixed
      calculated = coupon.discountValue;
    }
    calculated = Math.min(Math.round(calculated), subtotal);
    calculated = Math.max(0, calculated);

    return {
      isValid: true,
      discount: calculated,
      coupon,
    };
  };

  const couponCheck = appliedCoupon ? validateCoupon(appliedCoupon, cartSubtotal) : null;
  const cartDiscount = couponCheck?.isValid ? couponCheck.discount : 0;

  const freeShippingEnabled = settings?.freeShippingEnabled ?? true;
  const standardShipping = settings?.shippingCharge ?? 0;
  const cartShipping = cart.length === 0 || freeShippingEnabled || standardShipping === 0 ? 0 : standardShipping;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartShipping);

  // Cart operations
  const addToCart = (
    product: Product,
    size: string,
    color: string,
    quantity: number = 1,
    variantOverride?: Partial<ProductVariant>
  ) => {
    const matchedVariant =
      variantOverride ||
      product.variants?.find(
        (v) =>
          v.color.trim().toLowerCase() === color.trim().toLowerCase() &&
          v.size.trim().toLowerCase() === size.trim().toLowerCase() &&
          v.isEnabled !== false
      );

    const price = matchedVariant?.sellingPrice !== undefined ? matchedVariant.sellingPrice : product.sellingPrice;
    const mrp = matchedVariant?.mrp !== undefined ? matchedVariant.mrp : product.mrp;
    const sku = matchedVariant?.sku || product.sku;
    const maxStock = matchedVariant?.stock !== undefined ? matchedVariant.stock : product.stock;
    const defaultProductImage = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
    const imageCandidate =
      matchedVariant?.image ||
      product.colorOptions?.find((c) => c.name.toLowerCase() === color.toLowerCase())?.images?.[0] ||
      product.images?.[0];
    const image = (imageCandidate && typeof imageCandidate === 'string' && imageCandidate.trim() !== '')
      ? imageCandidate.trim()
      : defaultProductImage;

    const itemKey = `${product.id}-${size}-${color}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemKey);
      if (existing) {
        return prev.map((item) =>
          item.id === itemKey
            ? { ...item, quantity: Math.min(item.quantity + quantity, maxStock) }
            : item
        );
      }
      const newItem: CartItem = {
        id: itemKey,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image,
        price,
        mrp,
        size,
        color,
        quantity,
        sku,
        maxStock,
      };
      return [...prev, newItem];
    });
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity: Math.min(quantity, item.maxStock) } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const applyCoupon = (codeOrCoupon: string | Coupon): boolean => {
    setCouponError(null);
    const result = validateCoupon(codeOrCoupon, cartSubtotal);
    if (!result.isValid || !result.coupon) {
      setCouponError(result.error || 'Invalid coupon code.');
      return false;
    }

    setAppliedCoupon(result.coupon);
    setCouponError(null);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Order creation
  const createOrder = async (
    address: ShippingAddress,
    paymentMethod: PaymentMethod = 'Cash on Delivery'
  ): Promise<Order> => {
    // Strict Validation for 7 compulsory fields before order placement
    const cleanFullName = (address.fullName || '').trim();
    const cleanPhone = (address.phone || '').replace(/\D/g, '');
    const cleanEmail = (address.email || '').trim().toLowerCase();
    const cleanAddress1 = (address.addressLine1 || '').trim();
    const cleanCity = (address.city || '').trim();
    const cleanState = (address.state || '').trim();
    const cleanPincode = (address.pincode || '').replace(/\D/g, '');

    if (!cleanFullName || cleanFullName.length < 2) {
      throw new Error('Please enter your full name.');
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new Error('Please enter a valid 10-digit Indian mobile number.');
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }
    if (!cleanAddress1 || cleanAddress1.length < 5) {
      throw new Error('Please enter your complete delivery address.');
    }
    if (!cleanCity || cleanCity.length < 2) {
      throw new Error('Please enter your city.');
    }
    if (!cleanState) {
      throw new Error('Please enter your state.');
    }
    if (!/^[1-9]\d{5}$/.test(cleanPincode)) {
      throw new Error('Please enter a valid 6-digit PIN code.');
    }

    const orderNumber = `FSH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.productId,
      productName: item.name,
      productImage: item.image,
      price: item.price,
      mrp: item.mrp,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      sku: item.sku,
    }));

    const cleanShippingAddress: ShippingAddress = {
      fullName: address.fullName || '',
      phone: address.phone || '',
      email: address.email || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      apartment: address.apartment || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      country: address.country || 'India',
    };

    // 1. Route Cash on Delivery order creation through trusted server API
    // Server computes & verifies item prices, coupon discounts, shipping, and totals directly against the database
    if (paymentMethod === 'Cash on Delivery') {
      try {
        const serverRes = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart,
            shippingAddress: cleanShippingAddress,
            couponCode: appliedCoupon?.code,
            customerUserId: user ? user.uid : 'guest',
            paymentMethod: 'Cash on Delivery',
          }),
        });

        if (serverRes.ok) {
          const serverData = await serverRes.json();
          if (serverData.success && serverData.order) {
            const verifiedOrder: Order = serverData.order;
            setLastCreatedOrder(verifiedOrder);
            setOrders((prev) => [verifiedOrder, ...prev.filter((o) => o.id !== verifiedOrder.id)]);
            try {
              const guestOrders = JSON.parse(localStorage.getItem('fashinery_guest_orders') || '[]');
              localStorage.setItem('fashinery_guest_orders', JSON.stringify([verifiedOrder, ...guestOrders]));
            } catch (e) {
              console.warn('Could not cache guest order in localStorage', e);
            }
            clearCart();
            setCurrentView('order-success');
            return verifiedOrder;
          }
        }
      } catch (serverErr) {
        console.warn('Server order creation endpoint unavailable, falling back to direct write:', serverErr);
      }
    }

    const newOrder: Order = {
      id: orderNumber,
      orderNumber,
      userId: user ? user.uid : 'guest',
      customerName: address.fullName || '',
      customerEmail: address.email || '',
      customerPhone: address.phone || '',
      shippingAddress: cleanShippingAddress,
      items: orderItems,
      subtotal: cartSubtotal,
      discount: cartDiscount,
      shippingCharge: cartShipping,
      total: cartTotal,
      paymentMethod,
      // Security Invariant: paymentStatus on initial creation is ALWAYS Pending
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: 'Customer placed order with Cash on Delivery.',
    };

    if (appliedCoupon?.code && cartDiscount > 0) {
      newOrder.couponCode = appliedCoupon.code;
    }

    try {
      const sanitizedOrder = removeUndefinedFields(newOrder);
      await setDoc(doc(db, 'orders', orderNumber), sanitizedOrder);
      
      // Update coupon usage count in Firestore if coupon was redeemed
      if (appliedCoupon?.id && cartDiscount > 0) {
        try {
          const couponRef = doc(db, 'coupons', appliedCoupon.id);
          await updateDoc(couponRef, {
            usedCount: increment(1),
            updatedAt: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Could not update coupon usage count:', e);
        }
      }

      setLastCreatedOrder(newOrder);
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
      try {
        const guestOrders = JSON.parse(localStorage.getItem('fashinery_guest_orders') || '[]');
        localStorage.setItem('fashinery_guest_orders', JSON.stringify([newOrder, ...guestOrders]));
      } catch (e) {
        console.warn('Could not cache guest order in localStorage', e);
      }
      clearCart();
      setCurrentView('order-success');
      return newOrder;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderNumber}`);
      throw err;
    }
  };

  // Confirm Razorpay order after server-side payment verification
  const confirmRazorpayOrder = (verifiedOrder: Order) => {
    setLastCreatedOrder(verifiedOrder);
    setOrders((prev) => [verifiedOrder, ...prev.filter((o) => o.id !== verifiedOrder.id)]);
    try {
      const guestOrders = JSON.parse(localStorage.getItem('fashinery_guest_orders') || '[]');
      const filtered = guestOrders.filter((o: any) => o.id !== verifiedOrder.id && o.orderNumber !== verifiedOrder.orderNumber);
      localStorage.setItem('fashinery_guest_orders', JSON.stringify([verifiedOrder, ...filtered]));
    } catch (e) {
      console.warn('Could not cache guest order in localStorage', e);
    }
    clearCart();
    setCurrentView('order-success');
  };

  const seedDatabase = async (force = false) => {
    await seedDatabaseIfNeeded(db, isAdmin, force);
  };

  const cancelOrder = async (
    orderId: string,
    cancellationReason: string,
    cancellationDetails: string = '',
    cancelledBy: 'Customer' | 'Admin' = 'Customer'
  ): Promise<boolean> => {
    // 1. Locate order to check cancellation eligibility
    const targetOrder = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (targetOrder) {
      const nonCancellable: OrderStatus[] = [
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Return Requested',
        'Returned',
        'Refunded',
      ];
      if (nonCancellable.includes(targetOrder.orderStatus)) {
        throw new Error(
          `Order #${targetOrder.orderNumber} cannot be cancelled as it is already marked as ${targetOrder.orderStatus}.`
        );
      }
    }

    const cancelledAt = new Date().toISOString();
    const cleanDetails = cancellationDetails ? cancellationDetails.trim() : '';
    const updatePayload = {
      orderStatus: 'Cancelled' as OrderStatus,
      cancellationReason,
      customerCancellationReason: cancellationReason,
      cancellationDetails: cleanDetails,
      cancelledAt,
      cancelledBy,
      notes: `Cancelled by ${cancelledBy} on ${new Date().toLocaleString('en-IN')}: ${cancellationReason}${
        cleanDetails ? ` (${cleanDetails})` : ''
      }`,
      updatedAt: cancelledAt,
    };

    const actualDocId = targetOrder?.id || orderId;

    if (!user) {
      // Guest order cancellation: routed via backend endpoint to prevent unauthenticated client tampering
      try {
        await fetch('/api/orders/cancel-guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: targetOrder?.orderNumber || actualDocId,
            phone: targetOrder?.customerPhone || targetOrder?.shippingAddress?.phone,
            email: targetOrder?.customerEmail || targetOrder?.shippingAddress?.email,
            cancellationReason,
            cancellationDetails: cleanDetails,
          }),
        });
      } catch (guestCancelErr) {
        console.warn('Guest cancellation server call note:', guestCancelErr);
      }
    } else {
      // Authenticated customer cancellation: evaluated directly by hardened firestore.rules
      try {
        await updateDoc(doc(db, 'orders', actualDocId), removeUndefinedFields(updatePayload));
      } catch (err) {
        console.warn('Direct Firestore order update failed, trying fallback:', err);
        try {
          if (targetOrder && targetOrder.orderNumber !== actualDocId) {
            await updateDoc(doc(db, 'orders', targetOrder.orderNumber), removeUndefinedFields(updatePayload));
          } else {
            handleFirestoreError(err, OperationType.UPDATE, `orders/${actualDocId}`);
          }
        } catch (fallbackErr) {
          handleFirestoreError(fallbackErr, OperationType.UPDATE, `orders/${actualDocId}`);
        }
      }
    }

    // Immediately reflect cancellation across all React order states
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.orderNumber === orderId || o.id === actualDocId
          ? {
              ...o,
              orderStatus: 'Cancelled',
              cancellationReason,
              cancellationDetails: cleanDetails,
              cancelledAt,
              cancelledBy,
              updatedAt: cancelledAt,
            }
          : o
      )
    );

    setLastCreatedOrder((prev) =>
      prev && (prev.id === orderId || prev.orderNumber === orderId || prev.id === actualDocId)
        ? {
            ...prev,
            orderStatus: 'Cancelled',
            cancellationReason,
            cancellationDetails: cleanDetails,
            cancelledAt,
            cancelledBy,
            updatedAt: cancelledAt,
          }
        : prev
    );

    // Synchronize guest localStorage persistence
    try {
      const guestRaw = localStorage.getItem('fashinery_guest_orders');
      if (guestRaw) {
        const guestList: Order[] = JSON.parse(guestRaw);
        const updatedGuestList = guestList.map((o) =>
          o.id === orderId || o.orderNumber === orderId || o.id === actualDocId
            ? {
                ...o,
                orderStatus: 'Cancelled' as OrderStatus,
                cancellationReason,
                cancellationDetails: cleanDetails,
                cancelledAt,
                cancelledBy,
                updatedAt: cancelledAt,
              }
            : o
        );
        localStorage.setItem('fashinery_guest_orders', JSON.stringify(updatedGuestList));
      }
    } catch (e) {
      console.warn('Could not sync guest orders in localStorage:', e);
    }

    return true;
  };

  const requestReturn = async (
    orderId: string,
    reason: string,
    notes?: string,
    returnType: 'return' | 'exchange' = 'return'
  ) => {
    try {
      await updateDoc(
        doc(db, 'orders', orderId),
        removeUndefinedFields({
          orderStatus: returnType === 'exchange' ? 'Exchange Requested' : 'Return Requested',
          returnReason: reason,
          returnNotes: notes || '',
          returnType,
          returnRequestedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // Google Login
  const loginWithGoogle = async (isForAdmin: boolean | unknown = false) => {
    const forAdmin = typeof isForAdmin === 'boolean' ? isForAdmin : false;
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;

      const isSuperAdminEmail = loggedUser.email === 'dheeraj8933@gmail.com';

      // Verify whether loggedUser.uid is an authorized admin in Firestore
      let adminSnap = await getDoc(doc(db, 'admins', loggedUser.uid));

      // Bootstrap owner dheeraj8933@gmail.com if record doesn't exist yet
      if ((!adminSnap.exists() || !adminSnap.data()?.isActive) && isSuperAdminEmail) {
        const bootstrapDoc: AdminUser = {
          id: loggedUser.uid,
          uid: loggedUser.uid,
          email: loggedUser.email || 'dheeraj8933@gmail.com',
          name: loggedUser.displayName || 'Owner Super Admin',
          role: 'superadmin',
          isActive: true,
          addedBy: 'system-bootstrap',
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        try {
          await setDoc(doc(db, 'admins', loggedUser.uid), removeUndefinedFields(bootstrapDoc));
          adminSnap = await getDoc(doc(db, 'admins', loggedUser.uid));
        } catch (bootErr) {
          console.warn('Bootstrap admin error:', bootErr);
        }
      }

      if (isSuperAdminEmail || (adminSnap.exists() && adminSnap.data()?.isActive)) {
        const adminData = adminSnap.exists() ? (adminSnap.data() as AdminUser) : null;
        setIsAdmin(true);
        setIsSuperAdmin(isSuperAdminEmail || adminData?.role === 'superadmin');
        setAdminRole(isSuperAdminEmail ? 'superadmin' : adminData?.role || 'admin');
        setAdminUser(
          adminData || {
            id: loggedUser.uid,
            uid: loggedUser.uid,
            email: loggedUser.email || 'dheeraj8933@gmail.com',
            name: loggedUser.displayName || 'Owner Super Admin',
            role: 'superadmin',
            isActive: true,
            addedBy: 'system-bootstrap',
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        );
        if (forAdmin || currentView === 'admin-login') {
          setAdminMode(true);
          setCurrentView('admin');
          window.location.hash = '/admin';
        }
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminRole(null);
        setAdminUser(null);

        // Normal customer registration: always save role 'customer' only
        if (loggedUser.email && loggedUser.email !== 'dheeraj8933@gmail.com') {
          try {
            const userRef = doc(db, 'users', loggedUser.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              const newProf: CustomerProfile = {
                id: loggedUser.uid,
                uid: loggedUser.uid,
                name: loggedUser.displayName || 'Customer',
                displayName: loggedUser.displayName || 'Customer',
                email: loggedUser.email,
                phone: loggedUser.phoneNumber || '',
                authEmail: loggedUser.email,
                hasEmail: true,
                role: 'customer',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              await setDoc(userRef, removeUndefinedFields(newProf));
              setCustomerProfile(newProf);

              if (loggedUser.phoneNumber) {
                const pVal = validateIndianMobile(loggedUser.phoneNumber);
                if (pVal.isValid) {
                  await setDoc(
                    doc(db, 'phone_lookup', pVal.cleanPhone),
                    removeUndefinedFields({
                      phone: pVal.cleanPhone,
                      uid: loggedUser.uid,
                      authEmail: loggedUser.email,
                      hasEmail: true,
                      updatedAt: new Date().toISOString(),
                    }),
                    { merge: true }
                  );
                }
              }
            } else {
              setCustomerProfile(userSnap.data() as CustomerProfile);
            }
          } catch (custErr) {
            console.warn('Customer record sync note:', custErr);
          }
        }

        if (forAdmin || currentView === 'admin-login') {
          // If signing in via admin portal, deny access and sign out
          await signOut(auth);
          const denied = 'You are not authorized to access the Admin Panel.';
          setAuthError(denied);
          throw new Error(denied);
        }
      }
    } catch (error: any) {
      const code = error?.code || '';
      // Normal user cancellation or duplicate popup attempt: do NOT log as console error
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/user-cancelled'
      ) {
        // User closed or dismissed the popup window naturally
        return;
      }

      if (code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups for this window and try again.');
        return;
      }

      if (code === 'auth/unauthorized-domain') {
        setAuthError('This domain is not authorized in Firebase Authentication for Google Sign-In.');
        return;
      }

      console.warn('Google sign-in could not be completed:', error?.message || error);
      const msg = error?.message || 'Authentication could not be completed. Please try again.';
      setAuthError(msg);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCustomerProfile(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setAdminRole(null);
      setAdminUser(null);
      setAdminUsers([]);
      setAdminMode(false);
      setAuthError(null);
      if (currentView === 'admin') {
        setCurrentView('admin-login');
        window.location.hash = '/admin-login';
      }
    } catch (error: any) {
      console.warn('Sign-out could not be completed:', error?.message || error);
    }
  };

  // Customer Authentication: Register
  // Customer Authentication: Secure Registration (Name, Mobile, REQUIRED Email, Strong Password)
  const registerCustomer = async (params: {
    name: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => {
    setAuthError(null);
    const { name, phone, email, password, confirmPassword } = params;

    // 1. Customer Name validation
    if (!name || !name.trim()) {
      const err = 'Customer Name is required.';
      setAuthError(err);
      throw new Error(err);
    }

    // 2. Mobile validation (10 digits, starts with 6,7,8,9)
    const phoneVal = validateIndianMobile(phone);
    if (!phoneVal.isValid) {
      const err = phoneVal.error || 'Please enter a valid 10-digit Indian mobile number.';
      setAuthError(err);
      throw new Error(err);
    }
    const cleanPhone = phoneVal.cleanPhone;

    // 3. REQUIRED email validation (Mandatory for Firebase password reset & security)
    const emailVal = validateRequiredEmail(email);
    if (!emailVal.isValid) {
      const err = emailVal.error || 'Email address is required for client account security and recovery.';
      setAuthError(err);
      throw new Error(err);
    }
    const cleanEmail = emailVal.cleanEmail;

    // 4. Strong Password validation (8+ chars, uppercase, lowercase, number, confirm match)
    const passVal = validatePassword(password, confirmPassword);
    if (!passVal.isValid) {
      const err = passVal.error || 'Password must be at least 8 characters and include uppercase, lowercase, and numeric characters.';
      setAuthError(err);
      throw new Error(err);
    }

    // 5. Pre-check if phone number is already registered in phone_lookup
    try {
      const existingPhoneSnap = await getDoc(doc(db, 'phone_lookup', cleanPhone));
      if (existingPhoneSnap.exists()) {
        const err = `An account with mobile number +91 ${cleanPhone} already exists. Please log in or request a password reset.`;
        setAuthError(err);
        throw new Error(err);
      }
    } catch (checkErr: any) {
      if (checkErr.message?.includes('already exists')) {
        throw checkErr;
      }
      console.warn('Phone pre-check note:', checkErr);
    }

    try {
      // Firebase Authentication handles the password securely; no plaintext or custom tokens
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const newUser = cred.user;

      // Update Firebase Auth display name
      try {
        await updateProfile(newUser, {
          displayName: name.trim(),
        });
      } catch (profErr) {
        console.warn('Profile name update note:', profErr);
      }

      // Save customer profile in Firestore (NEVER store passwords or credentials in Firestore!)
      const customerDoc: CustomerProfile = {
        id: newUser.uid,
        uid: newUser.uid,
        name: name.trim(),
        displayName: name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        authEmail: cleanEmail,
        hasEmail: true,
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', newUser.uid), removeUndefinedFields(customerDoc));

      // Save phone lookup for seamless mobile login and recovery
      await setDoc(
        doc(db, 'phone_lookup', cleanPhone),
        removeUndefinedFields({
          phone: cleanPhone,
          uid: newUser.uid,
          authEmail: cleanEmail,
          hasEmail: true,
          updatedAt: new Date().toISOString(),
        })
      );

      setCustomerProfile(customerDoc);

      // Attempt initial verification dispatch if email is unverified
      try {
        const isProd = typeof window !== 'undefined' &&
          (window.location.hostname === 'fashinery.com' || window.location.hostname === 'www.fashinery.com');
        const returnUrl = isProd
          ? 'https://fashinery.com/account'
          : (typeof window !== 'undefined' ? `${window.location.origin}/account` : 'https://fashinery.com/account');
        await sendEmailVerification(newUser, { url: returnUrl, handleCodeInApp: true });
      } catch (verifErr: any) {
        if (verifErr?.code === 'auth/unauthorized-continue-uri') {
          await sendEmailVerification(newUser).catch(() => {});
        }
      }
    } catch (err: any) {
      const code = err?.code;
      let msg = err?.message || 'Registration could not be completed.';
      if (code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please log in or use Forgot Password.';
      } else if (code === 'auth/weak-password') {
        msg = 'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address format.';
      }
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Customer Authentication: Login (by Email or 10-digit Mobile Number)
  const loginCustomer = async (identifier: string, password: string) => {
    setAuthError(null);
    const trimmed = identifier.trim();
    if (!trimmed) {
      const err = 'Please enter your Email address or 10-digit Mobile Number.';
      setAuthError(err);
      throw new Error(err);
    }
    if (!password) {
      const err = 'Please enter your password.';
      setAuthError(err);
      throw new Error(err);
    }

    let authEmailToUse = '';
    const isEmail = trimmed.includes('@');

    if (isEmail) {
      authEmailToUse = trimmed.toLowerCase();
    } else {
      // Validate mobile number
      const phoneVal = validateIndianMobile(trimmed);
      if (!phoneVal.isValid) {
        const err = phoneVal.error || 'Please enter a valid 10-digit Indian mobile number.';
        setAuthError(err);
        throw new Error(err);
      }
      const cleanPhone = phoneVal.cleanPhone;

      // Look up phone mapping in phone_lookup collection
      try {
        const phoneSnap = await getDoc(doc(db, 'phone_lookup', cleanPhone));
        if (phoneSnap.exists()) {
          const data = phoneSnap.data();
          authEmailToUse = data.authEmail || `${cleanPhone}@customer.fashinery.in`;
        } else {
          authEmailToUse = `${cleanPhone}@customer.fashinery.in`;
        }
      } catch (err) {
        console.warn('Phone lookup error, using default pattern:', err);
        authEmailToUse = `${cleanPhone}@customer.fashinery.in`;
      }
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, authEmailToUse, password);
      // Customer profile will automatically load via onAuthStateChanged, but also fetch immediately
      try {
        const userSnap = await getDoc(doc(db, 'users', cred.user.uid));
        if (userSnap.exists()) {
          setCustomerProfile(userSnap.data() as CustomerProfile);
        }
      } catch (docErr) {
        console.warn('Immediate customer profile fetch note:', docErr);
      }
    } catch (err: any) {
      const code = err?.code;
      let msg = err?.message || 'Login could not be completed.';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        msg = isEmail
          ? 'Incorrect email or password. Please verify your credentials or use Forgot Password.'
          : 'Incorrect mobile number or password. Please verify your credentials or register an account.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please wait a few moments or reset your password.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Please provide a valid email format or 10-digit mobile number.';
      }
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Customer Authentication: Production-Ready Forgot Password Reset
  // Implements strict Anti-Enumeration, ActionCodeSettings, and client-side cooldown rate limiting
  const sendCustomerPasswordReset = async (
    identifier: string
  ): Promise<{
    success: boolean;
    noEmail?: boolean;
    email?: string;
    maskedEmail?: string;
    message: string;
    cooldownSeconds?: number;
  }> => {
    setAuthError(null);
    const trimmed = identifier.trim();
    if (!trimmed) {
      const err = 'Please enter your registered Email address.';
      setAuthError(err);
      throw new Error(err);
    }

    // Client-side cooldown (60 seconds per identifier to prevent form submission abuse)
    const normalizedKey = trimmed.toLowerCase();
    const storageKey = `fashinery_pwd_reset_${normalizedKey.replace(/[^a-z0-9]/g, '_')}`;
    const lastSentStr = typeof window !== 'undefined' ? sessionStorage.getItem(storageKey) : null;
    const now = Date.now();
    if (lastSentStr) {
      const lastSent = parseInt(lastSentStr, 10);
      const elapsedSeconds = Math.floor((now - lastSent) / 1000);
      const cooldownPeriod = 60;
      if (elapsedSeconds < cooldownPeriod) {
        const remaining = cooldownPeriod - elapsedSeconds;
        const msg = `Please wait ${remaining} second${remaining > 1 ? 's' : ''} before requesting another reset link.`;
        setAuthError(msg);
        return {
          success: false,
          message: msg,
          cooldownSeconds: remaining,
        };
      }
    }

    // Neutral anti-enumeration message: never reveals whether an email exists
    const neutralEmailMessage =
      'If an account exists for this email address, a password reset link has been sent. Please check your inbox and spam folder.';

    // Construct ActionCodeSettings using production authorized URL https://fashinery.com/reset-password
    const isProd = typeof window !== 'undefined' &&
      (window.location.hostname === 'fashinery.com' || window.location.hostname === 'www.fashinery.com');
    const resetUrl = isProd
      ? 'https://fashinery.com/reset-password'
      : (typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : 'https://fashinery.com/reset-password');

    const actionCodeSettings: ActionCodeSettings = {
      url: resetUrl,
      handleCodeInApp: true,
    };

    if (trimmed.includes('@')) {
      const emailVal = validateRequiredEmail(trimmed);
      if (!emailVal.isValid) {
        const err = emailVal.error || 'Please provide a valid email format (e.g. name@example.com).';
        setAuthError(err);
        throw new Error(err);
      }
      const cleanEmail = emailVal.cleanEmail;

      try {
        try {
          await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
        } catch (actionErr: any) {
          // If continuing URL is not yet whitelisted in Firebase Console authorized continue URIs,
          // gracefully fall back to standard sendPasswordResetEmail without breaking dispatch
          if (
            actionErr?.code === 'auth/unauthorized-continue-uri' ||
            actionErr?.code === 'auth/invalid-continue-uri'
          ) {
            await sendPasswordResetEmail(auth, cleanEmail);
          } else {
            throw actionErr;
          }
        }
      } catch (err: any) {
        const code = err?.code;
        // Anti-enumeration protection: even if Firebase throws user-not-found, never leak account absence
        if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
          if (typeof window !== 'undefined') sessionStorage.setItem(storageKey, now.toString());
          return {
            success: true,
            email: cleanEmail,
            maskedEmail: maskEmail(cleanEmail),
            message: neutralEmailMessage,
            cooldownSeconds: 60,
          };
        }
        if (code === 'auth/too-many-requests') {
          const msg = 'Too many requests. Please wait a few moments before requesting another password reset link.';
          setAuthError(msg);
          throw new Error(msg);
        }
        // For general errors, also maintain neutral response to prevent enumeration
      }

      // Record successful attempt cooldown
      if (typeof window !== 'undefined') sessionStorage.setItem(storageKey, now.toString());

      return {
        success: true,
        email: cleanEmail,
        maskedEmail: maskEmail(cleanEmail),
        message: neutralEmailMessage,
        cooldownSeconds: 60,
      };
    }

    // Phone number input: resolve registered email in phone_lookup without exposing existence
    const phoneVal = validateIndianMobile(trimmed);
    if (!phoneVal.isValid) {
      const err = phoneVal.error || 'Please enter a valid email address or 10-digit mobile number.';
      setAuthError(err);
      throw new Error(err);
    }
    const cleanPhone = phoneVal.cleanPhone;

    try {
      const phoneSnap = await getDoc(doc(db, 'phone_lookup', cleanPhone));
      if (phoneSnap.exists()) {
        const data = phoneSnap.data();
        if (data.authEmail && !data.authEmail.endsWith('@customer.fashinery.in')) {
          try {
            await sendPasswordResetEmail(auth, data.authEmail, actionCodeSettings);
          } catch (actionErr: any) {
            if (actionErr?.code === 'auth/unauthorized-continue-uri') {
              await sendPasswordResetEmail(auth, data.authEmail);
            }
          }
        }
      }
    } catch (lookupErr) {
      console.warn('Phone reset lookup note:', lookupErr);
    }

    if (typeof window !== 'undefined') sessionStorage.setItem(storageKey, now.toString());

    return {
      success: true,
      message:
        'If an account exists for this mobile number, a password reset link has been sent to the registered email address. Please check your inbox and spam folder.',
      cooldownSeconds: 60,
    };
  };

  // Official Firebase action code verification for /reset-password
  const verifyResetCode = async (actionCode: string): Promise<string> => {
    setAuthError(null);
    if (!actionCode || !actionCode.trim()) {
      throw new Error('This password reset link is invalid or has expired. Please request a new reset link.');
    }
    try {
      const email = await verifyPasswordResetCode(auth, actionCode.trim());
      return email;
    } catch (err: any) {
      throw new Error('This password reset link is invalid or has expired. Please request a new reset link.');
    }
  };

  // Official Firebase password confirmation for /reset-password
  const confirmReset = async (actionCode: string, newPassword: string): Promise<void> => {
    setAuthError(null);
    const passVal = validatePassword(newPassword);
    if (!passVal.isValid) {
      throw new Error(passVal.error || 'Password does not meet required security criteria.');
    }
    try {
      await confirmPasswordReset(auth, actionCode.trim(), newPassword);
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/expired-action-code' || code === 'auth/invalid-action-code') {
        throw new Error('This password reset link is invalid or has expired. Please request a new reset link.');
      }
      if (code === 'auth/weak-password') {
        throw new Error('Password does not meet required complexity. Please choose a stronger password.');
      }
      throw new Error(err?.message || 'Unable to reset password. Please request a new reset link.');
    }
  };

  // Customer Email Verification Resend
  const sendCustomerEmailVerification = async (): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error('You must be signed in to request email verification.');
    }
    const isProd = typeof window !== 'undefined' &&
      (window.location.hostname === 'fashinery.com' || window.location.hostname === 'www.fashinery.com');
    const returnUrl = isProd
      ? 'https://fashinery.com/account'
      : (typeof window !== 'undefined' ? `${window.location.origin}/account` : 'https://fashinery.com/account');

    try {
      await sendEmailVerification(auth.currentUser, {
        url: returnUrl,
        handleCodeInApp: true,
      });
    } catch (actionErr: any) {
      if (actionErr?.code === 'auth/unauthorized-continue-uri') {
        await sendEmailVerification(auth.currentUser);
      } else {
        throw actionErr;
      }
    }
  };

  // Customer Profile: Secure Update
  const updateCustomerProfile = async (data: {
    name?: string;
    phone?: string;
    email?: string;
  }) => {
    if (!user) {
      throw new Error('You must be logged in to update your profile.');
    }

    const updates: Partial<CustomerProfile> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.name !== undefined) {
      if (!data.name.trim()) throw new Error('Customer name cannot be empty.');
      updates.name = data.name.trim();
      updates.displayName = data.name.trim();
      try {
        await updateProfile(user, { displayName: data.name.trim() });
      } catch (err) {
        console.warn('Firebase Auth displayName update note:', err);
      }
    }

    if (data.phone !== undefined) {
      const phoneVal = validateIndianMobile(data.phone);
      if (!phoneVal.isValid) {
        throw new Error(phoneVal.error || 'Please enter a valid 10-digit Indian mobile number.');
      }
      updates.phone = phoneVal.cleanPhone;

      // Update phone_lookup mapping
      try {
        await setDoc(
          doc(db, 'phone_lookup', phoneVal.cleanPhone),
          removeUndefinedFields({
            phone: phoneVal.cleanPhone,
            uid: user.uid,
            authEmail: user.email || `${phoneVal.cleanPhone}@customer.fashinery.in`,
            hasEmail: Boolean(user.email && !user.email.endsWith('@customer.fashinery.in')),
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        );
      } catch (phoneErr) {
        console.warn('Phone lookup mapping sync note:', phoneErr);
      }
    }

    if (data.email !== undefined) {
      const emailVal = validateOptionalEmail(data.email);
      if (!emailVal.isValid) {
        throw new Error(emailVal.error || 'Invalid email format.');
      }
      updates.email = emailVal.cleanEmail;
      updates.hasEmail = Boolean(emailVal.cleanEmail);
    }

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, removeUndefinedFields(updates), { merge: true });

    setCustomerProfile((prev) => (prev ? { ...prev, ...updates } : (updates as CustomerProfile)));
  };

  const loginWithEmailPassword = async (email: string, password: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      const err = 'Please provide both administrator email and password.';
      setAuthError(err);
      throw new Error(err);
    }

    try {
      let loggedUser: any;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        loggedUser = userCredential.user;
      } catch (authErr: any) {
        // If owner dheeraj8933@gmail.com is logging in with their configured password and account doesn't exist yet in Firebase Auth,
        // register the initial Firebase account with the password they provided
        if (
          cleanEmail === 'dheeraj8933@gmail.com' &&
          (authErr?.code === 'auth/user-not-found' || authErr?.code === 'auth/invalid-credential')
        ) {
          try {
            const createCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            loggedUser = createCred.user;
          } catch {
            throw authErr;
          }
        } else {
          throw authErr;
        }
      }

      const isSuperAdminEmail = cleanEmail === 'dheeraj8933@gmail.com' || loggedUser.email === 'dheeraj8933@gmail.com';

      // Verify that authenticated user's UID is in Firestore admins collection with isActive: true
      let adminSnap = await getDoc(doc(db, 'admins', loggedUser.uid));

      // Bootstrap check for platform owner dheeraj8933@gmail.com
      if ((!adminSnap.exists() || !adminSnap.data()?.isActive) && isSuperAdminEmail) {
        const bootstrapDoc: AdminUser = {
          id: loggedUser.uid,
          uid: loggedUser.uid,
          email: cleanEmail,
          name: loggedUser.displayName || 'Owner Super Admin',
          role: 'superadmin',
          isActive: true,
          addedBy: 'system-bootstrap',
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        try {
          await setDoc(doc(db, 'admins', loggedUser.uid), removeUndefinedFields(bootstrapDoc));
          adminSnap = await getDoc(doc(db, 'admins', loggedUser.uid));
        } catch (bootErr) {
          console.warn('Bootstrap admin error:', bootErr);
        }
      }

      if (!isSuperAdminEmail && (!adminSnap.exists() || !adminSnap.data()?.isActive)) {
        await signOut(auth);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminRole(null);
        setAdminUser(null);
        const denied = 'You are not authorized to access the Admin Panel.';
        setAuthError(denied);
        throw new Error(denied);
      }

      const adminData = adminSnap.exists() ? (adminSnap.data() as AdminUser) : null;
      setIsAdmin(true);
      setIsSuperAdmin(isSuperAdminEmail || adminData?.role === 'superadmin');
      setAdminRole(isSuperAdminEmail ? 'superadmin' : adminData?.role || 'admin');
      setAdminUser(
        adminData || {
          id: loggedUser.uid,
          uid: loggedUser.uid,
          email: cleanEmail,
          name: loggedUser.displayName || 'Owner Super Admin',
          role: 'superadmin',
          isActive: true,
          addedBy: 'system-bootstrap',
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      setAdminMode(true);
      setCurrentView('admin');
      window.location.hash = '/admin';
    } catch (err: any) {
      let msg = err?.message || 'Authentication could not be completed.';
      if (
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/user-not-found'
      ) {
        msg = 'Invalid administrator email or password.';
      } else if (err?.code === 'auth/too-many-requests') {
        msg = 'Access temporarily restricted due to repeated attempts. Please wait a few moments or reset password.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Please enter a valid administrative email address.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Super Admin Management: Add Admin User
  const addAdminUser = async (adminData: {
    uid?: string;
    email: string;
    name?: string;
    role: AdminRole;
    isActive: boolean;
  }) => {
    if (!isSuperAdmin) {
      throw new Error('Unauthorized: Only Super Administrators can authorize new admin accounts.');
    }
    const cleanEmail = adminData.email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Administrator email address is required.');
    }
    const docId = adminData.uid?.trim() || cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '_');
    const record: AdminUser = {
      id: docId,
      uid: adminData.uid?.trim() || docId,
      email: cleanEmail,
      name: adminData.name?.trim() || cleanEmail.split('@')[0],
      role: adminData.role,
      isActive: adminData.isActive,
      addedBy: user?.email || user?.uid || 'superadmin',
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'admins', docId), removeUndefinedFields(record));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `admins/${docId}`);
      throw err;
    }
  };

  // Super Admin Management: Update Admin Status (Disable/Enable)
  const updateAdminUserStatus = async (adminId: string, isActive: boolean) => {
    if (!isSuperAdmin) {
      throw new Error('Unauthorized: Only Super Administrators can modify admin status.');
    }
    if (adminId === user?.uid && !isActive) {
      throw new Error('Action blocked: You cannot disable your own active Super Administrator account.');
    }
    try {
      await updateDoc(doc(db, 'admins', adminId), {
        isActive,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `admins/${adminId}`);
      throw err;
    }
  };

  // Super Admin Management: Update Admin Role
  const updateAdminUserRole = async (adminId: string, role: AdminRole) => {
    if (!isSuperAdmin) {
      throw new Error('Unauthorized: Only Super Administrators can modify administrator roles.');
    }
    try {
      await updateDoc(doc(db, 'admins', adminId), {
        role,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `admins/${adminId}`);
      throw err;
    }
  };

  // Super Admin Management: Remove Admin User
  const deleteAdminUser = async (adminId: string) => {
    if (!isSuperAdmin) {
      throw new Error('Unauthorized: Only Super Administrators can remove administrator accounts.');
    }
    if (adminId === user?.uid) {
      throw new Error('Action blocked: You cannot delete your own active Super Administrator account.');
    }
    try {
      await deleteDoc(doc(db, 'admins', adminId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `admins/${adminId}`);
      throw err;
    }
  };

  const sendAdminPasswordReset = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your administrator email address.');
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err: any) {
      let msg = err?.message || 'Failed to send password reset email';
      if (err?.code === 'auth/user-not-found') {
        msg = 'No administrative account found with this email address.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      throw new Error(msg);
    }
  };

  // Contact form submission
  const submitContact = async (data: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => {
    try {
      await addDoc(
        collection(db, 'contacts'),
        removeUndefinedFields({
          ...data,
          status: 'new',
          createdAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'contacts');
    }
  };

  // Newsletter
  const subscribeNewsletter = async (email: string): Promise<boolean> => {
    try {
      await addDoc(
        collection(db, 'newsletter'),
        removeUndefinedFields({
          email: email.trim().toLowerCase(),
          subscribedAt: new Date().toISOString(),
        })
      );
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'newsletter');
      return false;
    }
  };

  // Product Review
  const submitReview = async (review: Omit<Review, 'id' | 'createdAt' | 'status'>) => {
    try {
      await addDoc(
        collection(db, 'reviews'),
        removeUndefinedFields({
          ...review,
          status: 'pending', // Moderation required in production
          isFeatured: false,
          createdAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reviews');
    }
  };

  // WhatsApp helpers
  const getWhatsAppProductUrl = (product: Product) => {
    const phone = (settings?.whatsapp || '+91 93720 85090').replace(/[^0-9]/g, '');
    const productUrl = `${window.location.origin}#product/${product.slug}`;
    const text = encodeURIComponent(
      `Hello Fashinery, I am interested in this luxury piece:\n*${product.name}*\nSKU: ${product.sku}\nPrice: ₹${product.sellingPrice.toLocaleString('en-IN')}\nLink: ${productUrl}`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  const getWhatsAppOrderHelpUrl = (orderNumber: string) => {
    const phone = (settings?.whatsapp || '+91 93720 85090').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello Fashinery Customer Care, I need assistance regarding my Order #${orderNumber}.`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  const openGeneralWhatsApp = () => {
    const phone = (settings?.whatsapp || '+91 93720 85090').replace(/[^0-9]/g, '');
    const text = encodeURIComponent('Hello Fashinery, I would like to inquire about your collections.');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // Navigation helpers
  const openProductPage = (slugOrId: string) => {
    const found = products.find((p) => p.slug === slugOrId || p.id === slugOrId);
    if (found) {
      setSelectedProductSlug(found.slug);
      setCurrentView('product');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Admin Operations
  const saveProduct = async (productData: Partial<Product>) => {
    if (!isAdmin) throw new Error('Access Denied: Administrative privileges required.');

    // URL Validation for product images
    if (productData.images && Array.isArray(productData.images)) {
      for (const url of productData.images) {
        const v = validateSafeURL(url);
        if (!v.isValid) throw new Error(`Security Alert: Unsafe product image URL detected (${v.error}).`);
      }
    }

    const id = productData.id || `prod-${Date.now()}`;
    const cleanSlug =
      productData.slug ||
      (productData.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // Derive backwards-compatible colors and sizes from colorOptions and sizeOptions
    const cleanColorOptions = (productData.colorOptions || []).map((c, idx) => ({
      id: c.id || `col-${Date.now()}-${idx}`,
      name: c.name?.trim() || `Color ${idx + 1}`,
      hexCode: c.hexCode?.trim() || undefined,
      images: Array.isArray(c.images) ? c.images.filter(Boolean) : undefined,
      galleryImages: Array.isArray(c.galleryImages) ? c.galleryImages : undefined,
      isEnabled: c.isEnabled !== false,
    }));

    const cleanSizeOptions = (productData.sizeOptions || []).map((s, idx) => ({
      id: s.id || `size-${Date.now()}-${idx}`,
      name: s.name?.trim() || `Size ${idx + 1}`,
      isEnabled: s.isEnabled !== false,
    }));

    const activeColors = cleanColorOptions.length > 0
      ? cleanColorOptions.filter((c) => c.isEnabled).map((c) => c.name)
      : (productData.colors && productData.colors.length > 0 ? productData.colors : ['Ivory', 'Rose']);

    const activeSizes = cleanSizeOptions.length > 0
      ? cleanSizeOptions.filter((s) => s.isEnabled).map((s) => s.name)
      : (productData.sizes && productData.sizes.length > 0 ? productData.sizes : ['Free Size']);

    const cleanVariants = (productData.variants || []).map((v, idx) => ({
      id: v.id || `var-${Date.now()}-${idx}`,
      colorId: v.colorId || undefined,
      color: v.color?.trim() || '',
      sizeId: v.sizeId || undefined,
      size: v.size?.trim() || '',
      sku: v.sku?.trim() || `${productData.sku || 'FSH'}-${idx + 1}`,
      stock: Number(v.stock) >= 0 ? Number(v.stock) : 0,
      sellingPrice: Number(v.sellingPrice) >= 0 ? Number(v.sellingPrice) : Number(productData.sellingPrice) || 0,
      mrp: Number(v.mrp) >= 0 ? Number(v.mrp) : Number(productData.mrp) || 0,
      image: v.image?.trim() || undefined,
      isEnabled: v.isEnabled !== false,
    }));

    const fullProduct: Product = {
      id,
      name: productData.name || 'Untitled Garment',
      slug: cleanSlug,
      sku: productData.sku || `FSH-${Math.floor(100 + Math.random() * 900)}`,
      categoryId: productData.categoryId || (categories[0]?.id ?? 'cat-sarees'),
      categoryName:
        categories.find((c) => c.id === productData.categoryId)?.name ||
        productData.categoryName ||
        'Sarees',
      subCategory: productData.subCategory || '',
      brand: productData.brand || 'Fashinery Haute',
      shortDescription: productData.shortDescription || '',
      description: productData.description || '',
      mrp: Number(productData.mrp) || 9999,
      sellingPrice: Number(productData.sellingPrice) || 6999,
      discountPercent:
        productData.mrp && productData.sellingPrice
          ? Math.round(((productData.mrp - productData.sellingPrice) / productData.mrp) * 100)
          : productData.discountPercent || 0,
      stock: Number(productData.stock) || 10,
      lowStockThreshold: Number(productData.lowStockThreshold) || 3,
      sizes: activeSizes,
      colors: activeColors,
      colorOptions: cleanColorOptions,
      sizeOptions: cleanSizeOptions,
      variants: cleanVariants,
      fabric: productData.fabric || 'Pure Silk',
      images: (productData.images && productData.images.filter((img) => typeof img === 'string' && img.trim() !== '').length > 0)
        ? productData.images.filter((img) => typeof img === 'string' && img.trim() !== '')
        : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85'],
      galleryImages: productData.galleryImages || [],
      featured: productData.featured ?? true,
      bestseller: productData.bestseller ?? false,
      newArrival: productData.newArrival ?? true,
      published: productData.published ?? true,
      rating: productData.rating || 4.9,
      reviewCount: productData.reviewCount || 1,
      sizeChart: productData.sizeChart,
      shippingInfo: productData.shippingInfo || 'Dispatched within 24-48 hours.',
      returnInfo: productData.returnInfo || '7-day doorstep return policy.',
      createdAt: productData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'products', id), removeUndefinedFields(fullProduct));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!isAdmin) throw new Error('Access Denied');
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
    }
  };

  const saveCategory = async (categoryData: Partial<Category>) => {
    if (!isAdmin) throw new Error('Access Denied');
    
    // URL Validation
    const v = validateSafeURL(categoryData.image);
    if (!v.isValid) throw new Error(`Security Alert: Unsafe category image URL detected (${v.error}).`);

    const id = categoryData.id || `cat-${Date.now()}`;
    const cleanSlug =
      categoryData.slug ||
      (categoryData.name || 'category')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const cat: Category = {
      id,
      name: categoryData.name || 'New Category',
      slug: cleanSlug,
      description: categoryData.description || '',
      image:
        categoryData.image ||
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      sortOrder: Number(categoryData.sortOrder) || categories.length + 1,
      isActive: categoryData.isActive ?? true,
    };

    try {
      await setDoc(doc(db, 'categories', id), removeUndefinedFields(cat));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${id}`);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${categoryId}`);
    }
  };

  const saveBanner = async (bannerData: Partial<Banner>) => {
    if (!isAdmin) throw new Error('Access Denied');

    // URL Validation
    const urlCheck1 = validateSafeURL(bannerData.buttonUrl);
    if (!urlCheck1.isValid) throw new Error(`Security Alert: Unsafe button URL detected.`);
    const urlCheck2 = validateSafeURL(bannerData.desktopImage);
    if (!urlCheck2.isValid) throw new Error(`Security Alert: Unsafe desktop image URL detected.`);
    const urlCheck3 = validateSafeURL(bannerData.mobileImage);
    if (!urlCheck3.isValid) throw new Error(`Security Alert: Unsafe mobile image URL detected.`);

    const id = bannerData.id || `banner-${Date.now()}`;
    const ban: Banner = {
      id,
      title: bannerData.title || 'New Banner',
      subtitle: bannerData.subtitle || '',
      description: bannerData.description || '',
      desktopImage: bannerData.desktopImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85',
      mobileImage: bannerData.mobileImage || bannerData.desktopImage || '',
      buttonText: bannerData.buttonText || 'Shop Now',
      buttonUrl: bannerData.buttonUrl || '/shop',
      position: bannerData.position || 'hero',
      sortOrder: Number(bannerData.sortOrder) || 1,
      isActive: bannerData.isActive ?? true,
      discountBadge: bannerData.discountBadge,
    };

    try {
      await setDoc(doc(db, 'banners', id), removeUndefinedFields(ban));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `banners/${id}`);
    }
  };

  const deleteBanner = async (bannerId: string) => {
    try {
      await deleteDoc(doc(db, 'banners', bannerId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `banners/${bannerId}`);
    }
  };

  const saveCoupon = async (couponData: Partial<Coupon>) => {
    if (!isAdmin) throw new Error('Access Denied');
    const id = couponData.id || `coupon-${Date.now()}`;
    const cleanCode = (couponData.code || '').toUpperCase().trim();
    if (!cleanCode) return;

    const coup: Coupon = {
      id,
      code: cleanCode,
      description: couponData.description?.trim() || '',
      discountType: (couponData.discountType === 'flat' ? 'flat' : couponData.discountType) || 'percentage',
      discountValue: Number(couponData.discountValue) || 0,
      minOrderValue: Number(couponData.minOrderValue) || 0,
      maxDiscount: couponData.maxDiscount ? Number(couponData.maxDiscount) : undefined,
      usageLimit: couponData.usageLimit ? Number(couponData.usageLimit) : undefined,
      usedCount: Number(couponData.usedCount) || 0,
      perCustomerLimit: couponData.perCustomerLimit ? Number(couponData.perCustomerLimit) : undefined,
      isActive: couponData.isActive !== false,
      startDate: couponData.startDate || new Date().toISOString().split('T')[0],
      validUntil: couponData.validUntil || '2026-12-31',
      createdAt: couponData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'coupons', id), removeUndefinedFields(coup));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `coupons/${id}`);
    }
  };

  const deleteCoupon = async (couponId: string) => {
    if (!isAdmin) throw new Error('Access Denied');
    try {
      await deleteDoc(doc(db, 'coupons', couponId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `coupons/${couponId}`);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    details?: {
      trackingUrl?: string;
      courierPartner?: string;
      cancellationReason?: string;
      cancelledBy?: 'admin' | 'customer' | 'Customer' | 'Admin';
      notes?: string;
      trackingNumber?: string;
      courier?: string;
    } | string,
    legacyCourier?: string,
    legacyNotes?: string,
    legacyCancellationReason?: string
  ) => {
    if (!isAdmin) throw new Error('Access Denied: Administrative privileges required to modify order status.');
    try {
      const now = new Date().toISOString();
      const updates: Partial<Order> = {
        orderStatus: status,
        updatedAt: now,
      };

      if (typeof details === 'object' && details !== null) {
        if (status === 'Cancelled') {
          const cleanReason = (details.cancellationReason || '').trim();
          updates.cancelledBy = 'admin';
          updates.cancellationReason = cleanReason;
          updates.cancelledAt = now;
          updates.notes = `Cancelled by admin on ${new Date().toLocaleString('en-IN')}: ${cleanReason}`;
        } else {
          if (details.trackingUrl !== undefined) {
            updates.trackingUrl = details.trackingUrl.trim();
          }
          if (details.courierPartner !== undefined || details.courier !== undefined) {
            const partner = (details.courierPartner || details.courier || '').trim();
            updates.courierPartner = partner;
            updates.courier = partner; // backward compatibility
          }
          if (details.trackingNumber !== undefined) {
            updates.trackingNumber = details.trackingNumber.trim();
          }
          if (details.notes !== undefined) {
            updates.notes = details.notes;
          }
        }
      } else {
        // Legacy positional call: (orderId, status, trackingNumber/url, courier, notes, cancellationReason)
        if (status === 'Cancelled') {
          const cleanReason = (legacyCancellationReason || (typeof details === 'string' ? details : '')).trim();
          updates.cancelledBy = 'admin';
          updates.cancellationReason = cleanReason;
          updates.cancelledAt = now;
          updates.notes = `Cancelled by admin on ${new Date().toLocaleString('en-IN')}: ${cleanReason}`;
        } else {
          if (typeof details === 'string') {
            if (details.startsWith('http://') || details.startsWith('https://')) {
              updates.trackingUrl = details.trim();
            } else {
              updates.trackingNumber = details.trim();
            }
          }
          if (legacyCourier !== undefined) {
            updates.courierPartner = legacyCourier.trim();
            updates.courier = legacyCourier.trim();
          }
          if (legacyNotes !== undefined) {
            updates.notes = legacyNotes;
          }
        }
      }

      // Sync across React state immediately
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, ...updates } : o))
      );
      setLastCreatedOrder((prev) =>
        prev && (prev.id === orderId || prev.orderNumber === orderId) ? { ...prev, ...updates } : prev
      );

      await updateDoc(doc(db, 'orders', orderId), removeUndefinedFields(updates));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      throw err;
    }
  };

  const saveSiteSettings = async (newSettings: SiteSettings) => {
    if (!isAdmin) throw new Error('Unauthorized');

    // URL Validation
    const urlsToValidate = [
      newSettings.logoUrl,
      newSettings.faviconUrl,
      newSettings.announcementLink,
      newSettings.socialInstagram,
      newSettings.socialFacebook,
      newSettings.socialWhatsApp,
    ];

    for (const url of urlsToValidate) {
      const v = validateSafeURL(url);
      if (!v.isValid) throw new Error(`Site settings contains unsafe URL: ${v.error}`);
    }

    try {
      const cleanSettings: SiteSettings = {
        ...newSettings,
        socialInstagram: 'https://www.instagram.com/fashinery.in/',
      };
      await setDoc(doc(db, 'siteSettings', 'global'), removeUndefinedFields(cleanSettings));
      setSettings(cleanSettings);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('fashinery_site_settings', JSON.stringify(newSettings));
          if (newSettings.logoUrl) {
            localStorage.setItem('fashinery_brand_logo', newSettings.logoUrl);
          } else {
            localStorage.removeItem('fashinery_brand_logo');
          }
        } catch (storageErr) {
          console.warn('Could not persist settings to localStorage:', storageErr);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'siteSettings/global');
    }
  };

  const saveCommunityGallery = async (galleryItems: CommunityGalleryItem[]): Promise<boolean> => {
    try {
      const cleanItems: CommunityGalleryItem[] = (galleryItems || []).map((item, index) => ({
        id: item.id || `comm-${Date.now()}-${index}`,
        imageUrl: item.imageUrl || '',
        storagePath: item.storagePath || '',
        sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index,
        active: item.active !== false,
        instagramUrl: item.instagramUrl?.trim() || 'https://www.instagram.com/fashinery.in/',
        title: item.title || '',
        likes: item.likes || '1.2k',
        handle: item.handle || '@fashinery.in',
      }));

      const cleanSettings: SiteSettings = {
        ...settings,
        communityGallery: cleanItems,
        socialInstagram: 'https://www.instagram.com/fashinery.in/',
      };

      await setDoc(doc(db, 'siteSettings', 'global'), removeUndefinedFields(cleanSettings), { merge: true });
      setSettings(cleanSettings);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('fashinery_site_settings', JSON.stringify(cleanSettings));
        } catch (storageErr) {
          console.warn('Could not persist settings to localStorage:', storageErr);
        }
      }
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'siteSettings/global');
      return false;
    }
  };

  const savePolicy = async (policy: Policy) => {
    try {
      await setDoc(
        doc(db, 'policies', policy.id),
        removeUndefinedFields({
          ...policy,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `policies/${policy.id}`);
    }
  };

  const saveFaq = async (faq: Partial<FAQItem>) => {
    if (!isAdmin) throw new Error('Access Denied');
    const id = faq.id || `faq_${Date.now()}`;
    const data: FAQItem = {
      id,
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'General',
      sortOrder: faq.sortOrder ?? 99,
      isActive: faq.isActive ?? true,
    };
    try {
      await setDoc(doc(db, 'faqs', id), removeUndefinedFields(data));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `faqs/${id}`);
    }
  };

  const deleteFaq = async (faqId: string) => {
    if (!isAdmin) throw new Error('Access Denied');
    try {
      await deleteDoc(doc(db, 'faqs', faqId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `faqs/${faqId}`);
    }
  };

  const updateContactStatus = async (
    id: string,
    status: 'new' | 'read' | 'replied' | 'archived',
    adminNotes?: string
  ) => {
    try {
      const updates: any = { status, updatedAt: new Date().toISOString() };
      if (adminNotes !== undefined) updates.adminNotes = adminNotes;
      await updateDoc(doc(db, 'contacts', id), removeUndefinedFields(updates));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `contacts/${id}`);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'contacts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `contacts/${id}`);
    }
  };

  const moderateReview = async (reviewId: string, status: 'approved' | 'rejected') => {
    if (!isAdmin) throw new Error('Access Denied');
    try {
      await updateDoc(doc(db, 'reviews', reviewId), removeUndefinedFields({ status }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reviews/${reviewId}`);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!isAdmin) throw new Error('Access Denied');
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reviews/${reviewId}`);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        banners,
        settings,
        coupons,
        reviews,
        orders,
        policies,
        faqs,
        contactMessages,
        loading,

        currentView,
        setCurrentView,
        selectedProductSlug,
        openProductPage,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        selectedPolicySlug,
        setSelectedPolicySlug,
        openPolicyPage,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,

        cart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isWishlistDrawerOpen,
        setIsWishlistDrawerOpen,
        wishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,

        appliedCoupon,
        couponError,
        applyCoupon,
        validateCoupon,
        removeCoupon,
        cartSubtotal,
        cartDiscount,
        cartShipping,
        cartTotal,

        lastCreatedOrder,
        createOrder,
        confirmRazorpayOrder,
        cancelOrder,
        requestReturn,

        user,
        customerProfile,
        isAdmin,
        isSuperAdmin,
        adminRole,
        adminUser,
        adminUsers,
        adminMode,
        authReady,
        setAdminMode,
        loginWithGoogle,
        loginCustomer,
        registerCustomer,
        sendCustomerPasswordReset,
        verifyResetCode,
        confirmReset,
        sendCustomerEmailVerification,
        updateCustomerProfile,
        loginWithEmailPassword,
        sendAdminPasswordReset,
        logout,
        authError,
        clearAuthError,

        addAdminUser,
        updateAdminUserStatus,
        updateAdminUserRole,
        deleteAdminUser,

        submitContact,
        subscribeNewsletter,
        submitReview,

        getWhatsAppProductUrl,
        getWhatsAppOrderHelpUrl,
        openGeneralWhatsApp,

        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        saveBanner,
        deleteBanner,
        saveCoupon,
        deleteCoupon,
        updateOrderStatus,
        saveSiteSettings,
        saveCommunityGallery,
        savePolicy,
        saveFaq,
        deleteFaq,
        updateContactStatus,
        deleteContact,
        moderateReview,
        deleteReview,
        seedDatabase,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
