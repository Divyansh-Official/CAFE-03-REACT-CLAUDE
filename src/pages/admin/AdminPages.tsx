import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/allServices';
import { PrimaryButton, Spinner, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

// ─── Admin Login Page ─────────────────────────────────────────
export const AdminLoginPage: React.FC = () => {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!staffId || !password) return toast.error('Enter staff ID and password');
    setLoading(true);
    try {
      const res = await authService.adminLogin(staffId, password, isMainAdmin);
      setAuth(res.user, res.token);
      toast.success(`Welcome, ${res.user.name}!`);
      navigate('/admin/dashboard');
    } catch {
      // Dev fallback
      if (staffId === 'admin' && password === 'admin123') {
        setAuth(
          { id: 'admin', name: 'Admin', phone: '', addresses: [], role: isMainAdmin ? 'main_admin' : 'staff',
            isWhatsAppEnabled: false, totalOrders: 0, totalSpent: 0, memberSince: new Date().toISOString() },
          'admin-token'
        );
        navigate('/admin/dashboard');
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 600);
        toast.error('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm"
        animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-bubble-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-brand text-3xl">
            🫧
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Staff Login</h1>
          <p className="text-text-secondary text-sm mt-1">Bobba Bobba & Hungroo Admin</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-white/10 shadow-card space-y-4">
          {/* Admin toggle */}
          <div className="flex gap-2">
            {[false, true].map((val) => (
              <button
                key={String(val)}
                onClick={() => setIsMainAdmin(val)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all
                  ${isMainAdmin === val ? 'border-primary bg-primary/20 text-primary' : 'border-white/20 text-text-secondary hover:border-white/40'}`}
              >
                {val ? '👑 Main Admin' : '🧑 Staff'}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            placeholder="Staff ID"
            autoFocus
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/60 transition-colors placeholder:text-text-secondary"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/60 transition-colors placeholder:text-text-secondary"
          />
          <PrimaryButton className="w-full justify-center" onClick={handleLogin} loading={loading}>
            Login →
          </PrimaryButton>
        </div>
        <p className="text-text-secondary text-center text-xs mt-4">Dev: staffId=admin, password=admin123</p>
      </motion.div>
    </div>
  );
};

// ─── Admin Dashboard ──────────────────────────────────────────
export const AdminDashboardPage: React.FC = () => {
  const kpis = [
    { label: "Today's Revenue", value: '₹12,840', icon: '💰', trend: '+18%', color: '#34C759' },
    { label: "Today's Orders", value: '47', icon: '📦', trend: '+12%', color: '#FF9500' },
    { label: 'Pending Orders', value: '8', icon: '⏳', trend: '-3%', color: '#FF3B30' },
    { label: 'Active Offers', value: '3', icon: '🏷️', trend: 'active', color: '#FFD600' },
  ];

  const recentOrders = [
    { id: 'BB1A2B', customer: 'Priya S.', items: 'Matcha Bobba × 2', total: '₹398', status: 'Preparing' },
    { id: 'BB3C4D', customer: 'Arjun K.', items: 'Afghan Momos × 1', total: '₹179', status: 'Delivered' },
    { id: 'BB5E6F', customer: 'Mehak R.', items: 'Bingsu Mango × 1', total: '₹249', status: 'Placed' },
    { id: 'BB7G8H', customer: 'Rohit V.', items: 'Korean Ramen × 2', total: '₹558', status: 'Out for Delivery' },
  ];

  const statusColors: Record<string, string> = {
    'Placed': 'text-secondary',
    'Preparing': 'text-warning',
    'Out for Delivery': 'text-primary',
    'Delivered': 'text-success',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-text-secondary text-sm">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon, trend, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{icon}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full`} style={{ color, backgroundColor: `${color}20` }}>
                {trend}
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-white">{value}</p>
            <p className="text-text-secondary text-xs mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="font-bold text-white">Recent Orders</h2>
          <button className="text-primary text-xs font-bold hover:underline">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Order ID', 'Customer', 'Items', 'Total', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-text-secondary font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 text-white font-mono text-xs">#{order.id}</td>
                  <td className="px-5 py-3 text-white">{order.customer}</td>
                  <td className="px-5 py-3 text-text-secondary">{order.items}</td>
                  <td className="px-5 py-3 text-white font-bold">{order.total}</td>
                  <td className="px-5 py-3">
                    <span className={`font-bold ${statusColors[order.status]}`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Sellers */}
      <div className="bg-card rounded-2xl border border-white/10 p-5">
        <h2 className="font-bold text-white mb-4">🔥 Top Selling Items</h2>
        <div className="space-y-3">
          {[
            { name: 'Japanese Matcha Bobba', count: 124, revenue: '₹30,876' },
            { name: 'Afghan Momos', count: 98, revenue: '₹17,542' },
            { name: 'Bingsu Mango Magic', count: 87, revenue: '₹21,663' },
            { name: 'Korean Ramen (Carbonara)', count: 73, revenue: '₹25,185' },
          ].map(({ name, count, revenue }, i) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-text-secondary font-bold text-sm w-5">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full">
                    <div
                      className="h-full bg-bubble-gradient rounded-full"
                      style={{ width: `${(count / 124) * 100}%` }}
                    />
                  </div>
                  <span className="text-text-secondary text-xs shrink-0">{count} orders</span>
                </div>
              </div>
              <span className="text-success font-bold text-sm shrink-0">{revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
