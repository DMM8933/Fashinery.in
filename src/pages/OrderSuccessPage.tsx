import React from 'react';
import {
  CheckCircle2,
  MessageCircle,
  Package,
  ShoppingBag,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const OrderSuccessPage: React.FC = () => {
  const { lastCreatedOrder, setCurrentView, getWhatsAppOrderHelpUrl } = useStore();

  if (!lastCreatedOrder) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">No Active Order Found</h2>
        <button
          onClick={() => setCurrentView('home')}
          className="bg-stone-900 text-white text-xs uppercase px-6 py-2.5 rounded-md"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleWhatsAppHelp = () => {
    const url = getWhatsAppOrderHelpUrl(lastCreatedOrder.orderNumber);
    window.open(url, '_blank');
  };

  return (
    <div id="order-success-page" className="min-h-screen bg-[#faf7f2] py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl text-center space-y-6">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold tracking-[0.25em] text-amber-800 uppercase block mb-1">
              Order Confirmed
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Thank You, {lastCreatedOrder.customerName}!
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Your artisanal garments are now being prepared at our Mumbai atelier.
            </p>
          </div>

          {/* Order Details Pill */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-left space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div>
                <span className="text-xs text-stone-400 block">Order Identifier</span>
                <span className="font-mono text-base font-bold text-stone-950">
                  {lastCreatedOrder.orderNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400 block">Status</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {lastCreatedOrder.orderStatus}
                </span>
              </div>
            </div>

            {/* Delivery address & items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600 pt-2">
              <div>
                <span className="font-semibold text-stone-900 block mb-1">Delivering To:</span>
                <p>{lastCreatedOrder.shippingAddress.fullName}</p>
                <p>{lastCreatedOrder.shippingAddress.addressLine1}</p>
                {lastCreatedOrder.shippingAddress.addressLine2 && (
                  <p>{lastCreatedOrder.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {lastCreatedOrder.shippingAddress.city},{' '}
                  {lastCreatedOrder.shippingAddress.state} -{' '}
                  {lastCreatedOrder.shippingAddress.pincode}
                </p>
                <p className="text-stone-900 mt-1 font-medium">
                  Contact: {lastCreatedOrder.shippingAddress.phone}
                </p>
              </div>

              <div>
                <span className="font-semibold text-stone-900 block mb-1">Payment Summary:</span>
                <p>Method: <strong>{lastCreatedOrder.paymentMethod}</strong></p>
                <p>Payment Status: <strong>{lastCreatedOrder.paymentStatus}</strong></p>
                <p className="text-stone-950 font-bold text-sm mt-2">
                  Total Paid / Payable: ₹{lastCreatedOrder.total.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Item Thumbnails */}
            <div className="pt-3 border-t border-stone-200 space-y-2">
              <span className="text-xs font-semibold text-stone-900 block">Items in this Order:</span>
              {lastCreatedOrder.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    {it.productImage && it.productImage.trim() !== '' ? (
                      <img
                        src={it.productImage.trim()}
                        alt={it.productName}
                        className="w-8 h-10 object-cover rounded bg-stone-100"
                      />
                    ) : (
                      <div className="w-8 h-10 rounded bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-900 font-serif font-bold text-[10px]">
                        {it.productName?.slice(0, 2).toUpperCase() || 'ITEM'}
                      </div>
                    )}
                    <span>
                      {it.productName} ({it.size}, {it.color}) x{it.quantity}
                    </span>
                  </div>
                  <span className="font-semibold text-stone-900">
                    ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Express Delivery Timeline */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-left flex items-start gap-3 text-xs text-amber-900">
            <Truck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Estimated Delivery: 3–5 Business Days</span>
              <p className="text-amber-800/80 leading-relaxed mt-0.5">
                Our logistics partner will send SMS notifications with live dispatch tracking and OTP before the delivery attempt.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <button
              id="btn-success-whatsapp-support"
              onClick={handleWhatsAppHelp}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Get WhatsApp Updates for Order #{lastCreatedOrder.orderNumber}</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setCurrentView('account');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-semibold uppercase tracking-wider py-3 rounded-xl transition-colors cursor-pointer"
              >
                Track in My Account
              </button>

              <button
                onClick={() => {
                  setCurrentView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full bg-stone-950 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-xl transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
