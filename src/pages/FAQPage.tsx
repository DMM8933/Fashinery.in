import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  HelpCircle,
  Mail,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FAQItem } from '../types';

export const FAQPage: React.FC = () => {
  const { faqs, settings, openGeneralWhatsApp, setCurrentView } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const categories = [
    'All',
    'Shipping',
    'Returns',
    'Refunds',
    'Exchanges',
    'Orders',
    'Payments',
    'Products',
    'Account',
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchCategory =
        selectedCategory === 'All' || faq.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q);
      return matchCategory && matchSearch && (faq.isActive ?? true);
    });
  }, [faqs, selectedCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    filteredFaqs.forEach((item) => {
      next[item.id] = true;
    });
    setOpenItems(next);
  };

  const collapseAll = () => {
    setOpenItems({});
  };

  return (
    <div id="faq-page" className="min-h-screen bg-[#faf7f2] py-12 sm:py-16 text-stone-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-[0.25em] text-amber-800 uppercase block mb-2">
            Help &amp; Support Center
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Find immediate answers regarding orders, free shipping, doorstep returns, sizing, and payment safety.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-faq-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, e.g., 'Free shipping', 'Return pickup', 'COD', 'Sizing'..."
              className="w-full bg-white pl-12 pr-10 py-3.5 rounded-2xl border border-stone-200 text-xs sm:text-sm shadow-xs focus:outline-hidden focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 uppercase font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`filter-faq-${cat.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs uppercase tracking-wider font-semibold px-4 py-2 rounded-full transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Expand / Collapse Controls */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200 text-xs text-stone-500">
          <span>
            Showing <strong>{filteredFaqs.length}</strong> questions
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </span>
          <div className="space-x-3">
            <button
              onClick={expandAll}
              className="hover:text-stone-900 underline cursor-pointer"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="hover:text-stone-900 underline cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 space-y-3">
              <HelpCircle className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-stone-900">
                No matching questions found
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                We couldn’t find any questions matching "{searchQuery}". You can chat directly with our concierge team on WhatsApp for instant assistance.
              </p>
              <button
                onClick={openGeneralWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ask on WhatsApp (+91 93720 85090)</span>
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openItems[faq.id] ?? false;
              return (
                <div
                  key={faq.id}
                  id={`faq-item-${faq.id}`}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden transition-shadow hover:shadow-xs"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer focus:outline-hidden"
                  >
                    <div className="space-y-1 pr-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm inline-block">
                        {faq.category}
                      </span>
                      <h3 className="font-serif text-base sm:text-lg font-semibold text-stone-900">
                        {faq.question}
                      </h3>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-stone-500 transition-transform ${
                        isOpen ? 'rotate-180 bg-stone-200 text-stone-900' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-[#fdfcfb] font-sans">
                      <p className="whitespace-pre-line">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions Concierge Box */}
        <div className="mt-14 bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 shadow-xs text-center space-y-4">
          <span className="text-xs font-semibold tracking-widest text-amber-800 uppercase block">
            Dedicated Customer Assistance
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Still Have Inquiries?
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Our Mumbai client care team is active Monday to Saturday (10:00 AM – 7:00 PM IST) to answer styling questions, clarify return pickups, or update order statuses.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              id="btn-faq-whatsapp"
              onClick={openGeneralWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-wider font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: +91 93720 85090</span>
            </button>

            <button
              id="btn-faq-contact-form"
              onClick={() => setCurrentView('contact')}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Write to Support</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
