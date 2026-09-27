import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Ban,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Order, CANCELLATION_REASONS, isOrderCancellable } from '../types';
import { useStore } from '../context/StoreContext';

interface CancelOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelled?: (order: Order) => void;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onCancelled,
}) => {
  const { cancelOrder } = useStore();

  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]);
  const [otherReason, setOtherReason] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [isConfirmStep, setIsConfirmStep] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

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

  const resetState = () => {
    setSelectedReason(CANCELLATION_REASONS[0]);
    setOtherReason('');
    setAdditionalNotes('');
    setIsConfirmStep(false);
    setIsSubmitting(false);
    setErrorMessage(null);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedReason === 'Other' && !otherReason.trim()) {
      setErrorMessage('Please enter your cancellation reason in the text box below.');
      return;
    }

    if (selectedReason === 'Other' && otherReason.trim().length < 4) {
      setErrorMessage('Please provide a brief explanation of at least 4 characters.');
      return;
    }

    setIsConfirmStep(true);
  };

  const handleFinalCancel = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const details = selectedReason === 'Other' ? otherReason.trim() : additionalNotes.trim();
      await cancelOrder(order.id, selectedReason, details, 'Customer');

      setIsSuccess(true);
      if (onCancelled) {
        onCancelled({
          ...order,
          orderStatus: 'Cancelled',
          cancellationReason: selectedReason,
          cancellationDetails: details,
          cancelledAt: new Date().toISOString(),
          cancelledBy: 'Customer',
        });
      }
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      setErrorMessage(
        err.message || 'Unable to cancel this order. Please try again or contact customer support.'
      );
      setIsConfirmStep(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="cancel-order-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div
        id="cancel-order-modal-container"
        className="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-7 z-10 shadow-2xl border border-stone-200 text-stone-900 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-tight">
                Cancel Order #{order.orderNumber}
              </h3>
              <p className="text-xs text-stone-500">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <button
            id="btn-close-cancel-modal"
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-widest text-rose-700 uppercase block mb-1">
                Order Cancelled
              </span>
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                Cancellation Confirmed
              </h4>
              <p className="text-xs text-stone-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Order #{order.orderNumber} has been officially cancelled. A confirmation record has been saved and your order status is now updated.
              </p>
            </div>

            {/* Summary pill */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between text-stone-600">
                <span>Reason:</span>
                <span className="font-semibold text-stone-900">{selectedReason}</span>
              </div>
              {selectedReason === 'Other' && otherReason && (
                <div className="flex items-start justify-between text-stone-600 gap-2">
                  <span className="shrink-0">Details:</span>
                  <span className="font-medium text-stone-800 text-right">{otherReason}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-stone-600">
                <span>Cancelled On:</span>
                <span className="font-medium text-stone-800">{new Date().toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600 pt-2 border-t border-stone-200/60">
                <span>Payment Mode:</span>
                <span className="font-semibold text-stone-900">{order.paymentMethod}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-cancel-modal-done"
                type="button"
                onClick={handleClose}
                className="w-full bg-stone-950 hover:bg-stone-800 text-white text-xs uppercase tracking-widest font-semibold py-3.5 px-6 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : !cancellable ? (
          /* Non-cancellable Guard */
          <div className="py-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-stone-900">
                Order Ineligible for Cancellation
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed max-w-sm mx-auto">
                Order #{order.orderNumber} is currently{' '}
                <strong className="text-stone-900 uppercase">[{order.orderStatus}]</strong>. Orders
                that have already been dispatched or delivered cannot be cancelled online.
              </p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-left text-xs space-y-2 text-stone-700">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <p>
                  <strong>Doorstep Returns Available:</strong> If the order has already been delivered, you can initiate a doorstep return or size exchange within 7 days of delivery.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full bg-stone-900 text-white text-xs uppercase tracking-wider font-semibold py-3 px-6 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : isConfirmStep ? (
          /* Step 2: Final Confirmation */
          <div className="py-4 space-y-5">
            <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl text-xs space-y-2 text-rose-900">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
                <span>Confirm Cancellation</span>
              </div>
              <p className="text-stone-700 leading-relaxed">
                Are you sure you wish to cancel <strong>Order #{order.orderNumber}</strong>? Once cancelled, this action cannot be reversed, and the artisanal preparation of your order will stop.
              </p>
            </div>

            {/* Order Review Snippet */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="flex justify-between items-center text-stone-600">
                <span>Items:</span>
                <span className="font-semibold text-stone-900">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Total Amount:</span>
                <span className="font-bold text-stone-950 text-sm">
                  ₹{order.total.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Cancellation Reason:</span>
                <span className="font-semibold text-rose-800">{selectedReason}</span>
              </div>
              {selectedReason === 'Other' && otherReason && (
                <div className="pt-2 border-t border-stone-200 text-stone-600">
                  <span className="block font-medium mb-0.5">Custom Reason:</span>
                  <p className="text-stone-900 italic">"{otherReason}"</p>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="btn-confirm-cancel-back"
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsConfirmStep(false)}
                className="py-3 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Keep Order
              </button>

              <button
                id="btn-confirm-cancel-proceed"
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalCancel}
                className="py-3 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 disabled:bg-rose-400 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Order</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Step 1: Reason Selection */
          <form onSubmit={handleProceedToConfirm} className="py-4 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-1">
                Please Select a Cancellation Reason *
              </label>
              <p className="text-xs text-stone-500 mb-3">
                Select the primary reason for cancelling this order:
              </p>

              <div className="space-y-2">
                {CANCELLATION_REASONS.map((reason, idx) => {
                  const isChecked = selectedReason === reason;
                  return (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-amber-50/70 border-amber-800/80 text-amber-950 font-semibold ring-1 ring-amber-800/40'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancellationReason"
                        value={reason}
                        checked={isChecked}
                        onChange={() => {
                          setSelectedReason(reason);
                          setErrorMessage(null);
                        }}
                        className="w-4 h-4 text-amber-900 border-stone-300 focus:ring-amber-900 accent-amber-900 cursor-pointer"
                      />
                      <span className="flex-1">
                        {idx + 1}. {reason}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* "Other" Reason Textarea */}
            {selectedReason === 'Other' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                  Please Specify Your Reason *
                </label>
                <textarea
                  id="cancel-other-reason-input"
                  required
                  rows={3}
                  value={otherReason}
                  onChange={(e) => {
                    setOtherReason(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Please let us know why you need to cancel this order..."
                  className="w-full bg-stone-50 p-3 rounded-xl border border-stone-300 text-xs focus:bg-white focus:outline-hidden focus:border-stone-900 leading-relaxed"
                />
                <span className="text-[11px] text-stone-400 block">
                  Compulsory field when selecting 'Other'. Minimum 4 characters.
                </span>
              </div>
            )}

            {/* Optional Additional Feedback when standard reason chosen */}
            {selectedReason !== 'Other' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-600">
                  Additional Details or Feedback (Optional)
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any extra feedback you would like to share with our atelier team..."
                  className="w-full bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden focus:border-stone-900 leading-relaxed"
                />
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit / Proceed */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-5 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                id="btn-proceed-cancel-order"
                type="submit"
                className="bg-stone-950 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider py-3 px-6 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
