import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';

const MOBILE_CATEGORIES = [
  { name: 'Sarees', slug: 'sarees' },
  { name: 'Kurtis', slug: 'kurtis' },
  { name: 'Kurta Sets', slug: 'kurta-sets' },
  { name: 'Dresses', slug: 'dresses' },
  { name: 'Tops', slug: 'tops' },
  { name: 'Western Wear', slug: 'western-wear' },
  { name: 'Ethnic Wear', slug: 'ethnic-wear' },
  { name: 'Party Wear', slug: 'party-wear' },
  { name: 'Co-ords', slug: 'co-ords' },
];

export const Header: React.FC = () => {
  const {
    settings,
    categories,
    products,
    cart,
    wishlist,
    currentView,
    setCurrentView,
    setSelectedCategoryFilter,
    selectedCategoryFilter,
    setIsCartDrawerOpen,
    setIsWishlistDrawerOpen,
    setIsSearchOpen,
    user,
    loginWithGoogle,
    openPolicyPage,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCollectionsExpanded, setMobileCollectionsExpanded] = useState(true);
  const [mobilePoliciesExpanded, setMobilePoliciesExpanded] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contactMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter ONLY active categories that currently exist in database and sort them
  const activeCategories = useMemo(() => {
    return (categories || [])
      .filter((c) => c.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categories]);

  // Product counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (products || []).forEach((p) => {
      if (p.published !== false) {
        if (p.categoryId) counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
        if (p.categoryName) {
          const lower = p.categoryName.toLowerCase();
          counts[lower] = (counts[lower] || 0) + 1;
        }
      }
    });
    return counts;
  }, [products]);

  // Check if New Arrivals or Sale are available
  const hasNewArrivals = useMemo(() => {
    return (products || []).some((p) => p.newArrival && p.published !== false);
  }, [products]);

  const hasSale = useMemo(() => {
    return (products || []).some(
      (p) => (p.discountPercent ?? 0) > 0 && p.published !== false
    );
  }, [products]);

  // Blog is not implemented in the website, keep as false
  const hasBlog = false;

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Category product count calculation for mobile menu
  const getMobileCategoryCount = (slug: string) => {
    return (products || []).filter((p) => {
      if (p.published === false) return false;
      const s = slug.toLowerCase();
      if (s === 'sarees') {
        return (
          p.categoryId === 'cat-sarees' ||
          p.categoryName?.toLowerCase() === 'sarees' ||
          p.name?.toLowerCase().includes('saree') ||
          p.subCategory?.toLowerCase().includes('saree')
        );
      }
      if (s === 'kurtis') {
        return (
          p.categoryId === 'cat-kurtis' ||
          p.categoryName?.toLowerCase() === 'kurtis' ||
          p.name?.toLowerCase().includes('kurti') ||
          p.name?.toLowerCase().includes('anarkali') ||
          p.subCategory?.toLowerCase().includes('kurti')
        );
      }
      if (s === 'kurta-sets') {
        return (
          p.name?.toLowerCase().includes('kurta') ||
          p.name?.toLowerCase().includes('set') ||
          p.name?.toLowerCase().includes('suit') ||
          p.name?.toLowerCase().includes('anarkali') ||
          p.subCategory?.toLowerCase().includes('suit') ||
          p.subCategory?.toLowerCase().includes('set') ||
          p.categoryName?.toLowerCase().includes('kurta')
        );
      }
      if (s === 'dresses') {
        return (
          p.categoryId === 'cat-dresses' ||
          p.categoryName?.toLowerCase() === 'dresses' ||
          p.name?.toLowerCase().includes('dress') ||
          p.name?.toLowerCase().includes('gown') ||
          p.name?.toLowerCase().includes('maxi') ||
          p.subCategory?.toLowerCase().includes('dress') ||
          p.subCategory?.toLowerCase().includes('gown')
        );
      }
      if (s === 'tops') {
        return (
          p.categoryId === 'cat-tops' ||
          p.categoryName?.toLowerCase() === 'tops' ||
          p.name?.toLowerCase().includes('top') ||
          p.name?.toLowerCase().includes('blouse') ||
          p.name?.toLowerCase().includes('shirt') ||
          p.subCategory?.toLowerCase().includes('top')
        );
      }
      if (s === 'western-wear') {
        return (
          p.categoryName === 'Dresses' ||
          p.categoryName === 'Tops' ||
          p.name?.toLowerCase().includes('maxi') ||
          p.name?.toLowerCase().includes('dress') ||
          p.name?.toLowerCase().includes('gown') ||
          p.name?.toLowerCase().includes('peplum') ||
          p.name?.toLowerCase().includes('top') ||
          p.categoryName?.toLowerCase().includes('western')
        );
      }
      if (s === 'ethnic-wear') {
        return (
          p.categoryName === 'Sarees' ||
          p.categoryName === 'Lehengas' ||
          p.categoryName === 'Kurtis' ||
          p.categoryName === 'Bottom Wear' ||
          p.name?.toLowerCase().includes('saree') ||
          p.name?.toLowerCase().includes('lehenga') ||
          p.name?.toLowerCase().includes('sharara') ||
          p.name?.toLowerCase().includes('anarkali') ||
          p.categoryName?.toLowerCase().includes('ethnic')
        );
      }
      if (s === 'party-wear') {
        return Boolean(
          p.featured ||
          p.bestseller ||
          (p.sellingPrice && p.sellingPrice >= 4500) ||
          p.name?.toLowerCase().includes('zardozi') ||
          p.name?.toLowerCase().includes('silk') ||
          p.name?.toLowerCase().includes('gown') ||
          p.name?.toLowerCase().includes('bridal') ||
          p.name?.toLowerCase().includes('banarasi')
        );
      }
      if (s === 'co-ords') {
        return (
          p.name?.toLowerCase().includes('set') ||
          p.name?.toLowerCase().includes('suit') ||
          p.name?.toLowerCase().includes('co-ord') ||
          p.subCategory?.toLowerCase().includes('set') ||
          p.subCategory?.toLowerCase().includes('suit') ||
          p.name?.toLowerCase().includes('sharara')
        );
      }
      return false;
    }).length;
  };

  // Navigation click handler
  const handleNavClick = (
    view: 'home' | 'shop' | 'contact' | 'about' | 'faq' | 'track' | 'policy' | 'account',
    categorySlug?: string
  ) => {
    if (categorySlug) {
      setSelectedCategoryFilter(categorySlug);
      setCurrentView('shop');
    } else {
      setSelectedCategoryFilter(null);
      setCurrentView(view);
    }
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    setContactMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hover handlers for Mega Menu with slight debounce to prevent jitter
  const handleMegaMenuEnter = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    if (contactMenuTimeoutRef.current) clearTimeout(contactMenuTimeoutRef.current);
    setContactMenuOpen(false);
    setMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 180);
  };

  // Hover handlers for Contact Menu
  const handleContactMenuEnter = () => {
    if (contactMenuTimeoutRef.current) clearTimeout(contactMenuTimeoutRef.current);
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setMegaMenuOpen(false);
    setContactMenuOpen(true);
  };

  const handleContactMenuLeave = () => {
    contactMenuTimeoutRef.current = setTimeout(() => {
      setContactMenuOpen(false);
    }, 180);
  };

  // Close menus on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMegaMenuOpen(false);
        setContactMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-xs border-b border-stone-200/80">
      {/* Top Announcement Bar */}
      {settings.announcementActive && (
        <div id="announcement-bar" className="bg-stone-900 text-stone-200 text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center font-medium">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span
                id="announcement-text"
                onClick={() => handleNavClick('shop')}
                className="cursor-pointer hover:text-amber-200 transition-colors font-medium tracking-wide"
              >
                {settings.announcementText || '✦ ELEGANCE IN EVERY LOOK | ✦ FREE SHIPPING ON ALL ORDERS | ✦ EASY 7-DAY DOORSTEP RETURNS'}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-stone-300 text-xs">
              <a
                href="tel:9372085090"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3 h-3 text-amber-300" />
                <span>93720 85090</span>
              </a>
              <span className="text-stone-600">|</span>
              <a
                href="https://wa.me/919372085090?text=Hello%20Fashinery%2C%20I%20have%20an%20inquiry."
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-emerald-400 font-medium"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
              <span className="text-stone-600">|</span>
              <button
                id="btn-announcement-returns"
                onClick={() => handleNavClick('policy')}
                className="hover:text-amber-200 cursor-pointer underline underline-offset-2 transition-colors"
              >
                Policies &amp; Legal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Mobile Menu & Search Buttons */}
          <div className="flex items-center lg:hidden shrink-0">
            <button
              id="btn-mobile-menu"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 text-stone-700 hover:text-stone-900 focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            <button
              id="btn-mobile-search"
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 sm:p-2 text-stone-700 hover:text-stone-900"
              aria-label="Search Catalog"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-none flex justify-center lg:justify-start px-1 font-bold">
            <button
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="text-center group cursor-pointer focus:outline-hidden flex flex-col items-center justify-center py-1 w-auto max-w-none px-1 font-bold"
              aria-label="Fashinery - Elegance in Every Look"
            >
              <span className="block transition-transform duration-300 group-hover:scale-[1.03] w-full font-bold relative">
                <BrandLogo
                  size="lg"
                  showSlogan={false}
                  theme="light"
                  showSkeleton={true}
                  enableCrossFade={true}
                />
              </span>
              <span className="block text-[8.5px] xs:text-[9.5px] sm:text-[11px] md:text-[11.5px] tracking-[0.18em] xs:tracking-[0.22em] sm:tracking-[0.28em] text-stone-950 uppercase font-extrabold text-center font-sans transition-colors group-hover:text-rose-950 mt-0.5 whitespace-nowrap overflow-visible">
                {settings.tagline || 'Elegance in Every Look'}
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 h-full">
            {/* 1. Home */}
            <button
              id="nav-link-home"
              onClick={() => handleNavClick('home')}
              className={`text-xs font-medium tracking-[0.16em] uppercase transition-colors hover:text-amber-800 h-full flex items-center border-b-2 cursor-pointer ${
                currentView === 'home'
                  ? 'text-amber-900 font-semibold border-amber-900'
                  : 'text-stone-700 border-transparent'
              }`}
            >
              Home
            </button>

            {/* 2. Collections / Existing Categories with Mega Menu Dropdown */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button
                id="nav-link-collections"
                onClick={() => handleNavClick('shop')}
                className={`text-xs font-medium tracking-[0.16em] uppercase transition-colors hover:text-amber-800 h-full flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  currentView === 'shop' || megaMenuOpen
                    ? 'text-amber-900 font-semibold border-amber-900'
                    : 'text-stone-700 border-transparent'
                }`}
                aria-expanded={megaMenuOpen}
              >
                <span>Collections</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    megaMenuOpen ? 'rotate-180 text-amber-900' : 'text-stone-400'
                  }`}
                />
              </button>

              {/* Desktop Mega Menu Dropdown */}
              {megaMenuOpen && (
                <div
                  id="header-mega-menu"
                  className="absolute top-full -left-24 xl:-left-40 w-[860px] xl:w-[940px] bg-white rounded-2xl shadow-2xl border border-stone-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseEnter={handleMegaMenuEnter}
                  onMouseLeave={handleMegaMenuLeave}
                >
                  <div className="grid grid-cols-12">
                    {/* Left: Collections Grid (Only Existing Categories) */}
                    <div className="col-span-8 p-7 bg-white">
                      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
                        <div>
                          <h3 className="font-serif text-base font-bold text-stone-900">
                            Atelier Collections
                          </h3>
                          <p className="text-[11px] text-stone-500">
                            Discover handcrafted Indian couture, heirloom weaves &amp; contemporary pret.
                          </p>
                        </div>
                        <button
                          onClick={() => handleNavClick('shop')}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 hover:text-amber-700 cursor-pointer"
                        >
                          <span>View All Pieces</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Categories mapped dynamically from Firestore / Admin database */}
                      {activeCategories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
                          {activeCategories.map((cat) => {
                            const count =
                              categoryCounts[cat.id] ||
                              categoryCounts[cat.name.toLowerCase()] ||
                              0;
                            return (
                              <button
                                key={cat.id}
                                id={`mega-menu-cat-${cat.slug}`}
                                onClick={() => handleNavClick('shop', cat.slug)}
                                className="group flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-stone-50 transition-all text-left border border-stone-100/80 hover:border-amber-200/80 cursor-pointer"
                              >
                                {cat.image && cat.image.trim() !== '' ? (
                                  <img
                                    src={cat.image.trim()}
                                    alt={cat.name}
                                    className="w-12 h-14 object-cover rounded-lg shrink-0 border border-stone-200 group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-12 h-14 bg-amber-50 rounded-lg flex items-center justify-center shrink-0 border border-amber-200 text-amber-900 font-serif text-xs font-bold">
                                    {cat.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <h4 className="font-serif text-xs font-bold text-stone-900 group-hover:text-amber-900 transition-colors truncate">
                                      {cat.name}
                                    </h4>
                                    {count > 0 && (
                                      <span className="text-[10px] text-stone-400 font-mono shrink-0">
                                        {count} items
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 font-sans">
                                    {cat.description || 'Curated women’s luxury wardrobe'}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-xs text-stone-500">
                          No categories currently enabled in the Admin Panel.
                        </div>
                      )}
                    </div>

                    {/* Right: Atelier Concierge & Business Address Panel */}
                    <div className="col-span-4 bg-[#faf7f2] p-6 border-l border-stone-200/80 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-900 block mb-1">
                            Atelier Concierge
                          </span>
                          <h4 className="font-serif text-sm font-bold text-stone-900">
                            Personal Shopping &amp; Sizing
                          </h4>
                          <p className="text-[11px] text-stone-600 leading-relaxed mt-1">
                            Our Mumbai stylists assist with measurements, fabric details, and dispatch status.
                          </p>
                        </div>

                        {/* Quick Contact Buttons */}
                        <div className="space-y-2 pt-1">
                          <a
                            href="tel:9372085090"
                            className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-900 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-between transition-colors group shadow-2xs"
                          >
                            <span className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-amber-900" />
                              <span>Call: 93720 85090</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                          </a>

                          <a
                            href="https://wa.me/919372085090?text=Hello%20Fashinery%2C%20I%20would%20like%20assistance%20with%20your%20collection."
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-between transition-colors shadow-2xs"
                          >
                            <span className="flex items-center gap-2">
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp: +91 93720 85090</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />
                          </a>

                          <a
                            href="mailto:care.fashinery@gmail.com?subject=Inquiry%20from%20Website"
                            className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-900 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-between transition-colors group shadow-2xs"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Mail className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                              <span className="truncate">care.fashinery@gmail.com</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </a>
                        </div>

                        {/* Business / Contact Address Section */}
                        <div className="pt-3 border-t border-stone-200/80">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1 mb-1">
                            <MapPin className="w-3 h-3 text-amber-800 shrink-0" />
                            <span>Business / Contact Address</span>
                          </span>
                          <p className="text-[11px] text-stone-700 leading-relaxed">
                            Kurar Village, Shivaji Nagar,<br />
                            Malad East, Mumbai,<br />
                            Maharashtra - 400997
                          </p>
                          <p className="text-[10px] text-stone-500 mt-1 italic leading-tight">
                            (Administrative office only • Not a return destination. Returns must be initiated online.)
                          </p>
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          onClick={() => handleNavClick('contact')}
                          className="text-[11px] font-bold text-amber-950 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Full Contact &amp; Support Page</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. New Arrivals (Only if available) */}
            {hasNewArrivals && (
              <button
                id="nav-link-new-arrivals"
                onClick={() => handleNavClick('shop')}
                className={`text-xs font-medium tracking-[0.16em] uppercase transition-colors hover:text-amber-800 h-full flex items-center gap-1 border-b-2 cursor-pointer ${
                  currentView === 'shop' && window.location.hash.includes('newest')
                    ? 'text-amber-900 font-semibold border-amber-900'
                    : 'text-stone-700 border-transparent'
                }`}
              >
                <span>New Arrivals</span>
                <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                  NEW
                </span>
              </button>
            )}

            {/* 4. Sale (Only if available) */}
            {hasSale && (
              <button
                id="nav-link-sale"
                onClick={() => handleNavClick('shop')}
                className="text-xs font-medium tracking-[0.16em] uppercase text-rose-700 hover:text-rose-800 transition-colors h-full flex items-center gap-1 border-b-2 border-transparent cursor-pointer"
              >
                <span>Sale</span>
                <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full font-bold">
                  HOT
                </span>
              </button>
            )}

            {/* 5. Blog (Only if available) - currently false */}
            {hasBlog && (
              <button
                id="nav-link-blog"
                onClick={() => handleNavClick('home')}
                className="text-xs font-medium tracking-[0.16em] uppercase text-stone-700 hover:text-amber-800 transition-colors h-full flex items-center border-b-2 border-transparent"
              >
                Blog
              </button>
            )}

            {/* 6. Contact (With Interactive Contact & Help Dropdown) */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={handleContactMenuEnter}
              onMouseLeave={handleContactMenuLeave}
            >
              <button
                id="nav-link-contact"
                onClick={() => handleNavClick('contact')}
                className={`text-xs font-medium tracking-[0.16em] uppercase transition-colors hover:text-amber-800 h-full flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  currentView === 'contact' || contactMenuOpen
                    ? 'text-amber-900 font-semibold border-amber-900'
                    : 'text-stone-700 border-transparent'
                }`}
                aria-expanded={contactMenuOpen}
              >
                <span>Contact</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    contactMenuOpen ? 'rotate-180 text-amber-900' : 'text-stone-400'
                  }`}
                />
              </button>

              {/* Desktop Contact / Help Dropdown Popover */}
              {contactMenuOpen && (
                <div
                  id="header-contact-dropdown"
                  className="absolute top-full -right-16 w-84 bg-white rounded-2xl shadow-2xl border border-stone-200/90 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-4"
                  onMouseEnter={handleContactMenuEnter}
                  onMouseLeave={handleContactMenuLeave}
                >
                  <div className="border-b border-stone-100 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-900 block mb-0.5">
                      Client Assistance
                    </span>
                    <h4 className="font-serif text-sm font-bold text-stone-900">
                      Contact &amp; Help Desk
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Reach our Mumbai atelier directly via call, WhatsApp or email.
                    </p>
                  </div>

                  {/* Clickable Call, WhatsApp and Email Buttons */}
                  <div className="space-y-2">
                    <a
                      href="tel:9372085090"
                      className="w-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-900 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors group"
                    >
                      <span className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-amber-900" />
                        <span>Phone: 93720 85090</span>
                      </span>
                      <span className="text-[10px] text-amber-900 uppercase font-bold tracking-wider">
                        Call
                      </span>
                    </a>

                    <a
                      href="https://wa.me/919372085090?text=Hello%20Fashinery%2C%20I%20have%20an%20inquiry%20regarding%20an%20order."
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors shadow-2xs"
                    >
                      <span className="flex items-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp: +91 93720 85090</span>
                      </span>
                      <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">
                        Chat
                      </span>
                    </a>

                    <a
                      href="mailto:care.fashinery@gmail.com?subject=Customer%20Support%20Request"
                      className="w-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-900 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors group"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                        <span className="truncate">care.fashinery@gmail.com</span>
                      </span>
                      <span className="text-[10px] text-amber-900 uppercase font-bold tracking-wider shrink-0">
                        Email
                      </span>
                    </a>
                  </div>

                  {/* Address Section */}
                  <div className="pt-3 border-t border-stone-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3 h-3 text-amber-900 shrink-0" />
                      <span>Business / Contact Address</span>
                    </span>
                    <p className="text-[11px] text-stone-700 leading-relaxed font-sans">
                      Kurar Village, Shivaji Nagar,<br />
                      Malad East, Mumbai,<br />
                      Maharashtra - 400997
                    </p>
                    <div className="mt-2 bg-amber-50/70 border border-amber-200/70 p-2 rounded-lg text-[10px] text-amber-900 flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                      <span>
                        <strong>Note:</strong> Registered corporate office only. Do NOT use this as a return address. All returns must be requested online.
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => handleNavClick('contact')}
                      className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-2 rounded-xl transition-colors text-center cursor-pointer"
                    >
                      Open Full Contact Form
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 shrink-0">
            {/* Desktop Search Button */}
            <button
              id="btn-desktop-search"
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center gap-1 text-stone-700 hover:text-stone-900 p-2 transition-colors cursor-pointer"
              title="Search Catalog"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Link / Login */}
            <button
              id="btn-account"
              onClick={() => {
                setCurrentView('account');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-1.5 sm:p-2 text-stone-700 hover:text-stone-900 transition-colors relative cursor-pointer"
              title={user ? `Signed in as ${user.displayName || user.email}` : 'Sign In / Register'}
              aria-label="Account"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              {user && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Wishlist Button */}
            <button
              id="btn-wishlist"
              onClick={() => setIsWishlistDrawerOpen(true)}
              className="p-1.5 sm:p-2 text-stone-700 hover:text-stone-900 transition-colors relative cursor-pointer"
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[9px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              id="btn-cart-drawer"
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-1.5 sm:p-2 text-stone-900 hover:text-amber-900 transition-colors relative cursor-pointer"
              title="Shopping Bag"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-amber-200 text-[9px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Drawer Navigation mounted via Portal to document.body */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <div
                id="mobile-menu-overlay"
                className="lg:hidden fixed inset-0 z-[99999] flex"
                style={{ height: '100dvh' }}
              >
                {/* Backdrop with Fade Animation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer z-0"
                  onClick={() => setMobileMenuOpen(false)}
                  onTouchMove={(e) => e.preventDefault()}
                />

                {/* Slide-out Drawer with Smooth Spring Animation from the Left */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '0%' }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  className="relative w-[86%] max-w-sm sm:max-w-md bg-white h-full h-screen h-[100dvh] shadow-2xl flex flex-col z-10 overflow-hidden"
                >
                  {/* Drawer Top Fixed Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 shrink-0 bg-white">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick('home');
                      }}
                      className="text-left group cursor-pointer"
                      aria-label="Fashinery - Elegance in Every Look"
                    >
                      <BrandLogo
                        size="sm"
                        showSlogan={true}
                        sloganText={settings.tagline || 'Elegance in Every Look'}
                        theme="light"
                        showSkeleton={true}
                        enableCrossFade={true}
                      />
                    </button>
                    <button
                      id="btn-close-mobile-menu"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-950 transition-colors border border-stone-200/80 shadow-xs cursor-pointer flex items-center justify-center"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5 text-stone-800" />
                    </button>
                  </div>

                  {/* Scrollable Drawer Content */}
                  <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-6 touch-pan-y">
                {/* Search Bar */}
                <div>
                  <button
                    id="mobile-nav-search-button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-stone-100/90 hover:bg-stone-200/80 rounded-xl text-stone-500 text-xs transition-colors border border-stone-200/70 cursor-pointer"
                    aria-label="Search products"
                  >
                    <span className="flex items-center gap-2.5">
                      <Search className="w-4 h-4 text-amber-900 shrink-0" />
                      <span className="text-stone-600 font-medium">Search sarees, kurtis, dresses...</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      Search
                    </span>
                  </button>
                </div>

                {/* Quick Utility Actions: Login / My Account, Wishlist, Cart */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Login / My Account */}
                  <button
                    id="mobile-quick-account"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCurrentView('account');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-stone-50 hover:bg-amber-50/60 border border-stone-200/70 text-stone-800 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-amber-900 mb-1" />
                    <span className="text-[11px] font-semibold truncate max-w-[80px]">
                      {user ? (user.displayName ? user.displayName.split(' ')[0] : 'Account') : 'Sign In'}
                    </span>
                  </button>

                  {/* Wishlist */}
                  <button
                    id="mobile-quick-wishlist"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsWishlistDrawerOpen(true);
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-stone-50 hover:bg-rose-50/60 border border-stone-200/70 text-stone-800 transition-colors relative cursor-pointer"
                  >
                    <div className="relative mb-1">
                      <Heart className="w-4 h-4 text-rose-600" />
                      {wishlist.length > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
                          {wishlist.length}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold">Wishlist</span>
                  </button>

                  {/* Cart */}
                  <button
                    id="mobile-quick-cart"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsCartDrawerOpen(true);
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-stone-50 hover:bg-amber-50/60 border border-stone-200/70 text-stone-800 transition-colors relative cursor-pointer"
                  >
                    <div className="relative mb-1">
                      <ShoppingBag className="w-4 h-4 text-amber-900" />
                      {cartItemCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-stone-900 text-amber-200 text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
                          {cartItemCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold">Cart</span>
                  </button>
                </div>

                {/* 1. SHOP SECTION */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 pb-1 flex items-center justify-between">
                    <span>Shop</span>
                    <span className="h-px flex-1 bg-stone-100 ml-3" />
                  </div>
                  <div className="space-y-0.5">
                    <button
                      id="mobile-nav-all-products"
                      onClick={() => handleNavClick('shop')}
                      className={`w-full text-left text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        currentView === 'shop' && !selectedCategoryFilter
                          ? 'bg-amber-100/70 text-amber-950 font-bold'
                          : 'text-stone-800 hover:bg-stone-50'
                      }`}
                    >
                      <span>All Products</span>
                      <span className="text-[10px] text-stone-400 font-mono">({products.length})</span>
                    </button>

                    <button
                      id="mobile-nav-new-arrivals"
                      onClick={() => handleNavClick('shop', 'new-arrivals')}
                      className={`w-full text-left text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        currentView === 'shop' && selectedCategoryFilter === 'new-arrivals'
                          ? 'bg-amber-100/70 text-amber-950 font-bold'
                          : 'text-stone-800 hover:bg-stone-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>New Arrivals</span>
                        <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
                          NEW
                        </span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>

                    <button
                      id="mobile-nav-best-sellers"
                      onClick={() => handleNavClick('shop', 'bestsellers')}
                      className={`w-full text-left text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        currentView === 'shop' && selectedCategoryFilter === 'bestsellers'
                          ? 'bg-amber-100/70 text-amber-950 font-bold'
                          : 'text-stone-800 hover:bg-stone-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>Best Sellers</span>
                        <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full font-bold">
                          HOT
                        </span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                  </div>
                </div>

                {/* 2. CATEGORIES SECTION */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 pb-1 flex items-center justify-between">
                    <span>Categories</span>
                    <span className="h-px flex-1 bg-stone-100 ml-3" />
                  </div>
                  <div className="grid grid-cols-1 gap-0.5">
                    {MOBILE_CATEGORIES.map((cat) => {
                      const count = getMobileCategoryCount(cat.slug);
                      const isActive = currentView === 'shop' && selectedCategoryFilter === cat.slug;
                      return (
                        <button
                          key={cat.slug}
                          id={`mobile-nav-cat-${cat.slug}`}
                          onClick={() => handleNavClick('shop', cat.slug)}
                          className={`w-full text-left text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                            isActive
                              ? 'bg-amber-100/70 text-amber-950 font-bold'
                              : 'text-stone-700 hover:bg-stone-50 hover:text-amber-900'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-800/40" />
                            <span>{cat.name}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            {count > 0 && (
                              <span className="text-[10px] text-stone-400 font-mono">({count})</span>
                            )}
                            <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. CUSTOMER SECTION */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 pb-1 flex items-center justify-between">
                    <span>Customer</span>
                    <span className="h-px flex-1 bg-stone-100 ml-3" />
                  </div>
                  <div className="space-y-0.5">
                    <button
                      id="mobile-customer-account"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setCurrentView('account');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full text-left text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        currentView === 'account' ? 'bg-amber-100/70 text-amber-950 font-bold' : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <User className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                        <span>My Account</span>
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {user ? user.displayName || 'Profile' : 'Sign In'}
                      </span>
                    </button>

                    <button
                      id="mobile-customer-orders"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (user) {
                          setCurrentView('account');
                        } else {
                          setCurrentView('track');
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors text-stone-700 hover:bg-stone-50"
                    >
                      <span className="flex items-center gap-2.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                        <span>My Orders</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
                    </button>

                    <button
                      id="mobile-customer-wishlist"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsWishlistDrawerOpen(true);
                      }}
                      className="w-full text-left text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors text-stone-700 hover:bg-stone-50"
                    >
                      <span className="flex items-center gap-2.5">
                        <Heart className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Wishlist</span>
                      </span>
                      {wishlist.length > 0 && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                          {wishlist.length}
                        </span>
                      )}
                    </button>

                    <button
                      id="mobile-customer-cart"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsCartDrawerOpen(true);
                      }}
                      className="w-full text-left text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors text-stone-700 hover:bg-stone-50"
                    >
                      <span className="flex items-center gap-2.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                        <span>Cart</span>
                      </span>
                      {cartItemCount > 0 && (
                        <span className="text-[10px] bg-stone-900 text-amber-200 font-bold px-1.5 py-0.2 rounded-full">
                          {cartItemCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* 4. INFORMATION SECTION */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 pb-1 flex items-center justify-between">
                    <span>Information</span>
                    <span className="h-px flex-1 bg-stone-100 ml-3" />
                  </div>
                  <div className="space-y-0.5">
                    <button
                      id="mobile-info-about"
                      onClick={() => handleNavClick('about')}
                      className={`w-full text-left text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        currentView === 'about' ? 'bg-amber-100/70 text-amber-950 font-bold' : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>About Us</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
                    </button>

                    <button
                      id="mobile-info-contact"
                      onClick={() => handleNavClick('contact')}
                      className={`w-full text-left text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        currentView === 'contact' ? 'bg-amber-100/70 text-amber-950 font-bold' : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>Contact Us</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
                    </button>

                    <button
                      id="mobile-info-faq"
                      onClick={() => handleNavClick('faq')}
                      className={`w-full text-left text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        currentView === 'faq' ? 'bg-amber-100/70 text-amber-950 font-bold' : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>FAQ</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
                    </button>

                    <button
                      id="mobile-info-shipping"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openPolicyPage('shipping');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors text-stone-700 hover:bg-stone-50"
                    >
                      <span>Shipping Policy</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
                    </button>

                    <button
                      id="mobile-info-return-refund"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openPolicyPage('return-refund');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors text-stone-700 hover:bg-stone-50"
                    >
                      <span>Return &amp; Refund Policy</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
                    </button>

                    <button
                      id="mobile-info-cancellation"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openPolicyPage('cancellation');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors text-stone-700 hover:bg-stone-50"
                    >
                      <span>Cancellation Policy</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
                    </button>

                    <button
                      id="mobile-info-terms"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openPolicyPage('terms');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors text-stone-700 hover:bg-stone-50"
                    >
                      <span>Terms &amp; Conditions</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
                    </button>

                    <button
                      id="mobile-info-privacy"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openPolicyPage('privacy');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors text-stone-700 hover:bg-stone-50"
                    >
                      <span>Privacy Policy</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
                    </button>
                  </div>
                </div>

                {/* 5. CONTACT SECTION */}
                <div className="space-y-2 pt-2 border-t border-stone-200">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 pb-1 flex items-center justify-between">
                    <span>Contact</span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full lowercase tracking-normal">
                      mon-sat 10am-7pm
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* WhatsApp: +91 93720 85090 */}
                    <a
                      id="mobile-contact-whatsapp-link"
                      href="https://wa.me/919372085090"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-colors shadow-xs"
                    >
                      <span className="flex items-center gap-2.5">
                        <MessageCircle className="w-4 h-4 text-emerald-200 shrink-0" />
                        <span>WhatsApp: +91 93720 85090</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-100 shrink-0">
                        Chat Now
                      </span>
                    </a>

                    {/* Email: care.fashinery@gmail.com */}
                    <a
                      id="mobile-contact-email-link"
                      href="mailto:care.fashinery@gmail.com"
                      className="w-full bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-colors border border-stone-200/80"
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Mail className="w-4 h-4 text-amber-900 shrink-0" />
                        <span className="truncate">Email: care.fashinery@gmail.com</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 shrink-0">
                        Send Email
                      </span>
                    </a>

                    {/* Direct Phone Call */}
                    <a
                      id="mobile-contact-phone-link"
                      href="tel:9372085090"
                      className="w-full bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-colors border border-stone-200/80"
                    >
                      <span className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-amber-900 shrink-0" />
                        <span>Call: +91 93720 85090</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 shrink-0">
                        Call
                      </span>
                    </a>
                  </div>

                  {/* Business / Contact Address */}
                  <div className="pt-2 text-[11px] text-stone-500 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-900 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      Kurar Village, Shivaji Nagar, Malad East, Mumbai, Maharashtra - 400997
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </header>
  );
};

