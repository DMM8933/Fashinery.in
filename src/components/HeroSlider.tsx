import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const HeroSlider: React.FC = () => {
  const { banners, setCurrentView, setSelectedCategoryFilter } = useStore();
  const heroBanners = banners.filter((b) => b.position === 'hero' && b.isActive);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slides every 6 seconds
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  if (heroBanners.length === 0) return null;

  const handleCtaClick = (url?: string) => {
    if (!url) {
      setCurrentView('shop');
      return;
    }
    if (url.includes('category=')) {
      const match = url.match(/category=([^&]+)/);
      if (match) {
        setSelectedCategoryFilter(match[1]);
        setCurrentView('shop');
        return;
      }
    }
    if (url.startsWith('/shop')) {
      setCurrentView('shop');
    } else if (url.startsWith('/contact')) {
      setCurrentView('contact');
    } else {
      window.location.href = url;
    }
  };

  const slide = heroBanners[currentSlide] || heroBanners[0];

  return (
    <section id="hero-slider-section" className="relative w-full overflow-hidden bg-stone-950">
      <div className="relative h-[550px] sm:h-[620px] lg:h-[700px] w-full">
        {/* Slide Image with Fade Animation */}
        {heroBanners.map((item, idx) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Responsive Images: Desktop and Mobile */}
            <picture>
              {item.mobileImage && item.mobileImage.trim() !== '' ? (
                <source media="(max-width: 640px)" srcSet={item.mobileImage.trim()} />
              ) : null}
              {item.desktopImage && item.desktopImage.trim() !== '' ? (
                <img
                  src={item.desktopImage.trim()}
                  alt={item.title}
                  className="w-full h-full object-cover object-center"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div className="w-full h-full bg-stone-900" />
              )}
            </picture>

            {/* Gradient Scrim for Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent sm:from-black/70 sm:via-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Content Container */}
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-xl text-white space-y-4 sm:space-y-6">
                  {/* Badge & Subtitle */}
                  <div className="flex items-center gap-2">
                    {item.discountBadge && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-[0.2em] uppercase bg-amber-400 text-stone-950 px-2.5 py-1 rounded-sm shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        {item.discountBadge}
                      </span>
                    )}
                    {item.subtitle && (
                      <span className="text-xs font-semibold tracking-[0.25em] text-amber-200 uppercase">
                        {item.subtitle}
                      </span>
                    )}
                  </div>

                  {/* Heading */}
                  <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-50 leading-[1.15]">
                    {item.title}
                  </h1>

                  {/* Description */}
                  {item.description && (
                    <p className="text-sm sm:text-base text-stone-300 font-normal leading-relaxed max-w-lg line-clamp-3">
                      {item.description}
                    </p>
                  )}

                  {/* CTA Button */}
                  <div className="pt-2">
                    <button
                      id={`hero-cta-btn-${idx}`}
                      onClick={() => handleCtaClick(item.buttonUrl)}
                      className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs sm:text-sm tracking-[0.15em] uppercase px-8 py-3.5 rounded-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5"
                    >
                      {item.buttonText || 'Explore Collection'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Arrows */}
        {heroBanners.length > 1 && (
          <>
            <button
              id="hero-arrow-prev"
              onClick={() =>
                setCurrentSlide((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1))
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-xs transition-colors cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              id="hero-arrow-next"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % heroBanners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-xs transition-colors cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Slide Dots Indicator */}
        {heroBanners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2">
            {heroBanners.map((_, dotIdx) => (
              <button
                key={dotIdx}
                id={`hero-dot-${dotIdx}`}
                onClick={() => setCurrentSlide(dotIdx)}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                  dotIdx === currentSlide ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
