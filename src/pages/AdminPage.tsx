import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Banknote,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShoppingBag,
  Sliders,
  Tag,
  Trash2,
  Truck,
  Users,
  ShieldCheck,
  X,
  Ban,
  Instagram,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from '../components/BrandLogo';
import { AdminUsersTab } from '../components/AdminUsersTab';
import { AdminProductOptionsEditor } from '../components/AdminProductOptionsEditor';
import { AdminProductImagesManager } from '../components/AdminProductImagesManager';
import { AdminCommunityGalleryTab } from '../components/AdminCommunityGalleryTab';
import { AdminImageUploadField } from '../components/AdminImageUploadField';
import {
  Banner,
  Category,
  ContactMessage,
  Coupon,
  FAQItem,
  Order,
  OrderStatus,
  Policy,
  Product,
  ProductColorOption,
  ProductImageItem,
  ProductSizeOption,
  ProductVariant,
  SiteSettings,
  isValidTrackingUrl,
} from '../types';

type AdminTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'orders'
  | 'banners'
  | 'community-gallery'
  | 'coupons'
  | 'policies'
  | 'faqs'
  | 'contacts'
  | 'settings'
  | 'admin-users';

export const AdminPage: React.FC = () => {
  const {
    products,
    categories,
    orders,
    banners,
    coupons,
    policies,
    faqs,
    contactMessages,
    settings,
    saveProduct,
    deleteProduct,
    saveCategory,
    deleteCategory,
    saveBanner,
    deleteBanner,
    saveCoupon,
    deleteCoupon,
    saveFaq,
    deleteFaq,
    updateContactStatus,
    deleteContact,
    updateOrderStatus,
    saveSiteSettings,
    savePolicy,
    setCurrentView,
    user,
    isAdmin,
    isSuperAdmin,
    adminRole,
    adminUser,
    loginWithGoogle,
    logout,
    seedDatabase,
    authError,
    clearAuthError,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  // Product Form Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Category Form Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Banner Form Modal State
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);

  // Coupon Form Modal State
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  // Order Details Modal & Filters
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [orderFilterTab, setOrderFilterTab] = useState<
    'all' | 'cod' | 'razorpay' | 'paid' | 'pending' | 'failed' | 'cancelled' | 'shipped' | 'delivered' | 'returns'
  >('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderTrackingInput, setOrderTrackingInput] = useState({
    status: 'Confirmed' as OrderStatus,
    courierPartner: '',
    trackingUrl: '',
    cancellationReason: '',
    courier: '',
    trackingNumber: '',
  });
  const [orderUpdateError, setOrderUpdateError] = useState<string | null>(null);
  const [orderUpdateSuccess, setOrderUpdateSuccess] = useState<string | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // Settings form local state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setSettingsForm(settings);
    }
  }, [settings]);

  // Policy editing state
  const [selectedPolicySlug, setSelectedPolicySlug] = useState<string>('shipping');
  const [policySaved, setPolicySaved] = useState(false);
  const [policyPreviewMode, setPolicyPreviewMode] = useState(false);

  // FAQ Modal & state
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQItem> | null>(null);
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('All');
  const [faqSearch, setFaqSearch] = useState<string>('');

  // Contact inquiries filter
  const [contactFilter, setContactFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');

  // Product Search / Filter in Admin
  const [productSearch, setProductSearch] = useState('');

  // Dynamic Product Colors, Sizes & Variants State
  const [localColorOptions, setLocalColorOptions] = useState<ProductColorOption[]>([]);
  const [localSizeOptions, setLocalSizeOptions] = useState<ProductSizeOption[]>([]);
  const [localVariants, setLocalVariants] = useState<ProductVariant[]>([]);

  // Keep local options in sync when editingProduct changes
  useEffect(() => {
    if (editingProduct && productModalOpen) {
      // 1. Color Options
      if (editingProduct.colorOptions && editingProduct.colorOptions.length > 0) {
        setLocalColorOptions(editingProduct.colorOptions);
      } else if (editingProduct.colors && editingProduct.colors.length > 0) {
        setLocalColorOptions(
          editingProduct.colors.map((c, i) => ({
            id: `col-${Date.now()}-${i}`,
            name: c,
            hexCode: i === 0 ? '#C9A227' : i === 1 ? '#D32F2F' : '#00897B',
            isEnabled: true,
          }))
        );
      } else {
        setLocalColorOptions([
          { id: `col-${Date.now()}-1`, name: 'Vintage Gold', hexCode: '#C9A227', isEnabled: true },
          { id: `col-${Date.now()}-2`, name: 'Ruby Scarlet', hexCode: '#D32F2F', isEnabled: true },
        ]);
      }

      // 2. Size Options
      if (editingProduct.sizeOptions && editingProduct.sizeOptions.length > 0) {
        setLocalSizeOptions(editingProduct.sizeOptions);
      } else if (editingProduct.sizes && editingProduct.sizes.length > 0) {
        setLocalSizeOptions(
          editingProduct.sizes.map((s, i) => ({
            id: `size-${Date.now()}-${i}`,
            name: s,
            isEnabled: true,
          }))
        );
      } else {
        setLocalSizeOptions([
          { id: `size-${Date.now()}-1`, name: 'Free Size', isEnabled: true },
        ]);
      }

      // 3. Variants
      if (editingProduct.variants && editingProduct.variants.length > 0) {
        setLocalVariants(editingProduct.variants);
      } else {
        setLocalVariants([]);
      }
    }
  }, [editingProduct, productModalOpen]);

  // Overview metrics
  const totalRevenue = orders.reduce((acc, o) => (o.orderStatus !== 'Cancelled' ? acc + o.total : acc), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing').length;
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);

  // Product save handler
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Validate that if colors/sizes are present, at least one is enabled or non-empty
    const activeColors = localColorOptions
      .filter((c) => c.isEnabled && c.name.trim())
      .map((c) => c.name.trim());
    const activeSizes = localSizeOptions
      .filter((s) => s.isEnabled && s.name.trim())
      .map((s) => s.name.trim());

    const payload: Partial<Product> = {
      ...editingProduct,
      colorOptions: localColorOptions,
      sizeOptions: localSizeOptions,
      variants: localVariants,
      colors: activeColors.length > 0 ? activeColors : ['Original'],
      sizes: activeSizes.length > 0 ? activeSizes : ['Free Size'],
    };

    await saveProduct(payload);
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  // Category save handler
  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    await saveCategory(editingCategory);
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // Banner save handler
  const handleSaveBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    await saveBanner(editingBanner);
    setBannerModalOpen(false);
    setEditingBanner(null);
  };

  // Coupon save handler
  const handleSaveCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    await saveCoupon(editingCoupon);
    setCouponModalOpen(false);
    setEditingCoupon(null);
  };

  // Settings save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSiteSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Active policy derived
  const currentEditingPolicy =
    policies.find((p) => p.slug === selectedPolicySlug) ||
    policies[0] || {
      id: 'shipping',
      slug: 'shipping',
      title: 'Shipping & Delivery Policy',
      content: '',
      updatedAt: new Date().toISOString(),
    };

  const [localPolicyContent, setLocalPolicyContent] = useState<string>(currentEditingPolicy.content || '');
  const [localPolicyTitle, setLocalPolicyTitle] = useState<string>(currentEditingPolicy.title || '');
  const [localPolicySubtitle, setLocalPolicySubtitle] = useState<string>(currentEditingPolicy.subtitle || '');
  const [localPolicyStatus, setLocalPolicyStatus] = useState<'published' | 'draft' | 'unpublished'>(
    currentEditingPolicy.status || 'published'
  );
  const [localPolicySeoTitle, setLocalPolicySeoTitle] = useState<string>(currentEditingPolicy.seoTitle || '');
  const [localPolicySeoDesc, setLocalPolicySeoDesc] = useState<string>(currentEditingPolicy.seoDescription || '');

  // Keep local policy in sync when selectedPolicySlug changes or policies load
  useEffect(() => {
    const p = policies.find((item) => item.slug === selectedPolicySlug);
    if (p) {
      setLocalPolicyTitle(p.title);
      setLocalPolicySubtitle(p.subtitle || '');
      setLocalPolicyContent(p.content);
      setLocalPolicyStatus(p.status || 'published');
      setLocalPolicySeoTitle(p.seoTitle || '');
      setLocalPolicySeoDesc(p.seoDescription || '');
    }
  }, [selectedPolicySlug, policies]);

  // Policy save
  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Policy = {
      ...currentEditingPolicy,
      title: localPolicyTitle,
      subtitle: localPolicySubtitle,
      content: localPolicyContent,
      status: localPolicyStatus,
      seoTitle: localPolicySeoTitle,
      seoDescription: localPolicySeoDesc,
      updatedAt: new Date().toISOString(),
    };
    await savePolicy(updated);
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 3000);
  };

  // FAQ save handler
  const handleSaveFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !editingFaq.question || !editingFaq.answer) return;
    await saveFaq(editingFaq);
    setFaqModalOpen(false);
    setEditingFaq(null);
  };

  return (
    <div id="admin-management-portal" className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Admin Bar */}
      <div className="bg-stone-900 text-white px-6 py-3.5 flex items-center justify-between shadow-md border-b border-stone-800">
        <div className="flex items-center space-x-4">
          <div className="cursor-pointer" onClick={() => setCurrentView('home')}>
            <BrandLogo size="sm" theme="dark" showSlogan={false} />
          </div>
          <div className="border-l border-stone-700 pl-4 hidden sm:block">
            <h1 className="font-serif text-sm font-bold tracking-wider text-rose-200/90 uppercase">
              Atelier CMS &amp; Control
            </h1>
            <span className="text-[10px] text-stone-400 block tracking-widest uppercase">
              Real-time Firestore Operations Console
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Storefront</span>
          </button>
          <button
            id="btn-admin-logout"
            onClick={logout}
            className="flex items-center gap-1.5 text-stone-300 hover:text-rose-300 bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            title="Log out of admin session"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-stone-950 text-stone-300 p-2 sm:p-4 shrink-0 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-800">
          <div>
            <span className="hidden md:block text-[10px] font-bold tracking-widest text-stone-500 uppercase px-3 mb-2">
              Store Control Modules
            </span>

            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 md:gap-1 pb-1 md:pb-0 no-scrollbar">
              {[
                { id: 'overview', label: 'Overview Analytics', icon: LayoutDashboard },
                { id: 'products', label: 'Products & Stock', icon: ShoppingBag, badge: lowStockProducts.length },
                { id: 'categories', label: 'Category Hierarchy', icon: Layers },
                { id: 'orders', label: 'Client Orders', icon: Package, badge: pendingOrdersCount },
                { id: 'banners', label: 'Sliders & Banners', icon: ImageIcon },
                { id: 'community-gallery', label: 'Community & Styling Gallery', icon: Instagram },
                { id: 'coupons', label: 'Coupons & Discounts', icon: Tag },
                { id: 'policies', label: 'Policies CMS (8)', icon: Sliders },
                { id: 'faqs', label: 'FAQ Knowledgebase', icon: HelpCircle, badge: faqs.length },
                { id: 'contacts', label: 'Customer Inquiries', icon: MessageSquare, badge: contactMessages.filter((m) => m.status === 'new').length },
                { id: 'settings', label: 'Store Information', icon: Settings },
                { id: 'admin-users', label: 'Admin Access & RBAC', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`admin-nav-${tab.id}`}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`shrink-0 md:w-full flex items-center justify-between gap-2 px-3 py-2 md:py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                        : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          activeTab === tab.id
                            ? 'bg-stone-950 text-amber-300'
                            : 'bg-amber-900 text-amber-200'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden md:block pt-6 border-t border-stone-800 text-[11px] text-stone-500 space-y-1 p-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-stone-400">Authenticated Admin</p>
              <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                {adminRole || (isSuperAdmin ? 'superadmin' : 'admin')}
              </span>
            </div>
            <p className="truncate text-stone-300 font-mono text-[10px]" title={user?.email || 'Admin'}>
              {user?.email || 'admin@fashinery.com'}
            </p>
            <p>Direct Phone: +91 {settings.phone}</p>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto">
          {authError && (
            <div
              id="admin-auth-error-banner"
              className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{authError}</span>
              </div>
              <button
                onClick={clearAuthError}
                className="p-1 text-rose-600 hover:text-rose-900 rounded-lg hover:bg-rose-100 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    Performance &amp; Inventory Overview
                  </h2>
                  <p className="text-xs text-stone-500">
                    Real-time sales metrics, incoming orders, and inventory health.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {!user ? (
                    <button
                      type="button"
                      onClick={() => loginWithGoogle(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 text-amber-300 text-xs font-medium hover:bg-stone-800 transition"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Sign in as Store Owner
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-600 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                        {user.email} {isAdmin ? '(Admin)' : ''}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          disabled={seedLoading}
                          onClick={async () => {
                            setSeedLoading(true);
                            setSeedStatus(null);
                            try {
                              await seedDatabase(true);
                              setSeedStatus('Database synced successfully!');
                            } catch (e: any) {
                              setSeedStatus('Sync failed: ' + (e.message || 'Unknown error'));
                            } finally {
                              setSeedLoading(false);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-300 text-xs font-medium text-stone-800 transition disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${seedLoading ? 'animate-spin' : ''}`} />
                          {seedLoading ? 'Syncing...' : 'Sync Catalog to Firestore'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {seedStatus && (
                <div className="p-3 bg-stone-100 border border-stone-300 rounded-xl text-xs text-stone-700 flex items-center justify-between">
                  <span>{seedStatus}</span>
                  <button type="button" onClick={() => setSeedStatus(null)} className="text-stone-400 hover:text-stone-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold block">
                    Gross Order Revenue
                  </span>
                  <span className="font-serif text-2xl font-bold text-stone-900 mt-1 block">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Across {totalOrdersCount} orders placed
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold block">
                    Active Catalog Items
                  </span>
                  <span className="font-serif text-2xl font-bold text-stone-900 mt-1 block">
                    {products.length} Garments
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    In {categories.length} silhouettes
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold block">
                    Pending Dispatches
                  </span>
                  <span className="font-serif text-2xl font-bold text-amber-900 mt-1 block">
                    {pendingOrdersCount} Orders
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Requires packing / pickup
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold block">
                    Low Stock Alert
                  </span>
                  <span className="font-serif text-2xl font-bold text-rose-600 mt-1 block">
                    {lowStockProducts.length} Items
                  </span>
                  <span className="text-[11px] text-rose-500 font-medium">
                    Stock &le; 3 units
                  </span>
                </div>
              </div>

              {/* Low Stock Callout Table */}
              {lowStockProducts.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                  <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2 text-rose-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Garments Requiring Restock</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-stone-50 text-stone-500 uppercase">
                        <tr>
                          <th className="p-2">Garment</th>
                          <th className="p-2">SKU</th>
                          <th className="p-2">Stock Remaining</th>
                          <th className="p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {lowStockProducts.map((p) => (
                          <tr key={p.id}>
                            <td className="p-2 font-medium text-stone-900 flex items-center gap-2">
                              {p.images?.[0] && p.images[0].trim() !== '' ? (
                                <img
                                  src={p.images[0].trim()}
                                  alt={p.name}
                                  className="w-8 h-10 object-cover rounded"
                                />
                              ) : (
                                <div className="w-8 h-10 rounded bg-stone-100 flex items-center justify-center text-[10px] text-stone-500 font-bold">
                                  {p.name?.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span>{p.name}</span>
                            </td>
                            <td className="p-2 text-stone-500 font-mono">{p.sku}</td>
                            <td className="p-2 font-bold text-rose-600">{p.stock} units</td>
                            <td className="p-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setProductModalOpen(true);
                                }}
                                className="text-amber-800 hover:underline font-semibold"
                              >
                                Edit Stock
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recent Orders Overview */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    Recent Customer Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-amber-800 hover:underline font-semibold"
                  >
                    View All Orders &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 uppercase">
                      <tr>
                        <th className="p-2.5">Order No.</th>
                        <th className="p-2.5">Customer</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Total</th>
                        <th className="p-2.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-50/50">
                          <td className="p-2.5 font-mono font-bold text-stone-900">
                            {ord.orderNumber}
                          </td>
                          <td className="p-2.5 text-stone-800">{ord.customerName}</td>
                          <td className="p-2.5">
                            {ord.orderStatus === 'Cancelled' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                {ord.cancelledBy === 'Admin' ? 'Cancelled by Admin' : 'Cancelled by Customer'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800">
                                {ord.orderStatus}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-bold">₹{ord.total.toLocaleString('en-IN')}</td>
                          <td className="p-2.5 text-stone-400">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    Product Catalog Management
                  </h2>
                  <p className="text-xs text-stone-500">
                    Add new pieces, update pricing, replace imagery, and adjust inventory.
                  </p>
                </div>
                <button
                  id="btn-admin-add-product"
                  onClick={() => {
                    setEditingProduct({
                      id: `prod_${Date.now()}`,
                      name: '',
                      slug: '',
                      sku: `FSH-${Math.floor(100 + Math.random() * 900)}`,
                      categoryId: categories[0]?.id || '',
                      categoryName: categories[0]?.name || '',
                      sellingPrice: 4999,
                      mrp: 6999,
                      stock: 10,
                      lowStockThreshold: 3,
                      fabric: 'Pure Silk',
                      sizes: ['XS', 'S', 'M', 'L', 'XL'],
                      colors: ['Rose', 'Gold'],
                      shortDescription: '',
                      description: '',
                      images: [],
                      galleryImages: [],
                      featured: true,
                      bestseller: false,
                      newArrival: true,
                      published: true,
                    });
                    setProductModalOpen(true);
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-center gap-2">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by title, SKU or fabric..."
                  className="w-full text-xs bg-transparent focus:outline-hidden"
                />
              </div>

              {/* Product Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 uppercase border-b border-stone-200">
                      <tr>
                        <th className="p-3">Garment</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Selling Price</th>
                        <th className="p-3">MRP</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Tags</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {products
                        .filter(
                          (p) =>
                            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.fabric.toLowerCase().includes(productSearch.toLowerCase())
                        )
                        .map((prod) => (
                          <tr key={prod.id} className="hover:bg-stone-50/50">
                            <td className="p-3 flex items-center gap-3">
                              {prod.images?.[0] && prod.images[0].trim() !== '' ? (
                                <img
                                  src={prod.images[0].trim()}
                                  alt={prod.name}
                                  className="w-10 h-12 object-cover rounded bg-stone-100 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-12 rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-600 shrink-0">
                                  {prod.name?.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-stone-900 block font-serif">
                                  {prod.name}
                                </span>
                                <span className="text-[11px] text-stone-400">{prod.fabric}</span>
                              </div>
                            </td>
                            <td className="p-3 text-stone-700">{prod.categoryName}</td>
                            <td className="p-3 font-mono text-stone-500">{prod.sku}</td>
                            <td className="p-3 font-bold text-stone-950">
                              ₹{prod.sellingPrice.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 text-stone-400 line-through">
                              ₹{prod.mrp.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3">
                              <span
                                className={`font-bold ${
                                  prod.stock <= prod.lowStockThreshold
                                    ? 'text-rose-600'
                                    : 'text-stone-800'
                                }`}
                              >
                                {prod.stock} left
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {prod.featured && (
                                  <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                                    FEATURED
                                  </span>
                                )}
                                {prod.bestseller && (
                                  <span className="text-[9px] bg-stone-900 text-amber-200 px-1.5 py-0.5 rounded font-bold">
                                    BESTSELLER
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setProductModalOpen(true);
                                }}
                                className="p-1 text-stone-600 hover:text-amber-900"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete ${prod.name}?`)) {
                                    deleteProduct(prod.id);
                                  }
                                }}
                                className="p-1 text-stone-400 hover:text-rose-600"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    Category Hierarchy &amp; Silhouettes
                  </h2>
                  <p className="text-xs text-stone-500">
                    Manage store navigation groups, hero card photos, and sort orders.
                  </p>
                </div>
                <button
                  id="btn-admin-add-category"
                  onClick={() => {
                    setEditingCategory({
                      name: '',
                      slug: '',
                      description: '',
                      image:
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
                      sortOrder: categories.length + 1,
                      isActive: true,
                    });
                    setCategoryModalOpen(true);
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-stone-100">
                      {cat.image && cat.image.trim() !== '' ? (
                        <img
                          src={cat.image.trim()}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-amber-50 flex items-center justify-center text-amber-900 font-serif font-bold text-lg">
                          {cat.name}
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-stone-950/80 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        Sort Order: {cat.sortOrder}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-base font-bold text-stone-900">{cat.name}</h3>
                        <p className="text-xs text-stone-400 font-mono">slug: /{cat.slug}</p>
                        {cat.description && (
                          <p className="text-xs text-stone-600 mt-1">{cat.description}</p>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            cat.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryModalOpen(true);
                            }}
                            className="text-stone-600 hover:text-stone-900 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete Category "${cat.name}"?`)) {
                                deleteCategory(cat.id);
                              }
                            }}
                            className="text-stone-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (() => {
            const allCount = orders.length;
            const codCount = orders.filter((o) => o.paymentMethod === 'Cash on Delivery').length;
            const razorpayCount = orders.filter(
              (o) =>
                o.paymentMethod === 'Razorpay / Online' ||
                o.paymentMethod === 'UPI / Online Payment' ||
                Boolean(o.razorpayOrderId) ||
                Boolean(o.razorpayPaymentId)
            ).length;
            const paidCount = orders.filter((o) => o.paymentStatus === 'Paid').length;
            const pendingCount = orders.filter(
              (o) =>
                o.paymentStatus === 'Pending' ||
                ['Pending', 'Confirmed', 'Processing', 'Packed'].includes(o.orderStatus)
            ).length;
            const failedCount = orders.filter((o) => o.paymentStatus === 'Failed').length;
            const shippedCount = orders.filter((o) =>
              ['Shipped', 'Out for Delivery'].includes(o.orderStatus)
            ).length;
            const deliveredCount = orders.filter((o) => o.orderStatus === 'Delivered').length;
            const cancelledCount = orders.filter((o) => o.orderStatus === 'Cancelled').length;
            const returnsCount = orders.filter((o) =>
              ['Return Requested', 'Returned', 'Refunded'].includes(o.orderStatus)
            ).length;

            const filteredOrders = orders.filter((ord) => {
              // Status & Payment filters
              if (orderFilterTab === 'cod') {
                if (ord.paymentMethod !== 'Cash on Delivery') return false;
              } else if (orderFilterTab === 'razorpay') {
                const isRzp =
                  ord.paymentMethod === 'Razorpay / Online' ||
                  ord.paymentMethod === 'UPI / Online Payment' ||
                  Boolean(ord.razorpayOrderId) ||
                  Boolean(ord.razorpayPaymentId);
                if (!isRzp) return false;
              } else if (orderFilterTab === 'paid') {
                if (ord.paymentStatus !== 'Paid') return false;
              } else if (orderFilterTab === 'pending') {
                const isPending =
                  ord.paymentStatus === 'Pending' ||
                  ['Pending', 'Confirmed', 'Processing', 'Packed'].includes(ord.orderStatus);
                if (!isPending) return false;
              } else if (orderFilterTab === 'failed') {
                if (ord.paymentStatus !== 'Failed') return false;
              } else if (orderFilterTab === 'shipped') {
                if (!['Shipped', 'Out for Delivery'].includes(ord.orderStatus)) return false;
              } else if (orderFilterTab === 'delivered') {
                if (ord.orderStatus !== 'Delivered') return false;
              } else if (orderFilterTab === 'cancelled') {
                if (ord.orderStatus !== 'Cancelled') return false;
              } else if (orderFilterTab === 'returns') {
                if (!['Return Requested', 'Returned', 'Refunded'].includes(ord.orderStatus)) return false;
              }

              // Search query filter
              if (orderSearchQuery.trim()) {
                const q = orderSearchQuery.toLowerCase();
                const matchesNum = ord.orderNumber?.toLowerCase().includes(q);
                const matchesName = ord.customerName?.toLowerCase().includes(q);
                const matchesPhone = ord.customerPhone?.toLowerCase().includes(q);
                const matchesEmail = ord.customerEmail?.toLowerCase().includes(q);
                const matchesCity = ord.shippingAddress?.city?.toLowerCase().includes(q);
                const matchesReason = ord.cancellationReason?.toLowerCase().includes(q);
                const matchesItems = ord.items?.some((i) => i.productName?.toLowerCase().includes(q));
                const matchesRzpPay = ord.razorpayPaymentId?.toLowerCase().includes(q);
                const matchesRzpOrd = ord.razorpayOrderId?.toLowerCase().includes(q);
                if (
                  !matchesNum &&
                  !matchesName &&
                  !matchesPhone &&
                  !matchesEmail &&
                  !matchesCity &&
                  !matchesReason &&
                  !matchesItems &&
                  !matchesRzpPay &&
                  !matchesRzpOrd
                ) {
                  return false;
                }
              }

              return true;
            });

            return (
              <div className="space-y-6">
                {/* Orders Header & Metrics */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-stone-900">
                      Client Orders &amp; Fulfillment
                    </h2>
                    <p className="text-xs text-stone-500">
                      Monitor client purchases, Razorpay transaction verifications, dispatch statuses, and customer cancellation records.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Search order #, Razorpay ID, phone, name..."
                      className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-stone-900"
                    />
                    {orderSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setOrderSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Navigation Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
                  {/* All Orders */}
                  <button
                    onClick={() => setOrderFilterTab('all')}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      orderFilterTab === 'all'
                        ? 'bg-stone-950 text-white font-bold shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>All Orders</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200/50 font-mono">
                      {allCount}
                    </span>
                  </button>

                  {/* COD */}
                  <button
                    id="btn-admin-filter-cod"
                    onClick={() => setOrderFilterTab('cod')}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      orderFilterTab === 'cod'
                        ? 'bg-amber-900 text-white font-bold shadow-xs'
                        : 'bg-amber-50/60 border border-amber-200 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>COD</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200/70 text-amber-950 font-mono font-bold">
                      {codCount}
                    </span>
                  </button>

                  {/* Razorpay */}
                  <button
                    id="btn-admin-filter-razorpay"
                    onClick={() => setOrderFilterTab('razorpay')}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      orderFilterTab === 'razorpay'
                        ? 'bg-indigo-900 text-white font-bold shadow-xs'
                        : 'bg-indigo-50/60 border border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Razorpay</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-200/70 text-indigo-950 font-mono font-bold">
                      {razorpayCount}
                    </span>
                  </button>

                  {/* Paid */}
                  <button
                    id="btn-admin-filter-paid"
                    onClick={() => setOrderFilterTab('paid')}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      orderFilterTab === 'paid'
                        ? 'bg-emerald-800 text-white font-bold shadow-xs'
                        : 'bg-emerald-50/60 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Paid</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-950 font-mono font-bold">
                      {paidCount}
                    </span>
                  </button>

                  {/* Pending */}
                  <button
                    id="btn-admin-filter-pending"
                    onClick={() => setOrderFilterTab('pending')}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      orderFilterTab === 'pending'
                        ? 'bg-amber-800 text-white font-bold shadow-xs'
                        : 'bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>Pending</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 font-mono">
                      {pendingCount}
                    </span>
                  </button>

                  {/* Failed */}
                  <button
                    id="btn-admin-filter-failed"
                    onClick={() => setOrderFilterTab('failed')}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      orderFilterTab === 'failed'
                        ? 'bg-rose-800 text-white font-bold shadow-xs'
                        : 'bg-rose-50/60 border border-rose-200 text-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Failed</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-950 font-mono font-bold">
                      {failedCount}
                    </span>
                  </button>

                  {/* Cancelled */}
                  <button
                    id="btn-admin-filter-cancelled"
                    onClick={() => setOrderFilterTab('cancelled')}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      orderFilterTab === 'cancelled'
                        ? 'bg-rose-700 text-white font-bold shadow-xs ring-2 ring-rose-300'
                        : 'bg-rose-50/70 border border-rose-200 text-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancelled</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        orderFilterTab === 'cancelled'
                          ? 'bg-white text-rose-800'
                          : 'bg-rose-200 text-rose-950'
                      }`}
                    >
                      {cancelledCount}
                    </span>
                  </button>

                  {/* Shipped */}
                  <button
                    onClick={() => setOrderFilterTab('shipped')}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      orderFilterTab === 'shipped'
                        ? 'bg-blue-900 text-white font-bold shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>Shipped</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-900 font-mono">
                      {shippedCount}
                    </span>
                  </button>

                  {/* Delivered */}
                  <button
                    onClick={() => setOrderFilterTab('delivered')}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      orderFilterTab === 'delivered'
                        ? 'bg-stone-950 text-white font-bold shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>Delivered</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 font-mono">
                      {deliveredCount}
                    </span>
                  </button>

                  {/* Returns */}
                  <button
                    onClick={() => setOrderFilterTab('returns')}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      orderFilterTab === 'returns'
                        ? 'bg-stone-950 text-white font-bold shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>Returns</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-mono">
                      {returnsCount}
                    </span>
                  </button>
                </div>

                {/* SPECIALIZED CANCELLED ORDERS VIEW */}
                {orderFilterTab === 'cancelled' ? (
                  <div className="space-y-4">
                    {/* Informative Banner */}
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4 text-xs text-rose-950">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-200/80 text-rose-800 flex items-center justify-center shrink-0">
                          <Ban className="w-5 h-5" />
                        </div>
                        <div>
                          <strong className="block font-serif text-sm">
                            Cancelled Orders Log ({filteredOrders.length})
                          </strong>
                          <p className="text-stone-600 text-[11px] mt-0.5">
                            Orders cancelled by customers prior to dispatch. Shows exact customer reasons, notes, timestamps, and refund checks.
                          </p>
                        </div>
                      </div>
                    </div>

                    {filteredOrders.length === 0 ? (
                      <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
                        <Ban className="w-10 h-10 text-stone-300 mx-auto" />
                        <h4 className="font-serif font-bold text-stone-800">No Cancelled Orders</h4>
                        <p className="text-xs text-stone-500 max-w-sm mx-auto">
                          {orderSearchQuery
                            ? `No cancelled orders match your search "${orderSearchQuery}".`
                            : 'There are currently no cancelled orders in the system.'}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-rose-50/50 text-stone-700 uppercase border-b border-stone-200 text-[11px] tracking-wider">
                              <tr>
                                <th className="p-3">Order ID</th>
                                <th className="p-3">Customer Name</th>
                                <th className="p-3">Mobile Number</th>
                                <th className="p-3">Order Amount</th>
                                <th className="p-3 min-w-[200px]">Products</th>
                                <th className="p-3 min-w-[150px]">Cancellation Reason</th>
                                <th className="p-3 min-w-[150px]">Other Reason / Details</th>
                                <th className="p-3">Cancellation Date/Time</th>
                                <th className="p-3">Payment Status</th>
                                <th className="p-3">Order Status</th>
                                <th className="p-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {filteredOrders.map((ord) => (
                                <tr key={ord.id} className="hover:bg-stone-50/70">
                                  {/* 1. Order ID */}
                                  <td className="p-3 font-mono font-bold text-stone-900">
                                    #{ord.orderNumber}
                                  </td>

                                  {/* 2. Customer Name */}
                                  <td className="p-3 font-semibold text-stone-900">
                                    {ord.customerName}
                                  </td>

                                  {/* 3. Mobile Number */}
                                  <td className="p-3 text-stone-800 font-mono">
                                    {ord.customerPhone}
                                  </td>

                                  {/* 4. Order Amount */}
                                  <td className="p-3 font-bold text-stone-950">
                                    ₹{ord.total.toLocaleString('en-IN')}
                                  </td>

                                  {/* 5. Products */}
                                  <td className="p-3">
                                    <div className="space-y-1.5 max-w-xs">
                                      {ord.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                          {item.productImage && item.productImage.trim() !== '' ? (
                                            <img
                                              src={item.productImage.trim()}
                                              alt={item.productName}
                                              referrerPolicy="no-referrer"
                                              className="w-7 h-9 object-cover rounded bg-stone-100 shrink-0 border border-stone-200"
                                            />
                                          ) : (
                                            <div className="w-7 h-9 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-900 font-bold text-[9px] shrink-0">
                                              {item.productName?.slice(0, 2).toUpperCase() || 'ITEM'}
                                            </div>
                                          )}
                                          <div className="min-w-0 flex-1">
                                            <span className="block font-medium text-stone-900 truncate">
                                              {item.productName}
                                            </span>
                                            <span className="text-[10px] text-stone-500">
                                              {item.size} · {item.color} · x{item.quantity}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </td>

                                  {/* 6. Cancellation Reason */}
                                  <td className="p-3 font-semibold text-rose-900">
                                    {ord.cancelledBy?.toLowerCase() === 'admin'
                                      ? ord.cancellationReason || 'Cancelled by admin'
                                      : ord.customerCancellationReason || ord.cancellationReason || 'Requested by customer'}
                                  </td>

                                  {/* 7. Other Reason / Details */}
                                  <td className="p-3 text-stone-600 italic">
                                    {ord.cancellationDetails || '—'}
                                  </td>

                                  {/* 8. Cancellation Date / Time */}
                                  <td className="p-3 text-stone-700 whitespace-nowrap">
                                    {ord.cancelledAt ? (
                                      <>
                                        <span className="block font-medium">
                                          {new Date(ord.cancelledAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                          })}
                                        </span>
                                        <span className="text-[10px] text-stone-400">
                                          {new Date(ord.cancelledAt).toLocaleTimeString('en-IN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })}
                                        </span>
                                      </>
                                    ) : (
                                      '—'
                                    )}
                                  </td>

                                  {/* 9. Payment Status */}
                                  <td className="p-3">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        ord.paymentStatus === 'Paid'
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                                      }`}
                                    >
                                      {ord.paymentStatus}
                                    </span>
                                    <span className="block text-[10px] text-stone-400 mt-0.5">
                                      {ord.paymentMethod}
                                    </span>
                                  </td>

                                  {/* 10. Order Status: Cancelled by Customer / Admin */}
                                  <td className="p-3">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 uppercase tracking-wider">
                                      <Ban className="w-3 h-3 text-rose-700" />
                                      <span>
                                        {ord.cancelledBy?.toLowerCase() === 'admin'
                                          ? 'Cancelled by Admin'
                                          : 'Cancelled by Customer'}
                                      </span>
                                    </span>
                                  </td>

                                  {/* 11. Actions */}
                                  <td className="p-3 text-right">
                                    <button
                                      onClick={() => {
                                        setSelectedOrderDetails(ord);
                                        setOrderTrackingInput({
                                          status: ord.orderStatus,
                                          courierPartner: ord.courierPartner || ord.courier || '',
                                          trackingUrl: ord.trackingUrl || '',
                                          cancellationReason: ord.cancelledBy?.toLowerCase() === 'admin' ? ord.cancellationReason || '' : '',
                                          courier: ord.courier || ord.courierPartner || '',
                                          trackingNumber: ord.trackingNumber || '',
                                        });
                                        setOrderUpdateError(null);
                                        setOrderUpdateSuccess(null);
                                      }}
                                      className="bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                                    >
                                      Manage
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* STANDARD ALL / FILTERED ORDERS TABLE */
                  <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-stone-50 text-stone-600 uppercase border-b border-stone-200 text-[11px] font-semibold tracking-wider">
                          <tr>
                            <th className="p-3 whitespace-nowrap">Order ID</th>
                            <th className="p-3 whitespace-nowrap">Customer Name</th>
                            <th className="p-3 whitespace-nowrap">Mobile Number</th>
                            <th className="p-3 min-w-[180px]">Products</th>
                            <th className="p-3 whitespace-nowrap">Total Amount</th>
                            <th className="p-3 whitespace-nowrap">Payment Method</th>
                            <th className="p-3 whitespace-nowrap">Payment Status</th>
                            <th className="p-3 whitespace-nowrap">Order Status</th>
                            <th className="p-3 whitespace-nowrap">Razorpay Payment ID</th>
                            <th className="p-3 whitespace-nowrap">Razorpay Order ID</th>
                            <th className="p-3 whitespace-nowrap">Order Date</th>
                            <th className="p-3 text-right whitespace-nowrap">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={12} className="p-8 text-center text-stone-500">
                                No orders found matching the selected filter or search term.
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-stone-50/70">
                                {/* 1. Order ID */}
                                <td className="p-3 font-mono font-bold text-stone-900 whitespace-nowrap">
                                  #{ord.orderNumber}
                                </td>

                                {/* 2. Customer Name */}
                                <td className="p-3 font-semibold text-stone-900 whitespace-nowrap">
                                  {ord.customerName}
                                </td>

                                {/* 3. Mobile Number */}
                                <td className="p-3 text-stone-700 font-mono whitespace-nowrap">
                                  {ord.customerPhone}
                                </td>

                                {/* 4. Products */}
                                <td className="p-3">
                                  <div className="space-y-1 max-w-xs">
                                    {ord.items?.map((it, idx) => (
                                      <div key={idx} className="flex items-center gap-1.5">
                                        {it.productImage && it.productImage.trim() !== '' ? (
                                          <img
                                            src={it.productImage.trim()}
                                            alt={it.productName}
                                            referrerPolicy="no-referrer"
                                            className="w-6 h-7 object-cover rounded bg-stone-100 border border-stone-200 shrink-0"
                                          />
                                        ) : (
                                          <div className="w-6 h-7 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-900 font-bold text-[8px] shrink-0">
                                            {it.productName?.slice(0, 2).toUpperCase() || 'ITEM'}
                                          </div>
                                        )}
                                        <div className="min-w-0 flex-1 truncate">
                                          <span className="font-medium text-stone-800 text-[11px] block truncate">
                                            {it.productName}
                                          </span>
                                          <span className="text-[10px] text-stone-500">
                                            {it.size} · x{it.quantity}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>

                                {/* 5. Total Amount */}
                                <td className="p-3 font-bold text-stone-950 whitespace-nowrap">
                                  ₹{ord.total.toLocaleString('en-IN')}
                                </td>

                                {/* 6. Payment Method */}
                                <td className="p-3 whitespace-nowrap">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                      ord.paymentMethod === 'Cash on Delivery'
                                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                                        : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                                    }`}
                                  >
                                    {ord.paymentMethod}
                                  </span>
                                </td>

                                {/* 7. Payment Status (Paid, Pending, Failed) */}
                                <td className="p-3 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                      ord.paymentStatus === 'Paid'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : ord.paymentStatus === 'Failed'
                                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                    }`}
                                  >
                                    {ord.paymentStatus === 'Paid' ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    ) : ord.paymentStatus === 'Failed' ? (
                                      <AlertCircle className="w-3 h-3 text-rose-600" />
                                    ) : (
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    )}
                                    <span>{ord.paymentStatus}</span>
                                  </span>
                                </td>

                                {/* 8. Order Status */}
                                <td className="p-3 whitespace-nowrap">
                                  {ord.orderStatus === 'Cancelled' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                      <Ban className="w-3 h-3 text-rose-600" />
                                      <span>Cancelled</span>
                                    </span>
                                  ) : (
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                        ord.orderStatus === 'Delivered'
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                          : ord.orderStatus === 'Shipped'
                                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                                          : ord.orderStatus === 'Return Requested'
                                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                                          : 'bg-stone-100 text-stone-800 border-stone-200'
                                      }`}
                                    >
                                      {ord.orderStatus}
                                    </span>
                                  )}
                                </td>

                                {/* 9. Razorpay Payment ID */}
                                <td className="p-3 whitespace-nowrap font-mono text-[11px]">
                                  {ord.razorpayPaymentId ? (
                                    <span className="text-indigo-900 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-200/60 font-semibold select-all">
                                      {ord.razorpayPaymentId}
                                    </span>
                                  ) : (
                                    <span className="text-stone-400 italic">N/A (COD)</span>
                                  )}
                                </td>

                                {/* 10. Razorpay Order ID */}
                                <td className="p-3 whitespace-nowrap font-mono text-[11px]">
                                  {ord.razorpayOrderId ? (
                                    <span className="text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-medium select-all">
                                      {ord.razorpayOrderId}
                                    </span>
                                  ) : (
                                    <span className="text-stone-400 italic">—</span>
                                  )}
                                </td>

                                {/* 11. Order Date */}
                                <td className="p-3 whitespace-nowrap text-stone-600">
                                  <span className="block font-medium">
                                    {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                  <span className="text-[10px] text-stone-400">
                                    {new Date(ord.createdAt).toLocaleTimeString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </td>

                                {/* 12. Action (View / Manage) */}
                                <td className="p-3 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => {
                                      setSelectedOrderDetails(ord);
                                      setOrderTrackingInput({
                                        status: ord.orderStatus,
                                        courierPartner: ord.courierPartner || ord.courier || '',
                                        trackingUrl: ord.trackingUrl || '',
                                        cancellationReason: ord.cancelledBy?.toLowerCase() === 'admin' ? ord.cancellationReason || '' : '',
                                        courier: ord.courier || ord.courierPartner || '',
                                        trackingNumber: ord.trackingNumber || '',
                                      });
                                      setOrderUpdateError(null);
                                      setOrderUpdateSuccess(null);
                                    }}
                                    className="bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                                  >
                                    View / Manage
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 5: BANNERS & SLIDERS */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    Banners &amp; Slider Visuals
                  </h2>
                  <p className="text-xs text-stone-500">
                    Update Hero slides, festive promotional strips, and countdown offers.
                  </p>
                </div>
                <button
                  id="btn-admin-add-banner"
                  onClick={() => {
                    setEditingBanner({
                      title: 'New Collection Header',
                      subtitle: 'HAUTE COUTURE',
                      description: 'Exquisite bridal silks handwoven for grand celebrations.',
                      desktopImage:
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85',
                      buttonText: 'Explore Collection',
                      buttonUrl: '/shop',
                      position: 'hero',
                      sortOrder: banners.length + 1,
                      isActive: true,
                    });
                    setBannerModalOpen(true);
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Add Banner</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map((ban) => (
                  <div
                    key={ban.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-stone-900">
                      {ban.desktopImage && ban.desktopImage.trim() !== '' ? (
                        <img
                          src={ban.desktopImage.trim()}
                          alt={ban.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-900 flex items-center justify-center text-amber-200 text-xs font-bold">
                          {ban.title}
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-stone-950 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        Position: {ban.position}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-amber-800 uppercase block">
                          {ban.subtitle}
                        </span>
                        <h3 className="font-serif text-base font-bold text-stone-900">{ban.title}</h3>
                        <p className="text-xs text-stone-600 mt-1 line-clamp-2">{ban.description}</p>
                        <p className="text-xs text-stone-400 mt-2">
                          CTA: "{ban.buttonText}" &rarr; {ban.buttonUrl}
                        </p>
                      </div>

                      <div className="pt-3 mt-4 border-t border-stone-100 flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            ban.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {ban.isActive ? 'Active on Store' : 'Inactive'}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingBanner(ban);
                              setBannerModalOpen(true);
                            }}
                            className="p-1 text-stone-600 hover:text-stone-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete banner "${ban.title}"?`)) {
                                deleteBanner(ban.id);
                              }
                            }}
                            className="p-1 text-stone-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: COMMUNITY & STYLING GALLERY (#FashineryWomen) */}
          {activeTab === 'community-gallery' && <AdminCommunityGalleryTab />}

          {/* TAB 6: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    Vouchers &amp; Promo Coupons
                  </h2>
                  <p className="text-xs text-stone-500">
                    Create instant cart discounts, percentage promotions, and minimum order rules.
                  </p>
                </div>
                <button
                  id="btn-admin-add-coupon"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    const future = new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0];
                    setEditingCoupon({
                      code: '',
                      description: '',
                      discountType: 'percentage',
                      discountValue: 10,
                      minOrderValue: 1999,
                      maxDiscount: 1000,
                      usageLimit: 500,
                      perCustomerLimit: 1,
                      isActive: true,
                      startDate: today,
                      validUntil: future,
                    });
                    setCouponModalOpen(true);
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Create Coupon</span>
                </button>
              </div>

              {coupons.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-stone-300 text-center space-y-2">
                  <p className="text-sm font-medium text-stone-700">No promotional coupons created yet.</p>
                  <p className="text-xs text-stone-500">Create your first coupon to offer discounts in the customer shopping bag.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coupons.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-base font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => saveCoupon({ ...c, isActive: !c.isActive })}
                            title="Click to toggle active status"
                            className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              c.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                            }`}
                          >
                            {c.isActive ? '● Active' : '○ Inactive'}
                          </button>
                        </div>

                        {c.description && (
                          <p className="text-xs text-stone-600 mt-2 line-clamp-2 italic">
                            "{c.description}"
                          </p>
                        )}

                        <div className="mt-3 space-y-1 text-xs text-stone-600">
                          <p>
                            Discount:{' '}
                            <strong className="text-stone-900 font-semibold">
                              {c.discountType === 'percentage'
                                ? `${c.discountValue}% OFF`
                                : `₹${c.discountValue} OFF`}
                            </strong>
                          </p>
                          <p>
                            Min Order:{' '}
                            <strong className="text-stone-900">
                              ₹{c.minOrderValue.toLocaleString('en-IN')}
                            </strong>
                          </p>
                          {c.maxDiscount ? (
                            <p>
                              Max Cap: <strong className="text-stone-900">₹{c.maxDiscount.toLocaleString('en-IN')}</strong>
                            </p>
                          ) : null}
                          <p className="text-stone-500 text-[11px]">
                            Usage: <span className="font-medium text-stone-800">{c.usedCount || 0}</span>
                            {c.usageLimit ? ` / ${c.usageLimit} total` : ' (unlimited)'}
                            {c.perCustomerLimit ? ` • Max ${c.perCustomerLimit}x/user` : ''}
                          </p>
                          <p className="text-stone-400 text-[11px]">
                            Valid: {c.startDate ? `${c.startDate} to ` : ''}{c.validUntil || 'Ongoing'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 mt-4 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[11px] text-stone-400">
                          {c.isActive ? 'Visible in Cart' : 'Hidden from Cart'}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingCoupon(c);
                              setCouponModalOpen(true);
                            }}
                            className="text-stone-600 hover:text-stone-900 p-1.5 rounded-md hover:bg-stone-100 cursor-pointer"
                            title="Edit Coupon"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete coupon "${c.code}"? This will permanently remove it from Firestore.`)) {
                                deleteCoupon(c.id);
                              }
                            }}
                            className="text-stone-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: POLICIES CMS */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    Policy &amp; Legal CMS
                  </h2>
                  <p className="text-xs text-stone-500">
                    Manage all 8 customer-facing policies, legal disclosures, and SEO metadata.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('policy');
                    window.location.hash = `#/policy/${selectedPolicySlug}`;
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-900 hover:text-amber-800 font-semibold bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 self-start"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview on Storefront</span>
                </button>
              </div>

              {/* Policy selector pills */}
              <div className="flex flex-wrap gap-2">
                {policies.map((p) => {
                  const isSelected = selectedPolicySlug === p.slug;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPolicySlug(p.slug);
                        setPolicySaved(false);
                      }}
                      className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950 text-amber-200 font-bold shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>{p.title}</span>
                      {p.status === 'draft' && (
                        <span className="text-[10px] bg-amber-800 text-amber-100 px-1.5 py-0.5 rounded-sm">
                          Draft
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Policy Editor Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
                {policySaved && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Policy changes published and synchronized with Firestore!</span>
                  </div>
                )}

                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Editing: {currentEditingPolicy.title} ({currentEditingPolicy.slug})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPolicyPreviewMode(!policyPreviewMode)}
                      className="text-xs text-stone-600 hover:text-stone-900 font-medium px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
                    >
                      {policyPreviewMode ? 'Edit Mode' : 'Preview Rendered'}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSavePolicy} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                        Policy Heading Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={localPolicyTitle}
                        onChange={(e) => setLocalPolicyTitle(e.target.value)}
                        className="w-full bg-stone-50 text-xs p-3 rounded-xl border border-stone-300 focus:outline-hidden focus:bg-white focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                        Publication Status
                      </label>
                      <select
                        value={localPolicyStatus}
                        onChange={(e: any) => setLocalPolicyStatus(e.target.value)}
                        className="w-full bg-stone-50 text-xs p-3 rounded-xl border border-stone-300 focus:outline-hidden focus:bg-white focus:border-stone-900"
                      >
                        <option value="published">Published (Live)</option>
                        <option value="draft">Draft (Review Only)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                      Subtitle / Brief Summary
                    </label>
                    <input
                      type="text"
                      value={localPolicySubtitle}
                      onChange={(e) => setLocalPolicySubtitle(e.target.value)}
                      placeholder="e.g. Transparent turnaround times and insured door-to-door transit terms across India"
                      className="w-full bg-stone-50 text-xs p-3 rounded-xl border border-stone-300 focus:outline-hidden focus:bg-white focus:border-stone-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                        SEO Meta Title
                      </label>
                      <input
                        type="text"
                        value={localPolicySeoTitle}
                        onChange={(e) => setLocalPolicySeoTitle(e.target.value)}
                        placeholder="Page title for search engines"
                        className="w-full bg-stone-50 text-xs p-3 rounded-xl border border-stone-300 focus:outline-hidden focus:bg-white focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                        SEO Meta Description
                      </label>
                      <input
                        type="text"
                        value={localPolicySeoDesc}
                        onChange={(e) => setLocalPolicySeoDesc(e.target.value)}
                        placeholder="Short meta description for search snippets"
                        className="w-full bg-stone-50 text-xs p-3 rounded-xl border border-stone-300 focus:outline-hidden focus:bg-white focus:border-stone-900"
                      />
                    </div>
                  </div>

                  {policyPreviewMode ? (
                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-stone-800 text-xs leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap font-sans">
                      {localPolicyContent}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold uppercase text-stone-700">
                          Policy Body Text (Markdown Format) *
                        </label>
                        <span className="text-[11px] text-stone-400">
                          Supports headers (#), bullet points (-), bold (**text**)
                        </span>
                      </div>
                      <textarea
                        rows={16}
                        required
                        value={localPolicyContent}
                        onChange={(e) => setLocalPolicyContent(e.target.value)}
                        className="w-full bg-stone-50 text-xs p-3.5 rounded-xl border border-stone-300 focus:outline-hidden focus:bg-white focus:border-stone-900 font-mono leading-relaxed"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-stone-400">
                      Last Updated: {new Date(currentEditingPolicy.updatedAt).toLocaleString('en-IN')}
                    </span>
                    <button
                      type="submit"
                      className="bg-stone-950 hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save &amp; Publish Policy</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 8: FAQS CMS */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    FAQ Knowledgebase CMS
                  </h2>
                  <p className="text-xs text-stone-500">
                    Create, edit, sort, and organize customer questions and helpful answers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingFaq({
                      category: 'Orders',
                      question: '',
                      answer: '',
                      sortOrder: faqs.length + 1,
                      isActive: true,
                    });
                    setFaqModalOpen(true);
                  }}
                  className="bg-stone-950 hover:bg-stone-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add FAQ Item</span>
                </button>
              </div>

              {/* Filter & Search Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="Search FAQ questions..."
                    className="w-full bg-stone-50 text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                  {['All', 'Orders', 'Payments', 'Shipping', 'Returns', 'Refunds', 'Exchanges', 'Products', 'Account', 'General'].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setFaqCategoryFilter(cat)}
                        className={`text-[11px] px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                          faqCategoryFilter === cat
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* FAQs List */}
              <div className="space-y-3">
                {faqs
                  .filter((f) => {
                    const matchesCat =
                      faqCategoryFilter === 'All' || f.category === faqCategoryFilter;
                    const matchesSearch =
                      !faqSearch ||
                      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
                      f.answer.toLowerCase().includes(faqSearch.toLowerCase());
                    return matchesCat && matchesSearch;
                  })
                  .map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                            {faq.category}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            Order: #{faq.sortOrder}
                          </span>
                          {!faq.isActive && (
                            <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded-md font-semibold">
                              Hidden
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-sm text-stone-900">
                          {faq.question}
                        </h4>
                        <p className="text-xs text-stone-600 leading-relaxed font-sans line-clamp-2">
                          {faq.answer}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingFaq(faq);
                            setFaqModalOpen(true);
                          }}
                          className="p-2 text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit FAQ"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete question "${faq.question}"?`)) {
                              await deleteFaq(faq.id);
                            }
                          }}
                          className="p-2 text-stone-400 hover:text-rose-600 bg-stone-50 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                {faqs.length === 0 && (
                  <div className="p-10 bg-white rounded-3xl border border-stone-200 text-center space-y-2">
                    <HelpCircle className="w-10 h-10 text-stone-300 mx-auto" />
                    <p className="font-serif font-bold text-stone-800">No FAQ entries found</p>
                    <p className="text-xs text-stone-500">
                      Add frequently asked questions to help shoppers with sizing, deliveries, and returns.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: CUSTOMER INQUIRIES */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    Customer Inquiries &amp; Messages
                  </h2>
                  <p className="text-xs text-stone-500">
                    Incoming messages, sizing inquiries, and return requests submitted through the contact page.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(['all', 'new', 'read', 'replied'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setContactFilter(filter)}
                      className={`text-xs px-3.5 py-1.5 rounded-xl font-medium uppercase tracking-wider cursor-pointer ${
                        contactFilter === filter
                          ? 'bg-stone-900 text-white font-semibold'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {contactMessages
                  .filter((m) => contactFilter === 'all' || m.status === contactFilter)
                  .map((msg) => {
                    const cleanPhone = (msg.phone || '').replace(/[^0-9]/g, '');
                    const waLink = cleanPhone
                      ? `https://wa.me/91${cleanPhone.replace(/^91/, '')}?text=${encodeURIComponent(
                          `Hello ${msg.name}, thank you for contacting Fashinery regarding: "${msg.subject}". How may our atelier stylist assist you today?`
                        )}`
                      : null;

                    return (
                      <div
                        key={msg.id}
                        className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-900 text-sm">{msg.name}</span>
                            <span className="text-stone-400 text-xs">•</span>
                            <a
                              href={`mailto:${msg.email}`}
                              className="text-xs text-stone-600 hover:text-stone-900 underline"
                            >
                              {msg.email}
                            </a>
                            {msg.phone && (
                              <>
                                <span className="text-stone-400 text-xs">•</span>
                                <span className="text-xs text-stone-600 font-mono">{msg.phone}</span>
                              </>
                            )}
                            {msg.orderId && (
                              <span className="text-[10px] font-mono bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-semibold">
                                Order: {msg.orderId}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                msg.status === 'new'
                                  ? 'bg-rose-100 text-rose-800'
                                  : msg.status === 'replied'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {msg.status}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-amber-900 block mb-1">
                            Topic: {msg.subject}
                          </span>
                          <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-100 whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-2">
                            {waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp Reply</span>
                              </a>
                            )}
                            <button
                              onClick={() =>
                                updateContactStatus(
                                  msg.id,
                                  msg.status === 'replied' ? 'read' : 'replied'
                                )
                              }
                              className="text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              {msg.status === 'replied' ? 'Mark as Read' : 'Mark as Replied'}
                            </button>
                          </div>

                          <button
                            onClick={async () => {
                              if (window.confirm(`Delete inquiry from ${msg.name}?`)) {
                                await deleteContact(msg.id);
                              }
                            }}
                            className="text-stone-400 hover:text-rose-600 p-1.5 cursor-pointer"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {contactMessages.length === 0 && (
                  <div className="p-10 bg-white rounded-3xl border border-stone-200 text-center space-y-2">
                    <MessageSquare className="w-10 h-10 text-stone-300 mx-auto" />
                    <p className="font-serif font-bold text-stone-800">No customer inquiries yet</p>
                    <p className="text-xs text-stone-500">
                      Messages submitted through the Contact Us form will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 10: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Storewide Configurations &amp; Contact Info
                </h2>
                <p className="text-xs text-stone-500">
                  Control store identity, phone numbers, delivery charges, and announcement strip.
                </p>
              </div>

              {settingsSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium">
                  Settings successfully saved and published!
                </div>
              )}

              <form
                onSubmit={handleSaveSettings}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6"
              >
                {/* Brand Logo Upload & Management */}
                <div className="p-5 bg-amber-50/40 border border-amber-200/80 rounded-2xl space-y-4">
                  <AdminImageUploadField
                    label="Official Brand Logo"
                    currentImageUrl={settingsForm.logoUrl}
                    folder="brand"
                    onUpload={(url) => {
                      const updated = { ...settingsForm, logoUrl: url };
                      setSettingsForm(updated);
                      saveSiteSettings(updated);
                      setSettingsSaved(true);
                      setTimeout(() => setSettingsSaved(false), 3000);
                    }}
                    onRemove={() => {
                      const updated = { ...settingsForm, logoUrl: '' };
                      setSettingsForm(updated);
                      saveSiteSettings(updated);
                    }}
                    helperText="Upload your exact logo file. Automatically updates all navigation bars site-wide."
                    aspectRatio="aspect-[3/1] max-w-[300px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                      Brand / Store Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.businessName}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, businessName: e.target.value })
                      }
                      className="w-full bg-stone-50 text-xs p-3 rounded-lg border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                      Brand Slogan / Tagline
                    </label>
                    <input
                      type="text"
                      value={settingsForm.tagline || ''}
                      placeholder="Elegance in Every Look"
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, tagline: e.target.value })
                      }
                      className="w-full bg-stone-50 text-xs p-3 rounded-lg border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                      Primary Contact Phone
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, phone: e.target.value })
                      }
                      className="w-full bg-stone-50 text-xs p-3 rounded-lg border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                      WhatsApp Number (With Country Code)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, whatsapp: e.target.value })
                      }
                      className="w-full bg-stone-50 text-xs p-3 rounded-lg border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, email: e.target.value })
                      }
                      className="w-full bg-stone-50 text-xs p-3 rounded-lg border border-stone-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Registered Administrative Address
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.address}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, address: e.target.value })
                    }
                    className="w-full bg-stone-50 text-xs p-3 rounded-lg border border-stone-300"
                  />
                </div>

                {/* Announcement Bar Settings */}
                <div className="pt-4 border-t border-stone-100 space-y-3">
                  <h4 className="font-serif text-sm font-bold text-stone-900">
                    Header Announcement Banner
                  </h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="announcementActive"
                      checked={settingsForm.announcementActive}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          announcementActive: e.target.checked,
                        })
                      }
                      className="accent-stone-900"
                    />
                    <label htmlFor="announcementActive" className="text-xs font-medium text-stone-700">
                      Enable Announcement Bar at top of storefront
                    </label>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={settingsForm.announcementText}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          announcementText: e.target.value,
                        })
                      }
                      className="w-full bg-stone-50 text-xs p-3 rounded-lg border border-stone-300"
                      placeholder="e.g. Complimentary Pan-India shipping on orders above ₹1,999"
                    />
                  </div>
                </div>

                {/* Shipping & COD Rules */}
                <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                      Free Shipping Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.freeShippingThreshold}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          freeShippingThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full bg-stone-50 text-xs p-3 rounded-lg border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                      Standard Shipping Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.shippingCharge}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          shippingCharge: Number(e.target.value),
                        })
                      }
                      className="w-full bg-stone-50 text-xs p-3 rounded-lg border border-stone-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold px-6 py-3 rounded-lg flex items-center gap-2 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Global Store Settings</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'admin-users' && <AdminUsersTab />}
        </main>
      </div>

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setProductModalOpen(false)}
          />
          <div className="relative w-full max-w-4xl bg-white rounded-3xl p-5 sm:p-8 z-10 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingProduct.id ? 'Edit Garment' : 'Add New Couture Piece'}
              </h3>
              <button onClick={() => setProductModalOpen(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                    placeholder="e.g. Royal Maroon Velvet Bridal Lehenga"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.id === e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        categoryId: e.target.value,
                        categoryName: cat?.name || '',
                      });
                    }}
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.sellingPrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        sellingPrice: Number(e.target.value),
                      })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.mrp || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Fabric &amp; Weave *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.fabric || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, fabric: e.target.value })}
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                    placeholder="e.g. Pure Katan Silk &amp; Antique Zari"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Stock Units Available *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              {/* Product Images Management with Direct Firebase Storage Upload */}
              <div className="pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                  <AdminImageUploadField
                    label="Primary Product Image *"
                    currentImageUrl={editingProduct.images?.[0]}
                    currentStoragePath={editingProduct.galleryImages?.[0]?.storagePath}
                    folder={`products/${editingProduct.id || 'new'}/primary`}
                    onUpload={(url, path) => {
                      const imgs = [...(editingProduct.images || [])];
                      const gall = [...(editingProduct.galleryImages || [])];
                      imgs[0] = url;
                      gall[0] = { id: gall[0]?.id || 'primary', url, storagePath: path, isPrimary: true, sortOrder: 0 };
                      setEditingProduct({ ...editingProduct, images: imgs, galleryImages: gall });
                    }}
                    onRemove={() => {
                      const imgs = [...(editingProduct.images || [])];
                      const gall = [...(editingProduct.galleryImages || [])];
                      imgs[0] = '';
                      if (gall[0]) gall[0] = { ...gall[0], url: '', storagePath: '' };
                      setEditingProduct({ ...editingProduct, images: imgs, galleryImages: gall });
                    }}
                    helperText="Main image shown in catalog and product page."
                    aspectRatio="aspect-[3/4]"
                  />

                  <AdminImageUploadField
                    label="Secondary / Hover Image"
                    currentImageUrl={editingProduct.images?.[1]}
                    currentStoragePath={editingProduct.galleryImages?.[1]?.storagePath}
                    folder={`products/${editingProduct.id || 'new'}/secondary`}
                    onUpload={(url, path) => {
                      const imgs = [...(editingProduct.images || [])];
                      const gall = [...(editingProduct.galleryImages || [])];
                      if (!imgs[0]) imgs[0] = ''; // Ensure index 0 exists
                      imgs[1] = url;
                      if (!gall[0]) gall[0] = { id: 'primary', url: '', storagePath: '', isPrimary: true, sortOrder: 0 };
                      gall[1] = { id: gall[1]?.id || 'secondary', url, storagePath: path, isPrimary: false, sortOrder: 1 };
                      setEditingProduct({ ...editingProduct, images: imgs, galleryImages: gall });
                    }}
                    onRemove={() => {
                      const imgs = [...(editingProduct.images || [])];
                      const gall = [...(editingProduct.galleryImages || [])];
                      if (imgs[1]) imgs[1] = '';
                      if (gall[1]) gall[1] = { ...gall[1], url: '', storagePath: '' };
                      setEditingProduct({ ...editingProduct, images: imgs, galleryImages: gall });
                    }}
                    helperText="Image shown when hovering over product card."
                    aspectRatio="aspect-[3/4]"
                  />
                </div>

                {/* Additional Gallery Images */}
                <AdminProductImagesManager
                  productId={editingProduct.id || `prod_${Date.now()}`}
                  images={(editingProduct.images || []).slice(2)}
                  galleryImages={(editingProduct.galleryImages || []).slice(2)}
                  onChange={(imgs, galleryImgs) => {
                    const baseImgs = (editingProduct.images || []).slice(0, 2);
                    while (baseImgs.length < 2) baseImgs.push('');
                    
                    const baseGall = (editingProduct.galleryImages || []).slice(0, 2);
                    while (baseGall.length < 2) {
                      const idx = baseGall.length;
                      baseGall.push({ 
                        id: idx === 0 ? 'primary' : 'secondary', 
                        url: '', 
                        storagePath: '', 
                        isPrimary: idx === 0, 
                        sortOrder: idx 
                      });
                    }

                    setEditingProduct({
                      ...editingProduct,
                      images: [...baseImgs, ...imgs],
                      galleryImages: [...baseGall, ...galleryImgs],
                    });
                  }}
                  label="Additional Gallery Images"
                  helperText="Upload more images for the product carousel."
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, shortDescription: e.target.value })
                  }
                  className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={4}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured ?? true}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, featured: e.target.checked })
                    }
                  />
                  <span>Featured Edit</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.bestseller ?? false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, bestseller: e.target.checked })
                    }
                  />
                  <span>Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.newArrival ?? true}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, newArrival: e.target.checked })
                    }
                  />
                  <span>New Arrival</span>
                </label>
              </div>

              {/* Dynamic Unlimited Colors, Sizes & Variants Management */}
              <AdminProductOptionsEditor
                productId={editingProduct.id || 'temp_product'}
                colorOptions={localColorOptions}
                setColorOptions={setLocalColorOptions}
                sizeOptions={localSizeOptions}
                setSizeOptions={setLocalSizeOptions}
                variants={localVariants}
                setVariants={setLocalVariants}
                baseSku={editingProduct.sku || 'FSH'}
                baseSellingPrice={editingProduct.sellingPrice || 0}
                baseMrp={editingProduct.mrp || 0}
                baseImages={editingProduct.images || []}
              />

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-stone-900 text-white uppercase px-6 py-2.5 rounded-lg font-semibold"
                >
                  Save Garment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT CATEGORY */}
      {categoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setCategoryModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingCategory.id ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setCategoryModalOpen(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  placeholder="e.g. Sarees, Lehengas"
                />
              </div>

              <div>
                <AdminImageUploadField
                  label="Category Cover Image *"
                  currentImageUrl={editingCategory.image}
                  currentStoragePath={editingCategory.imageStoragePath}
                  folder="categories"
                  onUpload={(url, path) => setEditingCategory({ ...editingCategory, image: url, imageStoragePath: path })}
                  onRemove={() => setEditingCategory({ ...editingCategory, image: '', imageStoragePath: '' })}
                  helperText="Recommended: Square (1:1) or Portrait (3:4) image for best display on shop page."
                  aspectRatio="aspect-square"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={editingCategory.description || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                  className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Sort Order Number
                </label>
                <input
                  type="number"
                  value={editingCategory.sortOrder || 1}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      sortOrder: Number(e.target.value),
                    })
                  }
                  className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-stone-900 text-white uppercase px-6 py-2.5 rounded-lg font-semibold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT BANNER */}
      {bannerModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setBannerModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingBanner.id ? 'Edit Banner' : 'Create Banner'}
              </h3>
              <button onClick={() => setBannerModalOpen(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveBannerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Banner Heading *
                </label>
                <input
                  type="text"
                  required
                  value={editingBanner.title || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Eyebrow Subtitle
                </label>
                <input
                  type="text"
                  value={editingBanner.subtitle || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <AdminImageUploadField
                  label="Desktop Banner Image *"
                  currentImageUrl={editingBanner.desktopImage}
                  currentStoragePath={editingBanner.desktopImageStoragePath}
                  folder="banners/desktop"
                  onUpload={(url, path) => setEditingBanner({ ...editingBanner, desktopImage: url, desktopImageStoragePath: path })}
                  onRemove={() => setEditingBanner({ ...editingBanner, desktopImage: '', desktopImageStoragePath: '' })}
                  helperText="Recommended: Wide aspect ratio (21:9 or 16:9) for desktop displays."
                  aspectRatio="aspect-video"
                />
              </div>

              <div>
                <AdminImageUploadField
                  label="Mobile Banner Image (Optional)"
                  currentImageUrl={editingBanner.mobileImage}
                  currentStoragePath={editingBanner.mobileImageStoragePath}
                  folder="banners/mobile"
                  onUpload={(url, path) => setEditingBanner({ ...editingBanner, mobileImage: url, mobileImageStoragePath: path })}
                  onRemove={() => setEditingBanner({ ...editingBanner, mobileImage: '', mobileImageStoragePath: '' })}
                  helperText="If empty, the desktop image will be used on mobile devices. Recommended: Portrait aspect (9:16)."
                  aspectRatio="aspect-[9/16] w-32 mx-auto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Position
                  </label>
                  <select
                    value={editingBanner.position || 'hero'}
                    onChange={(e: any) =>
                      setEditingBanner({ ...editingBanner, position: e.target.value })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  >
                    <option value="hero">Hero Slider</option>
                    <option value="promo">Promotional Banner</option>
                    <option value="offer">Special Offer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={editingBanner.discountBadge || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, discountBadge: e.target.value })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                    placeholder="e.g. 20% OFF or CODE: FESTIVE"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={editingBanner.buttonText || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, buttonText: e.target.value })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Button URL
                  </label>
                  <input
                    type="text"
                    value={editingBanner.buttonUrl || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, buttonUrl: e.target.value })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="px-4 py-2 text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-stone-900 text-white uppercase px-6 py-2.5 rounded-lg font-semibold"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD / EDIT COUPON */}
      {couponModalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setCouponModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingCoupon.id ? 'Edit Coupon' : 'Create Coupon'}
              </h3>
              <button onClick={() => setCouponModalOpen(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveCouponSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code || ''}
                  onChange={(e) =>
                    setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })
                  }
                  className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300 font-mono"
                  placeholder="e.g. WELCOME10"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={editingCoupon.description || ''}
                  onChange={(e) =>
                    setEditingCoupon({ ...editingCoupon, description: e.target.value })
                  }
                  className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  placeholder="e.g. 15% instant discount on bridal lehengas & festive wear"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={editingCoupon.discountType || 'percentage'}
                    onChange={(e: any) =>
                      setEditingCoupon({ ...editingCoupon, discountType: e.target.value })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat / Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingCoupon.discountValue ?? ''}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        discountValue: Number(e.target.value),
                      })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                    placeholder="e.g. 15 or 500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingCoupon.minOrderValue ?? ''}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        minOrderValue: Number(e.target.value),
                      })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                    placeholder="e.g. 1999"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingCoupon.maxDiscount ?? ''}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        maxDiscount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                    placeholder="e.g. 1500 (optional)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editingCoupon.startDate || ''}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, startDate: e.target.value })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Expiry Date (Valid Until) *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingCoupon.validUntil || ''}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, validUntil: e.target.value })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    value={editingCoupon.usageLimit ?? ''}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        usageLimit: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Per Customer Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 1 (optional)"
                    value={editingCoupon.perCustomerLimit ?? ''}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        perCustomerLimit: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-stone-50 p-2.5 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCoupon.isActive !== false}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-stone-900 border-stone-300 focus:ring-stone-900"
                  />
                  <span className="font-semibold text-stone-800 text-xs">
                    Coupon is currently Active (visible to customers & redeemable in Shopping Bag)
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-stone-900 text-white uppercase px-6 py-2.5 rounded-lg font-semibold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ORDER MANAGEMENT & FULFILLMENT */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedOrderDetails(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 z-10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Manage Order #{selectedOrderDetails.orderNumber}
                </h3>
                <span className="text-xs text-stone-400">
                  Customer: {selectedOrderDetails.customerName} ({selectedOrderDetails.customerPhone})
                </span>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* If Order Cancelled */}
            {selectedOrderDetails.orderStatus === 'Cancelled' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5 text-xs text-rose-950">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                    <Ban className="w-4 h-4 text-rose-700" />
                    <span>Cancelled by {selectedOrderDetails.cancelledBy || 'Customer'}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-950 uppercase tracking-wider">
                    Cancelled
                  </span>
                </div>

                <div className="pt-2 border-t border-rose-200/70 space-y-1.5">
                  <p>
                    <strong>Cancellation Reason:</strong>{' '}
                    <span className="font-semibold text-rose-900">
                      {selectedOrderDetails.cancelledBy?.toLowerCase() === 'admin'
                        ? selectedOrderDetails.cancellationReason || 'Order could not be fulfilled'
                        : selectedOrderDetails.customerCancellationReason || selectedOrderDetails.cancellationReason || 'Requested by customer'}
                    </span>
                  </p>
                  {selectedOrderDetails.cancelledBy?.toLowerCase() !== 'admin' && selectedOrderDetails.cancellationDetails && (
                    <p className="text-stone-700 italic">
                      <strong>Customer Remarks / Custom Reason:</strong> "{selectedOrderDetails.cancellationDetails}"
                    </p>
                  )}
                  {selectedOrderDetails.cancelledAt && (
                    <p className="text-stone-500 text-[11px]">
                      <strong>Cancelled Timestamp:</strong>{' '}
                      {new Date(selectedOrderDetails.cancelledAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  <div className="pt-1 text-[11px] text-stone-600 flex items-center justify-between border-t border-rose-100">
                    <span>
                      Payment: <strong>{selectedOrderDetails.paymentMethod}</strong> ({selectedOrderDetails.paymentStatus})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* If Return Requested */}
            {(selectedOrderDetails.orderStatus === 'Return Requested' || selectedOrderDetails.returnReason) && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2.5 text-xs text-stone-900">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <RotateCcw className="w-4 h-4 text-amber-700" />
                    <span>Customer Return Request</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-950 uppercase tracking-wider">
                    {selectedOrderDetails.orderStatus}
                  </span>
                </div>

                <div className="pt-2 border-t border-amber-200/70 space-y-1.5">
                  <p>
                    <strong>Primary Reason:</strong>{' '}
                    <span className="font-semibold text-stone-900">
                      {selectedOrderDetails.returnReason || 'Not specified'}
                    </span>
                  </p>
                  {selectedOrderDetails.returnNotes && (
                    <p className="text-stone-700 italic">
                      <strong>Additional Details:</strong> "{selectedOrderDetails.returnNotes}"
                    </p>
                  )}
                  {selectedOrderDetails.returnRequestedAt && (
                    <p className="text-stone-500 text-[11px]">
                      <strong>Requested Timestamp:</strong>{' '}
                      {new Date(selectedOrderDetails.returnRequestedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment & Gateway Verification Panel */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <strong className="text-stone-900 font-semibold flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-700" />
                  <span>Payment &amp; Transaction Details</span>
                </strong>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedOrderDetails.paymentStatus === 'Paid'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : selectedOrderDetails.paymentStatus === 'Failed'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {selectedOrderDetails.paymentStatus === 'Paid' ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : selectedOrderDetails.paymentStatus === 'Failed' ? (
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  <span>Status: {selectedOrderDetails.paymentStatus}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-200/70">
                <div>
                  <span className="text-stone-500 block text-[11px]">Payment Method:</span>
                  <span className="font-semibold text-stone-900">
                    {selectedOrderDetails.paymentMethod}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Order Total:</span>
                  <span className="font-bold text-stone-950 font-mono text-sm">
                    ₹{selectedOrderDetails.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Razorpay specific fields */}
              {(selectedOrderDetails.razorpayPaymentId ||
                selectedOrderDetails.razorpayOrderId ||
                selectedOrderDetails.paymentMethod === 'Razorpay / Online' ||
                selectedOrderDetails.paymentMethod === 'UPI / Online Payment') && (
                <div className="pt-2 border-t border-stone-200/70 space-y-2 bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 block">
                    Razorpay Gateway Authentication Record
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-stone-500 block">Razorpay Payment ID:</span>
                      <span className="font-mono font-bold text-indigo-900 select-all">
                        {selectedOrderDetails.razorpayPaymentId || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Razorpay Order ID:</span>
                      <span className="font-mono text-stone-800 select-all">
                        {selectedOrderDetails.razorpayOrderId || '—'}
                      </span>
                    </div>
                    {selectedOrderDetails.paidAt && (
                      <div>
                        <span className="text-stone-500 block">Payment Verified At:</span>
                        <span className="text-stone-700">
                          {new Date(selectedOrderDetails.paidAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                    {selectedOrderDetails.razorpaySignature && (
                      <div>
                        <span className="text-stone-500 block">HMAC Signature:</span>
                        <span className="font-mono text-[10px] text-stone-500 truncate block select-all" title={selectedOrderDetails.razorpaySignature}>
                          {selectedOrderDetails.razorpaySignature.slice(0, 16)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Destination */}
            <div className="p-3.5 bg-stone-50 rounded-xl text-xs space-y-1">
              <strong className="block text-stone-900 font-semibold">Shipping Address:</strong>
              <p>
                {selectedOrderDetails.shippingAddress.addressLine1},{' '}
                {selectedOrderDetails.shippingAddress.addressLine2}
              </p>
              <p>
                {selectedOrderDetails.shippingAddress.city},{' '}
                {selectedOrderDetails.shippingAddress.state} -{' '}
                {selectedOrderDetails.shippingAddress.pincode}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <strong className="block text-stone-900 font-semibold">Order Items:</strong>
              {selectedOrderDetails.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {it.productImage && it.productImage.trim() !== '' ? (
                      <img
                        src={it.productImage.trim()}
                        alt={it.productName}
                        className="w-8 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-8 h-10 rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-600">
                        {it.productName?.slice(0, 2).toUpperCase() || 'ITEM'}
                      </div>
                    )}
                    <span>
                      {it.productName} ({it.size}, {it.color}) x{it.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">
                    ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* UPDATE ORDER STATUS & DISPATCH DETAILS */}
            <div
              className={`p-4 rounded-2xl space-y-3.5 text-xs border transition-all ${
                orderTrackingInput.status === 'Cancelled'
                  ? 'bg-rose-50/70 border-rose-200/80'
                  : 'bg-amber-50/50 border-amber-200/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <strong
                  className={`font-semibold uppercase tracking-wider text-[11px] block ${
                    orderTrackingInput.status === 'Cancelled' ? 'text-rose-950' : 'text-stone-900'
                  }`}
                >
                  UPDATE ORDER STATUS &amp; DISPATCH DETAILS
                </strong>
                {orderTrackingInput.status === 'Cancelled' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 uppercase tracking-wider">
                    Cancellation Mode
                  </span>
                )}
              </div>

              {orderUpdateError && (
                <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span className="font-medium">{orderUpdateError}</span>
                </div>
              )}

              {orderUpdateSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{orderUpdateSuccess}</span>
                </div>
              )}

              {orderTrackingInput.status !== 'Cancelled' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-stone-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                        STATUS
                      </label>
                      <select
                        id="admin-order-status-select"
                        value={orderTrackingInput.status}
                        onChange={(e: any) => {
                          setOrderTrackingInput({ ...orderTrackingInput, status: e.target.value });
                          setOrderUpdateError(null);
                        }}
                        className="w-full bg-white p-2.5 rounded-xl border border-stone-300 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-700"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Return Requested">Return Requested</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                        COURIER PARTNER
                      </label>
                      <input
                        id="admin-order-courier-input"
                        type="text"
                        value={orderTrackingInput.courierPartner}
                        onChange={(e) => {
                          setOrderTrackingInput({
                            ...orderTrackingInput,
                            courierPartner: e.target.value,
                            courier: e.target.value,
                          });
                          setOrderUpdateError(null);
                        }}
                        placeholder="e.g. BlueDart Express"
                        className="w-full bg-white p-2.5 rounded-xl border border-stone-300 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                      TRACKING LINK
                    </label>
                    <input
                      id="admin-order-tracking-url-input"
                      type="url"
                      value={orderTrackingInput.trackingUrl}
                      onChange={(e) => {
                        setOrderTrackingInput({
                          ...orderTrackingInput,
                          trackingUrl: e.target.value,
                        });
                        setOrderUpdateError(null);
                      }}
                      placeholder="Paste courier tracking URL, e.g. https://www.bluedart.com/tracking/..."
                      className="w-full bg-white p-2.5 rounded-xl border border-stone-300 text-stone-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-700"
                    />
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                      Paste the courier shipment tracking page URL. Customers will see a Track My Order button instead of the URL.
                    </p>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      id="btn-save-dispatch-updates"
                      type="button"
                      disabled={isUpdatingOrder}
                      onClick={async () => {
                        setOrderUpdateError(null);
                        setOrderUpdateSuccess(null);

                        const cleanUrl = orderTrackingInput.trackingUrl.trim();
                        if (cleanUrl && !isValidTrackingUrl(cleanUrl)) {
                          setOrderUpdateError('Please enter a valid tracking URL starting with http:// or https://');
                          return;
                        }

                        setIsUpdatingOrder(true);
                        try {
                          await updateOrderStatus(selectedOrderDetails.id, orderTrackingInput.status, {
                            trackingUrl: cleanUrl,
                            courierPartner: orderTrackingInput.courierPartner.trim(),
                            courier: orderTrackingInput.courierPartner.trim(),
                            trackingNumber: orderTrackingInput.trackingNumber,
                          });
                          setOrderUpdateSuccess('Order dispatch details updated successfully.');
                          setTimeout(() => {
                            setSelectedOrderDetails(null);
                            setOrderUpdateSuccess(null);
                          }, 1200);
                        } catch (err: any) {
                          setOrderUpdateError(err?.message || 'Failed to update order dispatch details.');
                        } finally {
                          setIsUpdatingOrder(false);
                        }
                      }}
                      className="bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs uppercase tracking-wider font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isUpdatingOrder ? 'Saving...' : 'SAVE DISPATCH UPDATES'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-stone-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                      STATUS
                    </label>
                    <select
                      id="admin-order-status-cancelled-select"
                      value={orderTrackingInput.status}
                      onChange={(e: any) => {
                        setOrderTrackingInput({ ...orderTrackingInput, status: e.target.value });
                        setOrderUpdateError(null);
                      }}
                      className="w-full bg-white p-2.5 rounded-xl border border-stone-300 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-700"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Return Requested">Return Requested</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                      CANCELLATION REASON <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      id="admin-order-cancellation-reason"
                      rows={3}
                      value={orderTrackingInput.cancellationReason}
                      onChange={(e) => {
                        setOrderTrackingInput({
                          ...orderTrackingInput,
                          cancellationReason: e.target.value,
                        });
                        setOrderUpdateError(null);
                      }}
                      placeholder="Enter cancellation reason (e.g. Product out of stock, Payment issue, Delivery service unavailable, Address could not be verified, etc.)"
                      className="w-full bg-white p-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-700 resize-none"
                    />
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                      Please enter a cancellation reason (5 to 500 characters). This will be shown to the customer.
                    </p>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      id="btn-save-order-update"
                      type="button"
                      disabled={isUpdatingOrder}
                      onClick={async () => {
                        setOrderUpdateError(null);
                        setOrderUpdateSuccess(null);

                        const cleanReason = orderTrackingInput.cancellationReason.trim();
                        if (!cleanReason) {
                          setOrderUpdateError('Please enter a cancellation reason.');
                          return;
                        }
                        if (cleanReason.length < 5) {
                          setOrderUpdateError('Cancellation reason must be at least 5 characters long.');
                          return;
                        }
                        if (cleanReason.length > 500) {
                          setOrderUpdateError('Cancellation reason cannot exceed 500 characters.');
                          return;
                        }

                        setIsUpdatingOrder(true);
                        try {
                          await updateOrderStatus(selectedOrderDetails.id, 'Cancelled', {
                            cancellationReason: cleanReason,
                            cancelledBy: 'admin',
                          });
                          setOrderUpdateSuccess('Order cancelled successfully.');
                          setTimeout(() => {
                            setSelectedOrderDetails(null);
                            setOrderUpdateSuccess(null);
                          }, 1200);
                        } catch (err: any) {
                          setOrderUpdateError(err?.message || 'Failed to cancel order.');
                        } finally {
                          setIsUpdatingOrder(false);
                        }
                      }}
                      className="bg-rose-900 hover:bg-rose-800 disabled:opacity-50 text-white text-xs uppercase tracking-wider font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isUpdatingOrder ? 'Saving...' : 'SAVE ORDER UPDATE'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD / EDIT FAQ ITEM */}
      {faqModalOpen && editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => {
              setFaqModalOpen(false);
              setEditingFaq(null);
            }}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 z-10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingFaq.id ? 'Edit FAQ Item' : 'Add New FAQ Question'}
              </h3>
              <button
                onClick={() => {
                  setFaqModalOpen(false);
                  setEditingFaq(null);
                }}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaqSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingFaq.category || 'Orders'}
                    onChange={(e: any) =>
                      setEditingFaq({ ...editingFaq, category: e.target.value })
                    }
                    className="w-full bg-stone-50 text-xs p-2.5 rounded-xl border border-stone-300"
                  >
                    {[
                      'Orders',
                      'Payments',
                      'Shipping',
                      'Returns',
                      'Refunds',
                      'Exchanges',
                      'Products',
                      'Account',
                      'General',
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingFaq.sortOrder ?? 1}
                    onChange={(e) =>
                      setEditingFaq({
                        ...editingFaq,
                        sortOrder: Number(e.target.value),
                      })
                    }
                    className="w-full bg-stone-50 text-xs p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={editingFaq.question || ''}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, question: e.target.value })
                  }
                  placeholder="e.g. How do I request an exchange for a different size?"
                  className="w-full bg-stone-50 text-xs p-2.5 rounded-xl border border-stone-300 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                  Answer *
                </label>
                <textarea
                  rows={5}
                  required
                  value={editingFaq.answer || ''}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, answer: e.target.value })
                  }
                  placeholder="Write clear, transparent steps for the shopper..."
                  className="w-full bg-stone-50 text-xs p-2.5 rounded-xl border border-stone-300 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="faq-is-active"
                  checked={editingFaq.isActive !== false}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, isActive: e.target.checked })
                  }
                  className="rounded text-amber-950 focus:ring-amber-900 h-4 w-4"
                />
                <label htmlFor="faq-is-active" className="text-xs text-stone-700 font-medium">
                  Active (Visible to customers on the FAQ page)
                </label>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFaqModalOpen(false);
                    setEditingFaq(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-stone-950 hover:bg-stone-800 text-white uppercase text-xs tracking-wider px-6 py-2.5 rounded-xl font-semibold cursor-pointer shadow-xs"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
