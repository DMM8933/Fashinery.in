import React, { useState, useEffect } from 'react';
import { Clock, Copy, Check, Tag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const SpecialOfferBanner: React.FC = () => {
  const { banners, setCurrentView } = useStore();
  const offer = banners.find((b) => b.position === 'offer' && b.isActive);

  const [copied, setCopied] = useState(false);

  // Simulated live countdown timer for festive urgency
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 48,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!offer) return null;

  const promoCode = offer.discountBadge?.includes('CODE:')
    ? offer.discountBadge.replace('CODE:', '').trim()
    : 'FESTIVE1000';

  const copyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="special-offer-section" className="py-14 sm:py-20 bg-stone-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        {offer.desktopImage && offer.desktopImage.trim() !== '' ? (
          <img
            src={offer.desktopImage.trim()}
            alt={offer.title}
            className="w-full h-full object-cover object-center opacity-30"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-stone-900 opacity-30" />
        )}
        <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 bg-white/5 border border-white/10 p-5 sm:p-8 md:p-12 rounded-2xl backdrop-blur-md">
          {/* Left Column: Offer Details */}
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest">
              <Tag className="w-3.5 h-3.5" />
              <span>{offer.subtitle || 'Privileged Customer Offer'}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {offer.title}
            </h2>

            {offer.description && (
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                {offer.description}
              </p>
            )}

            {/* Coupon Code Pill */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-2">
              <div className="flex items-center gap-2 bg-stone-800/90 border border-stone-700 px-3 sm:px-4 py-2 rounded-lg">
                <span className="text-xs text-stone-400">Coupon Code:</span>
                <span className="font-mono text-amber-300 font-bold tracking-wider text-xs sm:text-sm">{promoCode}</span>
                <button
                  id="btn-copy-offer-code"
                  onClick={copyCode}
                  className="p-1 hover:text-white text-stone-400 transition-colors cursor-pointer"
                  title="Copy Coupon"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                id="btn-claim-offer-cta"
                onClick={() => {
                  setCurrentView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs tracking-wider uppercase px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors cursor-pointer shadow-md"
              >
                {offer.buttonText || 'Shop With Offer'}
              </button>
            </div>
          </div>

          {/* Right Column: Countdown Clock */}
          <div className="bg-stone-950/70 border border-stone-800 p-4 sm:p-8 rounded-xl flex flex-col items-center text-center w-full max-w-sm">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-4">
              <Clock className="w-4 h-4" />
              <span>Offer Expires In</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-3 w-full">
              <div className="bg-stone-900 border border-stone-800 p-2 sm:p-2.5 rounded-lg flex flex-col items-center">
                <span className="font-serif text-xl sm:text-3xl font-bold text-white">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-stone-400 mt-1">Days</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 p-2 sm:p-2.5 rounded-lg flex flex-col items-center">
                <span className="font-serif text-xl sm:text-3xl font-bold text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-stone-400 mt-1">Hours</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 p-2 sm:p-2.5 rounded-lg flex flex-col items-center">
                <span className="font-serif text-xl sm:text-3xl font-bold text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-stone-400 mt-1">Mins</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 p-2 sm:p-2.5 rounded-lg flex flex-col items-center">
                <span className="font-serif text-xl sm:text-3xl font-bold text-amber-400">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-stone-400 mt-1">Secs</span>
              </div>
            </div>

            <span className="text-[11px] text-stone-400 mt-4">
              *Valid on orders above ₹5,999 across all ethnic &amp; bridal capsules.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
