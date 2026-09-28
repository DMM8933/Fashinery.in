import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  LogOut,
  Package,
  Heart,
  User,
  Phone,
  Mail,
  ShieldCheck,
  RotateCcw,
  Truck,
  Ban,
  Eye,
  MessageCircle,
  X,
  Sparkles,
  ShoppingBag,
  Trash2,
  Save,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, isOrderCancellable, isValidTrackingUrl, RETURN_REASONS } from '../types';
import { BrandLogo } from '../components/BrandLogo';
import { CustomerAuthCard } from '../components/CustomerAuthCard';
import { CancelOrderModal } from '../components/CancelOrderModal';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { OrderStatusTimeline } from '../components/OrderStatusTimeline';
import { validateIndianMobile, validateOptionalEmail } from '../utils/validation';

export const AccountPage: React.FC = () => {
  const {
    user,
    customerProfile,
    orders,
    products,
    wishlist,
    toggleWishlist,
    addToCart,
    logout,
    requestReturn,
    updateCustomerProfile,
    sendCustomerEmailVerification,
    getWhatsAppOrderHelpUrl,
    setCurrentView,
    authError,
    clearAuthError,
  } = useStore();

  // Active Tab for Logged-In User
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'details'>('orders');

  // Modals State
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [selectedReturnReason, setSelectedReturnReason] = useState<string>(RETURN_REASONS[0]);
  const [otherReturnReason, setOtherReturnReason] = useState('');
  const [returnSuccess, setReturnSuccess] = useState(false);
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [detailsModalOrder, setDetailsModalOrder] = useState<Order | null>(null);

  // Missing Mobile Prompt State (for Google sign-ins)
  const [missingMobileInput, setMissingMobileInput] = useState('');
  const [missingMobileError, setMissingMobileError] = useState<string | null>(null);
  const [missingMobileSuccess, setMissingMobileSuccess] = useState(false);
  const [missingMobileSaving, setMissingMobileSaving] = useState(false);

  // Account Details Form State
  const [profileName, setProfileName] = useState(
    customerProfile?.name || customerProfile?.displayName || user?.displayName || ''
  );
  const [profilePhone, setProfilePhone] = useState(customerProfile?.phone || '');
  const [profileEmail, setProfileEmail] = useState(
    customerProfile?.email && !customerProfile.email.endsWith('@customer.fashinery.in')
      ? customerProfile.email
      : user?.email && !user.email.endsWith('@customer.fashinery.in')
      ? user.email
      : ''
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Email Verification State
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const handleResendVerification = async () => {
    setVerificationMessage(null);
    setVerificationError(null);
    setResendingVerification(true);
    try {
      await sendCustomerEmailVerification();
      setVerificationMessage('A new verification email has been dispatched. Please check your inbox and spam folder.');
    } catch (err: any) {
      setVerificationError(err.message || 'Unable to send verification email. Please try again later.');
    } finally {
      setResendingVerification(false);
    }
  };

  // Sync profile form when customerProfile changes
  useEffect(() => {
    if (customerProfile) {
      setProfileName(customerProfile.name || customerProfile.displayName || user?.displayName || '');
      setProfilePhone(customerProfile.phone || '');
      if (customerProfile.email && !customerProfile.email.endsWith('@customer.fashinery.in')) {
        setProfileEmail(customerProfile.email);
      } else if (user?.email && !user.email.endsWith('@customer.fashinery.in')) {
        setProfileEmail(user.email);
      }
    }
  }, [customerProfile, user]);

  // Keep open Order Details modal in sync with real-time updates from Firestore (trackingUrl, courier, status)
  useEffect(() => {
    if (detailsModalOrder) {
      const freshOrder = orders.find(
        (o) => o.id === detailsModalOrder.id || o.orderNumber === detailsModalOrder.orderNumber
      );
      if (
        freshOrder &&
        (freshOrder.trackingUrl !== detailsModalOrder.trackingUrl ||
          freshOrder.courierPartner !== detailsModalOrder.courierPartner ||
          freshOrder.orderStatus !== detailsModalOrder.orderStatus)
      ) {
        setDetailsModalOrder(freshOrder);
      }
    }
  }, [orders, detailsModalOrder]);

  // Orders filtered for current user
  const myOrders = orders.filter((o) => {
    if (!user) return false;
    const userPhone = customerProfile?.phone;
    return (
      o.userId === user.uid ||
      (user.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase()) ||
      (userPhone && o.customerPhone === userPhone)
    );
  });

  // Wishlist products
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  // Handle Return Submit
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalOrder) return;

    const reason = selectedReturnReason;
    const notes = selectedReturnReason === 'Other' ? otherReturnReason.trim() : '';

    if (reason === 'Other' && !notes) {
      alert('Please specify your return reason.');
      return;
    }

    await requestReturn(returnModalOrder.id, reason, notes);
    setReturnSuccess(true);
    setTimeout(() => {
      setReturnModalOrder(null);
      setReturnSuccess(false);
      setSelectedReturnReason(RETURN_REASONS[0]);
      setOtherReturnReason('');
    }, 2500);
  };

  // Handle Missing Mobile Submission (e.g. for Google users)
  const handleSaveMissingMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMissingMobileError(null);
    setMissingMobileSuccess(false);

    const val = validateIndianMobile(missingMobileInput);
    if (!val.isValid) {
      setMissingMobileError(val.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setMissingMobileSaving(true);
    try {
      await updateCustomerProfile({
        phone: val.cleanPhone,
      });
      setMissingMobileSuccess(true);
      setMissingMobileInput('');
      setTimeout(() => setMissingMobileSuccess(false), 3000);
    } catch (err: any) {
      setMissingMobileError(err.message || 'Could not save mobile number.');
    } finally {
      setMissingMobileSaving(false);
    }
  };

  // Handle Account Details Form Submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!profileName.trim()) {
      setProfileError('Customer Name is required.');
      return;
    }

    let cleanPhone = '';
    if (profilePhone.trim()) {
      const phoneVal = validateIndianMobile(profilePhone);
      if (!phoneVal.isValid) {
        setProfileError(phoneVal.error || 'Please enter a valid 10-digit Indian mobile number.');
        return;
      }
      cleanPhone = phoneVal.cleanPhone;
    } else {
      setProfileError('Mobile Number is required.');
      return;
    }

    let cleanEmail = '';
    if (profileEmail.trim()) {
      const emailVal = validateOptionalEmail(profileEmail);
      if (!emailVal.isValid) {
        setProfileError(emailVal.error || 'Please provide a valid email format.');
        return;
      }
      cleanEmail = emailVal.cleanEmail;
    }

    setProfileSaving(true);
    try {
      await updateCustomerProfile({
        name: profileName.trim(),
        phone: cleanPhone,
        email: cleanEmail || '',
      });
      setProfileSuccess('Your profile details have been saved securely.');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Could not update profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  // =========================================================================
  // VIEW 1: NOT LOGGED IN -> DEDICATED CUSTOMER AUTHENTICATION SCREEN
  // =========================================================================
  if (!user) {
    return (
      <div id="account-auth-screen" className="min-h-screen bg-[#faf7f2] py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <CustomerAuthCard initialMode="login" />
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LOGGED IN -> CLIENT ACCOUNT DASHBOARD
  // =========================================================================
  const clientName = customerProfile?.name || customerProfile?.displayName || user.displayName || 'Honoured Client';
  const clientPhone = customerProfile?.phone || '';
  const isSyntheticEmail = user.email?.endsWith('@customer.fashinery.in');
  const displayEmail = isSyntheticEmail ? 'No email linked' : customerProfile?.email || user.email || 'No email linked';

  return (
    <div id="account-dashboard" className="min-h-screen bg-[#faf7f2] py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Greeting / Auth Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-center shrink-0">
              <BrandLogo size="md" showSlogan={false} theme="light" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-widest text-amber-800 uppercase">
                  Fashinery Client Circle
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {clientName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{clientPhone ? `+91 ${clientPhone}` : 'No mobile registered'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{displayEmail}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-account-logout"
              onClick={logout}
              className="flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 px-4 py-2.5 rounded-xl transition-colors cursor-pointer border border-stone-200/60"
            >
              <LogOut className="w-4 h-4 text-stone-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Missing Mobile Prompt Banner for Google accounts */}
        {!clientPhone && (
          <div
            id="banner-missing-mobile"
            className="mb-8 p-5 bg-amber-50/90 border border-amber-300/80 rounded-2xl shadow-xs"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300/60 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-amber-950">
                    Add your Mobile Number to complete your client profile
                  </h3>
                  <p className="text-xs text-amber-900/80 mt-0.5 max-w-xl leading-relaxed">
                    A valid 10-digit Indian mobile number is mandatory for courier doorstep delivery, OTP verification, and real-time WhatsApp dispatch alerts.
                  </p>
                </div>
              </div>

              {missingMobileSuccess ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-3.5 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mobile number saved!</span>
                </div>
              ) : (
                <form
                  onSubmit={handleSaveMissingMobile}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto"
                >
                  <div className="flex">
                    <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-amber-300 bg-amber-100/60 text-amber-950 text-xs font-bold shrink-0">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={missingMobileInput}
                      onChange={(e) => setMissingMobileInput(e.target.value)}
                      placeholder="10-digit number"
                      maxLength={14}
                      disabled={missingMobileSaving}
                      className="px-3 py-2 bg-white border border-amber-300 rounded-r-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/30 w-full sm:w-40"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={missingMobileSaving}
                    className="py-2 px-4 bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {missingMobileSaving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}
            </div>

            {missingMobileError && (
              <p className="text-xs text-rose-700 font-medium mt-2 pl-12">
                {missingMobileError}
              </p>
            )}
          </div>
        )}

        {/* Email Verification Status Banner */}
        {user?.email && !user.email.endsWith('@customer.fashinery.in') && !user.emailVerified && (
          <div
            id="banner-unverified-email"
            className="mb-8 p-5 bg-amber-50/70 border border-amber-200/90 rounded-2xl shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100/90 border border-amber-300/50 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                      Email Verification Pending
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                      Unverified
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5 max-w-xl leading-relaxed">
                    Verify your email address (<strong className="text-stone-800">{user.email}</strong>) to guarantee quick account recovery and receive bespoke delivery receipts.
                  </p>
                  {verificationMessage && (
                    <p className="text-xs text-emerald-800 font-medium mt-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{verificationMessage}</span>
                    </p>
                  )}
                  {verificationError && (
                    <p className="text-xs text-rose-700 font-medium mt-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{verificationError}</span>
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="py-2 px-4 bg-stone-900 hover:bg-stone-800 active:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
              >
                {resendingVerification ? 'Sending Link...' : 'Resend Verification Email'}
              </button>
            </div>
          </div>
        )}

        {/* Authentication Notice if any global auth error */}
        {authError && (
          <div
            id="auth-error-banner"
            className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              onClick={clearAuthError}
              className="p-1 text-rose-600 hover:text-rose-900 rounded-lg hover:bg-rose-100 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-stone-200 mb-8 overflow-x-auto no-scrollbar gap-2 sm:gap-4">
          <button
            id="tab-account-orders"
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-colors relative cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'orders'
                ? 'text-amber-900 border-b-2 border-amber-900'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({myOrders.length})</span>
          </button>

          <button
            id="tab-account-wishlist"
            onClick={() => setActiveTab('wishlist')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-colors relative cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'wishlist'
                ? 'text-amber-900 border-b-2 border-amber-900'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist ({wishlistProducts.length})</span>
          </button>

          <button
            id="tab-account-details"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-colors relative cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'details'
                ? 'text-amber-900 border-b-2 border-amber-900'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account Details</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ORDER HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {myOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4">
                <Package className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-stone-800">
                  No orders placed yet
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Discover our royal Banarasi silks, organza dupattas, and bridal lehengas to place your initial curation.
                </p>
                <button
                  onClick={() => setCurrentView('shop')}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold px-6 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4"
                  >
                    {/* Order header row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100 text-xs">
                      <div>
                        <span className="text-stone-400 block">Order Reference</span>
                        <span className="font-mono font-bold text-stone-900 text-sm">
                          {order.orderNumber}
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-400 block">Date Placed</span>
                        <span className="font-medium text-stone-700">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-400 block">Status</span>
                        <span
                          className={`inline-block font-bold text-[11px] px-2.5 py-0.5 rounded-full border ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.orderStatus === 'Shipped'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : order.orderStatus === 'Return Requested'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-stone-100 text-stone-800 border-stone-200'
                          }`}
                        >
                          {order.orderStatus === 'Cancelled' ? 'Order Cancelled' : order.orderStatus}
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-400 block">Payment</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : order.paymentStatus === 'Failed'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {order.paymentStatus === 'Paid' ? (
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            ) : order.paymentStatus === 'Failed' ? (
                              <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            )}
                            <span>{order.paymentStatus}</span>
                          </span>
                          <span className="text-[10px] text-stone-500 hidden sm:inline font-mono">
                            {order.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Razorpay'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-stone-400 block">Total Amount</span>
                        <span className="font-bold text-stone-900 text-sm">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Professional Order Status Timeline */}
                    <div className="p-5 bg-stone-50 border border-stone-200 rounded-3xl">
                      <OrderStatusTimeline order={order} />
                    </div>

                    {/* Cancelled Order Notice Banner */}
                    {order.orderStatus === 'Cancelled' && (
                      <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-xs flex items-start gap-2.5 text-rose-900">
                        <Ban className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold block uppercase tracking-wide text-xs">
                            ORDER CANCELLED
                          </span>
                          <p className="text-stone-700 text-[11px]">
                            Cancellation Reason:{' '}
                            <strong className="text-rose-950 font-semibold">
                              {order.cancelledBy?.toLowerCase() === 'admin'
                                ? order.cancellationReason || 'Order could not be fulfilled'
                                : order.customerCancellationReason || order.cancellationReason || 'Customer requested cancellation'}
                            </strong>
                            {order.cancelledBy?.toLowerCase() !== 'admin' && order.cancellationDetails && ` ("${order.cancellationDetails}")`}
                          </p>
                          {order.cancelledAt && (
                            <span className="text-stone-400 text-[10px] block">
                              Cancelled on {new Date(order.cancelledAt).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Courier Partner & Track My Order button */}
                    {(isValidTrackingUrl(order.trackingUrl) || Boolean(order.courierPartner || order.courier)) && (
                      <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 text-stone-900">
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
                            id={`btn-track-order-${order.orderNumber}`}
                            href={order.trackingUrl!.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                          >
                            <span>TRACK MY ORDER</span>
                            <ExternalLink className="w-3 h-3 text-amber-300" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Items in order */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {item.productImage && item.productImage.trim() !== '' ? (
                            <img
                              src={item.productImage.trim()}
                              alt={item.productName}
                              className="w-12 h-14 object-cover rounded-lg bg-stone-100 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-14 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-900 font-serif font-bold text-xs shrink-0">
                              {item.productName?.slice(0, 2).toUpperCase() || 'ITEM'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0 text-xs">
                            <h4 className="font-serif font-semibold text-stone-900 truncate">
                              {item.productName}
                            </h4>
                            <span className="text-stone-500">
                              Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-stone-900">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions Footer */}
                    <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        {/* WhatsApp Help */}
                        <a
                          href={getWhatsAppOrderHelpUrl(order.orderNumber)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-medium"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Order Assistance on WhatsApp</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* View Details Button */}
                        <button
                          id={`btn-view-order-details-${order.orderNumber}`}
                          onClick={() => setDetailsModalOrder(order)}
                          className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 font-semibold text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-stone-500" />
                          <span>View Details</span>
                        </button>

                        {/* Cancel Order if eligible */}
                        {isOrderCancellable(order) && (
                          <button
                            id={`btn-cancel-order-${order.orderNumber}`}
                            onClick={() => setCancelModalOrder(order)}
                            className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5 text-rose-600" />
                            <span>Cancel Order</span>
                          </button>
                        )}

                        {/* Return Request Button if Delivered */}
                        {order.orderStatus === 'Delivered' && (
                          <button
                            onClick={() => setReturnModalOrder(order)}
                            className="inline-flex items-center gap-1 bg-amber-900 hover:bg-amber-950 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Request Return</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WISHLIST */}
        {/* ========================================================================= */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            {wishlistProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4">
                <Heart className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-stone-800">
                  Your wishlist is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Save your favorite silhouettes, handwoven sarees, and bespoke bridal pieces to keep track of seasonal availability.
                </p>
                <button
                  onClick={() => setCurrentView('shop')}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold px-6 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  Explore Luxury Collections
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative aspect-3/4 bg-stone-100 overflow-hidden">
                      <img
                        src={prod.images?.[0] && prod.images[0].trim() !== '' ? prod.images[0].trim() : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c'}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => toggleWishlist(prod.id)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-full text-rose-600 hover:bg-white transition-colors cursor-pointer shadow-xs"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                          {prod.categoryName || prod.brand || 'Luxury Silk'}
                        </span>
                        <h4 className="font-serif text-sm font-bold text-stone-900 truncate">
                          {prod.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-bold text-stone-900">
                            ₹{prod.sellingPrice?.toLocaleString('en-IN')}
                          </span>
                          {prod.mrp && prod.mrp > prod.sellingPrice && (
                            <span className="text-xs text-stone-400 line-through">
                              ₹{prod.mrp?.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex gap-2">
                        <button
                          onClick={() => {
                            addToCart(prod, prod.sizes?.[0] || 'Free Size', prod.colors?.[0] || 'Standard');
                            toggleWishlist(prod.id);
                          }}
                          className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Move to Bag</span>
                        </button>
                        <button
                          onClick={() => toggleWishlist(prod.id)}
                          className="p-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ACCOUNT DETAILS */}
        {/* ========================================================================= */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 sm:p-8 max-w-2xl">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Client Profile Details</h3>
                <p className="text-xs text-stone-500">
                  Update your contact details for insured deliveries and billing invoices
                </p>
              </div>
            </div>

            {profileError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              {/* Customer Name */}
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Customer Name <span className="text-amber-800">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="profile-name"
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    disabled={profileSaving}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label
                  htmlFor="profile-phone"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Mobile Number <span className="text-amber-800">*</span>
                </label>
                <div className="relative flex">
                  <div className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-200 bg-stone-100 text-stone-700 text-xs font-bold shrink-0">
                    <span className="mr-1.5">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="10-digit Indian mobile number"
                    maxLength={14}
                    disabled={profileSaving}
                    className="w-full pl-3 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-r-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  10 digits starting with 6, 7, 8, or 9. Required for delivery tracking.
                </p>
              </div>

              {/* Email Address */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="profile-email"
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700"
                  >
                    E-mail Address
                  </label>
                  <span className="text-[11px] font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="profile-email"
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="name@example.com (optional)"
                    disabled={profileSaving}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Adding an email allows PDF invoices and automated password recovery links.
                </p>
              </div>

              {/* Security info box */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/70 text-xs text-stone-600 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block text-stone-900 font-semibold mb-0.5">
                    Encrypted Authentication Protocol
                  </strong>
                  Your customer password is encrypted via Firebase Authentication. Passwords are never stored in Firestore documents.
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  id="btn-save-profile"
                  type="submit"
                  disabled={profileSaving}
                  className="py-3.5 px-6 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {profileSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-amber-300" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        order={cancelModalOrder}
        isOpen={!!cancelModalOrder}
        onClose={() => setCancelModalOrder(null)}
        onCancelled={(updatedOrder) => {
          if (detailsModalOrder && detailsModalOrder.id === updatedOrder.id) {
            setDetailsModalOrder(updatedOrder);
          }
        }}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={detailsModalOrder}
        isOpen={!!detailsModalOrder}
        onClose={() => setDetailsModalOrder(null)}
        onOpenCancelModal={(ord) => setCancelModalOrder(ord)}
        onOpenReturnModal={(ord) => setReturnModalOrder(ord)}
      />

      {/* Return Request Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setReturnModalOrder(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-800" />
                <span>Initiate Return: #{returnModalOrder.orderNumber}</span>
              </h3>
              <button onClick={() => setReturnModalOrder(null)}>
                <X className="w-5 h-5 text-stone-500 cursor-pointer" />
              </button>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Mandatory Directive:</strong> Please do NOT ship parcels to our registered Malad office. Once submitted, our team will schedule an authorized door-to-door courier reverse pickup with security sealing.
            </div>

            {returnSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium text-center">
                Return request submitted successfully! We will coordinate reverse pickup via SMS/WhatsApp within 24 hours.
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-2">
                    Please Select a Reason for Return / Exchange *
                  </label>
                  <div className="space-y-2">
                    {RETURN_REASONS.map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedReturnReason === reason
                            ? 'bg-amber-50 border-amber-800 text-amber-950 font-semibold'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="returnReason"
                          value={reason}
                          checked={selectedReturnReason === reason}
                          onChange={() => setSelectedReturnReason(reason)}
                          className="w-4 h-4 text-amber-900 border-stone-300 focus:ring-amber-900 accent-amber-900"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedReturnReason === 'Other' && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                      Please Specify *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={otherReturnReason}
                      onChange={(e) => setOtherReturnReason(e.target.value)}
                      placeholder="Please provide details about your return request..."
                      className="w-full bg-stone-50 text-xs p-3 rounded-xl border border-stone-300 focus:outline-hidden focus:bg-white"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setReturnModalOrder(null);
                      setSelectedReturnReason(RETURN_REASONS[0]);
                      setOtherReturnReason('');
                    }}
                    className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold px-6 py-2.5 rounded-xl cursor-pointer shadow-xs"
                  >
                    Confirm Return Pickup
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
