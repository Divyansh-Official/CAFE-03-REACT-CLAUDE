import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order } from '../../types/order.types';
import { OrderTimeline, DeliveryMap } from '../../components/order/OrderComponents';
import { orderService } from '../../services/allServices';
import cafe from '../../data/cafe.json';

const MOCK_ORDER: Partial<Order> = {
  id: 'BB1A2B3C',
  status: 'preparing',
  orderType: 'delivery',
  estimatedMinutes: 35,
  items: [
    { menuItemId: '1', name: 'Japanese Matcha Bobba', image: '', size: '500ml', addOns: [], quantity: 2, unitPrice: 249, totalPrice: 498 },
    { menuItemId: '2', name: 'Afghan Momos',          image: '', size: undefined, addOns: [], quantity: 1, unitPrice: 179, totalPrice: 179 },
  ],
  total: 717,
  placedAt: new Date(Date.now() - 8 * 60000).toISOString(),
  preparingAt: new Date(Date.now() - 3 * 60000).toISOString(),
};

const STATUS_LABELS: Record<Order['status'], string> = {
  placed:           '📋 Order Placed',
  preparing:        '👨‍🍳 Being Prepared',
  out_for_delivery: '🛵 Out for Delivery',
  delivered:        '🎉 Delivered!',
  cancelled:        '❌ Cancelled',
};

const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams();
  const [order, setOrder]   = useState<Partial<Order>>(MOCK_ORDER);
  const [minutes, setMinutes] = useState(MOCK_ORDER.estimatedMinutes ?? 35);
  const [seconds, setSeconds] = useState(0);

  /* ── Poll order status every 30s ── */
  useEffect(() => {
    if (!orderId) return;
    const poll = async () => {
      try {
        const res = await orderService.getOrderStatus(orderId);
        setOrder(prev => ({ ...prev, status: res.status, estimatedMinutes: res.estimatedMinutes }));
        setMinutes(res.estimatedMinutes);
      } catch { /* use mock */ }
    };
    poll();
    const iv = setInterval(poll, 30_000);
    return () => clearInterval(iv);
  }, [orderId]);

  /* ── Countdown timer ── */
  useEffect(() => {
    if (order.status === 'delivered' || order.status === 'cancelled') return;
    const iv = setInterval(() => {
      setSeconds(s => {
        if (s <= 0) {
          setMinutes(m => Math.max(0, m - 1));
          return 59;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [order.status]);

  const isDelivered = order.status === 'delivered';

  return (
    <div className="min-h-screen pt-24 pb-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Track Order</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            #{order.id ?? orderId ?? 'BBXXXXXX'}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-bold border
          ${isDelivered
            ? 'bg-success/20 text-success border-success/30'
            : 'bg-primary/20 text-primary border-primary/30 animate-pulse'
          }`}
        >
          {STATUS_LABELS[order.status ?? 'placed']}
        </div>
      </div>

      {/* ETA Card */}
      {!isDelivered && (
        <motion.div
          className="bg-gradient-to-r from-primary/10 via-card to-warning/10 rounded-2xl p-5
            border border-white/10 mb-6 flex items-center gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-5xl">⏱️</div>
          <div>
            <p className="text-text-secondary text-sm">Estimated arrival</p>
            <div className="flex items-baseline gap-1">
              <motion.span
                key={minutes}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="font-display text-4xl font-bold bg-bubble-gradient bg-clip-text text-transparent"
              >
                {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
              </motion.span>
              <span className="text-text-secondary text-sm">remaining</span>
            </div>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-text-secondary text-xs">Order total</p>
            <p className="text-white font-bold text-lg">₹{order.total}</p>
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-card rounded-2xl p-5 border border-white/10">
          <h2 className="font-display font-bold text-white mb-4">Order Timeline</h2>
          <OrderTimeline order={order} />
        </div>

        {/* Map + Items */}
        <div className="space-y-4">
          {/* Delivery map */}
          {order.orderType === 'delivery' && (
            <div className="bg-card rounded-2xl p-4 border border-white/10">
              <h2 className="font-display font-bold text-white mb-3">Live Location</h2>
              <DeliveryMap
                cafeLat={cafe.coordinates.lat}
                cafeLng={cafe.coordinates.lng}
                height="200px"
              />
              <p className="text-text-secondary text-xs text-center mt-2">
                🛵 Delivery partner en route
              </p>
            </div>
          )}

          {/* Items summary */}
          <div className="bg-card rounded-2xl p-4 border border-white/10">
            <h2 className="font-display font-bold text-white mb-3">Your Items</h2>
            <div className="space-y-2">
              {(order.items ?? []).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary">{item.quantity}×</span>
                    <span className="text-white font-semibold">{item.name}</span>
                    {item.size && <span className="text-text-secondary text-xs">({item.size})</span>}
                  </div>
                  <span className="text-white font-bold">₹{item.totalPrice}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 mt-1 flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-primary">₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="mt-6 bg-card rounded-2xl p-4 border border-white/10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📞</span>
          <div>
            <p className="text-white font-bold text-sm">Need help?</p>
            <p className="text-text-secondary text-xs">Call or WhatsApp us</p>
          </div>
        </div>
        <div className="flex gap-3">
          <a href={`tel:${cafe.phone}`}
            className="px-4 py-2 rounded-full border border-white/20 text-white text-sm font-semibold
              hover:bg-white/10 transition-colors">
            📞 Call
          </a>
          <a href={cafe.social.whatsapp} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-success/20 border border-success/30 text-success text-sm font-semibold
              hover:bg-success/30 transition-colors">
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
