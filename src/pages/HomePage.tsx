import React, { useState } from 'react';
import { Sparkles, Star, ArrowRight } from 'lucide-react';
import { CategoryGrid } from '../components/CategoryGrid';
import { HeroSlider } from '../components/HeroSlider';
import { ProductCard } from '../components/ProductCard';
import { PromotionalBanner } from '../components/PromotionalBanner';
import { SocialFeed } from '../components/SocialFeed';
import { SpecialOfferBanner } from '../components/SpecialOfferBanner';
import { WhyShopWithUs } from '../components/WhyShopWithUs';
import { useStore } from '../context/StoreContext';

export const HomePage: React.FC = () => {
  const { products, reviews, setCurrentView, setSelectedCategoryFilter } = useStore();
  const [activeTab, setActiveTab] = useState<'featured' | 'newArrivals' | 'bestsellers'>('featured');

  // Filter products based on active home tab
  const displayedProducts = products.filter((p) => {
    if (!p.published) return false;
    if (activeTab === 'featured') return p.featured;
    if (activeTab === 'newArrivals') return p.newArrival;
    if (activeTab === 'bestsellers') return p.bestseller;
    return true;
  }).slice(0, 8);

  const approvedReviews = reviews.filter((r) => r.status === 'approved');

  return (
    <div id="home-page-container" className="space-y-0">
      {/* 1. Hero Carousel */}
      <HeroSlider />

      {/* 2. Shop By Silhouette (Category Grid) */}
      <CategoryGrid />

      {/* 3. Featured Collection Showcase with Tab Switching */}
      <section id="curated-showcase-section" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold tracking-[0.25em] text-amber-800 uppercase block mb-2">
              Bespoke Edit
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-bold tracking-tight">
              Cherished Haute Coutures
            </h2>
            <div className="w-12 h-0.5 bg-amber-800 mx-auto mt-4 mb-6" />

            {/* Collection Tabs */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 border-b border-stone-200 pb-2">
              <button
                id="tab-featured"
                onClick={() => setActiveTab('featured')}
                className={`text-xs sm:text-sm font-semibold tracking-wider uppercase pb-2 px-3 transition-colors cursor-pointer ${
                  activeTab === 'featured'
                    ? 'text-amber-900 border-b-2 border-amber-900'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                Featured Edit
              </button>
              <button
                id="tab-new-arrivals"
                onClick={() => setActiveTab('newArrivals')}
                className={`text-xs sm:text-sm font-semibold tracking-wider uppercase pb-2 px-3 transition-colors cursor-pointer ${
                  activeTab === 'newArrivals'
                    ? 'text-amber-900 border-b-2 border-amber-900'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                New Arrivals
              </button>
              <button
                id="tab-bestsellers"
                onClick={() => setActiveTab('bestsellers')}
                className={`text-xs sm:text-sm font-semibold tracking-wider uppercase pb-2 px-3 transition-colors cursor-pointer ${
                  activeTab === 'bestsellers'
                    ? 'text-amber-900 border-b-2 border-amber-900'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                Iconic Bestsellers
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <button
              id="btn-home-view-all"
              onClick={() => {
                setSelectedCategoryFilter(null);
                setCurrentView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-widest font-semibold px-8 py-3.5 rounded-sm shadow-md transition-all cursor-pointer"
            >
              <span>Explore Complete Atelier</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Special Festive Countdown Offer */}
      <SpecialOfferBanner />

      {/* 5. Promotional Story Banner */}
      <PromotionalBanner />

      {/* 6. Why Shop With Us Pillars */}
      <WhyShopWithUs />

      {/* 7. Verified Client Reviews Carousel */}
      <section id="testimonials-section" className="py-16 sm:py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold tracking-[0.25em] text-amber-800 uppercase block mb-2">
              Patron Impressions
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-bold tracking-tight">
              Words From Fashinery Connoisseurs
            </h2>
            <div className="w-12 h-0.5 bg-amber-800 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {approvedReviews.slice(0, 3).map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Stars */}
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  {rev.title && (
                    <h3 className="font-serif text-base font-semibold text-stone-900 mb-2">
                      "{rev.title}"
                    </h3>
                  )}
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-xs text-stone-900 block">
                      {rev.userName}
                    </span>
                    {rev.userCity && (
                      <span className="text-[11px] text-stone-400">{rev.userCity}</span>
                    )}
                  </div>
                  {rev.isVerified && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified Buyer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Social Community Feed */}
      <SocialFeed />
    </div>
  );
};
