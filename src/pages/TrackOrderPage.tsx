import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Package,
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
  Ban,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus, isOrderCancellable, isValidTrackingUrl } from '../types';
import { CancelOrderModal } from '../components/CancelOrderModal';
import { OrderStatusTimeline } from '../components/OrderStatusTimeline';

export const TrackOrderPage: React.FC = () => {
  const {
    orders,
    user,
    lastCreatedOrder,
    getWhatsAppOrderHelpUrl,
    requestReturn,
    setCurrentView,
    settings,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return lastCreatedOrder?.orderNumber || '';
  });
  const [searched, setSearched] = useState<boolean>(!!lastCreatedOrder);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(lastCreatedOrder || null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);

  // Return modal states
  const [returnModalOpen, setReturnModalOpen] = useState<boolean>(false);
  const [returnType, setReturnType] = useState<'return' | 'exchange'>('return');
  const [returnReason, setReturnReason] = useState<string>('Size Issue - Requesting Alternate Size');
  const [returnNotes, setReturnNotes] = useState<string>('');
  const [returnSubmitting, setReturnSubmitting] = useState<boolean>(false);
  const [returnSuccess, setReturnSuccess] = useState<boolean>(false);

  const statusSteps: OrderStatus[] = [
    'Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const query = searchQuery.trim().toUpperCase();
    if (!query) {
      setErrorMessage('Please enter an Order Number, Phone Number, or Email.');
      return;
    }

    const found = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === query ||
        o.customerPhone.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, '') ||
        o.customerEmail.toLowerCase() === query.toLowerCase() ||
        o.trackingNumber?.toUpperCase() === query
    );

    if (found) {
      setSelectedOrder(found);
      setSearched(true);
    } else {
      setSelectedOrder(null);
      setSearched(true);
      setErrorMessage(`No matching order found for "${searchQuery}". Please check your order confirmation SMS or email.`);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
      case 'Confirmed':
        return 0;
      case 'Processing':
      case 'Packed':
        return 1;
      case 'Shipped':
        return 2;
      case 'Out for Delivery':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 1;
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setReturnSubmitting(true);
    await requestReturn(selectedOrder.id, returnReason, returnNotes, returnType);
    setReturnSubmitting(false);
    setReturnSuccess(true);
  };

  return (
    <div id="track-order-page" className="min-h-screen bg-[#faf7f2] py-12 sm:py-16 text-stone-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-[0.25em] text-amber-800 uppercase block mb-2">
            Logistics &amp; Dispatch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Track Your Shipment
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
            Enter your Fashinery Order Number (e.g. FSH-2026-10492) or 10-digit mobile number to view real-time delivery status.
          </p>
        </div>

        {/* Tracking Search Input Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-tracking-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Order Number (e.g. FSH-2026-XXXXX) or 10-digit Phone"
                className="w-full bg-stone-50 pl-12 pr-4 py-3.5 rounded-2xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              id="btn-track-submit"
              className="bg-stone-950 hover:bg-stone-800 text-white text-xs uppercase tracking-widest font-semibold px-8 py-3.5 rounded-2xl transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              Track Order
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Order Suggestions */}
          {orders.length > 0 && !selectedOrder && (
            <div className="mt-5 pt-4 border-t border-stone-100">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                Recent Orders in Session:
              </span>
              <div className="flex flex-wrap gap-2">
                {orders.slice(0, 3).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSearchQuery(o.orderNumber);
                      setSelectedOrder(o);
                      setSearched(true);
                      setErrorMessage('');
                    }}
                    className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-lg font-mono transition-colors cursor-pointer"
                  >
                    {o.orderNumber} ({o.orderStatus})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tracking Details View */}
        {selectedOrder && (
          <div className="space-y-6">
            {/* High-priority Status Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                      Order #{selectedOrder.orderNumber}
                    </h2>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        selectedOrder.orderStatus === 'Cancelled'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : selectedOrder.orderStatus === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}
                    >
                      {selectedOrder.orderStatus === 'Cancelled'
                        ? 'Order Cancelled'
                        : selectedOrder.orderStatus}
                    </span>
                  </div>
                  <span className="text-xs text-stone-500 mt-1 block">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Cancel Order Button if eligible */}
                  {isOrderCancellable(selectedOrder) && (
                    <button
                      id="btn-track-cancel-order"
                      type="button"
                      onClick={() => setCancelModalOpen(true)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold px-4 py-2 rounded-xl border border-rose-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Ban className="w-4 h-4 text-rose-700" />
                      <span>Cancel Order</span>
                    </button>
                  )}

                  <a
                    href={getWhatsAppOrderHelpUrl(selectedOrder.orderNumber)}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold px-4 py-2 rounded-xl border border-emerald-200 inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Support on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* High-visibility Order Cancelled Banner */}
              {selectedOrder.orderStatus === 'Cancelled' && (
                <div className="p-5 bg-rose-50/90 border border-rose-200 rounded-2xl space-y-3 text-rose-950">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                        <Ban className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-bold text-rose-950 uppercase tracking-wide">
                          ORDER CANCELLED
                        </h4>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-200 text-rose-900 uppercase tracking-wider">
                      Cancelled
                    </span>
                  </div>

                  <div className="pt-2 border-t border-rose-200/70 text-xs space-y-1.5">
                    <p>
                      <strong>Cancellation Reason:</strong>{' '}
                      <span className="font-semibold text-rose-900">
                        {selectedOrder.cancelledBy?.toLowerCase() === 'admin'
                          ? selectedOrder.cancellationReason || 'Order could not be fulfilled'
                          : selectedOrder.customerCancellationReason || selectedOrder.cancellationReason || 'Requested by customer'}
                      </span>
                    </p>
                    {selectedOrder.cancelledBy?.toLowerCase() !== 'admin' && selectedOrder.cancellationDetails && (
                      <p className="text-stone-700 italic">
                        <strong>Additional Details:</strong> "{selectedOrder.cancellationDetails}"
                      </p>
                    )}
                    {selectedOrder.cancelledAt && (
                      <p className="text-stone-500 text-[11px]">
                        <strong>Date &amp; Time:</strong>{' '}
                        {new Date(selectedOrder.cancelledAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                    <p className="text-stone-600 text-[11px] pt-1 leading-relaxed">
                      This order will not be fulfilled or dispatched. If an online payment was deducted, any eligible refund will be credited back via original method. For questions, contact customer care.
                    </p>
                  </div>
                </div>
              )}

              {/* Professional Real-time Order Status Timeline */}
              <div className="p-5 bg-stone-50 border border-stone-200 rounded-3xl my-3">
                <OrderStatusTimeline order={selectedOrder} />
              </div>

              {/* Shipment Logistics Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-stone-100 text-xs">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                  <div>
                    <span className="text-stone-500 uppercase tracking-wider block mb-1">Courier Partner</span>
                    <span className="font-bold text-stone-900 text-sm block">
                      {selectedOrder.courierPartner || selectedOrder.courier || 'BlueDart Express'}
                    </span>
                  </div>
                  {isValidTrackingUrl(selectedOrder.trackingUrl) && (
                    <div className="pt-3 mt-2 border-t border-stone-200/60">
                      <a
                        href={selectedOrder.trackingUrl!.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                      >
                        <span>TRACK MY ORDER</span>
                        <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 uppercase tracking-wider block mb-1">Estimated Delivery</span>
                  <span className="font-bold text-stone-900 text-sm">
                    {selectedOrder.orderStatus === 'Delivered'
                      ? 'Delivered to Doorstep'
                      : '2–4 Business Days (Free Express)'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 uppercase tracking-wider block mb-1">Shipping Method</span>
                  <span className="font-bold text-stone-900 text-sm">
                    Free Insured Doorstep Express
                  </span>
                </div>
              </div>

              {/* Return / Exchange Button if Delivered */}
              {selectedOrder.orderStatus === 'Delivered' && (
                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-stone-600">
                    <span>Eligible for Doorstep Return or Size Exchange within 7 days of delivery.</span>
                  </div>
                  <button
                    onClick={() => setReturnModalOpen(true)}
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Request Return / Exchange</span>
                  </button>
                </div>
              )}
            </div>

            {/* Items in Order */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Items in this Order ({selectedOrder.items.length})
              </h3>
              <div className="divide-y divide-stone-100">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center gap-4">
                    {item.productImage && item.productImage.trim() !== '' ? (
                      <img
                        src={item.productImage.trim()}
                        alt={item.productName}
                        referrerPolicy="no-referrer"
                        className="w-14 h-18 object-cover rounded-xl bg-stone-100 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-18 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-900 font-serif font-bold text-xs shrink-0">
                        {item.productName?.slice(0, 2).toUpperCase() || 'ITEM'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-semibold text-stone-900 truncate">
                        {item.productName}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Size: <span className="font-bold text-stone-700">{item.size}</span> | Color: <span className="font-bold text-stone-700">{item.color}</span> | Qty: {item.quantity}
                      </p>
                      <span className="text-xs font-bold text-stone-900 mt-1 block">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-between text-xs text-stone-600">
                <span>Shipping: <strong className="text-emerald-700">FREE (₹0)</strong></span>
                <span>Payment Method: <strong>{selectedOrder.paymentMethod}</strong></span>
                <span>Total: <strong className="text-stone-900 text-sm">₹{selectedOrder.total.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-3">
                Destination Address
              </h3>
              <div className="text-xs text-stone-600 leading-relaxed space-y-1">
                <span className="font-bold text-stone-900 block text-sm">
                  {selectedOrder.customerName}
                </span>
                <p>{selectedOrder.shippingAddress.addressLine1}</p>
                {selectedOrder.shippingAddress.addressLine2 && (
                  <p>{selectedOrder.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </p>
                <p className="pt-1 text-stone-500">Contact: {selectedOrder.customerPhone} | {selectedOrder.customerEmail}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Request Return / Exchange */}
        {returnModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-stone-200 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Request Return or Size Exchange
                </h3>
                <button
                  onClick={() => {
                    setReturnModalOpen(false);
                    setReturnSuccess(false);
                  }}
                  className="text-stone-400 hover:text-stone-700 text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {returnSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-serif text-lg font-bold text-emerald-950">
                    Request Lodged Successfully
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Our logistics partner will reach out within 24 hours to schedule a complimentary doorstep pickup. Keep the garments unused with original tags attached.
                  </p>
                  <button
                    onClick={() => {
                      setReturnModalOpen(false);
                      setReturnSuccess(false);
                    }}
                    className="bg-emerald-800 text-white text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl font-semibold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">
                      Request Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setReturnType('return')}
                        className={`p-3 rounded-xl border text-center font-semibold cursor-pointer ${
                          returnType === 'return'
                            ? 'bg-amber-950 text-white border-amber-950'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        Refund Return
                      </button>
                      <button
                        type="button"
                        onClick={() => setReturnType('exchange')}
                        className={`p-3 rounded-xl border text-center font-semibold cursor-pointer ${
                          returnType === 'exchange'
                            ? 'bg-amber-950 text-white border-amber-950'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        Size Exchange
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">
                      Reason
                    </label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
                    >
                      <option value="Size Issue - Need Larger Size">Size Issue - Need Larger Size</option>
                      <option value="Size Issue - Need Smaller Size">Size Issue - Need Smaller Size</option>
                      <option value="Fabric / Drape Difference">Fabric / Drape Difference</option>
                      <option value="Color Variance from Screen">Color Variance from Screen</option>
                      <option value="Ordered by Mistake">Ordered by Mistake</option>
                      <option value="Other Inquiries">Other Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">
                      Additional Notes / Preferred Size
                    </label>
                    <textarea
                      rows={3}
                      value={returnNotes}
                      onChange={(e) => setReturnNotes(e.target.value)}
                      placeholder="e.g. Please send size XL instead of L for the Kurti set..."
                      className="w-full bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="p-3.5 bg-stone-100 rounded-xl text-[11px] text-stone-600 leading-relaxed">
                    <strong>Note:</strong> Pickups are executed from the original delivery address. Doorstep inspection checks for unworn condition and attached barcode tags.
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setReturnModalOpen(false)}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl uppercase font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={returnSubmitting}
                      className="flex-1 bg-stone-950 hover:bg-stone-800 text-white py-3 rounded-xl uppercase font-semibold disabled:opacity-50 cursor-pointer"
                    >
                      {returnSubmitting ? 'Submitting...' : 'Confirm Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Cancel Order Modal */}
        <CancelOrderModal
          order={selectedOrder}
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onCancelled={(updatedOrder) => {
            setSelectedOrder(updatedOrder);
          }}
        />
      </div>
    </div>
  );
};
