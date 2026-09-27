import React, { useState, useEffect } from 'react';
import {
  Banknote,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Truck,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
  CreditCard,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ShippingAddress, PaymentMethod } from '../types';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTotal,
    appliedCoupon,
    createOrder,
    confirmRazorpayOrder,
    setCurrentView,
    user,
  } = useStore();

  const [address, setAddress] = useState<ShippingAddress>(() => {
    try {
      const saved = sessionStorage.getItem('fashinery_checkout_draft');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      fullName: user?.displayName || '',
      phone: '',
      email: user?.email || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      country: 'India',
    };
  });

  // Keep draft persisted in sessionStorage so refreshes do not lose user data
  useEffect(() => {
    try {
      sessionStorage.setItem('fashinery_checkout_draft', JSON.stringify(address));
    } catch {
      // ignore
    }
  }, [address]);

  // Track touched fields for displaying contextual inline validation
  const [touched, setTouched] = useState<Record<string, boolean>>({
    fullName: false,
    phone: false,
    email: false,
    addressLine1: false,
    city: false,
    state: false,
    pincode: false,
  });

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Payment method selection: Cash on Delivery or Online Payment (Razorpay)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');

  // --- Strict Validation Rules ---
  // 1. Full Name: Compulsory, cannot be empty
  const isFullNameValid = address.fullName.trim().length >= 2;
  const fullNameError = 'Please enter your full name.';

  // 2. Mobile Number: India only, exactly 10 digits, starts with 6, 7, 8 or 9, no letters/spaces/symbols
  const isPhoneValid = /^[6-9]\d{9}$/.test(address.phone);
  const phoneError = 'Please enter a valid 10-digit Indian mobile number.';

  // 3. Email Address: Compulsory, valid email format
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim());
  const emailError = 'Please enter a valid email address.';

  // 4. Complete Address: Compulsory, cannot be empty, requires complete delivery address
  const isAddressValid = address.addressLine1.trim().length >= 5;
  const addressError = 'Please enter your complete delivery address.';

  // 5. City: Compulsory, cannot be empty
  const isCityValid = address.city.trim().length >= 2;
  const cityError = 'Please enter your city.';

  // 6. State: Compulsory, cannot be empty
  const isStateValid = address.state.trim().length >= 2;
  const stateError = 'Please select or enter your state.';

  // 7. PIN Code: India only, exactly 6 digits, no letters or symbols
  const isPincodeValid = /^[1-9]\d{5}$/.test(address.pincode);
  const pincodeError = 'Please enter a valid 6-digit PIN code.';

  // Overall Form Validation - ALL 7 fields MUST be valid
  const isFormValid =
    isFullNameValid &&
    isPhoneValid &&
    isEmailValid &&
    isAddressValid &&
    isCityValid &&
    isStateValid &&
    isPincodeValid;

  // Visibility flags for red validation error messages
  const showFullNameError = (touched.fullName || attemptedSubmit) && !isFullNameValid;
  const showPhoneError = (touched.phone || attemptedSubmit) && !isPhoneValid;
  const showEmailError = (touched.email || attemptedSubmit) && !isEmailValid;
  const showAddressError = (touched.addressLine1 || attemptedSubmit) && !isAddressValid;
  const showCityError = (touched.city || attemptedSubmit) && !isCityValid;
  const showStateError = (touched.state || attemptedSubmit) && !isStateValid;
  const showPincodeError = (touched.pincode || attemptedSubmit) && !isPincodeValid;

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const markAllTouched = () => {
    setTouched({
      fullName: true,
      phone: true,
      email: true,
      addressLine1: true,
      city: true,
      state: true,
      pincode: true,
    });
    setAttemptedSubmit(true);
  };

  // Restrict Mobile Number input: digits only, strip country code if pasted, exactly 10 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    // If user pasted with 91 or 0 prefix
    if (val.length === 11 && val.startsWith('0')) {
      val = val.slice(1);
    } else if (val.length === 12 && val.startsWith('91')) {
      val = val.slice(2);
    }
    val = val.slice(0, 10);
    setAddress((prev) => ({ ...prev, phone: val }));
  };

  // Restrict PIN Code input: digits only, exactly 6 digits
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setAddress((prev) => ({ ...prev, pincode: val }));
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <ShoppingBag className="w-12 h-12 text-stone-400 mb-3" />
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          Please select a garment before proceeding to checkout.
        </p>
        <button
          onClick={() => setCurrentView('shop')}
          className="bg-stone-900 text-white text-xs uppercase tracking-wider font-semibold px-6 py-3 rounded-lg cursor-pointer"
        >
          Return to Collections
        </button>
      </div>
    );
  }

  const handleRazorpayCheckout = async () => {
    if (!isFormValid) {
      markAllTouched();
      setErrorMsg('Please complete all compulsory fields (*) marked in red before proceeding to payment.');
      const firstInvalid = document.querySelector('[data-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstInvalid as HTMLElement).focus?.();
      }
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Create order on secure backend
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          shippingAddress: address,
          couponCode: appliedCoupon?.code,
          customerUserId: user ? user.uid : 'guest',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            'Could not initiate Razorpay payment. Please verify your network or choose Cash on Delivery.'
        );
      }

      // 2. Ensure Razorpay checkout script is loaded
      const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
          if ((window as any).Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !(window as any).Razorpay) {
        throw new Error(
          'Razorpay payment checkout failed to load. Please disable ad-blockers, check internet connection, or choose Cash on Delivery.'
        );
      }

      // 3. Launch official Razorpay standard checkout popup
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'FASHINERY',
        description: `Order #${data.orderNumber} - Elegance in Every Look`,
        image: '/assets/fashinery-favicon.svg',
        order_id: data.razorpayOrderId,
        prefill: {
          name: address.fullName,
          email: address.email,
          contact: address.phone,
        },
        notes: {
          orderNumber: data.orderNumber,
        },
        theme: {
          color: '#1c1917',
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            fetch('/api/razorpay/mark-failed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderNumber: data.orderNumber,
                reason: 'Customer dismissed payment window before completion.',
              }),
            }).catch(() => {});
            setErrorMsg('Payment cancelled or window closed. You can retry or choose Cash on Delivery.');
          },
        },
        handler: async (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setSubmitting(true);
            // 4. Verify payment signature on server
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderNumber: data.orderNumber,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                appliedCouponId: data.appliedCouponId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(
                verifyData.error ||
                  'Payment verification failed. If money was debited, please contact customer support.'
              );
            }

            sessionStorage.removeItem('fashinery_checkout_draft');
            const verifiedOrder = {
              ...data.order,
              paymentMethod: 'UPI / Online Payment' as PaymentMethod,
              paymentStatus: 'Paid' as const,
              orderStatus: 'Confirmed' as const,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpaySignature: paymentResponse.razorpay_signature,
              paidAt: verifyData.paidAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            confirmRazorpayOrder(verifiedOrder);
          } catch (verErr: any) {
            console.error('Payment verification failed:', verErr);
            setErrorMsg(
              verErr.message ||
                'Payment verification error. If amount was debited, please reach us on WhatsApp or Email.'
            );
            setSubmitting(false);
          }
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);

      razorpayInstance.on('payment.failed', (failedResp: any) => {
        setSubmitting(false);
        const desc =
          failedResp.error?.description ||
          failedResp.error?.reason ||
          'Payment transaction was declined or failed.';
        setErrorMsg(`Payment Failed: ${desc}`);
        fetch('/api/razorpay/mark-failed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: data.orderNumber,
            reason: desc,
          }),
        }).catch(() => {});
      });

      razorpayInstance.open();
    } catch (checkoutErr: any) {
      console.error('Razorpay checkout error:', checkoutErr);
      setErrorMsg(
        checkoutErr.message ||
          'Could not start Razorpay payment. Please try again or switch to Cash on Delivery.'
      );
      setSubmitting(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Hard gate: form must be 100% valid. Bypassing HTML will still fail here & in StoreContext.
    if (!isFormValid) {
      markAllTouched();
      setErrorMsg('Please complete all compulsory fields (*) marked in red before placing your order.');
      const firstInvalid = document.querySelector('[data-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstInvalid as HTMLElement).focus?.();
      }
      return;
    }

    if (paymentMethod === 'Razorpay / Online' || paymentMethod === 'UPI / Online Payment') {
      await handleRazorpayCheckout();
      return;
    }

    setSubmitting(true);
    try {
      await createOrder(address, 'Cash on Delivery');
      sessionStorage.removeItem('fashinery_checkout_draft');
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMsg(err.message || 'Could not process order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="checkout-page" className="min-h-screen bg-[#faf7f2] py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs font-semibold tracking-[0.25em] text-amber-800 uppercase block mb-1">
            Secure Checkout
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Delivery &amp; Payment Details
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 mt-2">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit Encrypted Seamless Checkout</span>
          </div>
        </div>

        {errorMsg && (
          <div
            id="checkout-error-banner"
            className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium text-center flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left 7 Columns: Delivery Address & Payment Choice */}
            <div className="lg:col-span-7 space-y-8">
              {/* Shipping Address Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-800" />
                    <span>1. Shipping Destination</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    * All 7 fields compulsory
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 1: Full Name */}
                  <div>
                    <label
                      htmlFor="checkout-fullname"
                      className="block text-xs font-semibold uppercase text-stone-700 mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      id="checkout-fullname"
                      type="text"
                      required
                      value={address.fullName}
                      onBlur={() => markTouched('fullName')}
                      onChange={(e) => {
                        setAddress({ ...address, fullName: e.target.value });
                        markTouched('fullName');
                      }}
                      data-invalid={showFullNameError}
                      aria-invalid={showFullNameError}
                      aria-describedby={showFullNameError ? 'error-fullname' : undefined}
                      className={`w-full bg-stone-50 text-xs p-3 rounded-lg border transition-colors focus:outline-hidden focus:bg-white ${
                        showFullNameError
                          ? 'border-rose-500 bg-rose-50/30 text-stone-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                          : 'border-stone-300 focus:border-stone-900'
                      }`}
                      placeholder="e.g. Ananya Sharma"
                    />
                    {showFullNameError && (
                      <p
                        id="error-fullname"
                        className="text-rose-600 text-[11px] font-medium mt-1.5 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fullNameError}</span>
                      </p>
                    )}
                  </div>

                  {/* Field 2: Mobile Number */}
                  <div>
                    <label
                      htmlFor="checkout-phone"
                      className="block text-xs font-semibold uppercase text-stone-700 mb-1"
                    >
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500 text-xs font-medium">
                        +91
                      </div>
                      <input
                        id="checkout-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        value={address.phone}
                        onBlur={() => markTouched('phone')}
                        onChange={(e) => {
                          handlePhoneChange(e);
                          markTouched('phone');
                        }}
                        data-invalid={showPhoneError}
                        aria-invalid={showPhoneError}
                        aria-describedby={showPhoneError ? 'error-phone' : undefined}
                        className={`w-full bg-stone-50 text-xs p-3 pl-11 rounded-lg border transition-colors focus:outline-hidden focus:bg-white ${
                          showPhoneError
                            ? 'border-rose-500 bg-rose-50/30 text-stone-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                            : 'border-stone-300 focus:border-stone-900'
                        }`}
                        placeholder="9876543210"
                      />
                    </div>
                    {showPhoneError && (
                      <p
                        id="error-phone"
                        className="text-rose-600 text-[11px] font-medium mt-1.5 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Field 3: Email Address */}
                <div>
                  <label
                    htmlFor="checkout-email"
                    className="block text-xs font-semibold uppercase text-stone-700 mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={address.email}
                    onBlur={() => markTouched('email')}
                    onChange={(e) => {
                      setAddress({ ...address, email: e.target.value });
                      markTouched('email');
                    }}
                    data-invalid={showEmailError}
                    aria-invalid={showEmailError}
                    aria-describedby={showEmailError ? 'error-email' : undefined}
                    className={`w-full bg-stone-50 text-xs p-3 rounded-lg border transition-colors focus:outline-hidden focus:bg-white ${
                      showEmailError
                        ? 'border-rose-500 bg-rose-50/30 text-stone-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                        : 'border-stone-300 focus:border-stone-900'
                    }`}
                    placeholder="name@example.com"
                  />
                  {showEmailError && (
                    <p
                      id="error-email"
                      className="text-rose-600 text-[11px] font-medium mt-1.5 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                {/* Field 4: Complete Address */}
                <div>
                  <label
                    htmlFor="checkout-address"
                    className="block text-xs font-semibold uppercase text-stone-700 mb-1"
                  >
                    Complete Address *
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    required
                    value={address.addressLine1}
                    onBlur={() => markTouched('addressLine1')}
                    onChange={(e) => {
                      setAddress({ ...address, addressLine1: e.target.value });
                      markTouched('addressLine1');
                    }}
                    data-invalid={showAddressError}
                    aria-invalid={showAddressError}
                    aria-describedby={showAddressError ? 'error-address' : undefined}
                    className={`w-full bg-stone-50 text-xs p-3 rounded-lg border transition-colors focus:outline-hidden focus:bg-white ${
                      showAddressError
                        ? 'border-rose-500 bg-rose-50/30 text-stone-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                        : 'border-stone-300 focus:border-stone-900'
                    }`}
                    placeholder="Flat / House No., Building Name, Street / Road, Area"
                  />
                  {showAddressError && (
                    <p
                      id="error-address"
                      className="text-rose-600 text-[11px] font-medium mt-1.5 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{addressError}</span>
                    </p>
                  )}
                </div>

                {/* Optional Landmark */}
                <div>
                  <label
                    htmlFor="checkout-landmark"
                    className="block text-xs font-semibold uppercase text-stone-700 mb-1"
                  >
                    Landmark / Locality (Optional)
                  </label>
                  <input
                    id="checkout-landmark"
                    type="text"
                    value={address.addressLine2}
                    onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                    className="w-full bg-stone-50 text-xs p-3 rounded-lg border border-stone-300 focus:outline-hidden focus:bg-white focus:border-stone-900"
                    placeholder="e.g. Near Shiv Mandir / Behind Metro Station"
                  />
                </div>

                {/* City, State, PIN Code Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Field 5: City */}
                  <div>
                    <label
                      htmlFor="checkout-city"
                      className="block text-xs font-semibold uppercase text-stone-700 mb-1"
                    >
                      City *
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      value={address.city}
                      onBlur={() => markTouched('city')}
                      onChange={(e) => {
                        setAddress({ ...address, city: e.target.value });
                        markTouched('city');
                      }}
                      data-invalid={showCityError}
                      aria-invalid={showCityError}
                      aria-describedby={showCityError ? 'error-city' : undefined}
                      className={`w-full bg-stone-50 text-xs p-3 rounded-lg border transition-colors focus:outline-hidden focus:bg-white ${
                        showCityError
                          ? 'border-rose-500 bg-rose-50/30 text-stone-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                          : 'border-stone-300 focus:border-stone-900'
                      }`}
                      placeholder="e.g. Mumbai"
                    />
                    {showCityError && (
                      <p
                        id="error-city"
                        className="text-rose-600 text-[11px] font-medium mt-1.5 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{cityError}</span>
                      </p>
                    )}
                  </div>

                  {/* Field 6: State */}
                  <div>
                    <label
                      htmlFor="checkout-state"
                      className="block text-xs font-semibold uppercase text-stone-700 mb-1"
                    >
                      State *
                    </label>
                    <select
                      id="checkout-state"
                      required
                      value={address.state}
                      onBlur={() => markTouched('state')}
                      onChange={(e) => {
                        setAddress({ ...address, state: e.target.value });
                        markTouched('state');
                      }}
                      data-invalid={showStateError}
                      aria-invalid={showStateError}
                      aria-describedby={showStateError ? 'error-state' : undefined}
                      className={`w-full bg-stone-50 text-xs p-3 rounded-lg border transition-colors focus:outline-hidden focus:bg-white cursor-pointer ${
                        showStateError
                          ? 'border-rose-500 bg-rose-50/30 text-stone-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                          : 'border-stone-300 focus:border-stone-900'
                      }`}
                    >
                      <option value="">Select State *</option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                      {address.state && !INDIAN_STATES.includes(address.state) && (
                        <option value={address.state}>{address.state}</option>
                      )}
                    </select>
                    {showStateError && (
                      <p
                        id="error-state"
                        className="text-rose-600 text-[11px] font-medium mt-1.5 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{stateError}</span>
                      </p>
                    )}
                  </div>

                  {/* Field 7: PIN Code */}
                  <div>
                    <label
                      htmlFor="checkout-pincode"
                      className="block text-xs font-semibold uppercase text-stone-700 mb-1"
                    >
                      PIN Code *
                    </label>
                    <input
                      id="checkout-pincode"
                      type="text"
                      inputMode="numeric"
                      required
                      maxLength={6}
                      value={address.pincode}
                      onBlur={() => markTouched('pincode')}
                      onChange={(e) => {
                        handlePincodeChange(e);
                        markTouched('pincode');
                      }}
                      data-invalid={showPincodeError}
                      aria-invalid={showPincodeError}
                      aria-describedby={showPincodeError ? 'error-pincode' : undefined}
                      className={`w-full bg-stone-50 text-xs p-3 rounded-lg border transition-colors focus:outline-hidden focus:bg-white ${
                        showPincodeError
                          ? 'border-rose-500 bg-rose-50/30 text-stone-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                          : 'border-stone-300 focus:border-stone-900'
                      }`}
                      placeholder="e.g. 400097"
                    />
                    {showPincodeError && (
                      <p
                        id="error-pincode"
                        className="text-rose-600 text-[11px] font-medium mt-1.5 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{pincodeError}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method Card - Cash on Delivery & Razorpay Online */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-amber-800" />
                    <span>2. Select Payment Method</span>
                  </h3>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>100% Secure</span>
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* Option 1: Cash on Delivery (COD) */}
                  <label
                    htmlFor="payment-cod"
                    className={`block p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'border-amber-900 bg-amber-50/40 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <input
                        id="payment-cod"
                        type="radio"
                        name="paymentMethod"
                        value="Cash on Delivery"
                        checked={paymentMethod === 'Cash on Delivery'}
                        onChange={() => setPaymentMethod('Cash on Delivery')}
                        className="mt-1 h-4 w-4 text-amber-900 border-stone-300 focus:ring-amber-900 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="text-sm font-bold text-stone-900 flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-amber-800" />
                            <span>Cash on Delivery (COD)</span>
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                            Zero Handling Fee
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          Pay cash or scan the delivery executive&apos;s UPI QR code directly upon doorstep delivery. No advance online payment required.
                        </p>

                        <div className="mt-3 pt-3 border-t border-stone-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-700">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>Zero COD handling fees</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>Doorstep parcel inspection</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>Cash or digital UPI at doorstep</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>Hassle-free 7-day return pickup</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Online Payment – Razorpay */}
                  <label
                    htmlFor="payment-razorpay"
                    className={`block p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'Razorpay / Online'
                        ? 'border-stone-900 bg-stone-50/80 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <input
                        id="payment-razorpay"
                        type="radio"
                        name="paymentMethod"
                        value="Razorpay / Online"
                        checked={paymentMethod === 'Razorpay / Online'}
                        onChange={() => setPaymentMethod('Razorpay / Online')}
                        className="mt-1 h-4 w-4 text-stone-900 border-stone-300 focus:ring-stone-900 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="text-sm font-bold text-stone-900 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-stone-900" />
                            <span>Online Payment – Razorpay</span>
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Instant &amp; Highly Recommended
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          Pay instantly via UPI (Google Pay, PhonePe, Paytm, BHIM), Debit &amp; Credit Cards (Visa, MasterCard, RuPay), NetBanking, or Wallets.
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-semibold bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded shadow-2xs">
                            UPI
                          </span>
                          <span className="text-[10px] font-semibold bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded shadow-2xs">
                            Google Pay
                          </span>
                          <span className="text-[10px] font-semibold bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded shadow-2xs">
                            PhonePe
                          </span>
                          <span className="text-[10px] font-semibold bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded shadow-2xs">
                            Paytm
                          </span>
                          <span className="text-[10px] font-semibold bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded shadow-2xs">
                            Cards &amp; NetBanking
                          </span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-stone-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-700">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>Instant order confirmation</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>100% Bank-grade SSL encryption</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>Zero transaction surcharge</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>Instant refund on eligible returns</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Official Razorpay Payment Gateway integration with server-side signature validation.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Order Summary Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6 sticky top-28">
                <h3 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-normal text-stone-500">
                    {cart.reduce((a, b) => a + b.quantity, 0)} Items
                  </span>
                </h3>

                {/* Items preview list */}
                <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-stone-100">
                  {cart.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                      {item.image && item.image.trim() !== '' ? (
                        <img
                          src={item.image.trim()}
                          alt={item.name}
                          className="w-14 h-16 object-cover rounded-md bg-stone-100 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-16 rounded-md bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-900 font-serif font-bold text-xs shrink-0">
                          {item.name?.slice(0, 2).toUpperCase() || 'ITEM'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-xs font-semibold text-stone-900 truncate">
                          {item.name}
                        </h4>
                        <span className="text-[11px] text-stone-500 block">
                          Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                        </span>
                        <span className="text-xs font-bold text-stone-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-stone-900">
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
                    <span>Insured Pan-India Express Delivery</span>
                    <span>
                      {cartShipping === 0 ? (
                        <span className="text-emerald-700 font-semibold uppercase text-[11px]">
                          COMPLIMENTARY
                        </span>
                      ) : (
                        `₹${cartShipping.toLocaleString('en-IN')}`
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex justify-between text-base font-bold text-stone-950">
                    <span>Grand Total</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Important Return Notice Reminder */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-lg text-[11px] text-amber-900">
                  <strong>Notice:</strong> 7-day hassle-free reverse pickup is included. Returns must be authorized online before pickup (no direct shipping to Malad address).
                </div>

                {/* Place Order CTA - Strictly Disabled Until All 7 Fields Validated */}
                <div className="space-y-2.5">
                  <button
                    id="btn-place-order"
                    type="submit"
                    disabled={!isFormValid || submitting}
                    onClick={(e) => {
                      if (!isFormValid) {
                        e.preventDefault();
                        markAllTouched();
                        setErrorMsg(
                          'Please complete all compulsory fields (*) marked in red before placing your order.'
                        );
                        const firstInvalid = document.querySelector('[data-invalid="true"]');
                        if (firstInvalid) {
                          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          (firstInvalid as HTMLElement).focus?.();
                        }
                      }
                    }}
                    className={`w-full text-white text-xs uppercase tracking-widest font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${
                      isFormValid && !submitting
                        ? 'bg-stone-950 hover:bg-stone-800 cursor-pointer shadow-stone-900/10 active:scale-[0.99]'
                        : 'bg-stone-400 cursor-not-allowed opacity-50 shadow-none'
                    }`}
                    aria-disabled={!isFormValid || submitting}
                  >
                    {submitting ? (
                      <span>
                        {paymentMethod === 'Razorpay / Online'
                          ? 'Opening Razorpay Secure Gateway...'
                          : 'Confirming Order...'}
                      </span>
                    ) : paymentMethod === 'Razorpay / Online' ? (
                      <>
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>Pay ₹{cartTotal.toLocaleString('en-IN')} with Razorpay</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Place Cash on Delivery Order (₹{cartTotal.toLocaleString('en-IN')})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Clear status note for shoppers */}
                  {!isFormValid && (
                    <div
                      id="checkout-validation-hint"
                      className="p-2.5 bg-amber-50/90 border border-amber-200/80 rounded-lg text-[11px] text-amber-900 flex items-center justify-center gap-1.5 text-center font-medium"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                      <span>Complete all 7 mandatory fields (*) with valid details to place order</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-stone-500 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Buyer Protection &amp; Quality Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
