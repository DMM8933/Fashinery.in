import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  Loader2,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from '../components/BrandLogo';

export const AdminLoginPage: React.FC = () => {
  const {
    user,
    isAdmin,
    loginWithEmailPassword,
    loginWithGoogle,
    logout,
    sendAdminPasswordReset,
    setCurrentView,
    authError,
    clearAuthError,
  } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Set document title
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Admin Login | Fashinery Atelier';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // Pre-fill email if already signed in with non-admin or store owner
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
      setForgotEmail(user.email);
    }
  }, [user]);

  // If already authenticated as admin, auto-navigate to Admin Dashboard
  useEffect(() => {
    if (user && isAdmin) {
      setCurrentView('admin');
      window.location.hash = '/admin';
    }
  }, [user, isAdmin, setCurrentView]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim() || !password) {
      setLocalError('Please provide both your administrator email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmailPassword(email, password);
      // Navigation to /admin is handled inside loginWithEmailPassword
    } catch (err: any) {
      setLocalError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    clearAuthError();
    setIsLoading(true);
    try {
      await loginWithGoogle(true);
      // If user logs in with admin email, auth state change will promote them and App routing handles it
    } catch (err: any) {
      setLocalError(err?.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your administrator email address.');
      return;
    }

    setForgotLoading(true);
    try {
      await sendAdminPasswordReset(forgotEmail);
      setForgotSuccess(
        `A secure password reset link has been dispatched to ${forgotEmail}. Please check your inbox or spam folder.`
      );
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to send password reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div
      id="admin-login-page"
      className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950 relative overflow-hidden"
    >
      {/* Background Decorative Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-stone-800/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md z-10">
        <button
          id="btn-admin-return-storefront"
          type="button"
          onClick={() => {
            clearAuthError();
            setLocalError(null);
            setCurrentView('home');
            try {
              history.replaceState(null, '', window.location.pathname);
            } catch {
              window.location.hash = '';
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 text-xs text-amber-200 hover:text-white transition-colors py-1.5 px-3.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 cursor-pointer shadow-xs font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>Return to Storefront</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] text-stone-400 bg-stone-900/90 border border-stone-800 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Atelier Secure Access</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 z-10">
        <div className="w-full max-w-md bg-stone-900/90 border border-stone-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          {/* Fashinery Branding */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="mb-3">
              <BrandLogo size="md" theme="dark" showSlogan={false} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold uppercase tracking-widest mb-3">
              <Lock className="w-2.5 h-2.5" />
              <span>Restricted Administrative Portal</span>
            </div>
            <h1
              id="admin-login-heading"
              className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide"
            >
              Admin Login
            </h1>
            <p className="text-xs text-stone-400 mt-1.5 max-w-xs leading-relaxed">
              Sign in with your authorized credentials to manage the Fashinery catalog, orders, and store settings.
            </p>
          </div>

          {/* Already Authenticated as Admin banner */}
          {user && isAdmin && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">
                  Currently authenticated as <strong className="text-white">{user.email}</strong> (Administrator)
                </span>
              </div>
              <button
                type="button"
                id="btn-enter-admin-dashboard"
                onClick={() => {
                  setCurrentView('admin');
                  window.location.hash = '/admin';
                }}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Enter Admin Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Unauthorized Customer Notice */}
          {user && !isAdmin && (
            <div
              id="admin-unauthorized-notice"
              className="mb-6 p-4 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex flex-col gap-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-amber-300 mb-0.5">
                    You are not authorized to access the Admin Panel.
                  </span>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    Signed in as <strong className="text-white">{user.email}</strong> (Customer Account). Direct administrative access is restricted to verified store administrators.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  id="btn-admin-signout-switch"
                  onClick={async () => {
                    await logout();
                    setEmail('');
                    setPassword('');
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-stone-700"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
                <button
                  type="button"
                  id="btn-unauthorized-return-home"
                  onClick={() => {
                    clearAuthError();
                    setLocalError(null);
                    setCurrentView('home');
                    try {
                      history.replaceState(null, '', window.location.pathname);
                    } catch {
                      window.location.hash = '';
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Go to Storefront</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Error Notice */}
          {displayError && (
            <div
              id="admin-login-error"
              className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span>{displayError}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLocalError(null);
                  clearAuthError();
                }}
                className="text-rose-400 hover:text-white text-xs p-0.5"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          {/* Admin Email/Password Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email-input"
                className="block text-xs font-medium text-stone-300 mb-1.5 uppercase tracking-wider"
              >
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  placeholder="admin@fashinery.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-xs sm:text-sm text-white placeholder-stone-600 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password-input"
                  className="block text-xs font-medium text-stone-300 uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  id="btn-forgot-password"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotError(null);
                    setForgotSuccess(null);
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="admin-password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-xs sm:text-sm text-white placeholder-stone-600 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-500 hover:text-stone-300 focus:outline-hidden cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              id="btn-admin-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-stone-900 px-3 text-stone-500 uppercase tracking-widest text-[10px]">
                Or Store Owner Login
              </span>
            </div>
          </div>

          {/* Google Sign In for Store Owner */}
          <button
            id="btn-admin-google-login"
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-950/70 hover:bg-stone-950 border border-stone-800 hover:border-stone-700 text-stone-200 font-medium text-xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google (Owner Account)</span>
          </button>

          {/* Security Guarantee Details */}
          <div className="mt-6 pt-4 border-t border-stone-800/80 text-center text-[11px] text-stone-500">
            <p className="text-[10px] text-stone-500">
              End-to-end encrypted session with Firestore security enforcement.
            </p>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          id="admin-forgot-password-modal"
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <KeyRound className="w-4 h-4" />
                <h3 className="font-serif text-base font-bold text-white">Reset Admin Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-stone-400 hover:text-white text-sm p-1"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              Enter your registered administrator email. We will send a secure link to reset your administrative password.
            </p>

            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{forgotError}</span>
              </div>
            )}

            {!forgotSuccess && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="forgot-email-input"
                    className="block text-xs font-medium text-stone-300 mb-1 uppercase tracking-wider"
                  >
                    Admin Email Address
                  </label>
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    disabled={forgotLoading}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@fashinery.com"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-forgot-password"
                    disabled={forgotLoading}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {forgotSuccess && (
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Return to Login Form
              </button>
            )}
          </div>
        </div>
      )}

      {/* Discreet Footer */}
      <footer className="px-6 py-3 border-t border-stone-900 bg-stone-950 text-center text-[11px] text-stone-600 flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
        <span>© {new Date().getFullYear()} Fashinery Atelier. All rights reserved.</span>
        <button
          type="button"
          onClick={() => {
            clearAuthError();
            setLocalError(null);
            setCurrentView('home');
            try {
              history.replaceState(null, '', window.location.pathname);
            } catch {
              window.location.hash = '';
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="hover:text-amber-400 transition-colors cursor-pointer text-[10px]"
        >
          Return to Customer Storefront
        </button>
      </footer>
    </div>
  );
};
