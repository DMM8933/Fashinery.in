import React, { useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    products,
    openProductPage,
  } = useStore();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const query = searchQuery.trim().toLowerCase();
  const results = query
    ? products.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.categoryName?.toLowerCase().includes(query) ||
          p.fabric?.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query) ||
          p.shortDescription?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      )
    : [];

  const handleSelectProduct = (slug: string) => {
    openProductPage(slug);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div id="search-modal-backdrop" className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-stone-200">
        {/* Search Input Header */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-stone-200">
          <Search className="w-5 h-5 text-stone-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            id="input-global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Sarees, Lehengas, Kurtis, Fabrics or SKUs..."
            className="w-full text-base sm:text-lg text-stone-900 placeholder:text-stone-400 focus:outline-hidden bg-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-stone-400 hover:text-stone-700 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          {query === '' ? (
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-stone-400 mb-3">
                Trending Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {['Banarasi Saree', 'Velvet Lehenga', 'Anarkali Set', 'Organza Silk', 'Peplum Blouse'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="text-xs bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-stone-500 font-medium">
                Found {results.length} garment{results.length > 1 ? 's' : ''}
              </p>
              {results.map((product) => (
                <div
                  key={product.id}
                  id={`search-item-${product.slug}`}
                  onClick={() => handleSelectProduct(product.slug)}
                  className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors border border-transparent hover:border-stone-200"
                >
                  {product.images?.[0] && product.images[0].trim() !== '' ? (
                    <img
                      src={product.images[0].trim()}
                      alt={product.name}
                      className="w-14 h-18 object-cover rounded-lg shrink-0 bg-stone-100"
                    />
                  ) : (
                    <div className="w-14 h-18 rounded-lg shrink-0 bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-900 font-serif font-bold text-xs">
                      {product.name?.slice(0, 2).toUpperCase() || 'ITEM'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                      {product.categoryName}
                    </span>
                    <h4 className="font-serif text-sm font-semibold text-stone-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-stone-500 truncate">{product.fabric}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-stone-900">
                        ₹{product.sellingPrice.toLocaleString('en-IN')}
                      </span>
                      {product.mrp > product.sellingPrice && (
                        <span className="text-xs text-stone-400 line-through">
                          ₹{product.mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-stone-500">
              <p className="font-serif text-lg text-stone-700 mb-1">No collections match "{searchQuery}"</p>
              <p className="text-xs text-stone-500">
                Try searching for broader terms like "Silk", "Saree", or "Lehenga".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
