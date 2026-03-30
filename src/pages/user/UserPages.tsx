// CartPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { CartSummary } from '../../components/cart/CartComponents';
import { PrimaryButton, SecondaryButton } from '../../components/ui';
import { formatCurrency } from '../../utils/helpers';
import { offerService } from '../../services/allServices';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, applyCoupon, couponCode, getSubtotal } = useCartStore();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(couponCode);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const res = await offerService.validateCoupon(coupon, getSubtotal());
      if (res.valid) {
        applyCoupon(coupon, res.discount);
        toast.success(`Coupon applied! You save ${formatCurrency(res.discount)} 🎉`);
      } else {
        toast.error(res.message || 'Invalid coupon code');
      }
    } catch {
      toast.error('Could not validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-24">
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-8xl mb-5">
          🧋
        </motion.div>
        <h2 className="font-display text-3xl font-bold text-white mb-2">Cart is empty!</h2>
        <p className="text-text-secondary mb-6">Add some bubble goodness to get started</p>
        <PrimaryButton onClick={() => navigate('/menu')}>Explore Menu 🍵</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Your Cart 🛒</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-4 p-4 bg-card rounded-2xl border border-white/10"
              >
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                    <button onClick={() => removeItem(item.id)} className="text-text-secondary hover:text-red-400 transition-colors text-xl leading-none">×</button>
                  </div>
                  {item.size && <p className="text-text-secondary text-xs">{item.size}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-white hover:text-primary font-bold">−</button>
                      <span className="text-white font-bold text-sm w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-white hover:text-primary font-bold">+</button>
                    </div>
                    <p className="text-white font-bold">{formatCurrency(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Coupon */}
          <div className="p-4 bg-card rounded-2xl border border-white/10">
            <p className="text-white font-bold text-sm mb-3">Have a coupon code?</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-primary/60"
              />
              <PrimaryButton onClick={handleCoupon} loading={couponLoading} size="sm">Apply</PrimaryButton>
            </div>
          </div>

          <button onClick={clearCart} className="text-red-400 text-sm hover:text-red-300 transition-colors">
            🗑️ Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24">
          <CartSummary showCheckoutButton />
          <SecondaryButton className="w-full mt-3 justify-center" onClick={() => navigate('/menu')}>
            Continue Shopping
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};

// ─── Checkout Page ────────────────────────────────────────────
export const CheckoutPage: React.FC = () => {
  const [step, setStep] = useState<'details' | 'payment' | 'confirm'>('details');
  const [orderType, setOrderType] = useState<'dine_in' | 'pickup' | 'delivery'>('delivery');
  const [form, setForm] = useState({ name: '', phone: '', address: '', landmark: '', pincode: '' });
  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  const handleOrder = () => {
    setStep('confirm');
    setTimeout(() => {
      clearCart();
    }, 2000);
  };

  return (
    <div className="pt-24 pb-24 min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Checkout</h1>

      <AnimatePresence mode="wait">
        {step === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            {/* Order type */}
            <div className="bg-card rounded-2xl p-6 border border-white/10 mb-6">
              <h2 className="font-bold text-white mb-4">How would you like your order?</h2>
              <div className="flex gap-3 flex-wrap">
                {(['dine_in', 'pickup', 'delivery'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`flex-1 min-w-24 py-3 rounded-xl border text-sm font-bold capitalize transition-all
                      ${orderType === t ? 'border-primary bg-primary/20 text-primary' : 'border-white/20 text-text-secondary hover:border-white/40'}`}
                  >
                    {t === 'dine_in' ? '🪑 Dine In' : t === 'pickup' ? '🏃 Pickup' : '🛵 Delivery'}
                  </button>
                ))}
              </div>
            </div>

            {/* Address form */}
            {orderType === 'delivery' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="bg-card rounded-2xl p-6 border border-white/10 mb-6 space-y-4">
                <h2 className="font-bold text-white">Delivery Address</h2>
                {[['name', 'Full Name'], ['phone', 'Phone Number'], ['address', 'Full Address'], ['landmark', 'Landmark (optional)'], ['pincode', 'Pincode']].map(([field, label]) => (
                  <input
                    key={field}
                    type="text"
                    placeholder={label}
                    value={form[field as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/60 transition-colors placeholder:text-text-secondary"
                  />
                ))}
              </motion.div>
            )}

            <PrimaryButton className="w-full justify-center" size="lg" onClick={() => setStep('payment')}>
              Continue to Payment →
            </PrimaryButton>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div key="payment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-card rounded-2xl p-8 border border-white/10 text-center">
              <img src="https://img.icons8.com/color/96/bhim.png" alt="UPI" className="w-16 h-16 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-white mb-2">Pay via UPI</h2>
              <p className="text-text-secondary mb-6">Scan QR or use UPI ID to pay</p>
              <div className="w-48 h-48 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-black text-sm font-mono text-center">QR Code<br/>(Generated on order)</span>
              </div>
              <p className="text-text-secondary text-sm mb-2">UPI ID: <span className="text-white font-mono">bobbabobba@paytm</span></p>
              <div className="flex gap-3 mt-6">
                <SecondaryButton onClick={() => setStep('details')} className="flex-1 justify-center">← Back</SecondaryButton>
                <PrimaryButton onClick={handleOrder} className="flex-1 justify-center">Confirm Order 🎉</PrimaryButton>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: 3 }}
              className="text-8xl mb-6">🎉</motion.div>
            <h2 className="font-display text-4xl font-bold text-white mb-2">Order Placed!</h2>
            <p className="text-text-secondary mb-2">Your bubble goodness is being prepared 🧋</p>
            <p className="text-secondary font-bold text-lg mb-8">Estimated time: 35–45 minutes</p>
            <PrimaryButton size="lg" onClick={() => navigate('/orders')}>Track Your Order →</PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Order Tracking Page ──────────────────────────────────────
export const OrderTrackingPage: React.FC = () => {
  const steps = ['Order Placed', 'Being Prepared', 'Out for Delivery', 'Delivered'];
  const currentStep = 1; // mock

  return (
    <div className="pt-24 pb-24 min-h-screen max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Track Order</h1>
      <div className="bg-card rounded-2xl p-6 border border-white/10 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-secondary text-sm">Order #BB{Date.now().toString(36).toUpperCase()}</span>
          <span className="text-secondary font-bold text-sm">🔥 Being Prepared</span>
        </div>
        <p className="text-text-secondary text-xs">Estimated Delivery: ~35 minutes</p>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-2xl p-6 border border-white/10 mb-6">
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={step} className="flex items-start gap-4 relative">
              {i < steps.length - 1 && (
                <div className={`absolute left-4 top-8 w-0.5 h-10 ${i < currentStep ? 'bg-primary' : 'bg-white/20'}`} />
              )}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2
                ${i < currentStep ? 'bg-primary border-primary text-white' :
                  i === currentStep ? 'border-primary bg-primary/20 text-primary animate-pulse' :
                  'border-white/20 bg-card text-text-secondary'}`}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              <div className="pb-10">
                <p className={`font-bold text-sm ${i <= currentStep ? 'text-white' : 'text-text-secondary'}`}>{step}</p>
                {i === currentStep && <p className="text-primary text-xs">In progress...</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="bg-card rounded-2xl border border-white/10 h-48 flex items-center justify-center">
        <p className="text-text-secondary text-sm">🗺️ Live delivery map (connects to Leaflet.js)</p>
      </div>
    </div>
  );
};

// ─── Profile Page ─────────────────────────────────────────────
export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <div className="pt-24 pb-24 min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-full bg-bubble-gradient flex items-center justify-center text-3xl font-bold text-white shadow-brand">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-text-secondary">{user.phone}</p>
          <p className="text-text-secondary text-xs mt-0.5">Member since {new Date(user.memberSince).getFullYear()}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: user.totalOrders || 0 },
          { label: 'Total Spent', value: `₹${user.totalSpent || 0}` },
          { label: 'Member Since', value: new Date(user.memberSince).getFullYear() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card rounded-2xl p-4 border border-white/10 text-center">
            <p className="font-display text-2xl font-bold text-white">{value}</p>
            <p className="text-text-secondary text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl p-6 border border-white/10">
        <p className="text-text-secondary text-sm">More profile features coming soon — order history, reviews, addresses!</p>
      </div>
    </div>
  );
};

// Import needed for ProfilePage
import { useAuthStore } from '../../store/authStore';

// ─── Gallery Page ─────────────────────────────────────────────
export const GalleryPage: React.FC = () => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const images = Array.from({ length: 24 }, (_, i) =>
    `https://picsum.photos/seed/bobba-gallery-${i}/600/600`
  );

  return (
    <div className="pt-24 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-2">
            Our <span className="bg-bubble-gradient bg-clip-text text-transparent">Gallery</span>
          </h1>
          <p className="text-text-secondary">A visual feast of everything we make 📸</p>
        </div>

        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {images.map((src, i) => (
            <motion.button
              key={i}
              className="w-full overflow-hidden rounded-xl block"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setLightbox(src)}
            >
              <img
                src={src}
                alt={`Gallery ${i + 1}`}
                className="w-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-4 right-4 text-white text-3xl">×</button>
            <img src={lightbox} alt="Gallery" className="max-h-[90vh] max-w-full rounded-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Settings Page ────────────────────────────────────────────
export const SettingsPage: React.FC = () => {
  const [whatsapp, setWhatsapp] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="pt-24 pb-24 min-h-screen max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="space-y-4">
        <div className="bg-card rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-white font-bold">WhatsApp Notifications</p>
            <p className="text-text-secondary text-xs">Receive order updates & offers on WhatsApp</p>
          </div>
          <button
            onClick={() => setWhatsapp(!whatsapp)}
            className={`w-12 h-6 rounded-full transition-colors relative ${whatsapp ? 'bg-success' : 'bg-white/20'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${whatsapp ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-white/10">
          <p className="text-white font-bold mb-1">Language</p>
          <select className="bg-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/20 w-full">
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="pa">ਪੰਜਾਬੀ</option>
          </select>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10">
          <button
            onClick={() => navigate('/admin/login')}
            className="text-text-secondary text-xs hover:text-white transition-colors"
          >
            Staff Login
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Order History Page ───────────────────────────────────────
export const OrderHistoryPage: React.FC = () => (
  <div className="pt-24 pb-24 min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 className="font-display text-3xl font-bold text-white mb-8">My Orders</h1>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-bold text-sm">Order #BB{(i * 12345).toString(36).toUpperCase()}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              i === 1 ? 'bg-success/20 text-success' : 'bg-white/10 text-text-secondary'
            }`}>
              {i === 1 ? '✓ Delivered' : 'Past Order'}
            </span>
          </div>
          <p className="text-text-secondary text-xs mb-1">Bobba Milk Tea × 2, Momos × 1</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-white font-bold">₹{249 * i}</span>
            <button className="text-primary text-xs font-bold hover:underline">Reorder</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
