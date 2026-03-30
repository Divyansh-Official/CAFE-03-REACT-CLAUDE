import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import icons from '../../data/icons.json';

const NavItem: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 font-body
      ${isActive ? 'bg-primary text-white' : 'text-text-secondary hover:text-white hover:bg-white/10'}`
    }
  >
    {label}
  </NavLink>
);

interface NavbarProps {
  onAuthClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAuthClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { getItemCount, openCart } = useCartStore();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const itemCount = getItemCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-bubble-gradient flex items-center justify-center shadow-brand">
              <span className="text-xl">🫧</span>
            </div>
            <div>
              <span className="font-display text-lg font-bold bg-bubble-gradient bg-clip-text text-transparent leading-none">
                Bobba Bobba
              </span>
              <p className="text-text-secondary text-[10px] leading-none">& Hungroo</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavItem to="/" label="Home" />
            <NavItem to="/menu" label="Menu" />
            <NavItem to="/gallery" label="Gallery" />
            {isAuthenticated && <NavItem to="/orders" label="Orders" />}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Cart"
            >
              <img src={icons.cart.url} alt="cart" className="w-6 h-6" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full
                      flex items-center justify-center font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Auth / Profile */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-bubble-gradient flex items-center justify-center text-xs font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-semibold text-white">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-white/10 rounded-2xl
                  shadow-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-t-2xl transition-colors">
                    <img src={icons.profile.url} alt="" className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link to="/orders" className="flex items-center gap-2 px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
                    <img src={icons.order.url} alt="" className="w-4 h-4" />
                    My Orders
                  </Link>
                  <button
                    onClick={() => { clearAuth(); navigate('/'); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:text-white hover:bg-red-500/10 rounded-b-2xl transition-colors"
                  >
                    <img src={icons.logout.url} alt="" className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white
                  text-sm font-bold hover:bg-primary/90 transition-colors shadow-brand"
              >
                Login / Sign Up
              </button>
            )}

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-5 space-y-1">
                <motion.div className="h-0.5 bg-white rounded" animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }} />
                <motion.div className="h-0.5 bg-white rounded" animate={{ opacity: menuOpen ? 0 : 1 }} />
                <motion.div className="h-0.5 bg-white rounded" animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden bg-card/95 backdrop-blur-md border-t border-white/10"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-4 py-4 space-y-2">
              {[['/', 'Home'], ['/menu', 'Menu'], ['/gallery', 'Gallery'], ['/orders', 'Orders']].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-text-secondary hover:text-white hover:bg-white/10 transition-colors font-semibold"
                >
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
