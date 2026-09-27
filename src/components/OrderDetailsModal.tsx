import React, { useEffect } from 'react';
import {
  X,
  Package,
  Truck,
  MessageCircle,
  RotateCcw,
  Ban,
  Clock,
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Order, isOrderCancellable, isValidTrackingUrl } from '../types';
import { useStore } from '../context/StoreContext';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCancelModal: (order: Order) => void;
  onOpenReturnModal?: (order: Order) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onOpenCancelModal,
  onOpenReturnModal,
}) => {
  const { getWhatsAppOrderHelpUrl } = useStore();

  useEffect(() => {
    if (isOpen && order) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const cancellable = isOrderCancellable(order);
  const isCancelled = order.orderStatus === 'Cancelled';

  return (
    <div
      id="order-details-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="order-details-modal-container"
        className="relative w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-8 z-10 shadow-2xl border border-stone-200 text-stone-900 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-100 gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-amber-900 uppercase block mb-1">
              Order Details &amp; History
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              Order #{order.orderNumber}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        {isCancelled ? (
          <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-700 shrink-0" />
              <span className="font-bold text-rose-900 text-sm tracking-wide">ORDER CANCELLED</span>
            </div>

            <div className="text-xs text-rose-900/90 pt-1 space-y-1">
              <p>
                <strong>Cancellation Reason:</strong>{' '}
                <span className="font-semibold text-rose-950">
                  {order.cancelledBy?.toLowerCase() === 'admin'
                    ? order.cancellationReason || 'Order could not be fulfilled'
                    : order.customerCancellationReason || order.cancellationReason || 'Customer requested cancellation'}
                </span>
              </p>
              {order.cancelledBy?.toLowerCase() !== 'admin' && order.cancellationDetails && (
                <p className="italic text-stone-700">
                  <strong>Details:</strong> "{order.cancellationDetails}"
                </p>
              )}
              {order.cancelledAt && (
                <p className="text-stone-500 text-[11px]">
                  <strong>Cancelled Date &amp; Time:</strong>{' '}
                  {new Date(order.cancelledAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span
                className={`inline-block font-bold text-xs px-3 py-1 rounded-full border ${
                  order.orderStatus === 'Delivered'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : order.orderStatus === 'Shipped'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : order.orderStatus === 'Return Requested'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-stone-200/80 text-stone-900 border-stone-300'
                }`}
              >
                {order.orderStatus}
              </span>
              <span className="text-stone-500">
                Payment: <strong className="text-stone-800">{order.paymentMethod}</strong> ({order.paymentStatus})
              </span>
            </div>

            {cancellable && (
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Eligible for Cancellation
              </span>
            )}
          </div>
        )}

        {/* Courier Partner & Track My Order Button */}
        {(isValidTrackingUrl(order.trackingUrl) || Boolean(order.courierPartner || order.courier)) && (
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs flex flex-wrap items-center justify-between gap-3 text-stone-900">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-amber-800 shrink-0" />
              <div>
                <span className="text-stone-500 text-[11px] block uppercase tracking-wider font-semibold">
                  Courier Partner:
                </span>
                <strong className="text-stone-900 font-bold text-xs block">
                  {order.courierPartner || order.courier || 'Delivery Partner'}
                </strong>
              </div>
            </div>
            {isValidTrackingUrl(order.trackingUrl) && (
              <a
                id={`modal-btn-track-order-${order.orderNumber}`}
                href={order.trackingUrl!.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                <span>TRACK MY ORDER</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              </a>
            )}
          </div>
        )}

        {/* Products in this order */}
        <div className="space-y-3">
          <h4 className="font-serif text-base font-bold text-stone-900 flex items-center justify-between">
            <span>Ordered Garments ({order.items.length})</span>
            <span className="text-xs font-sans font-normal text-stone-500">
              Total: ₹{order.total.toLocaleString('en-IN')}
            </span>
          </h4>

          <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 bg-white">
                {item.productImage && item.productImage.trim() !== '' ? (
                  <img
                    src={item.productImage.trim()}
                    alt={item.productName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-18 object-cover rounded-xl bg-stone-100 shrink-0 border border-stone-100"
                  />
                ) : (
                  <div className="w-14 h-18 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-900 font-serif font-bold text-xs shrink-0">
                    {item.productName?.slice(0, 2).toUpperCase() || 'ITEM'}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-xs">
                  <h5 className="font-serif font-semibold text-stone-900 truncate">
                    {item.productName}
                  </h5>
                  <p className="text-stone-500 mt-0.5">
                    Size: <span className="font-bold text-stone-800">{item.size}</span> · Color:{' '}
                    <span className="font-bold text-stone-800">{item.color}</span> · Quantity:{' '}
                    <span className="font-bold text-stone-800">{item.quantity}</span>
                  </p>
                  <p className="text-stone-400 text-[11px] mt-0.5">
                    SKU: {item.sku}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-stone-950 block">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-[10px] text-stone-400">
                      ₹{item.price.toLocaleString('en-IN')} each
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-2">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal:</span>
            <span className="font-medium text-stone-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Promotional Discount {order.couponCode ? `(${order.couponCode})` : ''}:</span>
              <span className="font-medium">-₹{order.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-stone-600">
            <span>Insured Shipping &amp; Handling:</span>
            <span className="font-medium text-emerald-700">
              {order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}
            </span>
          </div>
          <div className="pt-2 border-t border-stone-200 flex justify-between text-stone-950 text-sm font-bold">
            <span>Total Amount:</span>
            <span>₹{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Payment & Transaction Details */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <strong className="text-stone-900 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-stone-600" />
              <span>Payment Details</span>
            </strong>
            <span
              className={`inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${
                order.paymentStatus === 'Paid'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : order.paymentStatus === 'Failed'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {order.paymentStatus === 'Paid' ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : order.paymentStatus === 'Failed' ? (
                <AlertCircle className="w-3 h-3 text-rose-600" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              )}
              <span>{order.paymentStatus}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600 pt-1 border-t border-stone-200/60">
            <div>
              <span className="text-stone-400 block text-[11px]">Method:</span>
              <span className="font-semibold text-stone-900">{order.paymentMethod}</span>
            </div>
            {order.razorpayPaymentId && (
              <div>
                <span className="text-stone-400 block text-[11px]">Razorpay Payment ID:</span>
                <span className="font-mono font-bold text-indigo-900 select-all">
                  {order.razorpayPaymentId}
                </span>
              </div>
            )}
            {order.paidAt && (
              <div>
                <span className="text-stone-400 block text-[11px]">Paid On:</span>
                <span className="font-medium text-stone-700">
                  {new Date(order.paidAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Destination */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-1.5">
          <strong className="block text-stone-900 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-600" />
            <span>Shipping Destination</span>
          </strong>
          <p className="font-medium text-stone-900">{order.shippingAddress.fullName}</p>
          <p className="text-stone-600">
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
          </p>
          <p className="text-stone-600">
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
          <p className="text-stone-700 pt-1">
            <strong>Contact:</strong> {order.shippingAddress.phone} | {order.customerEmail}
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
          <a
            href={getWhatsAppOrderHelpUrl(order.orderNumber)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Order Help on WhatsApp</span>
          </a>

          <div className="flex items-center gap-2">
            {/* Cancel Order Button */}
            {cancellable && (
              <button
                id="btn-details-cancel-order"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCancelModal(order);
                }}
                className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Ban className="w-4 h-4 text-rose-700" />
                <span>Cancel Order</span>
              </button>
            )}

            {/* Return Request Button */}
            {order.orderStatus === 'Delivered' && onOpenReturnModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReturnModal(order);
                }}
                className="inline-flex items-center gap-1.5 bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Request Return / Exchange</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
