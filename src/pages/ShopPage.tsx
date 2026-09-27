import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

const getCategoryTitle = (slug: string | null, categories: { slug: string; name: string }[]) => {
  if (!slug) return 'Complete Wardrobe Archive';
  const titles: Record<string, string> = {
    'all-products': 'All Products Archive',
    'new-arrivals': 'New Arrivals — Latest Additions',
    'bestsellers': 'Best Sellers — Customer Favorites',
    'sarees': 'Sarees Collection',
    'kurtis': 'Kurtis & Anarkalis',
    'kurta-sets': 'Kurta Sets & Suits',
    'dresses': 'Dresses & Evening Gowns',
    'tops': 'Tops & Blouses',
    'western-wear': 'Western Wear',
    'ethnic-wear': 'Ethnic Wear & Handcrafted Heritage',
    'party-wear': 'Festive & Party Wear',
    'co-ords': 'Co-ord Sets',
  };
  if (titles[slug]) return titles[slug];
  const found = categories.find((c) => c.slug === slug);
  if (found) return found.name;
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const matchProductCategory = (p: any, filterSlug: string, categories: any[]) => {
  const s = filterSlug.toLowerCase();
  if (s === 'all' || s === 'all-products') return true;
  if (s === 'new-arrivals') return Boolean(p.newArrival);
  if (s === 'bestsellers' || s === 'best-sellers') return Boolean(p.bestseller);
  if (s === 'sarees') {
    return (
      p.categoryId === 'cat-sarees' ||
      p.categoryName?.toLowerCase() === 'sarees' ||
      p.name?.toLowerCase().includes('saree') ||
      p.subCategory?.toLowerCase().includes('saree')
    );
  }
  if (s === 'kurtis') {
    return (
      p.categoryId === 'cat-kurtis' ||
      p.categoryName?.toLowerCase() === 'kurtis' ||
      p.name?.toLowerCase().includes('kurti') ||
      p.name?.toLowerCase().includes('anarkali') ||
      p.subCategory?.toLowerCase().includes('kurti')
    );
  }
  if (s === 'kurta-sets') {
    return (
      p.name?.toLowerCase().includes('kurta') ||
      p.name?.toLowerCase().includes('set') ||
      p.name?.toLowerCase().includes('suit') ||
      p.name?.toLowerCase().includes('anarkali') ||
      p.subCategory?.toLowerCase().includes('suit') ||
      p.subCategory?.toLowerCase().includes('set') ||
      p.categoryName?.toLowerCase().includes('kurta')
    );
  }
  if (s === 'dresses') {
    return (
      p.categoryId === 'cat-dresses' ||
      p.categoryName?.toLowerCase() === 'dresses' ||
      p.name?.toLowerCase().includes('dress') ||
      p.name?.toLowerCase().includes('gown') ||
      p.name?.toLowerCase().includes('maxi') ||
      p.subCategory?.toLowerCase().includes('dress') ||
      p.subCategory?.toLowerCase().includes('gown')
    );
  }
  if (s === 'tops') {
    return (
      p.categoryId === 'cat-tops' ||
      p.categoryName?.toLowerCase() === 'tops' ||
      p.name?.toLowerCase().includes('top') ||
      p.name?.toLowerCase().includes('blouse') ||
      p.name?.toLowerCase().includes('shirt') ||
      p.subCategory?.toLowerCase().includes('top')
    );
  }
  if (s === 'western-wear') {
    return (
      p.categoryName === 'Dresses' ||
      p.categoryName === 'Tops' ||
      p.name?.toLowerCase().includes('maxi') ||
      p.name?.toLowerCase().includes('dress') ||
      p.name?.toLowerCase().includes('gown') ||
      p.name?.toLowerCase().includes('peplum') ||
      p.name?.toLowerCase().includes('top') ||
      p.categoryName?.toLowerCase().includes('western')
    );
  }
  if (s === 'ethnic-wear') {
    return (
      p.categoryName === 'Sarees' ||
      p.categoryName === 'Lehengas' ||
      p.categoryName === 'Kurtis' ||
      p.categoryName === 'Bottom Wear' ||
      p.name?.toLowerCase().includes('saree') ||
      p.name?.toLowerCase().includes('lehenga') ||
      p.name?.toLowerCase().includes('sharara') ||
      p.name?.toLowerCase().includes('anarkali') ||
      p.categoryName?.toLowerCase().includes('ethnic')
    );
  }
  if (s === 'party-wear') {
    return Boolean(
      p.featured ||
      p.bestseller ||
      (p.sellingPrice && p.sellingPrice >= 4500) ||
      p.name?.toLowerCase().includes('zardozi') ||
      p.name?.toLowerCase().includes('silk') ||
      p.name?.toLowerCase().includes('gown') ||
      p.name?.toLowerCase().includes('bridal') ||
      p.name?.toLowerCase().includes('banarasi')
    );
  }
  if (s === 'co-ords') {
    return (
      p.name?.toLowerCase().includes('set') ||
      p.name?.toLowerCase().includes('suit') ||
      p.name?.toLowerCase().includes('co-ord') ||
      p.subCategory?.toLowerCase().includes('set') ||
      p.subCategory?.toLowerCase().includes('suit') ||
      p.name?.toLowerCase().includes('sharara')
    );
  }
  const cat = categories.find((c) => c.slug === s || c.id === s);
  if (cat) {
    return p.categoryId === cat.id || p.categoryName === cat.name;
  }
  return true;
};

export const ShopPage: React.FC = () => {
  const {
    products,
    categories,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
  } = useStore();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(35000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');

  // Collect unique fabrics & sizes from all products dynamically
  const allFabrics = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.fabric) {
        // Grab main fabric name
        const primary = p.fabric.split(' ')[0];
        set.add(primary);
      }
    });
    return Array.from(set);
  }, [products]);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.sizeOptions && p.sizeOptions.length > 0) {
        p.sizeOptions.filter((s) => s.isEnabled !== false).forEach((s) => set.add(s.name.trim()));
      } else if (p.sizes && p.sizes.length > 0) {
        p.sizes.forEach((s) => set.add(s.trim()));
      }
    });
    if (set.size === 0) return ['XS', 'S', 'M', 'L', 'XL', 'Free Size'];
    return Array.from(set);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.published) return false;
        if (selectedCategoryFilter) {
          if (!matchProductCategory(p, selectedCategoryFilter, categories)) {
            return false;
          }
        }
        if (selectedFabric && !p.fabric.toLowerCase().includes(selectedFabric.toLowerCase())) {
          return false;
        }
        if (selectedSize) {
          const hasSize = (p.sizeOptions && p.sizeOptions.length > 0)
            ? p.sizeOptions.some((s) => s.isEnabled !== false && s.name.trim().toLowerCase() === selectedSize.trim().toLowerCase())
            : p.sizes?.some((s) => s.trim().toLowerCase() === selectedSize.trim().toLowerCase());
          if (!hasSize) {
            return false;
          }
        }
        if (p.sellingPrice > maxPrice) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
        if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategoryFilter, selectedFabric, selectedSize, maxPrice, sortBy, categories]);

  const resetFilters = () => {
    setSelectedCategoryFilter(null);
    setSelectedFabric(null);
    setSelectedSize(null);
    setMaxPrice(35000);
    setSortBy('featured');
  };

  const hasActiveFilters = selectedCategoryFilter || selectedFabric || selectedSize || maxPrice < 35000;

  return (
    <div id="shop-page-container" className="min-h-screen bg-[#faf7f2] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs font-semibold tracking-[0.25em] text-amber-800 uppercase block mb-1">
            Fashinery Haute &amp; Prêt
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-bold">
            {getCategoryTitle(selectedCategoryFilter, categories)}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-2">
            Discerning craftsmanship woven from pure silken threads, hand embroidery, and regal Indian tapestries.
          </p>
        </div>

        {/* Mobile Filter Toggle & Sort Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-xs border border-stone-200/80 mb-6 lg:hidden">
          <button
            id="btn-mobile-filter-toggle"
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-800"
          >
            <Filter className="w-4 h-4 text-amber-800" />
            <span>Refine Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-700" />
            )}
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-md p-1.5 text-xs font-medium focus:outline-hidden"
            >
              <option value="featured">Featured</option>
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-800" />
                  <span>Refine Selection</span>
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-amber-800 hover:text-amber-950 font-medium underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
                  Silhouettes
                </h4>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedCategoryFilter(null)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-md transition-colors flex items-center justify-between ${
                      selectedCategoryFilter === null
                        ? 'bg-amber-100/70 text-amber-950 font-semibold'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>All Silhouettes</span>
                    <span className="text-[11px] text-stone-400">({products.length})</span>
                  </button>
                  {categories.map((cat) => {
                    const count = products.filter(
                      (p) => p.categoryId === cat.id || p.categoryName === cat.name
                    ).length;
                    return (
                      <button
                        key={cat.id}
                        id={`filter-cat-${cat.slug}`}
                        onClick={() => setSelectedCategoryFilter(cat.slug)}
                        className={`w-full text-left text-xs py-1.5 px-2.5 rounded-md transition-colors flex items-center justify-between ${
                          selectedCategoryFilter === cat.slug
                            ? 'bg-amber-100/70 text-amber-950 font-semibold'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-[11px] text-stone-400">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Max Price
                  </h4>
                  <span className="text-xs font-semibold text-stone-900">
                    ₹{maxPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="35000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-amber-800 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>₹2,000</span>
                  <span>₹35,000+</span>
                </div>
              </div>

              {/* Fabric Filter */}
              <div className="pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2.5">
                  Fabric &amp; Weave
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {allFabrics.map((fabric) => (
                    <button
                      key={fabric}
                      onClick={() =>
                        setSelectedFabric(selectedFabric === fabric ? null : fabric)
                      }
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                        selectedFabric === fabric
                          ? 'bg-stone-900 text-amber-200 font-semibold'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {fabric}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div className="pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2.5">
                  Sizes Available
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className={`text-xs py-1.5 text-center rounded-md border transition-colors ${
                        selectedSize === size
                          ? 'bg-amber-900 border-amber-900 text-white font-bold'
                          : 'border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {/* Desktop Sort & Counter Bar */}
            <div className="hidden lg:flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
              <span className="text-xs text-stone-500">
                Displaying <strong className="text-stone-900">{filteredProducts.length}</strong> creations
              </span>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-xs text-stone-500">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-white border border-stone-200 rounded-md px-3 py-1.5 text-xs font-medium focus:outline-hidden focus:border-amber-800"
                >
                  <option value="featured">Featured Curations</option>
                  <option value="newest">New Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Patron Rating</option>
                </select>
              </div>
            </div>

            {/* Active Filters Pill Row */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-stone-400">Active filters:</span>
                {selectedCategoryFilter && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                    <span>{categories.find((c) => c.slug === selectedCategoryFilter)?.name}</span>
                    <X
                      className="w-3.5 h-3.5 cursor-pointer"
                      onClick={() => setSelectedCategoryFilter(null)}
                    />
                  </span>
                )}
                {selectedFabric && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                    <span>{selectedFabric}</span>
                    <X
                      className="w-3.5 h-3.5 cursor-pointer"
                      onClick={() => setSelectedFabric(null)}
                    />
                  </span>
                )}
                {selectedSize && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                    <span>Size: {selectedSize}</span>
                    <X
                      className="w-3.5 h-3.5 cursor-pointer"
                      onClick={() => setSelectedSize(null)}
                    />
                  </span>
                )}
                {maxPrice < 35000 && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                    <span>Under ₹{maxPrice.toLocaleString('en-IN')}</span>
                    <X
                      className="w-3.5 h-3.5 cursor-pointer"
                      onClick={() => setMaxPrice(35000)}
                    />
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-xs text-stone-500 hover:text-stone-900 underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-4">
                <h3 className="font-serif text-xl font-semibold text-stone-900">
                  No Garments Match These Specifications
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try adjusting or clearing your price, silhouette, or fabric filters to reveal more bespoke pieces.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-stone-900 text-white text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slide-over */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="font-serif text-lg font-bold text-stone-900">Filter Collections</h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Category
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategoryFilter(null)}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded ${
                      !selectedCategoryFilter ? 'bg-amber-100 font-semibold' : ''
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategoryFilter(c.slug)}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded ${
                        selectedCategoryFilter === c.slug ? 'bg-amber-100 font-semibold' : ''
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Max Price</span>
                  <span>₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="35000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-amber-800"
                />
              </div>

              {/* Fabric */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Fabric
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {allFabrics.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFabric(selectedFabric === f ? null : f)}
                      className={`text-xs px-2.5 py-1 rounded ${
                        selectedFabric === f ? 'bg-stone-900 text-white' : 'bg-stone-100'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200 space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-stone-900 text-white text-xs uppercase tracking-wider font-semibold py-3 rounded-lg"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                onClick={resetFilters}
                className="w-full text-stone-600 text-xs py-2 hover:underline"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
