import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { PrimaryButton, Modal } from '../../components/ui';
import { getInitials } from '../../utils/helpers';
import { authService } from '../../services/allServices';
import toast from 'react-hot-toast';

// ── Firebase imports ────────────────────────────────────────────
import {
  doc, collection, query, where, onSnapshot,
  addDoc, deleteDoc, updateDoc, serverTimestamp, orderBy,
} from 'firebase/firestore';
// import { db } from '../../firebase/config'; // adjust path as needed

// ── Icon registry (icons.json) ──────────────────────────────────
const ICONS: Record<string, { name: string; url: string }> = {
  home:         { name: 'Home',         url: 'https://img.icons8.com/?size=100&id=j6fro4Um6uAH&format=png&color=000000' },
  profile:      { name: 'Profile',      url: 'https://img.icons8.com/?size=100&id=G6DqeSTvGJFl&format=png&color=000000' },
  order:        { name: 'Order',        url: 'https://img.icons8.com/?size=100&id=ehttSx6o87gS&format=png&color=000000' },
  location:     { name: 'Location',     url: 'https://img.icons8.com/?size=100&id=7880&format=png&color=000000' },
  edit:         { name: 'Edit',         url: 'https://img.icons8.com/?size=100&id=izf3IxWTfYti&format=png&color=000000' },
  phone:        { name: 'Phone',        url: 'https://img.icons8.com/?size=100&id=9659&format=png&color=000000' },
  analytics:    { name: 'Analytics',    url: 'https://img.icons8.com/?size=100&id=bbtqnNJr58Kq&format=png&color=000000' },
  add:          { name: 'Add',          url: 'https://img.icons8.com/?size=100&id=1501&format=png&color=000000' },
  delete:       { name: 'Delete',       url: 'https://img.icons8.com/?size=100&id=67838&format=png&color=000000' },
  check:        { name: 'Check',        url: 'https://img.icons8.com/fluency/100/checkmark.png' },
  crown:        { name: 'Crown',        url: 'https://img.icons8.com/?size=100&id=67539&format=png&color=000000' },
  star:         { name: 'Star',         url: 'https://img.icons8.com/fluency/100/star.png' },
  time:         { name: 'Time',         url: 'https://img.icons8.com/?size=100&id=Rf54BjGHcVJI&format=png&color=000000' },
  settings:     { name: 'Settings',     url: 'https://img.icons8.com/?size=100&id=H6C79JoP90DH&format=png&color=000000' },
  logout:       { name: 'Logout',       url: 'https://img.icons8.com/?size=100&id=O78GFWyAFkHa&format=png&color=000000' },
  delivery:     { name: 'Delivery',     url: 'https://img.icons8.com/?size=100&id=BA2LGJp37aL5&format=png&color=000000' },
  heart:        { name: 'Heart',        url: 'https://img.icons8.com/fluency/100/like.png' },
  fire:         { name: 'Fire',         url: 'https://img.icons8.com/fluency/100/fire-element.png' },
};

// ── Icon tints (profilePage section from iconTints.json) ────────
const TINTS = {
  icon: 'brightness(0) invert(0.6)',
  edit: 'invert(32%) sepia(98%) saturate(7494%) hue-rotate(349deg) brightness(98%) contrast(116%)',
  star: 'brightness(0) saturate(100%) invert(85%) sepia(100%) saturate(500%) hue-rotate(0deg)',
  delete: 'invert(32%) sepia(98%) saturate(7494%) hue-rotate(349deg) brightness(98%) contrast(116%)',
};

// ── Tiny Icon component ─────────────────────────────────────────
const Icon: React.FC<{ id: string; size?: number; tint?: string; className?: string }> = ({
  id, size = 20, tint = TINTS.icon, className = '',
}) => {
  const ico = ICONS[id];
  if (!ico) return null;
  return (
    <img
      src={ico.url}
      alt={ico.name}
      width={size}
      height={size}
      style={{ filter: tint, objectFit: 'contain', flexShrink: 0 }}
      className={className}
    />
  );
};

// ── Helpers ─────────────────────────────────────────────────────
const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const formatDate = (ts: any) => {
  if (!ts) return '–';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Types ────────────────────────────────────────────────────────
type Tab = 'overview' | 'orders' | 'addresses';

interface Order {
  id: string;
  orderId: string;
  items: string;
  total: number;
  status: string;
  createdAt: any;
}

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  fullAddress: string;
  pincode: string;
  isDefault?: boolean;
}

// ── Animated background orbs ────────────────────────────────────
const BgOrbs: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 600, height: 600,
        top: '-10%', right: '-8%',
        background: 'radial-gradient(circle, rgba(255,90,30,0.09) 0%, transparent 70%)',
      }}
      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 500, height: 500,
        bottom: '5%', left: '-10%',
        background: 'radial-gradient(circle, rgba(140,35,220,0.07) 0%, transparent 70%)',
      }}
      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 300, height: 300,
        top: '40%', left: '40%',
        background: 'radial-gradient(circle, rgba(255,170,0,0.05) 0%, transparent 70%)',
      }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    />
  </div>
);

// ── Floating particles (same aesthetic as HeroSection) ──────────
const Particles: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: 3 + (i % 3),
          height: 3 + (i % 3),
          left: `${8 + i * 7.5}%`,
          top: `${10 + ((i * 17) % 80)}%`,
          background: i % 3 === 0
            ? 'rgba(255,90,30,0.4)'
            : i % 3 === 1
              ? 'rgba(255,214,0,0.3)'
              : 'rgba(200,80,255,0.25)',
        }}
        animate={{
          y: [0, -30 - i * 3, 0],
          opacity: [0.2, 0.7, 0.2],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 4 + i * 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: i * 0.4,
        }}
      />
    ))}
  </div>
);

// ── Stat Card ────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: string; label: string; value: string | number; delay: number; accent?: string;
}> = ({ icon, label, value, delay, accent = '#FF6B20' }) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.92 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 120, damping: 16 }}
    whileHover={{ y: -4, scale: 1.03 }}
    className="relative group overflow-hidden rounded-2xl p-4 sm:p-5 flex flex-col gap-3 cursor-default"
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px)',
    }}
  >
    <motion.div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl"
      style={{ background: `radial-gradient(ellipse at 30% 30%, ${accent}14, transparent 70%)`, transition: 'opacity 0.3s' }}
    />
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center"
      style={{ background: `${accent}18`, border: `1px solid ${accent}28` }}
    >
      <Icon id={icon} size={20} tint={TINTS.icon} />
    </div>
    <div>
      <p className="text-white font-bold text-xl sm:text-2xl font-display leading-none">{value}</p>
      <p className="text-xs mt-1.5" style={{ color: 'rgba(180,165,200,0.65)' }}>{label}</p>
    </div>
  </motion.div>
);

// ── Order Card ───────────────────────────────────────────────────
const OrderCard: React.FC<{ order: Order; index: number }> = ({ order, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.07, type: 'spring', stiffness: 120, damping: 18 }}
    whileHover={{ x: 4 }}
    className="relative group overflow-hidden rounded-2xl p-4 sm:p-5"
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(10px)',
    }}
  >
    {/* Left accent stripe */}
    <motion.div
      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
      style={{ background: 'linear-gradient(180deg, #FF3B30, #FF9500)' }}
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ delay: index * 0.07 + 0.2, duration: 0.4 }}
    />
    <div className="flex items-start justify-between gap-3 ml-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-white font-bold text-sm">#{order.orderId}</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(52,199,89,0.15)',
              color: '#34C759',
              border: '1px solid rgba(52,199,89,0.2)',
            }}
          >
            ✓ {order.status?.charAt(0).toUpperCase() + (order.status?.slice(1) ?? '')}
          </span>
        </div>
        <p className="text-sm truncate" style={{ color: 'rgba(200,185,220,0.75)' }}>{order.items}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <Icon id="time" size={12} tint={TINTS.icon} />
          <span className="text-xs" style={{ color: 'rgba(160,145,180,0.6)' }}>{formatDate(order.createdAt)}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-white font-bold">{formatCurrency(order.total)}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-2 text-xs font-bold px-3 py-1 rounded-xl"
          style={{
            background: 'rgba(255,107,32,0.12)',
            color: '#FF6B20',
            border: '1px solid rgba(255,107,32,0.2)',
          }}
        >
          Reorder
        </motion.button>
      </div>
    </div>
  </motion.div>
);

// ── Address Card ─────────────────────────────────────────────────
const AddressCard: React.FC<{
  addr: Address; index: number; onDelete: (id: string) => void;
}> = ({ addr, index, onDelete }) => {
  const icon = addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '🏢' : '📍';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, scale: 0.95 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 120, damping: 18 }}
      whileHover={{ scale: 1.01 }}
      className="relative group rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {addr.isDefault && (
        <motion.div
          className="absolute top-3 right-11 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(255,107,32,0.15)',
            color: '#FF6B20',
            border: '1px solid rgba(255,107,32,0.25)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          Default
        </motion.div>
      )}
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm">{addr.label}</p>
        <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'rgba(200,185,220,0.7)' }}>
          {addr.fullAddress}{addr.pincode ? ` – ${addr.pincode}` : ''}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Icon id="phone" size={11} tint={TINTS.icon} />
          <span className="text-xs" style={{ color: 'rgba(160,145,180,0.6)' }}>{addr.phone}</span>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.15, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onDelete(addr.id)}
        className="shrink-0 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(255,59,48,0.1)' }}
      >
        <Icon id="delete" size={16} tint={TINTS.delete} />
      </motion.button>
    </motion.div>
  );
};

// ────────────────────────────────────────────────────────────────
// SPINNER
// ────────────────────────────────────────────────────────────────
const Spinner: React.FC = () => (
  <div className="flex flex-col items-center py-16 gap-3">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-8 h-8 rounded-full border-2 border-transparent"
      style={{ borderTopColor: '#FF6B20' }}
    />
    <p className="text-sm" style={{ color: 'rgba(180,165,200,0.5)' }}>Loading…</p>
  </div>
);

// ════════════════════════════════════════════════════════════════
// PROFILE PAGE
// ════════════════════════════════════════════════════════════════
const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab]             = useState<Tab>('overview');
  const [editName, setEditName]   = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? '');
  const [savingName, setSavingName]   = useState(false);
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home', name: '', phone: '', fullAddress: '', pincode: '',
  });
  const [savingAddr, setSavingAddr] = useState(false);

  // Firebase state
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingOrders,    setLoadingOrders]    = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Avatar mouse parallax
  const headerRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20 });
  const avatarX = useTransform(mx, v => `${v * 8}px`);
  const avatarY = useTransform(my, v => `${v * 6}px`);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      rawX.set(((e.clientX - r.left) / r.width  - 0.5) * 2);
      rawY.set(((e.clientY - r.top)  / r.height - 0.5) * 2);
    };
    const onLeave = () => { rawX.set(0); rawY.set(0); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [rawX, rawY]);

  // Firebase: fetch orders
  useEffect(() => {
    if (!user?.uid) return;
    setLoadingOrders(true);
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(q,
      snap => { setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))); setLoadingOrders(false); },
      ()   => setLoadingOrders(false),
    );
    return unsub;
  }, [user?.uid]);

  // Firebase: fetch addresses
  useEffect(() => {
    if (!user?.uid) return;
    setLoadingAddresses(true);
    const q = query(collection(db, 'users', user.uid, 'addresses'));
    const unsub = onSnapshot(q,
      snap => { setAddresses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Address))); setLoadingAddresses(false); },
      ()   => setLoadingAddresses(false),
    );
    return unsub;
  }, [user?.uid]);

  // Save name
  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      await authService.updateProfile({ name: nameInput.trim() });
      if (user?.uid) await updateDoc(doc(db, 'users', user.uid), { name: nameInput.trim() });
      updateUser({ name: nameInput.trim() });
      setEditName(false);
      toast.success('Name updated!');
    } catch {
      updateUser({ name: nameInput.trim() });
      setEditName(false);
      toast.success('Name updated!');
    } finally { setSavingName(false); }
  };

  // Save address
  const handleSaveAddress = async () => {
    if (!newAddr.fullAddress.trim() || !newAddr.phone.trim()) { toast.error('Fill required fields'); return; }
    setSavingAddr(true);
    try {
      await addDoc(collection(db, 'users', user!.uid, 'addresses'), {
        ...newAddr, isDefault: addresses.length === 0, createdAt: serverTimestamp(),
      });
      toast.success('Address saved!');
      setAddAddressOpen(false);
      setNewAddr({ label: 'Home', name: '', phone: '', fullAddress: '', pincode: '' });
    } catch { toast.error('Failed to save address'); }
    finally { setSavingAddr(false); }
  };

  // Delete address
  const handleDeleteAddress = async (addrId: string) => {
    try { await deleteDoc(doc(db, 'users', user!.uid, 'addresses', addrId)); toast.success('Address removed'); }
    catch { toast.error('Failed to remove'); }
  };

  const totalSpent = orders.reduce((s, o) => s + (o.total ?? 0), 0);
  const avgOrder   = orders.length ? Math.round(totalSpent / orders.length) : 0;

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#06020e' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="text-5xl mb-4">🫧</div>
        <p style={{ color: 'rgba(200,185,220,0.7)' }}>Please log in to view your profile.</p>
      </motion.div>
    </div>
  );

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'overview',  icon: 'analytics', label: 'Overview'  },
    { key: 'orders',    icon: 'order',     label: 'Orders'    },
    { key: 'addresses', icon: 'location',  label: 'Addresses' },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: '#06020e' }}>
      <BgOrbs />
      <Particles />

      {/* Grain */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-32">

        {/* ══════════════════════════════════════════════════════
            PROFILE HERO HEADER
        ══════════════════════════════════════════════════════ */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 100, damping: 18 }}
          className="relative overflow-hidden rounded-3xl mb-5 p-6 sm:p-8"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 80% 20%, rgba(255,90,30,0.13) 0%, transparent 60%),
              radial-gradient(ellipse 60% 80% at 10% 80%, rgba(140,35,220,0.08) 0%, transparent 60%),
              rgba(255,255,255,0.03)
            `,
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Decorative rings */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
            style={{ border: '1px dashed rgba(255,180,60,0.3)' }} />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-15"
            style={{ border: '1px solid rgba(255,90,30,0.2)' }} />

          <div className="flex items-center gap-5 sm:gap-7 relative">
            {/* Avatar */}
            <motion.div style={{ x: avatarX, y: avatarY }} className="relative shrink-0">
              <motion.div
                whileHover={{ scale: 1.06 }}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center
                  text-2xl sm:text-3xl font-black text-white select-none cursor-default overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #FF3B30 0%, #FF9500 50%, #FFD600 100%)',
                  boxShadow: '0 8px 32px rgba(255,90,30,0.35), 0 2px 8px rgba(0,0,0,0.4)',
                }}
              >
                {getInitials(user.name ?? 'U')}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
              </motion.div>

              {user.role !== 'user' && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: '#06020e', border: '2px solid rgba(255,255,255,0.1)' }}
                >
                  {user.role === 'main_admin' ? '👑' : '🔧'}
                </motion.div>
              )}

              {/* Online dot */}
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full"
                style={{ background: '#34C759', border: '2px solid #06020e' }}
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {editName ? (
                  <motion.div key="edit"
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="flex items-center gap-2 mb-1"
                  >
                    <input
                      autoFocus
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditName(false); }}
                      className="flex-1 min-w-0 rounded-xl px-3 py-2 text-white text-sm font-bold outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,107,32,0.4)' }}
                    />
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleSaveName} disabled={savingName}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#FF3B30,#FF9500)' }}
                    >
                      {savingName ? '…' : 'Save'}
                    </motion.button>
                    <button onClick={() => setEditName(false)} style={{ color: 'rgba(180,165,200,0.6)' }}>✕</button>
                  </motion.div>
                ) : (
                  <motion.div key="view"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2 mb-1"
                  >
                    <h1 className="font-display font-black text-xl sm:text-2xl text-white truncate leading-tight">
                      {user.name}
                    </h1>
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 15 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setEditName(true)}
                      className="shrink-0 p-1.5 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <Icon id="edit" size={14} tint={TINTS.edit} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-1.5 mb-1">
                <Icon id="phone" size={13} tint={TINTS.icon} />
                <span className="text-sm" style={{ color: 'rgba(200,185,220,0.65)' }}>{user.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon id="star" size={13} tint={TINTS.star} />
                <span className="text-xs" style={{ color: 'rgba(160,145,180,0.55)' }}>
                  Member since{' '}
                  {new Date(user.memberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="mt-6 pt-5 flex items-center justify-around gap-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { value: orders.length,           label: 'Orders',    icon: 'order'     },
              { value: formatCurrency(totalSpent), label: 'Spent',   icon: 'analytics' },
              { value: addresses.length,         label: 'Addresses', icon: 'location'  },
            ].map(({ value, label, icon }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="text-center flex-1"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Icon id={icon} size={13} tint={TINTS.icon} />
                </div>
                <p className="font-bold text-white text-sm sm:text-base leading-none">{value}</p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(160,145,180,0.55)' }}>{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            TABS
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="relative flex gap-1 rounded-2xl p-1 mb-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors duration-200"
              style={{ color: tab === t.key ? '#fff' : 'rgba(160,145,180,0.55)' }}
            >
              {tab === t.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,59,48,0.25), rgba(255,149,0,0.15))',
                    border: '1px solid rgba(255,107,32,0.25)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                id={t.icon}
                size={16}
                tint={tab === t.key ? TINTS.edit : TINTS.icon}
              />
              <span className="relative hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            TAB CONTENT
        ══════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ────────────────────────────────────── */}
          {tab === 'overview' && (
            <motion.div key="overview"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-3 gap-3 mb-4">
                <StatCard icon="order"     label="Total Orders" value={orders.length}              delay={0.05} accent="#FF6B20" />
                <StatCard icon="analytics" label="Total Spent"  value={formatCurrency(totalSpent)} delay={0.1}  accent="#FF9500" />
                <StatCard icon="delivery"  label="Avg Order"    value={formatCurrency(avgOrder)}   delay={0.15} accent="#FFD600" />
              </div>

              {/* Recent order card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl overflow-hidden mb-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2">
                    <Icon id="fire" size={18} />
                    <span className="font-bold text-white text-sm">Recent Order</span>
                  </div>
                  <motion.button whileHover={{ x: 3 }} onClick={() => setTab('orders')}
                    className="text-xs font-bold flex items-center gap-1" style={{ color: '#FF6B20' }}>
                    View all <span>→</span>
                  </motion.button>
                </div>
                {loadingOrders ? (
                  <div className="px-5 py-6 flex justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-6 h-6 rounded-full border-2 border-transparent"
                      style={{ borderTopColor: '#FF6B20' }} />
                  </div>
                ) : orders[0] ? (
                  <div className="px-5 py-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-white font-bold text-sm">#{orders[0].orderId}</span>
                      <p className="text-sm truncate mt-0.5" style={{ color: 'rgba(200,185,220,0.7)' }}>{orders[0].items}</p>
                      <p className="text-xs mt-1.5" style={{ color: 'rgba(160,145,180,0.55)' }}>{formatDate(orders[0].createdAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-bold">{formatCurrency(orders[0].total)}</p>
                      <span className="text-xs font-bold" style={{ color: '#34C759' }}>✓ Delivered</span>
                    </div>
                  </div>
                ) : (
                  <p className="px-5 py-6 text-center text-sm" style={{ color: 'rgba(160,145,180,0.5)' }}>No orders yet</p>
                )}
              </motion.div>

              {/* Loyalty bar */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,59,48,0.12), rgba(255,214,0,0.06))',
                  border: '1px solid rgba(255,107,32,0.18)',
                }}
              >
                <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
                  style={{ background: 'radial-gradient(circle, rgba(255,214,0,0.4), transparent)' }} />
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,214,0,0.12)', border: '1px solid rgba(255,214,0,0.2)' }}>
                  <Icon id="crown" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">Bubbler Loyalty</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(200,185,220,0.6)' }}>
                    {orders.length >= 10 ? '🎉 Gold member!' : `${10 - orders.length} more orders to Gold`}
                  </p>
                  <div className="mt-2.5 h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg,#FF3B30,#FFD600)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (orders.length / 10) * 100)}%` }}
                      transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── ORDERS ──────────────────────────────────────── */}
          {tab === 'orders' && (
            <motion.div key="orders"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }} className="space-y-3"
            >
              {loadingOrders ? <Spinner /> : orders.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-16 gap-3">
                  <div className="text-5xl mb-2">📦</div>
                  <p className="text-white font-bold">No orders yet</p>
                  <p className="text-sm" style={{ color: 'rgba(180,165,200,0.5)' }}>Start ordering to see them here</p>
                </motion.div>
              ) : orders.map((order, i) => <OrderCard key={order.id} order={order} index={i} />)}
            </motion.div>
          )}

          {/* ── ADDRESSES ───────────────────────────────────── */}
          {tab === 'addresses' && (
            <motion.div key="addresses"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {loadingAddresses ? <Spinner /> : (
                <div className="space-y-3 mb-4">
                  <AnimatePresence>
                    {addresses.length === 0 ? (
                      <motion.div key="empty"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center py-16 gap-3 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
                      >
                        <div className="text-5xl mb-2">📍</div>
                        <p className="text-white font-bold">No saved addresses</p>
                        <p className="text-sm" style={{ color: 'rgba(180,165,200,0.5)' }}>Add one for faster checkout</p>
                      </motion.div>
                    ) : addresses.map((addr, i) => (
                      <AddressCard key={addr.id} addr={addr} index={i} onDelete={handleDeleteAddress} />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => setAddAddressOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,59,48,0.15), rgba(255,149,0,0.1))',
                  border: '1px solid rgba(255,107,32,0.25)',
                  color: '#FF6B20',
                }}
              >
                <motion.span
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.07) 50%, transparent 65%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPositionX: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                />
                <Icon id="add" size={18} tint={TINTS.edit} />
                <span className="relative">Add New Address</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════════════════
          ADD ADDRESS MODAL
      ══════════════════════════════════════════════════════════ */}
      <Modal isOpen={addAddressOpen} onClose={() => setAddAddressOpen(false)} title="Add Address" size="sm">
        <div className="p-5 space-y-3">
          {/* Label picker */}
          <div className="flex gap-2">
            {['Home', 'Work', 'Other'].map(l => (
              <motion.button key={l} whileTap={{ scale: 0.95 }}
                onClick={() => setNewAddr(a => ({ ...a, label: l }))}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                style={{
                  background: newAddr.label === l ? 'rgba(255,107,32,0.18)' : 'rgba(255,255,255,0.04)',
                  border: newAddr.label === l ? '1px solid rgba(255,107,32,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: newAddr.label === l ? '#FF6B20' : 'rgba(180,165,200,0.6)',
                }}
              >
                {l === 'Home' ? '🏠' : l === 'Work' ? '🏢' : '📍'} {l}
              </motion.button>
            ))}
          </div>

          {([
            ['name',        'Full Name'],
            ['phone',       'Phone Number'],
            ['fullAddress', 'Full Address'],
            ['pincode',     'Pincode'],
          ] as [keyof typeof newAddr, string][]).map(([f, l]) => (
            <input
              key={f}
              placeholder={l}
              value={newAddr[f]}
              onChange={e => setNewAddr(a => ({ ...a, [f]: e.target.value }))}
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,107,32,0.4)')}
              onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          ))}

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleSaveAddress} disabled={savingAddr}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm relative overflow-hidden"
            style={{
              background: savingAddr ? 'rgba(255,107,32,0.4)' : 'linear-gradient(135deg,#FF3B30 0%,#FF9500 100%)',
              boxShadow: '0 4px 20px rgba(255,90,30,0.3)',
            }}
          >
            {savingAddr ? (
              <motion.span
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-4 h-4 rounded-full border-2 border-transparent align-middle"
                style={{ borderTopColor: 'white' }}
              />
            ) : 'Save Address'}
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;





// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAuthStore } from '../../store/authStore';
// import { PrimaryButton, SecondaryButton, Modal } from '../../components/ui';
// import { getInitials, formatDate, formatCurrency } from '../../utils/helpers';
// import { authService } from '../../services/allServices';
// import toast from 'react-hot-toast';

// type Tab = 'overview' | 'orders' | 'addresses';

// const MOCK_ORDERS = [
//   { id:'BB1A2B', items:'Matcha Bobba × 2, Afghan Momos × 1', total:677, status:'delivered', date:'2024-03-28' },
//   { id:'BB3C4D', items:'Bingsu Mango Magic × 1',             total:249, status:'delivered', date:'2024-03-25' },
//   { id:'BB5E6F', items:'Korean Ramen × 2, Holland Fries × 1',total:498, status:'delivered', date:'2024-03-20' },
// ];

// const ProfilePage: React.FC = () => {
//   const { user, updateUser } = useAuthStore();
//   const [tab, setTab]       = useState<Tab>('overview');
//   const [editName, setEditName]   = useState(false);
//   const [nameInput, setNameInput] = useState(user?.name ?? '');
//   const [savingName, setSavingName] = useState(false);
//   const [addAddressOpen, setAddAddressOpen] = useState(false);
//   const [newAddr, setNewAddr] = useState({ label:'Home', name:'', phone:'', fullAddress:'', pincode:'' });

//   if (!user) return (
//     <div className="min-h-screen flex items-center justify-center">
//       <p className="text-text-secondary">Please log in to view your profile.</p>
//     </div>
//   );

//   const handleSaveName = async () => {
//     if (!nameInput.trim()) return;
//     setSavingName(true);
//     try {
//       await authService.updateProfile({ name: nameInput.trim() });
//       updateUser({ name: nameInput.trim() });
//       setEditName(false);
//       toast.success('Name updated!');
//     } catch {
//       updateUser({ name: nameInput.trim() });
//       setEditName(false);
//       toast.success('Name updated!');
//     } finally {
//       setSavingName(false);
//     }
//   };

//   const TABS: { key: Tab; label: string; icon: string }[] = [
//     { key:'overview',  label:'Overview',  icon:'📊' },
//     { key:'orders',    label:'Orders',    icon:'📦' },
//     { key:'addresses', label:'Addresses', icon:'📍' },
//   ];

//   return (
//     <div className="min-h-screen pt-24 pb-28 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
//       {/* Profile header */}
//       <motion.div
//         initial={{ opacity:0, y:20 }}
//         animate={{ opacity:1, y:0 }}
//         className="bg-card rounded-2xl p-6 border border-white/10 mb-6"
//       >
//         <div className="flex items-center gap-5">
//           {/* Avatar */}
//           <div className="relative shrink-0">
//             <div className="w-20 h-20 rounded-full bg-bubble-gradient flex items-center justify-center
//               text-2xl font-bold text-white shadow-brand select-none">
//               {getInitials(user.name ?? 'U')}
//             </div>
//             {user.role !== 'user' && (
//               <div className="absolute -bottom-1 -right-1 bg-secondary text-black text-[10px] font-bold
//                 px-1.5 py-0.5 rounded-full">
//                 {user.role === 'main_admin' ? '👑' : '🔧'}
//               </div>
//             )}
//           </div>

//           {/* Name / info */}
//           <div className="flex-1 min-w-0">
//             {editName ? (
//               <div className="flex items-center gap-2">
//                 <input
//                   autoFocus
//                   value={nameInput}
//                   onChange={e => setNameInput(e.target.value)}
//                   onKeyDown={e => e.key === 'Enter' && handleSaveName()}
//                   className="flex-1 bg-white/10 border border-primary/40 rounded-xl px-3 py-2 text-white
//                     text-sm outline-none font-bold"
//                 />
//                 <PrimaryButton size="sm" onClick={handleSaveName} loading={savingName}>Save</PrimaryButton>
//                 <button onClick={() => setEditName(false)} className="text-text-secondary hover:text-white">✕</button>
//               </div>
//             ) : (
//               <div className="flex items-center gap-2">
//                 <h1 className="font-display text-2xl font-bold text-white truncate">{user.name}</h1>
//                 <button onClick={() => setEditName(true)}
//                   className="text-text-secondary hover:text-primary transition-colors text-sm shrink-0">
//                   ✏️
//                 </button>
//               </div>
//             )}
//             <p className="text-text-secondary text-sm mt-0.5">{user.phone}</p>
//             <p className="text-text-secondary text-xs mt-0.5">
//               Member since {new Date(user.memberSince).toLocaleDateString('en-IN',{month:'long',year:'numeric'})}
//             </p>
//           </div>
//         </div>
//       </motion.div>

//       {/* Tabs */}
//       <div className="flex gap-1 bg-card rounded-2xl p-1 border border-white/10 mb-6">
//         {TABS.map(t => (
//           <button
//             key={t.key}
//             onClick={() => setTab(t.key)}
//             className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold
//               transition-all duration-200
//               ${tab === t.key ? 'bg-primary text-white shadow-brand' : 'text-text-secondary hover:text-white hover:bg-white/10'}`}
//           >
//             <span className="text-base">{t.icon}</span>
//             <span className="hidden sm:inline">{t.label}</span>
//           </button>
//         ))}
//       </div>

//       {/* Tab content */}
//       <AnimatePresence mode="wait">
//         {/* ── Overview ── */}
//         {tab === 'overview' && (
//           <motion.div key="overview"
//             initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}>
//             {/* Stats */}
//             <div className="grid grid-cols-3 gap-4 mb-6">
//               {[
//                 { label:'Total Orders', value: MOCK_ORDERS.length, icon:'📦' },
//                 { label:'Total Spent',  value: formatCurrency(MOCK_ORDERS.reduce((s,o)=>s+o.total,0)), icon:'💰' },
//                 { label:'Avg Order',    value: formatCurrency(Math.round(MOCK_ORDERS.reduce((s,o)=>s+o.total,0)/MOCK_ORDERS.length)), icon:'📊' },
//               ].map(({ label, value, icon }) => (
//                 <div key={label} className="bg-card rounded-2xl p-4 border border-white/10 text-center">
//                   <div className="text-2xl mb-1">{icon}</div>
//                   <p className="font-display font-bold text-white text-lg">{value}</p>
//                   <p className="text-text-secondary text-xs mt-0.5">{label}</p>
//                 </div>
//               ))}
//             </div>

//             {/* Recent order */}
//             <div className="bg-card rounded-2xl p-5 border border-white/10">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="font-bold text-white">Recent Order</h3>
//                 <button onClick={() => setTab('orders')} className="text-primary text-xs font-bold hover:underline">
//                   View all →
//                 </button>
//               </div>
//               {MOCK_ORDERS[0] && (
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-white font-bold text-sm">#{MOCK_ORDERS[0].id}</p>
//                     <p className="text-text-secondary text-xs mt-0.5">{MOCK_ORDERS[0].items}</p>
//                     <p className="text-text-secondary text-xs">{formatDate(MOCK_ORDERS[0].date)}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-white font-bold">{formatCurrency(MOCK_ORDERS[0].total)}</p>
//                     <span className="text-xs font-bold text-success">✓ Delivered</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         )}

//         {/* ── Orders ── */}
//         {tab === 'orders' && (
//           <motion.div key="orders"
//             initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
//             className="space-y-3">
//             {MOCK_ORDERS.map((order, i) => (
//               <motion.div key={order.id}
//                 initial={{ opacity:0, x:-10 }}
//                 animate={{ opacity:1, x:0 }}
//                 transition={{ delay: i*0.06 }}
//                 className="bg-card rounded-2xl p-5 border border-white/10 hover:border-primary/20 transition-colors"
//               >
//                 <div className="flex items-start justify-between mb-2">
//                   <div>
//                     <p className="text-white font-bold text-sm">#{order.id}</p>
//                     <p className="text-text-secondary text-xs mt-0.5">{formatDate(order.date)}</p>
//                   </div>
//                   <span className="text-xs font-bold px-2 py-1 rounded-full bg-success/20 text-success">
//                     ✓ Delivered
//                   </span>
//                 </div>
//                 <p className="text-text-secondary text-sm mb-3 line-clamp-1">{order.items}</p>
//                 <div className="flex items-center justify-between">
//                   <p className="text-white font-bold">{formatCurrency(order.total)}</p>
//                   <button className="text-xs text-primary font-bold hover:underline">Reorder</button>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         )}

//         {/* ── Addresses ── */}
//         {tab === 'addresses' && (
//           <motion.div key="addresses"
//             initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}>
//             <div className="space-y-3 mb-4">
//               {(user.addresses ?? []).length === 0 ? (
//                 <div className="bg-card rounded-2xl p-8 border border-white/10 text-center">
//                   <div className="text-5xl mb-3">📍</div>
//                   <p className="text-white font-bold mb-1">No saved addresses</p>
//                   <p className="text-text-secondary text-sm">Add an address for faster checkout</p>
//                 </div>
//               ) : (
//                 user.addresses.map((addr) => (
//                   <div key={addr.id} className="bg-card rounded-2xl p-4 border border-white/10 flex items-start justify-between gap-3">
//                     <div className="flex items-start gap-3">
//                       <span className="text-2xl">
//                         {addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '🏢' : '📍'}
//                       </span>
//                       <div>
//                         <div className="flex items-center gap-2">
//                           <p className="text-white font-bold text-sm">{addr.label}</p>
//                           {addr.isDefault && (
//                             <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
//                               Default
//                             </span>
//                           )}
//                         </div>
//                         <p className="text-text-secondary text-xs mt-0.5">{addr.fullAddress}</p>
//                         <p className="text-text-secondary text-xs">{addr.phone}</p>
//                       </div>
//                     </div>
//                     <button className="text-text-secondary hover:text-red-400 transition-colors text-lg leading-none shrink-0">×</button>
//                   </div>
//                 ))
//               )}
//             </div>

//             <PrimaryButton className="w-full justify-center" onClick={() => setAddAddressOpen(true)}>
//               + Add New Address
//             </PrimaryButton>

//             {/* Add address modal */}
//             <Modal isOpen={addAddressOpen} onClose={() => setAddAddressOpen(false)} title="Add Address" size="sm">
//               <div className="p-5 space-y-3">
//                 <div className="flex gap-2">
//                   {['Home','Work','Other'].map(l => (
//                     <button key={l} onClick={() => setNewAddr(a=>({...a,label:l}))}
//                       className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
//                         ${newAddr.label===l?'border-primary bg-primary/20 text-primary':'border-white/20 text-text-secondary hover:border-white/40'}`}>
//                       {l==='Home'?'🏠':l==='Work'?'🏢':'📍'} {l}
//                     </button>
//                   ))}
//                 </div>
//                 {[
//                   ['name','Full Name'],['phone','Phone'],['fullAddress','Full Address'],['pincode','Pincode'],
//                 ].map(([f,l]) => (
//                   <input key={f} placeholder={l}
//                     value={newAddr[f as keyof typeof newAddr]}
//                     onChange={e => setNewAddr(a=>({...a,[f]:e.target.value}))}
//                     className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
//                       text-sm outline-none focus:border-primary/60 transition-colors placeholder:text-text-secondary"
//                   />
//                 ))}
//                 <PrimaryButton className="w-full justify-center" onClick={() => {
//                   toast.success('Address saved!');
//                   setAddAddressOpen(false);
//                   setNewAddr({ label:'Home', name:'', phone:'', fullAddress:'', pincode:'' });
//                 }}>
//                   Save Address
//                 </PrimaryButton>
//               </div>
//             </Modal>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default ProfilePage;
