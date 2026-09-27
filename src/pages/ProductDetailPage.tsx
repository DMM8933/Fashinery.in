import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Check,
  MapPin,
  Ruler,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { ProductColorOption } from '../types';

export const ProductDetailPage: React.FC = () => {
  const {
    products,
    selectedProductSlug,
    addToCart,
    wishlist,
    toggleWishlist,
    setCurrentView,
    getWhatsAppProductUrl,
    submitReview,
    reviews,
  } = useStore();

  const product = products.find((p) => p.slug === selectedProductSlug) || products[0];

  // Derive dynamic enabled colors and sizes from Firestore configuration
  const availableColors: ProductColorOption[] = useMemo(() => {
    if (!product) return [];
    if (product.colorOptions && product.colorOptions.length > 0) {
      const enabled = product.colorOptions.filter((c) => c.isEnabled !== false && c.name?.trim());
      if (enabled.length > 0) return enabled;
    }
    return (product.colors || ['Original']).map((name, idx): ProductColorOption => ({
      id: `col-${idx}`,
      name,
      hexCode: undefined,
      images: undefined,
      galleryImages: undefined,
      isEnabled: true,
    }));
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product) return [];
    if (product.sizeOptions && product.sizeOptions.length > 0) {
      const enabled = product.sizeOptions.filter((s) => s.isEnabled !== false && s.name?.trim());
      if (enabled.length > 0) return enabled;
    }
    return (product.sizes || ['Free Size']).map((name, idx) => ({
      id: `sz-${idx}`,
      name,
      isEnabled: true,
    }));
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0]?.name || product?.sizes?.[0] || 'Free Size');
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0]?.name || product?.colors?.[0] || 'Original');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'shipping' | 'reviews'>('details');

  // Active color option
  const activeColorOption = useMemo(() => {
    return availableColors.find(
      (c) => c.name.toLowerCase() === selectedColor.toLowerCase()
    );
  }, [availableColors, selectedColor]);

  // Gallery images for customer view:
  // If the customer-selected color has color-specific images configured by admin, show them!
  // If not, fallback to the general product images configured by admin.
  const activeGalleryImages = useMemo(() => {
    const fallbackImage = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
    if (activeColorOption?.images && activeColorOption.images.length > 0) {
      const valid = activeColorOption.images.filter((img) => typeof img === 'string' && img.trim() !== '');
      if (valid.length > 0) return valid;
    }
    if (activeColorOption?.galleryImages && activeColorOption.galleryImages.length > 0) {
      const valid = activeColorOption.galleryImages.map((g) => g.url).filter((u) => typeof u === 'string' && u.trim() !== '');
      if (valid.length > 0) return valid;
    }
    if (product?.images && product.images.length > 0) {
      const valid = product.images.filter((img) => typeof img === 'string' && img.trim() !== '');
      if (valid.length > 0) return valid;
    }
    return [fallbackImage];
  }, [activeColorOption, product?.images]);

  // Match active variant based on selected color and size
  const activeVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    return (
      product.variants.find(
        (v) =>
          v.color.trim().toLowerCase() === selectedColor.trim().toLowerCase() &&
          v.size.trim().toLowerCase() === selectedSize.trim().toLowerCase() &&
          v.isEnabled !== false
      ) || null
    );
  }, [product, selectedColor, selectedSize]);

  // Derived pricing, stock, SKU and discount
  const currentSellingPrice =
    activeVariant?.sellingPrice !== undefined ? activeVariant.sellingPrice : product?.sellingPrice || 0;
  const currentMrp =
    activeVariant?.mrp !== undefined ? activeVariant.mrp : product?.mrp || currentSellingPrice;
  const currentSku = activeVariant?.sku || product?.sku || '';
  const currentStock =
    activeVariant?.stock !== undefined ? activeVariant.stock : product?.stock || 0;
  const isOutOfStock = currentStock <= 0;
  const discount =
    currentMrp > currentSellingPrice
      ? Math.round(((currentMrp - currentSellingPrice) / currentMrp) * 100)
      : product?.discountPercent || 0;

  // Pincode Delivery Checker State
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{
    valid: boolean;
    date: string;
    cod: boolean;
  } | null>(null);

  // Size Chart Modal
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  // Review Form
  const [reviewForm, setReviewForm] = useState({
    userName: '',
    rating: 5,
    title: '',
    comment: '',
    userCity: '',
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      const defaultColor = availableColors[0]?.name || product.colors?.[0] || 'Original';
      const defaultSize = availableSizes[0]?.name || product.sizes?.[0] || 'Free Size';
      setSelectedColor(defaultColor);
      setSelectedSize(defaultSize);
      setQuantity(1);
      setPincodeResult(null);
      setReviewSubmitted(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product?.id, availableColors, availableSizes]);

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <p className="text-stone-500">Garment not found.</p>
        <button
          onClick={() => setCurrentView('shop')}
          className="mt-4 bg-stone-900 text-white px-6 py-2 text-xs uppercase"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);

  const productReviews = reviews.filter(
    (r) => r.productId === product.id && r.status === 'approved'
  );

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      const formattedDate = deliveryDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      setPincodeResult({
        valid: true,
        date: formattedDate,
        cod: true,
      });
    } else {
      setPincodeResult(null);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity, activeVariant || undefined);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity, activeVariant || undefined);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    setActiveImageIndex(0);
  };

  const handleWhatsAppEnquiry = () => {
    const url = getWhatsAppProductUrl(product);
    window.open(url, '_blank');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.userName || !reviewForm.comment) return;

    await submitReview({
      productId: product.id,
      productName: product.name,
      userId: 'guest',
      userName: reviewForm.userName,
      userCity: reviewForm.userCity || 'Mumbai',
      rating: reviewForm.rating,
      title: reviewForm.title,
      comment: reviewForm.comment,
      isVerified: true,
    });

    setReviewSubmitted(true);
    setReviewForm({ userName: '', rating: 5, title: '', comment: '', userCity: '' });
  };

  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.categoryId === product.categoryId || p.categoryName === product.categoryName))
    .slice(0, 4);

  return (
    <div id="product-detail-page" className="min-h-screen bg-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-xs text-stone-500 mb-6 space-x-2">
          <button onClick={() => setCurrentView('home')} className="hover:text-stone-900">
            Home
          </button>
          <span>/</span>
          <button onClick={() => setCurrentView('shop')} className="hover:text-stone-900">
            Collections
          </button>
          <span>/</span>
          <span className="text-amber-900 font-medium">{product.categoryName}</span>
          <span>/</span>
          <span className="text-stone-800 font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Main Product Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            {activeGalleryImages.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-20 shrink-0 pb-2 sm:pb-0">
                {activeGalleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    id={`thumb-img-${idx}`}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-3/4 w-16 sm:w-full rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-amber-900 shadow-xs'
                        : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img && img.trim() !== '' ? img.trim() : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                      alt={`${product.name} thumb ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Active Display Image */}
            <div className="relative flex-1 aspect-3/4 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs group">
              <img
                src={
                  (activeGalleryImages[activeImageIndex] && activeGalleryImages[activeImageIndex].trim() !== '')
                    ? activeGalleryImages[activeImageIndex].trim()
                    : (activeGalleryImages[0] && activeGalleryImages[0].trim() !== '')
                    ? activeGalleryImages[0].trim()
                    : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
                }
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Mobile Carousel Navigation Arrows */}
              {activeGalleryImages.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none sm:hidden z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) =>
                        prev > 0 ? prev - 1 : activeGalleryImages.length - 1
                      );
                    }}
                    className="pointer-events-auto p-2 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white shadow-md backdrop-blur-xs transition-colors cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) =>
                        prev < activeGalleryImages.length - 1 ? prev + 1 : 0
                      );
                    }}
                    className="pointer-events-auto p-2 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white shadow-md backdrop-blur-xs transition-colors cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mobile Pagination Dots */}
              {activeGalleryImages.length > 1 && (
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 sm:hidden z-10">
                  {activeGalleryImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        activeImageIndex === i ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/70'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.bestseller && (
                  <span className="text-xs font-bold tracking-wider uppercase bg-stone-950 text-amber-200 px-3 py-1 rounded-sm shadow-md">
                    Bestseller
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-bold tracking-wider uppercase bg-rose-700 text-white px-3 py-1 rounded-sm shadow-md">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist Toggle */}
              <button
                id="btn-pdp-wishlist"
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-rose-600 shadow-md backdrop-blur-xs transition-colors cursor-pointer z-10"
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted ? 'fill-rose-600 text-rose-600' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Right Column: Garment Specs & Purchase Controls */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Brand & Category */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-[0.25em] text-amber-800 uppercase">
                  {product.brand} · {product.categoryName}
                </span>
                <span className="text-xs font-mono text-stone-400">SKU: {currentSku}</span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-950 mt-2 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 font-bold text-stone-900">{product.rating}</span>
                </div>
                <span className="text-stone-400">|</span>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-stone-600 underline hover:text-amber-900"
                >
                  {productReviews.length} Verified Patron Review{productReviews.length !== 1 ? 's' : ''}
                </button>
              </div>

              {/* Pricing */}
              <div className="mt-5 p-4 rounded-xl bg-stone-50 border border-stone-200/70 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-stone-950 font-serif">
                  ₹{currentSellingPrice.toLocaleString('en-IN')}
                </span>
                {currentMrp > currentSellingPrice && (
                  <>
                    <span className="text-sm text-stone-400 line-through">
                      ₹{currentMrp.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Save ₹{(currentMrp - currentSellingPrice).toLocaleString('en-IN')} ({discount}%)
                    </span>
                  </>
                )}
                <span className="text-[11px] text-stone-500 block ml-auto">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-xs sm:text-sm text-stone-600 mt-4 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Dynamic Color Selection */}
              {availableColors.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Color: <strong className="text-stone-950 font-semibold">{selectedColor}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => {
                      const isSelected = selectedColor.toLowerCase() === color.name.toLowerCase();
                      return (
                        <button
                          key={color.id || color.name}
                          id={`color-choice-${color.name.replace(/\s+/g, '-').toLowerCase()}`}
                          type="button"
                          onClick={() => handleSelectColor(color.name)}
                          className={`inline-flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-stone-900 border-stone-900 text-white font-semibold shadow-xs ring-2 ring-stone-900/15'
                              : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                          }`}
                        >
                          {color.hexCode && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0"
                              style={{ backgroundColor: color.hexCode }}
                            />
                          )}
                          <span>{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Size Selection & Size Chart */}
              {availableSizes.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Size: <strong className="text-stone-950 font-semibold">{selectedSize}</strong>
                    </span>
                    <button
                      id="btn-open-size-chart"
                      onClick={() => setSizeChartOpen(true)}
                      className="text-xs text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1 underline underline-offset-2"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Size &amp; Fit Guide</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                      const isSelected = selectedSize.toLowerCase() === size.name.toLowerCase();
                      const variantForThisSize = product.variants?.find(
                        (v) =>
                          v.color.trim().toLowerCase() === selectedColor.trim().toLowerCase() &&
                          v.size.trim().toLowerCase() === size.name.trim().toLowerCase() &&
                          v.isEnabled !== false
                      );
                      const isVariantSoldOut = variantForThisSize ? variantForThisSize.stock <= 0 : false;

                      return (
                        <button
                          key={size.id || size.name}
                          id={`size-choice-${size.name.replace(/\s+/g, '-').toLowerCase()}`}
                          type="button"
                          onClick={() => setSelectedSize(size.name)}
                          className={`min-w-[48px] text-xs py-2 px-3 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-900 border-amber-900 text-white font-bold shadow-xs ring-2 ring-amber-900/15'
                              : isVariantSoldOut
                              ? 'bg-stone-50 border-stone-200 text-stone-400 line-through'
                              : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                          }`}
                        >
                          <span>{size.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock Status & Quantity */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center border border-stone-300 rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock}
                    className="p-2.5 text-stone-600 hover:bg-stone-100 rounded-l-lg disabled:opacity-40"
                    title="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-xs font-bold text-stone-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={isOutOfStock || quantity >= currentStock}
                    className="p-2.5 text-stone-600 hover:bg-stone-100 rounded-r-lg disabled:opacity-40"
                    title="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {!isOutOfStock ? (
                  <span className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {currentStock <= (product.lowStockThreshold || 3)
                      ? `Hurry, only ${currentStock} left in stock!`
                      : 'In Stock · Ready to Dispatch'}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-600">
                    Currently Sold Out {activeVariant ? `(${selectedColor} / ${selectedSize})` : ''}
                  </span>
                )}
              </div>

              {/* Primary CTAs */}
              <div className="mt-6 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    id="btn-pdp-add-cart"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="w-full bg-white hover:bg-stone-50 text-stone-950 border-2 border-stone-950 text-xs font-bold uppercase tracking-widest py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                  </button>

                  <button
                    id="btn-pdp-buy-now"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="w-full bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-widest py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>{isOutOfStock ? 'Unavailable' : 'Buy It Now'}</span>
                  </button>
                </div>

                {/* WhatsApp Enquiry Button */}
                <button
                  id="btn-pdp-whatsapp"
                  onClick={handleWhatsAppEnquiry}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Enquire on WhatsApp (+91 93720 85090)</span>
                </button>
              </div>

              {/* Interactive Delivery Pincode Checker */}
              <div className="mt-6 p-4 rounded-xl bg-stone-50/80 border border-stone-200">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-stone-800">
                  <Truck className="w-4 h-4 text-amber-800" />
                  <span>Check Delivery &amp; COD Availability</span>
                </div>
                <form onSubmit={handleCheckPincode} className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                    <input
                      id="input-delivery-pincode"
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Enter 6-digit Pincode (e.g. 400001)"
                      className="w-full bg-white text-xs pl-8 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:border-stone-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Check
                  </button>
                </form>

                {pincodeResult && (
                  <div className="mt-3 text-xs text-stone-700 space-y-1">
                    <p className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5" />
                      Estimated Delivery by <strong>{pincodeResult.date}</strong>
                    </p>
                    <p className="text-stone-500 text-[11px]">
                      ✓ Cash on Delivery is available for this zone.
                    </p>
                  </div>
                )}
              </div>

              {/* Security & Authenticity Badges */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>100% Certified Authentic Weave</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>7-Day Doorstep Pickup Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-16 border-t border-stone-200 pt-10">
          <div className="flex border-b border-stone-200 overflow-x-auto space-x-6 sm:space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'border-b-2 border-stone-950 text-stone-950'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Description &amp; Silhouettes
            </button>
            <button
              onClick={() => setActiveTab('fabric')}
              className={`pb-3 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeTab === 'fabric'
                  ? 'border-b-2 border-stone-950 text-stone-950'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Fabric &amp; Artisanal Craft
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-3 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeTab === 'shipping'
                  ? 'border-b-2 border-stone-950 text-stone-950'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Shipping &amp; Return Policy
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-stone-950 text-stone-950'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Patron Reviews ({productReviews.length})
            </button>
          </div>

          {/* Tab Panes */}
          <div className="py-6 max-w-4xl text-stone-700 leading-relaxed text-sm">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <p>{product.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100 text-xs">
                  <div>
                    <span className="font-semibold text-stone-900 block">Occasion:</span>
                    <span className="text-stone-600">Weddings, Sangeet, Festive Soirées</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 block">Silhouette:</span>
                    <span className="text-stone-600">{product.categoryName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 block">Origin:</span>
                    <span className="text-stone-600">Handcrafted in Mumbai Atelier, India</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fabric' && (
              <div className="space-y-4">
                <h4 className="font-serif text-base font-bold text-stone-900">
                  Fabric Composition: {product.fabric}
                </h4>
                <p>
                  Sourced from certified heritage loom collectives, every thread is tested for thread-count density, natural breathability, and rich luminous luster.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600">
                  <li>Dry clean only to maintain zari and silk sheen longevity.</li>
                  <li>Store in breathable muslin or cotton garment bags.</li>
                  <li>Avoid direct exposure to liquid perfumes and deodorants.</li>
                  <li>Iron on low silk heat with a protective pressing cloth.</li>
                </ul>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-stone-900 uppercase tracking-wider mb-1">
                      Shipping Timeline
                    </h5>
                    <p className="text-stone-600">
                      Dispatched within 24–48 hours of order confirmation. Pan-India express delivery typically reaches within 3–5 working days.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-stone-900 uppercase tracking-wider mb-1">
                      7-Day Easy Return Guarantee
                    </h5>
                    <p className="text-stone-600">
                      If the fit is not ideal, you can initiate a replacement or refund within 7 days of package receipt.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Write Review Form */}
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                  <h4 className="font-serif text-base font-bold text-stone-900 mb-3">
                    Write a Patron Review
                  </h4>
                  {reviewSubmitted ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
                      Thank you! Your feedback has been published to our verified reviews.
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={reviewForm.userName}
                            onChange={(e) =>
                              setReviewForm({ ...reviewForm, userName: e.target.value })
                            }
                            className="w-full bg-white text-xs p-2.5 rounded-md border border-stone-300"
                            placeholder="e.g. Radhika M."
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={reviewForm.userCity}
                            onChange={(e) =>
                              setReviewForm({ ...reviewForm, userCity: e.target.value })
                            }
                            className="w-full bg-white text-xs p-2.5 rounded-md border border-stone-300"
                            placeholder="e.g. Mumbai"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                            Rating *
                          </label>
                          <select
                            value={reviewForm.rating}
                            onChange={(e) =>
                              setReviewForm({ ...reviewForm, rating: Number(e.target.value) })
                            }
                            className="w-full bg-white text-xs p-2.5 rounded-md border border-stone-300"
                          >
                            <option value={5}>5 Stars - Exquisite</option>
                            <option value={4}>4 Stars - Very Good</option>
                            <option value={3}>3 Stars - Average</option>
                            <option value={2}>2 Stars - Below Expectation</option>
                            <option value={1}>1 Star - Poor</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                          Review Headline
                        </label>
                        <input
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) =>
                            setReviewForm({ ...reviewForm, title: e.target.value })
                          }
                          className="w-full bg-white text-xs p-2.5 rounded-md border border-stone-300"
                          placeholder="e.g. Heavenly drape and opulent color"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                          Your Experience *
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={reviewForm.comment}
                          onChange={(e) =>
                            setReviewForm({ ...reviewForm, comment: e.target.value })
                          }
                          className="w-full bg-white text-xs p-2.5 rounded-md border border-stone-300"
                          placeholder="Share details about the fabric, fit, and compliments received..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-stone-900 text-white text-xs uppercase tracking-wider font-semibold px-6 py-2.5 rounded-md"
                      >
                        Publish Review
                      </button>
                    </form>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {productReviews.length > 0 ? (
                    productReviews.map((rev) => (
                      <div key={rev.id} className="p-4 border border-stone-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-900 text-xs">{rev.userName}</span>
                            {rev.userCity && (
                              <span className="text-stone-400 text-[11px]">({rev.userCity})</span>
                            )}
                            {rev.isVerified && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <div className="flex text-amber-400">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        {rev.title && (
                          <h5 className="font-medium text-xs text-stone-900">{rev.title}</h5>
                        )}
                        <p className="text-xs text-stone-600">{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-500 italic">
                      Be the first patron to review this couture piece.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Creations */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-stone-200">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold tracking-[0.25em] text-amber-800 uppercase block mb-1">
                Harmonious Pairings
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                You May Also Cherish
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Size Chart Modal */}
      {sizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSizeChartOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-2xl p-6 sm:p-8 z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-amber-800" />
                <span>Garment Measurement Guide (Inches)</span>
              </h3>
              <button onClick={() => setSizeChartOpen(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Our silhouettes are tailored according to standard Indian bridal &amp; luxury pret proportions. Custom fittings are also available via WhatsApp assistance.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-stone-700 border border-stone-200 rounded-lg">
                <thead className="bg-stone-100 text-stone-900 uppercase font-semibold">
                  <tr>
                    <th className="p-2.5 border-b">Size</th>
                    <th className="p-2.5 border-b">Bust (in)</th>
                    <th className="p-2.5 border-b">Waist (in)</th>
                    <th className="p-2.5 border-b">Hip (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="p-2.5 font-bold">XS</td>
                    <td className="p-2.5">32</td>
                    <td className="p-2.5">26</td>
                    <td className="p-2.5">36</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">S</td>
                    <td className="p-2.5">34</td>
                    <td className="p-2.5">28</td>
                    <td className="p-2.5">38</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">M</td>
                    <td className="p-2.5">36</td>
                    <td className="p-2.5">30</td>
                    <td className="p-2.5">40</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">L</td>
                    <td className="p-2.5">38</td>
                    <td className="p-2.5">32</td>
                    <td className="p-2.5">42</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">XL</td>
                    <td className="p-2.5">40</td>
                    <td className="p-2.5">34</td>
                    <td className="p-2.5">44</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Free Size</td>
                    <td className="p-2.5">Adjustable / Saree Drape</td>
                    <td className="p-2.5">Adjustable</td>
                    <td className="p-2.5">Free</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setSizeChartOpen(false)}
                className="bg-stone-900 text-white text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg"
              >
                Close Measurement Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
