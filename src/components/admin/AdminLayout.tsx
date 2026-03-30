import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import icons from '../../data/icons.json';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: icons.analytics.url },
  { to: '/admin/orders', label: 'Orders', icon: icons.order.url },
  { to: '/admin/menu', label: 'Menu', icon: icons.menu.url },
  { to: '/admin/offers', label: 'Offers', icon: icons.offer.url },
  { to: '/admin/users', label: 'Users', icon: icons.profile.url },
  { to: '/admin/delivery', label: 'Delivery', icon: icons.delivery.url },
  { to: '/admin/staff', label: 'Staff', icon: icons.admin.url, adminOnly: true },
  { to: '/admin/analytics', label: 'Analytics', icon: icons.analytics.url, adminOnly: true },
];

export const AdminLayout: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMainAdmin = user?.role === 'main_admin';

  const filteredNav = NAV_ITEMS.filter((item) => !item.adminOnly || isMainAdmin);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-bubble-gradient flex items-center justify-center text-xl shadow-brand">🫧</div>
          <div>
            <p className="font-display text-sm font-bold text-white leading-tight">Bobba Bobba</p>
            <p className="text-text-secondary text-[10px]">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* User badge */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-bubble-gradient flex items-center justify-center text-sm font-bold text-white">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-white text-xs font-bold">{user?.name}</p>
            <p className="text-text-secondary text-[10px]">{isMainAdmin ? '👑 Main Admin' : '🧑 Staff'}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {filteredNav.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-semibold transition-all duration-200
              ${isActive ? 'bg-primary/20 text-primary border border-primary/30' : 'text-text-secondary hover:text-white hover:bg-white/10'}`
            }
          >
            <img src={icon} alt="" className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <img src={icons.logout.url} alt="" className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-56 xl:w-64 bg-card border-r border-white/10 shrink-0 flex-col fixed h-full z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div className="lg:hidden fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <motion.div
              className="absolute left-0 top-0 h-full w-64 bg-card border-r border-white/10"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Sidebar />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-56 xl:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-card/90 backdrop-blur-sm border-b border-white/10 px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-text-secondary hover:text-white"
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="flex-1" />
          <div className="text-text-secondary text-xs">{new Date().toLocaleTimeString('en-IN')}</div>
        </div>

        {/* Page content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
