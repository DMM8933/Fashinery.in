import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CategoryGrid: React.FC = () => {
  const { categories, setSelectedCategoryFilter, setCurrentView } = useStore();
  const activeCategories = categories.filter((c) => c.isActive);

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategoryFilter(categorySlug);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="category-section" className="py-16 sm:py-20 bg-[#faf7f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-[0.25em] text-amber-800 uppercase block mb-2">
            Curated Wardrobe
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-bold tracking-tight">
            Shop By Silhouette
          </h2>
          <div className="w-12 h-0.5 bg-amber-800 mx-auto mt-4 mb-4" />
          <p className="text-stone-600 text-sm leading-relaxed">
            From imperial Banarasi sarees to structured couture dresses, explore handpicked collections designed for unforgettable occasions.
          </p>
        </div>

        {/* Categories Bento / Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {activeCategories.map((category) => (
            <div
              key={category.id}
              id={`cat-card-${category.slug}`}
              onClick={() => handleCategoryClick(category.slug)}
              className="group relative cursor-pointer overflow-hidden rounded-xl bg-stone-100 shadow-xs hover:shadow-md transition-all duration-500"
            >
              {/* Aspect Ratio Container for Tall Fashion Cards */}
              <div className="aspect-3/4 w-full overflow-hidden relative">
                {category.image && category.image.trim() !== '' ? (
                  <img
                    src={category.image.trim()}
                    alt={category.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-800 flex items-center justify-center text-amber-200 font-serif font-bold text-lg">
                    {category.name}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Floating Category Info */}
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 text-white text-center flex flex-col items-center">
                  <h3 className="font-serif text-base sm:text-lg font-semibold tracking-wide text-white group-hover:text-amber-200 transition-colors flex items-center gap-1">
                    <span>{category.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300 text-amber-300" />
                  </h3>
                  {category.description && (
                    <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5 font-normal">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
