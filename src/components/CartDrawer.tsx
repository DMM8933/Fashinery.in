import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Ticket,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTotal,
    coupons,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponError,
    settings,
    setCurrentView,
    openProductPage,
  } = useStore();

  const [inputCoupon, setInputCoupon] = useState('');
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);

  useEffect(() => {
    if (isCartDrawerOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const activeCoupons = coupons.filter((c) => c.isActive);

  const formatExpiryDate = (dateStr?: string) => {
    if (!dateStr) return 'Ongoing';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const threshold = settings.freeShippingThreshold || 1999;
  const progressToFree = Math.min(100, Math.round((cartSubtotal / threshold) * 100));
  const amountRemaining = Math.max(0, threshold - cartSubtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const ok = applyCoupon(inputCoupon.trim());
    if (ok) setInputCoupon('');
  };

  const handleWhatsAppCartInquiry = () => {
    const phone = (settings.whatsapp || '+91 93720 85090').replace(/[^0-9]/g, '');
    const itemsSummary = cart
      .map((item) => `- ${item.name} (${item.size}, ${item.color}) x${item.quantity} = ₹${(item.price * item.quantity).toLocaleString('en-IN')}`)
      .join('\n');
    const msg = `Hello Fashinery, I have items in my bag and would like styling / sizing assistance:\n\n${itemsSummary}\n\n*Cart Total:* ₹${cartTotal.toLocaleString('en-IN')}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      {/* Slide-in Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left">
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-stone-900" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h3>
          </div>
          <button
            id="btn-close-cart"
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-5 py-3 bg-amber-50/60 border-b border-amber-200/50 text-xs">
          <div className="flex items-center justify-between font-medium text-stone-800 mb-1.5">
            <span className="flex items-center gap-1.5 text-amber-900">
              <Truck className="w-4 h-4 text-amber-700" />
              {amountRemaining === 0 ? (
                <span className="font-bold text-emerald-700">
                  Complimentary Pan-India Shipping Unlocked!
                </span>
              ) : (
                <span>
                  Add <strong className="text-amber-900 font-bold">₹{amountRemaining.toLocaleString('en-IN')}</strong> for Free Shipping
                </span>
              )}
            </span>
            <span className="text-stone-500">{progressToFree}%</span>
          </div>
          <div className="w-full h-1.5 bg-amber-200/60 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progressToFree >= 100 ? 'bg-emerald-600' : 'bg-amber-700'
              }`}
              style={{ width: `${progressToFree}%` }}
            />
          </div>
        </div>

        {/* Item List or Empty State */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-lg font-semibold text-stone-800 mb-1">
              Your bag is currently empty
            </h4>
            <p className="text-xs text-stone-500 max-w-xs mb-6">
              Explore our imperial bridal silks and contemporary ethnic sets to begin curation.
            </p>
            <button
              id="btn-cart-empty-shop"
              onClick={() => {
                setIsCartDrawerOpen(false);
                setCurrentView('shop');
              }}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-widest font-semibold px-6 py-3 rounded-lg"
            >
              Explore Collections
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-stone-100">
            {cart.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                {item.image && item.image.trim() !== '' ? (
                  <img
                    src={item.image.trim()}
                    alt={item.name}
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      openProductPage(item.slug);
                    }}
                    className="w-20 h-24 object-cover rounded-lg bg-stone-100 shrink-0 cursor-pointer"
                  />
                ) : (
                  <div
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      openProductPage(item.slug);
                    }}
                    className="w-20 h-24 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-900 font-serif font-bold text-xs shrink-0 cursor-pointer"
                  >
                    {item.name?.slice(0, 2).toUpperCase() || 'ITEM'}
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => {
                          setIsCartDrawerOpen(false);
                          openProductPage(item.slug);
                        }}
                        className="font-serif text-sm font-semibold text-stone-900 hover:text-amber-900 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                      <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px] font-medium text-stone-700">
                        Size: {item.size}
                      </span>
                      <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px] font-medium text-stone-700">
                        Color: {item.color}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-stone-200 rounded-md">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-stone-100 text-stone-600"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-stone-100 text-stone-600"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Item Price */}
                    <div className="text-right">
                      <span className="text-sm font-bold text-stone-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      {item.mrp > item.price && (
                        <span className="block text-[10px] text-stone-400 line-through">
                          ₹{(item.mrp * item.quantity).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Billing Section */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50/50 space-y-4">
            {/* Coupon Section */}
            <div className="space-y-2">
              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Coupon <strong className="font-mono bg-emerald-100/70 px-1 py-0.5 rounded text-emerald-950">{appliedCoupon.code}</strong> applied
                      </span>
                    </div>
                    <button
                      type="button"
                      id="btn-remove-coupon"
                      onClick={removeCoupon}
                      className="text-stone-500 hover:text-rose-600 font-semibold underline text-[11px] cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-800 font-medium pl-5.5">
                    <span>Coupon Discount:</span>
                    <span className="font-bold">-₹{cartDiscount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                    <input
                      id="input-cart-coupon"
                      type="text"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      placeholder="Enter coupon code"
                      className="w-full bg-white text-xs pl-8 pr-3 py-2.5 rounded-md border border-stone-300 focus:outline-hidden focus:border-stone-900 uppercase font-mono"
                    />
                  </div>
                  <button
                    id="btn-apply-coupon"
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && (
                <div className="flex items-start gap-1.5 p-2 bg-rose-50 border border-rose-200 rounded-md text-rose-700 text-[11px] font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 mt-0.5" />
                  <span>{couponError}</span>
                </div>
              )}

              {/* Available Coupons Accordion */}
              <div>
                <button
                  type="button"
                  id="btn-toggle-available-coupons"
                  onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                  className="w-full flex items-center justify-between py-2 px-2.5 bg-stone-100 hover:bg-stone-200/80 rounded-lg text-xs font-semibold text-stone-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-amber-700" />
                    <span>Available Coupons</span>
                    {activeCoupons.length > 0 && (
                      <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                        {activeCoupons.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 font-normal">
                    <span>{showAvailableCoupons ? 'Hide' : 'View'}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        showAvailableCoupons ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {showAvailableCoupons && (
                  <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activeCoupons.length === 0 ? (
                      <div className="p-3 bg-white border border-stone-200 rounded-lg text-center text-xs text-stone-500">
                        No active coupons currently available. Check back soon!
                      </div>
                    ) : (
                      activeCoupons.map((c) => {
                        const isCurrentlyApplied =
                          appliedCoupon && appliedCoupon.code.toUpperCase() === c.code.toUpperCase();
                        const meetsMinOrder = cartSubtotal >= (c.minOrderValue || 0);

                        return (
                          <div
                            key={c.id}
                            className={`p-3 rounded-lg border text-xs transition-all ${
                              isCurrentlyApplied
                                ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300'
                                : 'bg-white border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-xs bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-stone-900">
                                  {c.code}
                                </span>
                                <span className="font-bold text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                                  {c.discountType === 'percentage'
                                    ? `${c.discountValue}% OFF`
                                    : `₹${c.discountValue} OFF`}
                                </span>
                              </div>

                              {isCurrentlyApplied ? (
                                <button
                                  type="button"
                                  onClick={removeCoupon}
                                  className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  id={`btn-apply-coupon-${c.code.toLowerCase()}`}
                                  onClick={() => applyCoupon(c.code)}
                                  className="bg-stone-900 hover:bg-stone-800 text-white font-semibold text-[11px] uppercase tracking-wider px-3 py-1 rounded transition-colors cursor-pointer"
                                >
                                  Apply
                                </button>
                              )}
                            </div>

                            {c.description && (
                              <p className="text-stone-600 text-[11px] mt-1.5 leading-snug">
                                {c.description}
                              </p>
                            )}

                            <div className="mt-2 pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-[10.5px] text-stone-500">
                              <span>
                                Min Order: <strong className="text-stone-700">₹{c.minOrderValue.toLocaleString('en-IN')}</strong>
                              </span>
                              {c.maxDiscount ? (
                                <span>
                                  Max Discount: <strong className="text-stone-700">₹{c.maxDiscount.toLocaleString('en-IN')}</strong>
                                </span>
                              ) : null}
                              <span>
                                Expires: <span className="text-stone-700">{formatExpiryDate(c.validUntil)}</span>
                              </span>
                            </div>

                            {!meetsMinOrder && !isCurrentlyApplied && (
                              <p className="text-[10px] text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded mt-1.5">
                                Add ₹{(c.minOrderValue - cartSubtotal).toLocaleString('en-IN')} more to unlock this coupon
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-stone-900 font-medium">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}</span>
                  <span>-₹{cartDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {cartShipping === 0 ? (
                    <span className="text-emerald-700 font-semibold uppercase text-[11px]">
                      FREE
                    </span>
                  ) : (
                    `₹${cartShipping.toLocaleString('en-IN')}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Estimated Total</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                id="btn-cart-checkout"
                onClick={handleProceedToCheckout}
                className="w-full bg-stone-950 hover:bg-stone-800 text-white text-xs uppercase tracking-widest font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-cart-whatsapp-help"
                onClick={handleWhatsAppCartInquiry}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Enquire About Bag on WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
