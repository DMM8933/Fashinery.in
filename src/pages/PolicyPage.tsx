import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Lock,
  MessageCircle,
  Printer,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { useStore } from '../context/StoreContext';
import { COMPREHENSIVE_POLICIES } from '../data/contentData';

export const PolicyPage: React.FC = () => {
  const {
    policies,
    selectedPolicySlug,
    setSelectedPolicySlug,
    settings,
    openGeneralWhatsApp,
    setCurrentView,
  } = useStore();

  const [policySearch, setPolicySearch] = useState<string>('');

  // Fallback to COMPREHENSIVE_POLICIES if not in Firestore yet
  const activeSlug = selectedPolicySlug || 'shipping';

  const currentPolicy = useMemo(() => {
    // Check in database policies first
    let found = policies.find(
      (p) =>
        p.slug === activeSlug ||
        (activeSlug === 'returns' && p.slug === 'return-refund') ||
        (activeSlug === 'return-refund' && p.slug === 'returns')
    );
    if (!found) {
      // Check in fallback comprehensive policies
      found = COMPREHENSIVE_POLICIES.find(
        (p) =>
          p.slug === activeSlug ||
          (activeSlug === 'returns' && p.slug === 'return-refund') ||
          (activeSlug === 'return-refund' && p.slug === 'returns')
      );
    }
    return found || COMPREHENSIVE_POLICIES[0];
  }, [policies, activeSlug]);

  const allPolicyTabs = [
    { slug: 'shipping', title: 'Shipping & Delivery', icon: Truck },
    { slug: 'returns', title: 'Return & Refund Policy', icon: RefreshCw },
    { slug: 'cancellation', title: 'Cancellation Policy', icon: Clock },
    { slug: 'refund', title: 'Refund Policy', icon: ShieldCheck },
    { slug: 'exchange', title: 'Exchange Policy', icon: RefreshCw },
    { slug: 'privacy', title: 'Privacy Policy', icon: Lock },
    { slug: 'terms', title: 'Terms & Conditions', icon: FileText },
    { slug: 'cookies', title: 'Cookie Policy', icon: Shield },
  ];

  // Calculate estimated reading time
  const readingTime = useMemo(() => {
    const text = currentPolicy?.content || '';
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return minutes <= 1 ? '1 min read' : `${minutes} min read`;
  }, [currentPolicy]);

  const handlePrint = () => {
    window.print();
  };

  const otherPolicies = allPolicyTabs.filter((p) => p.slug !== currentPolicy?.slug);

  return (
    <div id="policy-page" className="min-h-screen bg-[#faf7f2] py-10 sm:py-16 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-[0.25em] text-amber-800 uppercase block mb-2">
            Fashinery Trust &amp; Transparency
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900">
            {currentPolicy?.title || 'Policy Information'}
          </h1>
          {currentPolicy?.subtitle && (
            <p className="mt-2 text-xs sm:text-sm text-stone-600 font-sans">
              {currentPolicy.subtitle}
            </p>
          )}
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Mobile Fast Policy Switcher Bar */}
          <div className="lg:hidden col-span-1 overflow-x-auto pb-1 flex gap-2 no-scrollbar">
            {allPolicyTabs.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeSlug === item.slug ||
                (item.slug === 'returns' && activeSlug === 'return-refund') ||
                (item.slug === 'return-refund' && activeSlug === 'returns');

              return (
                <button
                  key={item.slug}
                  id={`mobile-quick-policy-${item.slug}`}
                  onClick={() => {
                    setSelectedPolicySlug(item.slug);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>

          {/* Left Sidebar: Sticky Table of Contents / Policy Switcher */}
          <aside className="hidden lg:block lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <BookOpen className="w-4 h-4 text-amber-800" />
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-stone-900">
                  Legal &amp; Policy Index
                </h3>
              </div>

              <nav className="space-y-1">
                {allPolicyTabs.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeSlug === item.slug ||
                    (item.slug === 'returns' && activeSlug === 'return-refund') ||
                    (item.slug === 'return-refund' && activeSlug === 'returns');

                  return (
                    <button
                      key={item.slug}
                      id={`sidebar-policy-${item.slug}`}
                      onClick={() => {
                        setSelectedPolicySlug(item.slug);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
                        <span>{item.title}</span>
                      </div>
                      <ArrowRight className={`w-3 h-3 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Concierge & Support Box */}
            <div className="bg-[#f5efe6] rounded-3xl p-6 border border-amber-200/60 shadow-xs space-y-3">
              <h4 className="font-serif text-sm font-bold text-stone-900">
                Need Policy Clarification?
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Our customer care drapers in Mumbai are available Monday to Saturday, 10:00 AM – 7:00 PM IST.
              </p>
              <button
                onClick={openGeneralWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-3 px-4 rounded-xl inline-flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp (+91 93720 85090)</span>
              </button>
            </div>
          </aside>

          {/* Right Area: Policy Content */}
          <main className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 border border-stone-200 shadow-xs space-y-6">
            {/* Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-100">
              <div className="flex items-center gap-4 text-xs text-stone-500 font-sans">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{readingTime}</span>
                </span>
                <span>•</span>
                <span>
                  Updated on{' '}
                  {new Date(currentPolicy?.updatedAt || Date.now()).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                  title="Print this policy"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={openGeneralWhatsApp}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium border border-emerald-200 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Ask Support</span>
                </button>
              </div>
            </div>

            {/* Rendered Policy Content with Markdown Support */}
            <article className="prose prose-stone max-w-none text-stone-700 font-sans text-xs sm:text-sm leading-relaxed space-y-4">
              <div className="markdown-body font-sans">
                <Markdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-900 underline font-semibold hover:text-amber-700 transition-colors"
                      />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        {...props}
                        className="border-l-4 border-amber-800 bg-amber-50/70 p-4 rounded-r-xl my-3 text-amber-950 font-medium not-italic"
                      />
                    ),
                  }}
                >
                  {currentPolicy?.content || ''}
                </Markdown>
              </div>
            </article>

            {/* Related Policies Footer */}
            <div className="pt-8 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest block mb-3">
                Related Policies
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherPolicies.slice(0, 4).map((p) => (
                  <button
                    key={p.slug}
                    onClick={() => {
                      setSelectedPolicySlug(p.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-left p-3.5 rounded-xl border border-stone-200 hover:border-stone-900 bg-stone-50 hover:bg-white text-xs font-semibold text-stone-800 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{p.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
