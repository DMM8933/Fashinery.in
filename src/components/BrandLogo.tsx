import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';

interface BrandLogoProps {
  className?: string;
  showSlogan?: boolean;
  sloganText?: string;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSkeleton?: boolean;
  enableCrossFade?: boolean;
}

// Synchronous resolution of the active brand logo to prevent any flash of old logos on page refresh
export const getActiveBrandLogo = (storeLogo?: string | null): string => {
  if (typeof storeLogo === 'string' && storeLogo.trim()) {
    return storeLogo.trim();
  }
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('fashinery_brand_logo');
      if (cached && cached.trim()) return cached.trim();
      const settingsStr = localStorage.getItem('fashinery_site_settings');
      if (settingsStr) {
        const parsed = JSON.parse(settingsStr);
        if (typeof parsed?.logoUrl === 'string' && parsed.logoUrl.trim()) return parsed.logoUrl.trim();
      }
    } catch {
      // Ignore
    }
  }
  return '/assets/fashinery-custom-logo.jpg';
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  showSlogan = false,
  sloganText,
  theme = 'light',
  size = 'md',
  showSkeleton = true,
  enableCrossFade = true,
}) => {
  const isDark = theme === 'dark';
  
  let storeSettings: any = null;
  try {
    const store = useStore();
    storeSettings = store?.settings;
  } catch {
    // BrandLogo safely usable outside StoreProvider if needed
  }

  // Sizing scales matching responsive typography & aspect ratio
  const sizeConfig = {
    sm: {
      height: 'h-7 xs:h-8 sm:h-9',
      maxW: 'max-w-[120px] sm:max-w-[150px]',
      minW: 'min-w-[90px] sm:min-w-[110px]',
      skeletonH: 'h-7 xs:h-8 sm:h-9',
      skeletonW: 'w-24 xs:w-28 sm:w-32',
      sloganStyle: 'text-[7.5px] xs:text-[8px] tracking-[0.28em] mt-0.5',
    },
    md: {
      height: 'h-8 xs:h-9 sm:h-11 md:h-12',
      maxW: 'max-w-[140px] xs:max-w-[170px] sm:max-w-[210px] md:max-w-[240px]',
      minW: 'min-w-[110px] sm:min-w-[150px]',
      skeletonH: 'h-8 xs:h-9 sm:h-11 md:h-12',
      skeletonW: 'w-32 xs:w-36 sm:w-44 md:w-48',
      sloganStyle: 'text-[8.5px] sm:text-[10px] tracking-[0.32em] mt-1',
    },
    lg: {
      height: 'h-11 sm:h-14 md:h-16',
      maxW: 'max-w-[210px] sm:max-w-[270px] md:max-w-[310px]',
      minW: 'min-w-[160px] sm:min-w-[220px]',
      skeletonH: 'h-11 sm:h-14 md:h-16',
      skeletonW: 'w-40 sm:w-52 md:w-60',
      sloganStyle: 'text-[10px] sm:text-xs tracking-[0.36em] mt-1.5',
    },
    xl: {
      height: 'h-14 sm:h-18 md:h-22',
      maxW: 'max-w-[260px] sm:max-w-[330px] md:max-w-[390px]',
      minW: 'min-w-[200px] sm:min-w-[260px]',
      skeletonH: 'h-14 sm:h-18 md:h-22',
      skeletonW: 'w-52 sm:w-64 md:w-72',
      sloganStyle: 'text-xs sm:text-sm tracking-[0.4em] mt-2',
    },
  }[size];

  // Derive initial active logo immediately from cache or fallback
  const preferredLogo = getActiveBrandLogo(storeSettings?.logoUrl);
  const [activeSrc, setActiveSrc] = useState<string>(preferredLogo);
  const [previousSrc, setPreviousSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const crossFadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if image is already cached and complete in browser memory on mount or src change
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [activeSrc]);

  // Handle updates to store logo smoothly via cross-fade
  useEffect(() => {
    const nextLogo = getActiveBrandLogo(storeSettings?.logoUrl);
    if (nextLogo && nextLogo !== activeSrc) {
      if (enableCrossFade && isLoaded) {
        // Buffer previous image to cross-fade seamlessly
        setPreviousSrc(activeSrc);
        setIsLoaded(false);
        setActiveSrc(nextLogo);
        setHasError(false);
      } else {
        setActiveSrc(nextLogo);
        setHasError(false);
      }
    }
  }, [storeSettings?.logoUrl, enableCrossFade]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (crossFadeTimeoutRef.current) {
        clearTimeout(crossFadeTimeoutRef.current);
      }
    };
  }, []);

  const handleActiveLoad = () => {
    setIsLoaded(true);
    if (previousSrc) {
      // Keep previous image visible for the duration of the cross-fade then clean up
      if (crossFadeTimeoutRef.current) clearTimeout(crossFadeTimeoutRef.current);
      crossFadeTimeoutRef.current = setTimeout(() => {
        setPreviousSrc(null);
      }, 500);
    }
  };

  const handleImageError = () => {
    if (!hasError && activeSrc !== '/assets/fashinery-custom-logo.jpg') {
      setHasError(true);
      setActiveSrc('/assets/fashinery-custom-logo.jpg');
    }
  };

  const filterStyles = isDark
    ? 'brightness-110 contrast-105 drop-shadow-[0_2px_10px_rgba(245,163,184,0.3)]'
    : 'contrast-110 drop-shadow-[0_1px_2px_rgba(111,26,48,0.25)]';

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* Relative logo container ensuring zero layout shift */}
      <div className={`relative flex items-center justify-center ${sizeConfig.height} ${sizeConfig.minW}`}>
        {/* 1. Subtle Skeleton Loader with shimmer (shown during initial load or before image is ready) */}
        {showSkeleton && !isLoaded && !previousSrc && (
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ease-in-out ${
              isLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            aria-hidden="true"
          >
            <div
              className={`${sizeConfig.skeletonH} ${sizeConfig.skeletonW} rounded-md relative overflow-hidden flex items-center justify-center ${
                isDark
                  ? 'bg-stone-900/90 border border-stone-800'
                  : 'bg-stone-100/90 border border-amber-200/50 shadow-xs'
              }`}
            >
              {/* Shimmer sweep bar */}
              <div
                className={`absolute inset-0 -translate-x-full animate-logo-shimmer bg-gradient-to-r ${
                  isDark
                    ? 'from-transparent via-stone-700/40 to-transparent'
                    : 'from-transparent via-amber-200/45 to-transparent'
                }`}
              />
              {/* Gentle brand silhouette placeholder */}
              <div className="flex items-center gap-1.5 opacity-40 px-3">
                <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-amber-400' : 'bg-amber-600'}`} />
                <div className={`h-1.5 rounded-full w-12 sm:w-20 ${isDark ? 'bg-stone-700' : 'bg-amber-300/70'}`} />
                <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-amber-400' : 'bg-amber-600'}`} />
              </div>
            </div>
          </div>
        )}

        {/* 2. Previous Logo image layer for smooth cross-fading when logo URL updates */}
        {previousSrc && previousSrc.trim() !== '' && enableCrossFade ? (
          <img
            src={previousSrc.trim()}
            alt="Previous Logo State"
            aria-hidden="true"
            className={`absolute inset-0 m-auto ${sizeConfig.height} ${sizeConfig.maxW} w-auto object-contain pointer-events-none transition-opacity duration-500 ease-in-out ${
              isLoaded ? 'opacity-0' : 'opacity-100'
            } ${filterStyles}`}
          />
        ) : null}

        {/* 3. Active Brand Logo Image with smooth cross-fade transition */}
        <img
          ref={imgRef}
          src={activeSrc && activeSrc.trim() !== '' ? activeSrc.trim() : '/assets/fashinery-custom-logo.jpg'}
          alt={storeSettings?.businessName || 'Fashinery'}
          onLoad={handleActiveLoad}
          onError={handleImageError}
          className={`${sizeConfig.height} ${sizeConfig.maxW} w-auto object-contain font-bold ${
            enableCrossFade ? 'transition-all duration-500 ease-in-out' : ''
          } ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
          } ${filterStyles}`}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>

      {showSlogan && (
        <span
          className={`block uppercase font-bold transition-colors duration-200 ${sizeConfig.sloganStyle} ${
            isDark ? 'text-rose-200 font-bold' : 'text-stone-950 font-bold'
          }`}
          style={{ letterSpacing: '0.3em' }}
        >
          {sloganText || storeSettings?.tagline || 'Elegance in Every Look'}
        </span>
      )}
    </div>
  );
};

