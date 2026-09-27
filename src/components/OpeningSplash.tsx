import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { getActiveBrandLogo } from './BrandLogo';

// Module-level in-memory flag: ensures the splash runs on initial page load / refresh,
// but NEVER re-triggers when the customer navigates between routes/pages in the SPA (Shop, Product, Cart, etc.)
let splashHasPlayedInSession = false;

const DISPLAY_DURATION_MS = 1400; // Hold visual for 1.4s for an elegant luxury experience
const FADE_OUT_DURATION_MS = 500; // Smooth 0.5s fade out
const SAFETY_FALLBACK_TIMEOUT_MS = 2200; // Hard failsafe so the site can never get stuck

export const OpeningSplash: React.FC = () => {
  const { settings, currentView } = useStore();

  // If already played during this SPA lifetime, or if directly landing on Admin portal, do not display
  const [hasCompleted, setHasCompleted] = useState<boolean>(() => {
    // Clear any stale sessionStorage flags from prior versions
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('fashinery_splash_shown');
      } catch {
        // Ignore
      }
    }
    return splashHasPlayedInSession;
  });

  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [logoSrc, setLogoSrc] = useState<string>(() => getActiveBrandLogo(settings?.logoUrl));
  const [imageError, setImageError] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync logo if settings update quickly
  useEffect(() => {
    if (settings?.logoUrl && !imageError) {
      setLogoSrc(getActiveBrandLogo(settings.logoUrl));
    }
  }, [settings?.logoUrl, imageError]);

  useEffect(() => {
    // If already completed or on admin, skip immediately
    if (hasCompleted || splashHasPlayedInSession) return;
    if (currentView === 'admin' || currentView === 'admin-login') {
      setHasCompleted(true);
      splashHasPlayedInSession = true;
      return;
    }

    // Sequence: 
    // 1. Hold for DISPLAY_DURATION_MS
    // 2. Fade out smoothly over FADE_OUT_DURATION_MS
    // 3. Mark completed and unmount
    timerRef.current = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        splashHasPlayedInSession = true;
        setHasCompleted(true);
      }, FADE_OUT_DURATION_MS);
    }, DISPLAY_DURATION_MS);

    // Guaranteed failsafe: website must always reveal even under extreme network throttling
    safetyTimerRef.current = setTimeout(() => {
      splashHasPlayedInSession = true;
      setHasCompleted(true);
    }, SAFETY_FALLBACK_TIMEOUT_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, [hasCompleted, currentView]);

  if (hasCompleted || splashHasPlayedInSession) {
    return null;
  }

  // Tagline from settings or default
  const tagline = settings?.tagline || 'Elegance in Every Look';

  return (
    <div
      id="fashinery-opening-splash"
      role="status"
      aria-label="Welcome to Fashinery"
      aria-hidden={isFadingOut ? 'true' : 'false'}
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center select-none overflow-hidden transition-all ease-out ${
        isFadingOut
          ? 'opacity-0 scale-[1.01] pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      style={{
        transitionDuration: `${FADE_OUT_DURATION_MS}ms`,
        backgroundColor: '#fdfbf7',
        backgroundImage:
          'radial-gradient(circle at 50% 50%, rgba(254, 243, 199, 0.45) 0%, rgba(253, 251, 247, 0.98) 60%, #fdfbf7 100%)',
      }}
    >
      {/* 1. Ambient luxury aura glow behind the emblem */}
      <div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-amber-200/35 blur-3xl pointer-events-none animate-splash-glow"
        aria-hidden="true"
      />

      {/* 2. Main Logo & Tagline Container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-lg w-full">
        {/* Logo Wrapper with Shimmer and Elevation */}
        <div className="relative flex items-center justify-center overflow-hidden p-3 rounded-2xl">
          {/* Subtle Champagne Shimmer Sweep */}
          <div
            className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
            aria-hidden="true"
          >
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-amber-100/70 to-transparent animate-splash-shimmer" />
          </div>

          {/* FASHINERY Brand Logo */}
          {!imageError ? (
            <img
              src={logoSrc && logoSrc.trim() !== '' ? logoSrc.trim() : '/assets/fashinery-custom-logo.jpg'}
              alt={settings?.businessName || 'Fashinery'}
              onError={() => {
                if (logoSrc !== '/assets/fashinery-custom-logo.jpg') {
                  setLogoSrc('/assets/fashinery-custom-logo.jpg');
                } else {
                  setImageError(true);
                }
              }}
              className="w-52 xs:w-60 sm:w-72 md:w-80 h-auto max-h-24 sm:max-h-32 object-contain drop-shadow-[0_4px_18px_rgba(111,26,48,0.18)] animate-splash-logo"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="flex flex-col items-center animate-splash-logo">
              <span className="font-serif text-3xl sm:text-4xl font-bold tracking-widest text-stone-900 uppercase">
                FASHINERY
              </span>
            </div>
          )}
        </div>

        {/* 3. Elegant Tagline: "Elegance in Every Look" */}
        <div className="mt-4 sm:mt-5 flex flex-col items-center animate-splash-tagline">
          {/* Delicate luxury gold rule divider */}
          <div className="w-12 sm:w-16 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-3 opacity-90" />

          <p className="text-xs xs:text-[13px] sm:text-[14px] font-sans font-bold tracking-[0.26em] xs:tracking-[0.3em] sm:tracking-[0.34em] text-stone-900 uppercase">
            {tagline}
          </p>

          <span className="text-[8.5px] sm:text-[10px] font-sans tracking-[0.38em] text-amber-900/70 uppercase mt-1.5 font-medium">
            Women's Couture &amp; Heritage
          </span>
        </div>
      </div>

      {/* 4. Fine bottom atelier watermark */}
      <div className="absolute bottom-6 sm:bottom-8 text-center pointer-events-none">
        <span className="text-[9px] sm:text-[10px] font-sans tracking-[0.3em] text-stone-400/90 uppercase font-medium">
          New Delhi • Worldwide Shipping
        </span>
      </div>
    </div>
  );
};
