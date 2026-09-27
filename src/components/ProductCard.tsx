import React from 'react';
import { Heart, MessageCircle, ShoppingBag, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    openProductPage,
    wishlist,
    toggleWishlist,
    addToCart,
    getWhatsAppProductUrl,
  } = useStore();

  const isWishlisted = wishlist.includes(product.id);
  const discount = product.discountPercent || (product.mrp > product.sellingPrice ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || 'Free Size';
    const defaultColor = product.colors?.[0] || 'Original';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getWhatsAppProductUrl(product);
    window.open(url, '_blank');
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const primaryImage =
    product.images?.[0] && product.images[0].trim() !== ''
      ? product.images[0].trim()
      : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

  const secondaryImage =
    product.images?.[1] && product.images[1].trim() !== ''
      ? product.images[1].trim()
      : null;

  return (
    <div
      id={`product-card-${product.slug}`}
      onClick={() => openProductPage(product.slug)}
      className="group flex flex-col bg-white rounded-xl overflow-hidden border border-stone-200/80 hover:border-amber-700/40 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-3/4 w-full bg-stone-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover Secondary Image if available */}
        {secondaryImage ? (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
            loading="lazy"
          />
        ) : null}

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.bestseller && (
            <span className="text-[10px] font-bold tracking-wider uppercase bg-stone-900 text-amber-200 px-2 py-0.5 rounded-sm shadow-xs">
              Bestseller
            </span>
          )}
          {product.newArrival && (
            <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-sm border border-amber-300/60 shadow-xs">
              New Arrival
            </span>
          )}
          {discount > 0 && (
            <span className="text-[10px] font-bold tracking-wider uppercase bg-rose-700 text-white px-2 py-0.5 rounded-sm shadow-xs">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          id={`btn-wishlist-${product.id}`}
          onClick={handleWishlistClick}
          className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-rose-600 shadow-xs backdrop-blur-xs transition-colors"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-rose-600 text-rose-600' : ''
            }`}
          />
        </button>

        {/* Quick Action Overlay on Desktop */}
        <div className="absolute inset-x-2 bottom-2 z-10 hidden sm:flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            id={`btn-quick-add-${product.id}`}
            onClick={handleQuickAdd}
            className="flex-1 bg-stone-900/90 hover:bg-stone-900 text-white text-xs font-semibold py-2 px-3 rounded-lg backdrop-blur-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
          <button
            id={`btn-wa-card-${product.id}`}
            onClick={handleWhatsAppClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg backdrop-blur-xs shadow-md transition-colors"
            title="Enquire on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category & Fabric Tag */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span className="uppercase tracking-wider font-medium text-amber-800">
              {product.categoryName}
            </span>
            {product.fabric && (
              <span className="text-stone-400 truncate max-w-[120px]">
                {product.fabric.split(' ')[0]}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-sm sm:text-base font-semibold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="flex items-center gap-1 mt-1.5 text-xs text-stone-600">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="ml-1 font-semibold text-stone-800">{product.rating}</span>
            </div>
            <span className="text-stone-400 text-[11px]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price Row */}
        <div className="mt-3 pt-2 border-t border-stone-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-stone-900">
              ₹{product.sellingPrice.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-xs text-stone-400 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {product.stock <= product.lowStockThreshold && product.stock > 0 && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Mobile Quick Action Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:hidden">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-stone-900 text-white text-[11px] font-medium py-1.5 px-2 rounded-md flex items-center justify-center gap-1"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Add</span>
          </button>
          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-emerald-600 text-white text-[11px] font-medium py-1.5 px-2 rounded-md flex items-center justify-center gap-1"
          >
            <MessageCircle className="w-3 h-3" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
