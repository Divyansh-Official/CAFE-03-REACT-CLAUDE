import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { TintedIcon } from '../ui/TintedIcon';
import icons from '../../data/icons.json';
import cafe  from '../../data/cafe.json';

const NavItem: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) =>
      `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 font-body
      ${isActive
        ? 'bg-primary text-white shadow-brand'
        : 'text-text-secondary hover:text-white hover:bg-white/10'}`
    }
  >
    {label}
  </NavLink>
);

interface NavbarProps {
  onAuthClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAuthClick }) => {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);
  const { getItemCount, openCart } = useCartStore();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate    = useNavigate();
  const itemCount   = getItemCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropOpen) return;
    const handler = () => setDropOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [dropOpen]);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300
        ${scrolled ? 'bg-surface/95 backdrop-blur-md shadow-card' : 'bg-transparent'}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            {cafe.logoUrl ? (
              <img
                src={cafe.logoUrl}
                alt={cafe.name}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-bubble-gradient flex items-center justify-center shadow-brand">
                <span className="text-xl">🫧</span>
              </div>
            )}
            {!cafe.logoUrl && (
              <div className="hidden sm:block leading-none">
                <span className="font-display text-lg font-bold bg-bubble-gradient bg-clip-text text-transparent">
                  Bobba Bobba
                </span>
                <p className="text-text-secondary text-[10px]">& Hungroo</p>
              </div>
            )}
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            <NavItem to="/"       label="Home"    />
            <NavItem to="/menu"   label="Menu"    />
            <NavItem to="/gallery" label="Gallery" />
            {isAuthenticated && <NavItem to="/orders" label="Orders" />}
          </div>

          {/* ── Right Actions ─────────────────────────────────── */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Search */}
            {/* <button
              onClick={() => navigate('/menu')}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Search"
            >
              <TintedIcon src={icons.search.url} alt="search" section="navbar" tintKey="default" size={20} />
            </button> */}

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Cart"
            >
              <TintedIcon src={icons.cart.url} alt="cart" section="navbar" tintKey="default" size={22} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-primary text-white text-[10px]
                      w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Settings */}
            <Link
              to="/settings"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Settings"
            >
              <TintedIcon src={icons.settings.url} alt="settings" section="navbar" tintKey="default" size={20} />
            </Link>

            {/* Auth / Profile */}
            {isAuthenticated ? (
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setDropOpen(v => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-bubble-gradient flex items-center
                    justify-center text-xs font-bold text-white shrink-0">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-semibold text-white">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0,  scale: 1 }}
                      exit={{ opacity: 0,  y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-card border border-white/10
                        rounded-2xl shadow-card overflow-hidden z-50"
                    >
                      {[
                        { to: '/profile',  icon: icons.profile.url,  label: 'My Profile' },
                        { to: '/orders',   icon: icons.order.url,    label: 'My Orders'  },
                        { to: '/settings', icon: icons.settings.url, label: 'Settings'   },
                      ].map(({ to, icon, label }) => (
                        <Link key={to} to={to} onClick={() => setDropOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary
                            hover:text-white hover:bg-white/5 transition-colors">
                          <TintedIcon src={icon} alt="" section="navbar" tintKey="default" size={16} />
                          {label}
                        </Link>
                      ))}
                      <button
                        onClick={() => { clearAuth(); navigate('/'); setDropOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400
                          hover:bg-red-500/10 transition-colors border-t border-white/10"
                      >
                        <TintedIcon src={icons.logout.url} alt="" section="settingsPage" tintKey="logout" size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="hidden md:flex items-center px-5 py-2 rounded-full bg-primary text-white
                  text-sm font-bold hover:bg-primary/90 transition-colors shadow-brand"
              >
                Login
              </button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-5 space-y-1.5">
                <motion.div className="h-0.5 bg-white rounded" animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} />
                <motion.div className="h-0.5 bg-white rounded" animate={{ opacity: menuOpen ? 0 : 1 }} />
                <motion.div className="h-0.5 bg-white rounded" animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden bg-card/97 backdrop-blur-md border-t border-white/10"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-4 py-4 space-y-1">
              {[
                ['/', 'Home'], ['/menu', 'Menu'], ['/gallery', 'Gallery'],
                ['/orders', 'Orders'], ['/settings', 'Settings'],
              ].map(([to, label]) => (
                <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-text-secondary hover:text-white
                    hover:bg-white/10 transition-colors font-semibold">
                  {label}
                </Link>
              ))}
              {!isAuthenticated && (
                <button
                  onClick={() => { setMenuOpen(false); onAuthClick?.(); }}
                  className="w-full py-3 rounded-full bg-primary text-white font-bold mt-2"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
