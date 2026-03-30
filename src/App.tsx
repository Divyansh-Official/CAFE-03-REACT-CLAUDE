import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layout
import Navbar            from './components/layout/Navbar';
import Footer            from './components/layout/Footer';
import MobileBottomNav   from './components/layout/MobileBottomNav';
import ParticleBackground from './components/effects/ParticleBackground';
import AuthModal         from './components/auth/AuthModal';
import { CartDrawer }    from './components/cart/CartComponents';
import AdminLayout       from './components/admin/AdminLayout';

// User pages
import HomePage          from './pages/user/HomePage';
import MenuPage          from './pages/user/MenuPage';
import CategoryPage      from './pages/user/CategoryPage';
import ItemPage          from './pages/user/ItemPage';
import CartPage          from './pages/user/CartPage';
import CheckoutPage      from './pages/user/CheckoutPage';
import OrderTrackingPage from './pages/user/OrderTrackingPage';
import ProfilePage       from './pages/user/ProfilePage';
// import GalleryPage       from '../pages/user/GalleryPage';
// import SettingsPage      from './pages/user/SettingsPage';
// import OrderHistoryPage  from './pages/user/OrderHistoryPage';

// Admin pages
import { AdminLoginPage, AdminDashboardPage }    from './pages/admin/AdminPages';
import AdminMenuPage                             from './pages/admin/AdminMenuPage';
import AdminOrdersPage                           from './pages/admin/AdminOrdersPage';
import {
  AdminOffersPage,
  AdminUsersPage,
  AdminDeliveryPage,
  AdminStaffPage,
  AdminAnalyticsPage,
} from './pages/admin/AdminExtraPages';

// Guards
import { RouteGuard } from './utils/routeGuard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60_000, retry: 1 },
  },
});

// ─── AppInner (needs Router context) ──────────────────────────
const AppInner: React.FC = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const location   = useLocation();
  const isAdmin    = location.pathname.startsWith('/admin');
  const isMinimal  = ['/cart','/checkout'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-surface text-white font-body">
      {!isAdmin && <ParticleBackground />}

      {!isAdmin && (
        <Navbar onAuthClick={() => setAuthOpen(true)} />
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <CartDrawer />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1E1E30',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontFamily: 'Nunito, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#34C759', secondary: '#fff' }, duration: 2000 },
          error:   { iconTheme: { primary: '#FF3B30', secondary: '#fff' }, duration: 3000 },
        }}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* ── User Pages ─────────────────────────────────── */}
          <Route path="/" element={<><HomePage /><Footer /></>} />
          <Route path="/menu" element={<><MenuPage /><Footer /></>} />
          <Route path="/menu/:categorySlug" element={<><CategoryPage /><Footer /></>} />
          <Route path="/menu/:categorySlug/:itemId" element={<><ItemPage /><Footer /></>} />
          {/* <Route path="/gallery" element={<><GalleryPage /><Footer /></>} /> */}
          {/* <Route path="/settings" element={<><SettingsPage /><Footer /></>} /> */}

          <Route path="/cart" element={<CartPage />} />

          <Route path="/checkout" element={
            <RouteGuard>
              <CheckoutPage />
            </RouteGuard>
          } />

          {/* <Route path="/orders" element={<><OrderHistoryPage /><Footer /></>} /> */}
          <Route path="/orders/:orderId" element={<><OrderTrackingPage /></>} />

          <Route path="/profile" element={
            <RouteGuard>
              <><ProfilePage /><Footer /></>
            </RouteGuard>
          } />

          {/* ── Admin Login (no layout) ─────────────────────── */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ── Admin Panel (with sidebar layout) ──────────── */}
          <Route path="/admin" element={
            <RouteGuard requiredRole="staff">
              <AdminLayout />
            </RouteGuard>
          }>
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="orders"    element={<AdminOrdersPage />} />
            <Route path="menu"      element={<AdminMenuPage />} />
            <Route path="offers"    element={<AdminOffersPage />} />
            <Route path="users"     element={<AdminUsersPage />} />
            <Route path="delivery"  element={<AdminDeliveryPage />} />
            <Route path="staff"     element={
              <RouteGuard requiredRole="main_admin">
                <AdminStaffPage />
              </RouteGuard>
            } />
            <Route path="analytics" element={
              <RouteGuard requiredRole="main_admin">
                <AdminAnalyticsPage />
              </RouteGuard>
            } />
          </Route>

          {/* ── 404 ────────────────────────────────────────── */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 relative z-10">
              <div className="text-9xl mb-6 select-none">🫧</div>
              <h1 className="font-display text-5xl font-bold text-white mb-3">Lost in Bubbles</h1>
              <p className="text-text-secondary text-lg mb-8">This page floated away…</p>
              <a href="/"
                className="px-8 py-3 rounded-full bg-bubble-gradient text-white font-bold text-lg
                  shadow-brand hover:opacity-90 transition-opacity">
                Go Home 🏠
              </a>
            </div>
          } />

        </Routes>
      </AnimatePresence>

      {!isAdmin && <MobileBottomNav />}
    </div>
  );
};

// ─── Root App ──────────────────────────────────────────────────
const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
