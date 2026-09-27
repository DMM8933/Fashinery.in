import React, { useState, useEffect } from 'react';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  Sparkles,
  Send,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { validateRequiredEmail } from '../utils/validation';
import { BrandLogo } from '../components/BrandLogo';

export const ForgotPasswordPage: React.FC = () => {
  const { sendCustomerPasswordReset, setCurrentView, clearAuthError, authError } = useStore();

  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // Clear errors on initial load
  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  // Live countdown timer for rate limit cooldown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearAuthError();

    if (cooldownSeconds > 0) {
      setFormError(`Please wait ${cooldownSeconds}s before sending another password reset link.`);
      return;
    }

    const clean = emailInput.trim();
    const val = validateRequiredEmail(clean);
    if (!val.isValid) {
      setFormError(val.error || 'Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendCustomerPasswordReset(clean);
      setSubmitted(true);
      // Strictly neutral anti-enumeration message
      setStatusMessage(
        res.message ||
          'If an account exists for this email address, a password reset link has been sent. Please check your inbox and spam folder.'
      );
      if (res.cooldownSeconds) {
        setCooldownSeconds(res.cooldownSeconds);
      } else {
        setCooldownSeconds(60);
      }
    } catch (err: any) {
      // In case of error (e.g. rate limit), surface safely
      setFormError(err.message || 'Unable to request password reset. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    clearAuthError();
    setCurrentView('account');
    if (typeof window !== 'undefined' && window.location.hash) {
      window.location.hash = '/account';
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#fdfbf7]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-4 transition-transform hover:scale-105 duration-300">
            <BrandLogo size="md" showSlogan={false} theme="light" />
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-amber-800 font-semibold mb-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Fashinery Concierge Security</span>
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Forgot Password?
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-sm mx-auto leading-relaxed">
            Enter your registered email address to receive secure instructions to reset your account password.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Neutral Success Notice (Anti-Enumeration) */}
          {submitted && statusMessage && (
            <div
              id="forgot-password-success-banner"
              className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h3 className="text-xs sm:text-sm font-semibold text-stone-900">
                    Reset Link Dispatched
                  </h3>
                  <p className="text-xs text-stone-700 leading-relaxed font-normal">
                    {statusMessage}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/60 text-[11px] text-stone-500 space-y-1">
                <p>• The reset link is valid for a limited time.</p>
                <p>• Make sure to check your promotional and spam folders if not received in a few minutes.</p>
              </div>

              {cooldownSeconds > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-900 font-medium pt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                  <span>Resend available in {cooldownSeconds} seconds</span>
                </div>
              )}
            </div>
          )}

          {/* Form Error Banner */}
          {(formError || authError) && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError || authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Enter your registered email address <span className="text-amber-800">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="forgot-email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="yourname@example.com"
                  autoComplete="email"
                  required
                  disabled={loading || (submitted && cooldownSeconds > 0)}
                  className="w-full pl-10 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all disabled:opacity-60"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1.5 flex items-center gap-1">
                <span>We protect your privacy. Account existence is never disclosed.</span>
              </p>
            </div>

            {/* Action Button */}
            <button
              id="btn-send-reset-link"
              type="submit"
              disabled={loading || !emailInput.trim() || (submitted && cooldownSeconds > 0)}
              className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 active:bg-black text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : submitted && cooldownSeconds > 0 ? (
                <>
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>Resend in {cooldownSeconds}s</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          {/* Security Assurance Box */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70 text-xs text-stone-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-stone-600">
              <strong className="text-stone-800 font-semibold">Official Firebase Security:</strong> Reset emails are dispatched directly by Firebase Authentication to the verified owner. Fashinery never stores or reads user passwords.
            </div>
          </div>

          {/* Navigation Links */}
          <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              id="btn-back-to-login"
              type="button"
              onClick={handleBackToLogin}
              className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>

            <a
              href="https://wa.me/919372085090?text=Hello%20Fashinery%20Concierge,%20I%20need%20assistance%20with%20my%20account%20access."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 hover:underline font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Need help? Contact Concierge</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
