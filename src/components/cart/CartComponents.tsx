import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { Drawer, PrimaryButton, GhostButton } from '../ui';
import { formatCurrency } from '../../utils/helpers';

// ─── CartItem ─────────────────────────────────────────────────
const CartItemRow: React.FC<{ item: ReturnType<typeof useCartStore.getState>['items'][0] }> = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-3 py-3 border-b border-white/10 last:border-0"
    >
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/5">
        <img
          src={item.image || `https://picsum.photos/seed/${item.menuItemId}/200/200`}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{item.name}</p>
            {item.size && (
              <p className="text-text-secondary text-xs">{item.size}</p>
            )}
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-text-secondary hover:text-red-400 transition-colors shrink-0 text-lg leading-none"
            aria-label="Remove item"
          >
            ×
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Qty stepper */}
          <div className="flex items-center gap-1 bg-white/10 rounded-full px-1 py-0.5">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white hover:bg-primary/50 transition-colors text-sm font-bold"
            >
              −
            </button>
            <span className="text-white font-bold text-sm w-5 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white hover:bg-primary/50 transition-colors text-sm font-bold"
            >
              +
            </button>
          </div>
          <p className="text-white font-bold text-sm">
            {formatCurrency(item.unitPrice * item.quantity)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── CartSummary ──────────────────────────────────────────────
export const CartSummary: React.FC<{ deliveryFee?: number; showCheckoutButton?: boolean }> = ({
  deliveryFee = 40, showCheckoutButton = false
}) => {
  const { items, getSubtotal, discount, couponCode } = useCartStore();
  const navigate = useNavigate();
  const subtotal = getSubtotal();
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst + (subtotal > 0 ? deliveryFee : 0) - discount;

  return (
    <div className="bg-card/60 rounded-2xl p-5 border border-white/10">
      <h4 className="font-display font-bold text-white mb-4">Order Summary</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-text-secondary">
          <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>GST (5%)</span>
          <span>{formatCurrency(gst)}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Delivery Fee</span>
          <span>{subtotal > 0 ? formatCurrency(deliveryFee) : '—'}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount {couponCode && `(${couponCode})`}</span>
            <span>−{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="border-t border-white/10 pt-2 mt-2 flex justify-between text-white font-bold text-base">
          <span>Total</span>
          <span className="bg-bubble-gradient bg-clip-text text-transparent">{formatCurrency(total)}</span>
        </div>
      </div>

      {showCheckoutButton && subtotal > 0 && (
        <PrimaryButton
          className="w-full mt-4 justify-center"
          onClick={() => navigate('/checkout')}
        >
          Proceed to Checkout →
        </PrimaryButton>
      )}
    </div>
  );
};

// ─── Empty Cart State ─────────────────────────────────────────
const EmptyCart: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <motion.div
        className="text-8xl mb-4 select-none"
        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        🧋
      </motion.div>
      <h3 className="font-display text-2xl font-bold text-white mb-2">Your cart is empty!</h3>
      <p className="text-text-secondary text-sm mb-6">
        Add some bubble teas or momos to get started. Bob the Bubble is waiting for you! 🫧
      </p>
      <PrimaryButton onClick={() => { onClose?.(); navigate('/menu'); }}>
        Explore Menu
      </PrimaryButton>
    </div>
  );
};

// ─── CartDrawer ───────────────────────────────────────────────
export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart } = useCartStore();
  const navigate = useNavigate();

  return (
    <Drawer isOpen={isOpen} onClose={closeCart} title="🛒 Your Cart" side="right">
      {items.length === 0 ? (
        <EmptyCart onClose={closeCart} />
      ) : (
        <div className="flex flex-col h-full">
          {/* Items */}
          <div className="flex-1 overflow-y-auto px-4">
            <AnimatePresence>
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </div>

          {/* Summary + CTA */}
          <div className="p-4 border-t border-white/10 bg-card">
            <CartSummary />
            <div className="flex gap-3 mt-4">
              <GhostButton onClick={closeCart} className="flex-1 justify-center">
                Continue Shopping
              </GhostButton>
              <PrimaryButton
                onClick={() => { closeCart(); navigate('/checkout'); }}
                className="flex-1 justify-center"
              >
                Checkout →
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default CartDrawer;
