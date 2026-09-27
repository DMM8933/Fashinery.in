import React, { useEffect } from 'react';
import { Heart, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    isWishlistDrawerOpen,
    setIsWishlistDrawerOpen,
    products,
    toggleWishlist,
    addToCart,
    openProductPage,
    setCurrentView,
  } = useStore();

  useEffect(() => {
    if (isWishlistDrawerOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isWishlistDrawerOpen]);

  if (!isWishlistDrawerOpen) return null;

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div id="wishlist-drawer-backdrop" className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsWishlistDrawerOpen(false)}
      />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Saved Wishlist ({wishlistedProducts.length})
            </h3>
          </div>
          <button
            id="btn-close-wishlist"
            onClick={() => setIsWishlistDrawerOpen(false)}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {wishlistedProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-lg font-semibold text-stone-800 mb-1">
              Your wishlist is empty
            </h4>
            <p className="text-xs text-stone-500 max-w-xs mb-6">
              Save your favourite sarees, gowns, and lehengas to revisit them whenever inspiration strikes.
            </p>
            <button
              onClick={() => {
                setIsWishlistDrawerOpen(false);
                setCurrentView('shop');
              }}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-widest font-semibold px-6 py-3 rounded-lg"
            >
              Discover Garments
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-stone-100">
            {wishlistedProducts.map((product) => (
              <div key={product.id} className="pt-4 first:pt-0 flex gap-4">
                {product.images?.[0] && product.images[0].trim() !== '' ? (
                  <img
                    src={product.images[0].trim()}
                    alt={product.name}
                    onClick={() => {
                      setIsWishlistDrawerOpen(false);
                      openProductPage(product.slug);
                    }}
                    className="w-20 h-24 object-cover rounded-lg bg-stone-100 shrink-0 cursor-pointer"
                  />
                ) : (
                  <div
                    onClick={() => {
                      setIsWishlistDrawerOpen(false);
                      openProductPage(product.slug);
                    }}
                    className="w-20 h-24 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-900 font-serif font-bold text-xs shrink-0 cursor-pointer"
                  >
                    {product.name?.slice(0, 2).toUpperCase() || 'ITEM'}
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => {
                          setIsWishlistDrawerOpen(false);
                          openProductPage(product.slug);
                        }}
                        className="font-serif text-sm font-semibold text-stone-900 hover:text-amber-900 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {product.name}
                      </h4>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{product.categoryName}</p>
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

                  <div className="mt-3">
                    <button
                      onClick={() => {
                        const size = product.sizes?.[0] || 'Free Size';
                        const color = product.colors?.[0] || 'Original';
                        addToCart(product, size, color, 1);
                        toggleWishlist(product.id);
                        setIsWishlistDrawerOpen(false);
                      }}
                      className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
