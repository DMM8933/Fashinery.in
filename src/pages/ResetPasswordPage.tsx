import React, { useState, useEffect } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  HelpCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { checkPasswordPolicy, maskEmail } from '../utils/validation';
import { BrandLogo } from '../components/BrandLogo';

export const ResetPasswordPage: React.FC = () => {
  const { verifyResetCode, confirmReset, setCurrentView, clearAuthError } = useStore();

  // Extraction of Firebase Action Code (oobCode)
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [codeStatus, setCodeStatus] = useState<'verifying' | 'valid' | 'invalid' | 'success'>('verifying');
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract action code from URL (supporting search params and hash routes)
  useEffect(() => {
    clearAuthError();
    let code: string | null = null;

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      code = searchParams.get('oobCode');

      if (!code && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        code = new URLSearchParams(hashQuery).get('oobCode');
      }
    }

    if (!code) {
      setCodeStatus('invalid');
      setErrorMessage('This password reset link is invalid or has expired. Please request a new reset link.');
      return;
    }

    setOobCode(code);

    // Validate the action code with Firebase Authentication
    const validateCode = async () => {
      try {
        const email = await verifyResetCode(code!);
        setVerifiedEmail(email);
        setCodeStatus('valid');
      } catch (err: any) {
        setCodeStatus('invalid');
        setErrorMessage('This password reset link is invalid or has expired. Please request a new reset link.');
      }
    };

    validateCode();
  }, [verifyResetCode, clearAuthError]);

  // Compute real-time password policy compliance
  const policy = checkPasswordPolicy(newPassword, confirmPassword);
  const isFormValid = policy.minLength && policy.hasUpper && policy.hasLower && policy.hasNumber && policy.matchesConfirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode || !isFormValid || isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await confirmReset(oobCode, newPassword);
      setCodeStatus('success');
    } catch (err: any) {
      setErrorMessage(
        err.message || 'This password reset link is invalid or has expired. Please request a new reset link.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToLogin = () => {
    clearAuthError();
    setCurrentView('account');
    if (typeof window !== 'undefined') {
      // Clean query params from address bar
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.hash = '/account';
    }
  };

  const handleRequestNewLink = () => {
    clearAuthError();
    setCurrentView('forgot-password');
    if (typeof window !== 'undefined') {
      window.location.hash = '/forgot-password';
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#fdfbf7]">
      <div className="w-full max-w-md">
        {/* Brand Framing */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-4 transition-transform hover:scale-105 duration-300">
            <BrandLogo size="md" showSlogan={false} theme="light" />
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-amber-800 font-semibold mb-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Fashinery Account Access</span>
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-sm mx-auto leading-relaxed">
            Create a strong, unique password to secure your curated orders and bespoke atelier preferences.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* STATE 1: VERIFYING ACTION CODE */}
          {codeStatus === 'verifying' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-10 h-10 border-3 border-stone-200 border-t-amber-800 rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-stone-800">
                  Verifying Security Token...
                </h3>
                <p className="text-xs text-stone-500">
                  Communicating with Firebase Authentication to validate your reset link.
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: INVALID / EXPIRED LINK */}
          {codeStatus === 'invalid' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
                <XCircle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Reset Link Invalid or Expired
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
                  {errorMessage ||
                    'This password reset link is invalid or has expired. Please request a new reset link.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  id="btn-request-new-link"
                  type="button"
                  onClick={handleRequestNewLink}
                  className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 active:bg-black text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-amber-300" />
                  <span>Request a New Reset Link</span>
                </button>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleContinueToLogin}
                  className="text-xs text-stone-500 hover:text-stone-800 font-medium transition-colors cursor-pointer"
                >
                  Return to Client Login
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: SUCCESS STATE */}
          {codeStatus === 'success' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Password Reset Successfully
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
                  Your Fashinery client account password has been updated securely. You can now log in using your new credentials.
                </p>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-2xl text-[11px] text-stone-600">
                Password updated via official Firebase Authentication protocols.
              </div>

              <div className="pt-2">
                <button
                  id="btn-continue-to-login"
                  type="button"
                  onClick={handleContinueToLogin}
                  className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 active:bg-black text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Continue to Login</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>
          )}

          {/* STATE 4: VALID ACTION CODE -> RESET FORM */}
          {codeStatus === 'valid' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Identifier Badge */}
              {verifiedEmail && (
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">Account:</span>
                  <span className="font-semibold text-stone-900">{maskEmail(verifiedEmail)}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. New Password */}
              <div>
                <label
                  htmlFor="reset-new-password"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  New Password <span className="text-amber-800">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 8 characters)"
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 2. Confirm New Password */}
              <div>
                <label
                  htmlFor="reset-confirm-password"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Confirm New Password <span className="text-amber-800">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Real-time Password Policy Checklist */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-stone-600 border-b border-stone-200/60 pb-1.5">
                  <span>Password Security Policy</span>
                  <span
                    className={
                      policy.strength === 'very-strong'
                        ? 'text-emerald-700 font-bold'
                        : policy.strength === 'strong'
                        ? 'text-emerald-600 font-semibold'
                        : policy.strength === 'fair'
                        ? 'text-amber-700 font-semibold'
                        : 'text-stone-500 font-normal'
                    }
                  >
                    Strength: {policy.strength.replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      policy.minLength ? 'text-emerald-700 font-medium' : 'text-stone-400'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        policy.minLength ? 'text-emerald-600' : 'text-stone-300'
                      }`}
                    />
                    <span>At least 8 characters</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      policy.hasUpper ? 'text-emerald-700 font-medium' : 'text-stone-400'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        policy.hasUpper ? 'text-emerald-600' : 'text-stone-300'
                      }`}
                    />
                    <span>One uppercase letter (A-Z)</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      policy.hasLower ? 'text-emerald-700 font-medium' : 'text-stone-400'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        policy.hasLower ? 'text-emerald-600' : 'text-stone-300'
                      }`}
                    />
                    <span>One lowercase letter (a-z)</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      policy.hasNumber ? 'text-emerald-700 font-medium' : 'text-stone-400'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        policy.hasNumber ? 'text-emerald-600' : 'text-stone-300'
                      }`}
                    />
                    <span>One number (0-9)</span>
                  </div>
                </div>

                {/* Match indicator */}
                {confirmPassword && (
                  <div
                    className={`text-xs flex items-center gap-1.5 pt-1 border-t border-stone-200/50 ${
                      policy.matchesConfirm ? 'text-emerald-700 font-medium' : 'text-rose-600 font-medium'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        policy.matchesConfirm ? 'text-emerald-600' : 'text-rose-400'
                      }`}
                    />
                    <span>
                      {policy.matchesConfirm
                        ? 'Passwords match exactly'
                        : 'Passwords do not match yet'}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Reset Button */}
              <button
                id="btn-confirm-password-reset"
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 active:bg-black text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </>
                )}
              </button>

              {/* Security Note */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70 text-[11px] text-stone-500 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span>
                  Official Firebase confirmPasswordReset protocol ensures your new credentials are encrypted directly at the authentication provider level.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
