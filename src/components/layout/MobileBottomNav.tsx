import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import icons from '../../data/icons.json';

const tabs = [
  { to: '/', icon: icons.home.url, label: 'Home' },
  { to: '/menu', icon: icons.menu.url, label: 'Menu' },
  { to: '/cart', icon: icons.cart.url, label: 'Cart', isCart: true },
  { to: '/orders', icon: icons.order.url, label: 'Orders' },
  { to: '/profile', icon: icons.profile.url, label: 'Profile' },
];

export const MobileBottomNav: React.FC = () => {
  const { getItemCount } = useCartStore();
  const itemCount = getItemCount();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-white/10 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ to, icon, label, isCart }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative
              ${isActive ? 'text-primary' : 'text-text-secondary'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <motion.div
                    animate={{ scale: isActive ? 1.15 : 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <img
                      src={icon}
                      alt={label}
                      className="w-6 h-6"
                      style={{ filter: isActive ? 'none' : 'grayscale(0.6) brightness(0.7)' }}
                    />
                  </motion.div>
                  <AnimatePresence>
                    {isCart && itemCount > 0 && (
                      <motion.span
                        key="cart-badge"
                        className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] w-4 h-4
                          rounded-full flex items-center justify-center font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        {itemCount > 9 ? '9+' : itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-[10px] font-semibold">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
