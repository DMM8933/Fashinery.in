import React, { useState } from 'react';
import {
  User,
  Lock,
  Phone,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  validateIndianMobile,
  validateRequiredEmail,
  validatePassword,
  checkPasswordPolicy,
} from '../utils/validation';
import { BrandLogo } from './BrandLogo';

interface CustomerAuthCardProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const CustomerAuthCard: React.FC<CustomerAuthCardProps> = ({
  initialMode = 'login',
  onSuccess,
}) => {
  const {
    loginCustomer,
    registerCustomer,
    loginWithGoogle,
    sendCustomerPasswordReset,
    authError,
    clearAuthError,
    setCurrentView,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State (Name, Mobile, REQUIRED Email, Password, Confirm Password)
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Real-time password policy for registration
  const regPolicy = checkPasswordPolicy(regPassword, regConfirmPassword);
  const isRegFormValid =
    regName.trim().length > 0 &&
    regPhone.trim().length >= 10 &&
    regEmail.trim().includes('@') &&
    regPolicy.minLength &&
    regPolicy.hasUpper &&
    regPolicy.hasLower &&
    regPolicy.hasNumber &&
    regPolicy.matchesConfirm;

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Clear errors when switching tabs
  const handleTabSwitch = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setLocalError(null);
    setSuccessMessage(null);
    clearAuthError();
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    clearAuthError();

    const cleanId = loginIdentifier.trim();
    if (!cleanId) {
      setLocalError('Please enter your Email or 10-digit Mobile Number.');
      return;
    }
    if (!loginPassword) {
      setLocalError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await loginCustomer(cleanId, loginPassword);
      setSuccessMessage('Welcome back! Logging you into your client account...');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLocalError(err.message || 'Unable to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Register with Required Email & Strong Password Policy
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    clearAuthError();

    // 1. Customer Name validation
    if (!regName.trim()) {
      setLocalError('Customer Name is required.');
      return;
    }

    // 2. Mobile Number validation
    const phoneVal = validateIndianMobile(regPhone);
    if (!phoneVal.isValid) {
      setLocalError(phoneVal.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // 3. REQUIRED Email validation (Mandatory for Firebase security and password reset)
    const emailVal = validateRequiredEmail(regEmail);
    if (!emailVal.isValid) {
      setLocalError(emailVal.error || 'Email address is required for account security and recovery.');
      return;
    }

    // 4. Strong Password validation (8+ chars, uppercase, lowercase, number, match confirm)
    const passVal = validatePassword(regPassword, regConfirmPassword);
    if (!passVal.isValid) {
      setLocalError(passVal.error || 'Password must meet all security requirements.');
      return;
    }

    setLoading(true);
    try {
      await registerCustomer({
        name: regName.trim(),
        phone: phoneVal.cleanPhone,
        email: emailVal.cleanEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });
      setSuccessMessage('Account created successfully! Welcome to FASHINERY.');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLocalError(err.message || 'Registration could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setLocalError(null);
    setSuccessMessage(null);
    clearAuthError();
    setLoading(true);
    try {
      await loginWithGoogle(false);
      setSuccessMessage('Signed in with Google successfully!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLocalError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Submit (Strict Anti-Enumeration)
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage(null);

    const cleanInput = forgotIdentifier.trim();
    if (!cleanInput) {
      setForgotMessage({
        type: 'error',
        text: 'Please enter your registered Email address.',
      });
      return;
    }

    setForgotLoading(true);
    try {
      const res = await sendCustomerPasswordReset(cleanInput);
      setForgotMessage({
        type: 'success',
        text:
          res.message ||
          'If an account exists for this email address, a password reset link has been sent. Please check your inbox and spam folder.',
      });
    } catch (err: any) {
      setForgotMessage({
        type: 'error',
        text: err.message || 'Could not initiate password reset. Please try again.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const currentError = localError || authError;

  return (
    <div id="customer-auth-card" className="w-full max-w-xl mx-auto">
      {/* Brand Framing Header */}
      <div className="text-center mb-8">
        <div className="inline-flex justify-center mb-4">
          <BrandLogo size="md" showSlogan={false} theme="light" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-amber-800 font-semibold mb-1">
          Client Authentication
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          {activeTab === 'login' ? 'Welcome Back to Fashinery' : 'Create Your Client Account'}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-md mx-auto">
          {activeTab === 'login'
            ? 'Access your curated orders, doorstep returns, and exclusive luxury wishlist.'
            : 'Join our bespoke circle for handcrafted collections, priority dispatch, and concierge support.'}
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        {/* Navigation Tabs: LOGIN ACCOUNT & REGISTER ACCOUNT */}
        <div className="grid grid-cols-2 border-b border-stone-200 bg-stone-50/70 p-1.5 gap-1.5">
          <button
            id="tab-btn-login"
            type="button"
            onClick={() => handleTabSwitch('login')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all rounded-2xl cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/70'
            }`}
          >
            1. Login Account
          </button>
          <button
            id="tab-btn-register"
            type="button"
            onClick={() => handleTabSwitch('register')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all rounded-2xl cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/70'
            }`}
          >
            2. Register Account
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* Notification Banners */}
          {currentError && (
            <div
              id="auth-alert-error"
              className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-rose-800 animate-in fade-in"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{currentError}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLocalError(null);
                  clearAuthError();
                }}
                className="p-1 text-rose-500 hover:text-rose-800 rounded-lg hover:bg-rose-100 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {successMessage && (
            <div
              id="auth-alert-success"
              className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* ================================================== */}
          {/* TAB 1: LOGIN ACCOUNT FORM */}
          {/* ================================================== */}
          {activeTab === 'login' && (
            <form id="form-customer-login" onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email or Mobile Number Input */}
              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-identifier"
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter email or 10-digit mobile number"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  You can enter your registered email ID or your 10-digit mobile number.
                </p>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700"
                  >
                    Password
                  </label>
                  <button
                    id="btn-forgot-password"
                    type="button"
                    onClick={() => {
                      clearAuthError();
                      setCurrentView('forgot-password');
                      if (typeof window !== 'undefined') {
                        window.location.hash = '/forgot-password';
                      }
                    }}
                    className="text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your account password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary LOGIN Button */}
              <div className="pt-2">
                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 active:bg-black text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>LOGIN</span>
                      <ArrowRight className="w-4 h-4 text-amber-300" />
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-white px-3 text-stone-400 font-medium">or continue with</span>
                </div>
              </div>

              {/* Continue with Google Button */}
              <button
                id="btn-google-login"
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 border border-stone-300 hover:border-stone-400 hover:bg-stone-50 active:bg-stone-100 text-stone-700 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.9 6.4C.7 8.8 0 10.8 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Google Security Clarification */}
              <p className="text-[11px] text-stone-500 text-center mt-2 leading-relaxed">
                Google account passwords are encrypted and managed directly by Google.
              </p>

              {/* Toggle to Register */}
              <div className="pt-4 text-center border-t border-stone-100 mt-6">
                <p className="text-xs sm:text-sm text-stone-600">
                  Don't have an account?{' '}
                  <button
                    id="btn-switch-to-register"
                    type="button"
                    onClick={() => handleTabSwitch('register')}
                    className="font-bold text-amber-900 hover:text-amber-950 underline decoration-amber-400 hover:decoration-amber-900 underline-offset-4 transition-colors cursor-pointer"
                  >
                    Register Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ================================================== */}
          {/* TAB 2: REGISTER ACCOUNT FORM */}
          {/* ================================================== */}
          {activeTab === 'register' && (
            <form id="form-customer-register" onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Required notice header */}
              <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                  Personal Details
                </span>
                <span className="text-xs font-semibold text-amber-800">* Required fields</span>
              </div>

              {/* 1. Customer Name * */}
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Customer Name <span className="text-amber-800">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    autoComplete="name"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                  />
                </div>
              </div>

              {/* 2. Mobile Number * */}
              <div>
                <label
                  htmlFor="reg-phone"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Mobile Number <span className="text-amber-800">*</span>
                </label>
                <div className="relative flex">
                  {/* Indian Country Code Badge */}
                  <div className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-200 bg-stone-100/80 text-stone-700 text-xs font-bold shrink-0">
                    <span className="mr-1.5">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="10-digit Indian mobile number"
                    autoComplete="tel-national"
                    maxLength={14}
                    disabled={loading}
                    className="w-full pl-3 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-r-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                  <span>Must be 10 digits starting with 6, 7, 8, or 9. Used for delivery updates.</span>
                </p>
              </div>

              {/* 3. E-mail Address (REQUIRED) */}
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  E-mail Address <span className="text-amber-800">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Required for account protection, order receipts, and password resets.
                </p>
              </div>

              {/* 4. Password * */}
              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Password <span className="text-amber-800">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password (min. 8 characters)"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 5. Confirm Password * */}
              <div>
                <label
                  htmlFor="reg-confirm-password"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Confirm Password <span className="text-amber-800">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-confirm-password"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                    aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Real-time Password Security Policy Checklist */}
              {regPassword && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                    <span>Password Security Policy</span>
                    <span
                      className={
                        regPolicy.strength === 'very-strong' || regPolicy.strength === 'strong'
                          ? 'text-emerald-700 font-bold'
                          : regPolicy.strength === 'fair'
                          ? 'text-amber-700 font-medium'
                          : 'text-stone-500'
                      }
                    >
                      {regPolicy.strength.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <div className={regPolicy.minLength ? 'text-emerald-700' : 'text-stone-400'}>
                      {regPolicy.minLength ? '✓' : '○'} At least 8 chars
                    </div>
                    <div className={regPolicy.hasUpper ? 'text-emerald-700' : 'text-stone-400'}>
                      {regPolicy.hasUpper ? '✓' : '○'} Uppercase letter
                    </div>
                    <div className={regPolicy.hasLower ? 'text-emerald-700' : 'text-stone-400'}>
                      {regPolicy.hasLower ? '✓' : '○'} Lowercase letter
                    </div>
                    <div className={regPolicy.hasNumber ? 'text-emerald-700' : 'text-stone-400'}>
                      {regPolicy.hasNumber ? '✓' : '○'} One number (0-9)
                    </div>
                  </div>

                  {regConfirmPassword && (
                    <div
                      className={`text-[11px] pt-1 border-t border-stone-200/60 font-medium ${
                        regPolicy.matchesConfirm ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {regPolicy.matchesConfirm ? '✓ Passwords match' : '✕ Passwords do not match'}
                    </div>
                  )}
                </div>
              )}

              {/* Submit CREATE ACCOUNT Button */}
              <div className="pt-2">
                <button
                  id="btn-submit-register"
                  type="submit"
                  disabled={loading || !isRegFormValid}
                  className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 active:bg-black text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>CREATE ACCOUNT</span>
                      <ArrowRight className="w-4 h-4 text-amber-300" />
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-white px-3 text-stone-400 font-medium">or continue with</span>
                </div>
              </div>

              {/* Continue with Google Button */}
              <button
                id="btn-google-register"
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 border border-stone-300 hover:border-stone-400 hover:bg-stone-50 active:bg-stone-100 text-stone-700 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.9 6.4C.7 8.8 0 10.8 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Toggle to Login */}
              <div className="pt-4 text-center border-t border-stone-100 mt-6">
                <p className="text-xs sm:text-sm text-stone-600">
                  Already have an account?{' '}
                  <button
                    id="btn-switch-to-login"
                    type="button"
                    onClick={() => handleTabSwitch('login')}
                    className="font-bold text-amber-900 hover:text-amber-950 underline decoration-amber-400 hover:decoration-amber-900 underline-offset-4 transition-colors cursor-pointer"
                  >
                    Login Account
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Security & Client Guarantee Badges */}
      <div className="mt-8 grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-white/70 rounded-2xl border border-stone-200/60 flex flex-col items-center">
          <ShieldCheck className="w-4 h-4 text-amber-800 mb-1" />
          <span className="text-[11px] font-bold text-stone-800">Bank-Grade Security</span>
          <span className="text-[10px] text-stone-500">Firebase Encrypted</span>
        </div>
        <div className="p-3 bg-white/70 rounded-2xl border border-stone-200/60 flex flex-col items-center">
          <Phone className="w-4 h-4 text-amber-800 mb-1" />
          <span className="text-[11px] font-bold text-stone-800">WhatsApp Updates</span>
          <span className="text-[10px] text-stone-500">Real-time Tracking</span>
        </div>
        <div className="p-3 bg-white/70 rounded-2xl border border-stone-200/60 flex flex-col items-center">
          <Sparkles className="w-4 h-4 text-amber-800 mb-1" />
          <span className="text-[11px] font-bold text-stone-800">VIP Privileges</span>
          <span className="text-[10px] text-stone-500">Priority Doorstep Care</span>
        </div>
      </div>

      {/* ================================================== */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ================================================== */}
      {showForgotModal && (
        <div
          id="modal-forgot-password"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xl relative animate-in zoom-in-95">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotMessage(null);
              }}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Reset Account Password</h3>
                <p className="text-xs text-stone-500">Fast and secure recovery</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Enter your registered <strong>Email Address</strong> or <strong>10-digit Mobile Number</strong> below to retrieve or reset your password.
            </p>

            {forgotMessage && (
              <div
                className={`mb-4 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                  forgotMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : forgotMessage.type === 'info'
                    ? 'bg-amber-50 text-amber-950 border border-amber-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                {forgotMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed">{forgotMessage.text}</div>
              </div>
            )}

            {/* If info about mobile-only account recovery, show WhatsApp concierge CTA */}
            {forgotMessage?.type === 'info' && (
              <div className="mb-4">
                <a
                  href="https://wa.me/919372085090?text=Hi%20Fashinery%20Team%2C%20I%20registered%20using%20my%20mobile%20number%20and%20need%20assistance%20resetting%20my%20account%20password."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Contact Fashinery Concierge on WhatsApp</span>
                </a>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-identifier"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Registered Email or Mobile Number
                </label>
                <input
                  id="forgot-identifier"
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="e.g. ananya@example.com or 9876543210"
                  disabled={forgotLoading}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotMessage(null);
                  }}
                  className="flex-1 py-3 px-4 border border-stone-300 text-stone-700 text-xs font-semibold uppercase rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  id="btn-submit-forgot"
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {forgotLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
