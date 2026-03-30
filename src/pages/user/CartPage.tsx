import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { PrimaryButton, SecondaryButton, Badge } from '../../components/ui';
import { formatCurrency } from '../../utils/helpers';
import { offerService } from '../../services/allServices';
import icons from '../../data/icons.json';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon,
    couponCode, discount, getSubtotal } = useCartStore();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const subtotal  = getSubtotal();
  const gst       = Math.round(subtotal * 0.05);
  const delivery  = subtotal > 0 ? 40 : 0;
  const total     = subtotal + gst + delivery - discount;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await offerService.validateCoupon(couponInput.trim(), subtotal);
      if (res.valid) {
        applyCoupon(couponInput.trim(), res.discount);
        toast.success(`Coupon applied! You save ${formatCurrency(res.discount)} 🎉`);
      } else {
        setCouponError(res.message || 'Invalid or expired coupon');
      }
    } catch {
      setCouponError('Could not validate coupon right now');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
    setCouponError('');
    toast('Coupon removed', { icon: '🗑️' });
  };

  /* ── Empty state ─────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-28 px-4">
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-9xl mb-6 select-none"
        >🧋</motion.div>
        <h2 className="font-display text-3xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-text-secondary text-sm mb-8 text-center max-w-xs">
          Looks like Bob the Bubble hasn't caught your eye yet. Browse the menu!
        </p>
        <PrimaryButton size="lg" onClick={() => navigate('/menu')}>
          Explore Menu 🍵
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Your Cart</h1>
          <p className="text-text-secondary text-sm mt-0.5">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        <button onClick={clearCart}
          className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors font-semibold">
          <img src={icons.delete.url} alt="" className="w-4 h-4" />
          Clear all
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Items — 3 cols */}
        <div className="lg:col-span-3 space-y-3">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="overflow-hidden"
              >
                <div className="flex gap-4 p-4 bg-card rounded-2xl border border-white/10 group
                  hover:border-primary/20 transition-colors">
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-white/5">
                    <img
                      src={item.image || `https://picsum.photos/seed/${item.menuItemId}/200/200`}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <img
                            src={item.isVeg ? icons.veg.url : icons.nonveg.url}
                            alt="" className="w-4 h-4 shrink-0"
                          />
                          <h3 className="font-bold text-white text-sm truncate">{item.name}</h3>
                        </div>
                        {item.size && (
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/10
                            text-text-secondary border border-white/10 mt-0.5">
                            {item.size}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-text-secondary hover:text-red-400 transition-colors shrink-0 p-1
                          hover:bg-red-400/10 rounded-full"
                        aria-label="Remove"
                      >
                        <img src={icons.delete.url} alt="" className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price + Qty */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 bg-white/10 rounded-full px-1.5 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white
                            hover:bg-primary/40 transition-colors font-bold text-base leading-none"
                        >−</button>
                        <motion.span
                          key={item.quantity}
                          initial={{ scale: 1.3 }}
                          animate={{ scale: 1 }}
                          className="text-white font-bold text-sm w-6 text-center"
                        >
                          {item.quantity}
                        </motion.span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white
                            hover:bg-primary/40 transition-colors font-bold text-base leading-none"
                        >+</button>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-text-secondary text-xs">
                            {formatCurrency(item.unitPrice)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Coupon */}
          <div className="p-5 bg-card rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <img src={icons.offer.url} alt="" className="w-4 h-4" />
              <p className="text-white font-bold text-sm">Coupon / Offer Code</p>
            </div>

            {couponCode ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-between bg-success/10 border border-success/30
                  rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-success text-lg">✓</span>
                  <div>
                    <p className="text-success font-bold text-sm">{couponCode} applied!</p>
                    <p className="text-success/70 text-xs">
                      You save {formatCurrency(discount)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-text-secondary hover:text-red-400 transition-colors text-xs font-semibold"
                >
                  Remove
                </button>
              </motion.div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Enter code (e.g. BOBBA10)"
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                      text-sm outline-none focus:border-primary/60 transition-colors placeholder:text-text-secondary"
                  />
                  <PrimaryButton
                    onClick={handleApplyCoupon}
                    loading={couponLoading}
                    disabled={!couponInput.trim() || couponLoading}
                    size="sm"
                  >
                    Apply
                  </PrimaryButton>
                </div>
                <AnimatePresence>
                  {couponError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-xs mt-2 flex items-center gap-1"
                    >
                      ✕ {couponError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Summary — 2 cols */}
        <div className="lg:col-span-2 lg:sticky lg:top-24 space-y-4">
          <div className="bg-card rounded-2xl p-5 border border-white/10">
            <h3 className="font-display font-bold text-white mb-4">Order Summary</h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>GST (5%)</span>
                <span>{formatCurrency(gst)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Delivery fee</span>
                <span>{formatCurrency(delivery)}</span>
              </div>
              {discount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex justify-between text-success font-semibold"
                >
                  <span>Coupon discount</span>
                  <span>−{formatCurrency(discount)}</span>
                </motion.div>
              )}
              <div className="border-t border-white/10 pt-3 mt-1 flex justify-between font-bold text-base">
                <span className="text-white">Total</span>
                <motion.span
                  key={total}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="bg-bubble-gradient bg-clip-text text-transparent"
                >
                  {formatCurrency(total)}
                </motion.span>
              </div>
            </div>

            <PrimaryButton
              className="w-full justify-center mt-5"
              size="lg"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout →
            </PrimaryButton>
          </div>

          <SecondaryButton
            className="w-full justify-center"
            onClick={() => navigate('/menu')}
          >
            ← Continue Shopping
          </SecondaryButton>

          {/* Savings callout */}
          {discount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-success/10 border border-success/20 rounded-2xl p-4 text-center"
            >
              <p className="text-success font-bold text-sm">
                🎉 You're saving {formatCurrency(discount)} on this order!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;