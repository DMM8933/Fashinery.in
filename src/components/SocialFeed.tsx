import React from 'react';
import { Instagram, ExternalLink } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DEFAULT_COMMUNITY_GALLERY, CommunityGalleryItem } from '../types';

export const OFFICIAL_INSTAGRAM_URL = 'https://www.instagram.com/fashinery.in/';

export const SocialFeed: React.FC = () => {
  const { settings } = useStore();

  // Always use official Fashinery Instagram URL as base
  const defaultInstagramUrl = OFFICIAL_INSTAGRAM_URL;

  // Dynamically retrieve community gallery items from store settings or fallback
  const rawGallery: CommunityGalleryItem[] =
    settings.communityGallery && settings.communityGallery.length > 0
      ? settings.communityGallery
      : DEFAULT_COMMUNITY_GALLERY;

  // Filter only active items and sort by sortOrder
  const galleryItems = rawGallery
    .filter((item) => item.active !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <section id="social-feed-section" className="py-16 bg-[#faf7f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-[0.25em] text-amber-800 uppercase block mb-1">
            Community &amp; Styling
          </span>
          <a
            href={defaultInstagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block group cursor-pointer"
            title="Visit official Fashinery Instagram @fashinery.in"
          >
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
              #FashineryWomen
            </h2>
          </a>
          <p className="text-xs text-stone-600 mt-2">
            Tag us in your cherished celebrations to be featured in our official social gallery.
          </p>
          <div className="mt-3">
            <a
              href={defaultInstagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200/80 px-3.5 py-1.5 rounded-full border border-amber-300/60 shadow-2xs transition-all cursor-pointer"
              title="Follow @fashinery.in on Instagram"
            >
              <Instagram className="w-3.5 h-3.5 text-amber-800" />
              <span>Follow @fashinery.in on Instagram</span>
              <ExternalLink className="w-3 h-3 text-amber-700 ml-0.5" />
            </a>
          </div>
        </div>

        {galleryItems.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-sm">
            No community styling images currently published.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryItems.map((item, idx) => {
              // Ensure URL is either a valid configured post or official profile
              const targetUrl =
                item.instagramUrl && item.instagramUrl.trim()
                  ? item.instagramUrl.trim()
                  : defaultInstagramUrl;

              return (
                <a
                  key={item.id ? `${item.id}-${idx}` : `gallery-slot-${idx}`}
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-xl overflow-hidden shadow-xs cursor-pointer block border border-stone-200/60 bg-stone-100"
                  aria-label={`View look on official Fashinery Instagram`}
                >
                  {item.imageUrl && item.imageUrl.trim() !== '' ? (
                    <img
                      src={item.imageUrl.trim()}
                      alt={item.title || `Fashinery look ${idx + 1}`}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-200" />
                  )}
                  <div className="absolute inset-0 bg-stone-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-3 text-center backdrop-blur-2xs">
                    <Instagram className="w-7 h-7 text-amber-300 mb-1.5 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-xs font-semibold tracking-wide">
                      {item.handle || '@fashinery.in'}
                    </span>
                    {item.likes && (
                      <span className="text-[10px] text-stone-300 mt-0.5">{item.likes} loves</span>
                    )}
                    <span className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 text-amber-200 px-2.5 py-1 rounded-md border border-white/20 shadow-xs">
                      <span>View on Instagram</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};


