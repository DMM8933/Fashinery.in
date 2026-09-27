import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  HelpCircle,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Truck,
  Instagram,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const {
    settings,
    categories,
    setCurrentView,
    setSelectedCategoryFilter,
    openPolicyPage,
    subscribeNewsletter,
    openGeneralWhatsApp,
  } = useStore();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    const ok = await subscribeNewsletter(newsletterEmail);
    if (ok) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  const navigateTo = (viewOrSlug: string) => {
    openPolicyPage(viewOrSlug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-stone-950 text-stone-300 pt-16 pb-10 border-t border-stone-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800/80">
          {/* Col 1: Brand Philosophy & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-start">
                <BrandLogo
                  size="md"
                  showSlogan={true}
                  sloganText={settings.tagline || 'Elegance in Every Look'}
                  theme="dark"
                  className="items-start text-left"
                />
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed pr-6">
              {settings.footerDescription ||
                'Fashinery celebrates the multifaceted lives of modern women with timeless silhouettes, breathable natural fabrics, and heritage Indian craftsmanship. Elegance in every look, crafted with pride in Mumbai.'}
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-stone-200 block mb-2 tracking-wider uppercase">
                The Fashinery Journal
              </span>
              {subscribed ? (
                <p className="text-xs text-emerald-400 font-medium">
                  ✓ Welcome to our VIP preview list! You will receive early access to new collections.
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm">
                  <input
                    id="footer-newsletter-input"
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="bg-stone-900 text-white text-xs px-3.5 py-2.5 rounded-l-xl border border-stone-700 focus:outline-hidden focus:border-amber-400 flex-1 placeholder:text-stone-500"
                    required
                  />
                  <button
                    id="footer-newsletter-submit"
                    type="submit"
                    className="bg-stone-800 hover:bg-stone-700 text-white text-xs px-4 py-2.5 rounded-r-xl font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer border border-l-0 border-stone-700"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Col 2: About & Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">
              Explore &amp; Help
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button
                  id="footer-link-about"
                  onClick={() => navigateTo('about')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  About Fashinery
                </button>
              </li>
              <li>
                <button
                  id="footer-link-faq"
                  onClick={() => navigateTo('faq')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  FAQ &amp; Help Center
                </button>
              </li>
              <li>
                <button
                  id="footer-link-track"
                  onClick={() => navigateTo('track')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Track Order Status
                </button>
              </li>
              <li>
                <button
                  id="footer-link-contact"
                  onClick={() => navigateTo('contact')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  id="footer-link-shop-all"
                  onClick={() => {
                    setSelectedCategoryFilter(null);
                    setCurrentView('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Shop All Collections
                </button>
              </li>
              <li className="pt-1.5 border-t border-stone-800/60">
                <button
                  id="footer-link-admin-login"
                  onClick={() => {
                    setCurrentView('admin-login');
                    window.location.hash = '/admin-login';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-[11px] text-stone-500 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Admin Login
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Policies & Guarantees */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">
              Policies &amp; Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button
                  id="footer-policy-shipping"
                  onClick={() => navigateTo('shipping')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Shipping &amp; Delivery
                </button>
              </li>
              <li>
                <button
                  id="footer-policy-returns"
                  onClick={() => navigateTo('returns')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Return &amp; Refund Policy
                </button>
              </li>
              <li>
                <button
                  id="footer-policy-cancellation"
                  onClick={() => navigateTo('cancellation')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  id="footer-policy-refund"
                  onClick={() => navigateTo('refund')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <button
                  id="footer-policy-exchange"
                  onClick={() => navigateTo('exchange')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Exchange Policy
                </button>
              </li>
              <li>
                <button
                  id="footer-policy-privacy"
                  onClick={() => navigateTo('privacy')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  id="footer-policy-terms"
                  onClick={() => navigateTo('terms')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  id="footer-policy-cookies"
                  onClick={() => navigateTo('cookies')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Atelier & Support Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">
              Atelier &amp; Contact
            </h4>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {settings.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-white transition-colors"
                >
                  {settings.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`tel:${settings.phone}`}
                  className="hover:text-white transition-colors"
                >
                  +91 {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${(settings.whatsapp || '').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  WhatsApp: {settings.whatsapp}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href="https://www.instagram.com/fashinery.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition-colors"
                >
                  Instagram: @fashinery.in
                </a>
              </div>
              <p className="text-[11px] text-stone-500 pt-1">
                {settings.supportHours || 'Monday to Saturday: 10:00 AM – 7:00 PM IST'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Copyright Row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} FASHINERY — Elegance in Every Look. All Rights Reserved. Made with pride in Mumbai, India.</p>

          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5 text-stone-400">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>100% Genuine Fabrics</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-400">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Free Pan-India Shipping</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-400">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>7-Day Easy Returns</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-400">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>100% Secure Checkout</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
