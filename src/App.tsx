import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { OpeningSplash } from './components/OpeningSplash';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { AccountPage } from './pages/AccountPage';
import { PolicyPage } from './pages/PolicyPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { FAQPage } from './pages/FAQPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AdminPage } from './pages/AdminPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const { currentView, user, isAdmin, authReady } = useStore();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  if (currentView === 'admin') {
    // While checking authentication state, display elegant verification spinner
    if (!authReady) {
      return (
        <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white font-sans">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-300 text-sm font-sans tracking-wide">Verifying administrator authorization...</p>
          </div>
        </div>
      );
    }
    // Only authenticated admin users can access the Admin Dashboard
    if (!user || !isAdmin) {
      return <AdminLoginPage />;
    }
    return (
      <div className="min-h-screen bg-stone-100 font-sans text-stone-900">
        <AdminPage />
      </div>
    );
  }

  if (currentView === 'admin-login') {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] font-sans text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      <Header />

      <main className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'shop' && <ShopPage />}
        {currentView === 'product' && <ProductDetailPage />}
        {currentView === 'checkout' && <CheckoutPage />}
        {currentView === 'order-success' && <OrderSuccessPage />}
        {currentView === 'account' && <AccountPage />}
        {currentView === 'policy' && <PolicyPage />}
        {currentView === 'contact' && <ContactPage />}
        {currentView === 'about' && <AboutPage />}
        {currentView === 'faq' && <FAQPage />}
        {currentView === 'track' && <TrackOrderPage />}
        {currentView === 'forgot-password' && <ForgotPasswordPage />}
        {currentView === 'reset-password' && <ResetPasswordPage />}
      </main>

      <Footer />

      {/* Global Drawers, Modals & Floating Tools */}
      <CartDrawer />
      <WishlistDrawer />
      <SearchModal />
      <FloatingWhatsApp />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <AppContent />
        <OpeningSplash />
      </StoreProvider>
    </ErrorBoundary>
  );
}
