import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const PromotionalBanner: React.FC = () => {
  const { banners, setCurrentView, setSelectedCategoryFilter } = useStore();
  const promo = banners.find((b) => b.position === 'promo' && b.isActive);

  if (!promo) return null;

  return (
    <section id="promo-banner-section" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden shadow-xl bg-stone-900 text-white min-h-[380px] sm:min-h-[440px] flex items-center">
          {/* Background Photo */}
          {promo.desktopImage && promo.desktopImage.trim() !== '' ? (
            <img
              src={promo.desktopImage.trim()}
              alt={promo.title}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-stone-900 opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-transparent" />

          {/* Content */}
          <div className="relative z-10 max-w-xl p-8 sm:p-12 lg:p-16 space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase bg-amber-400 text-stone-950 px-2.5 py-1 rounded-sm">
                {promo.discountBadge || 'EXCLUSIVE CAPSULE'}
              </span>
              {promo.subtitle && (
                <span className="text-xs font-semibold tracking-[0.2em] text-amber-200 uppercase">
                  {promo.subtitle}
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {promo.title}
            </h2>

            {promo.description && (
              <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed">
                {promo.description}
              </p>
            )}

            <div className="pt-3">
              <button
                id="btn-promo-cta"
                onClick={() => {
                  setSelectedCategoryFilter(null);
                  setCurrentView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-white hover:bg-stone-100 text-stone-900 text-xs sm:text-sm font-semibold tracking-wider uppercase px-7 py-3.5 rounded-sm shadow-md transition-all duration-300 cursor-pointer"
              >
                <span>{promo.buttonText || 'Discover Now'}</span>
                <ArrowRight className="w-4 h-4 text-amber-800" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
