import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order } from '../../types/order.types';
import { adminService } from '../../services/allServices';
import { Badge, Modal } from '../../components/ui';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

type FilterStatus = 'all' | Order['status'];

const STATUS_COLORS: Record<Order['status'], string> = {
  placed:           'text-secondary bg-secondary/20 border-secondary/30',
  preparing:        'text-warning bg-warning/20 border-warning/30',
  out_for_delivery: 'text-primary bg-primary/20 border-primary/30',
  delivered:        'text-success bg-success/20 border-success/30',
  cancelled:        'text-red-400 bg-red-400/20 border-red-400/30',
};

const STATUS_LABELS: Record<Order['status'], string> = {
  placed: '📋 Placed', preparing: '👨‍🍳 Preparing',
  out_for_delivery: '🛵 Out for Delivery', delivered: '✅ Delivered', cancelled: '❌ Cancelled',
};

const NEXT_STATUS: Partial<Record<Order['status'], Order['status']>> = {
  placed: 'preparing', preparing: 'out_for_delivery', out_for_delivery: 'delivered',
};

// Mock data
const MOCK_ORDERS: (Partial<Order> & { customerName: string; customerPhone: string })[] = [
  { id:'BB1A2B', customerName:'Priya Sharma', customerPhone:'98765 43210', items:[
    {menuItemId:'1',name:'Matcha Bobba',image:'',size:'500ml',addOns:[],quantity:2,unitPrice:249,totalPrice:498},
    {menuItemId:'2',name:'Afghan Momos',image:'',size:undefined,addOns:[],quantity:1,unitPrice:179,totalPrice:179},
  ], total:717, status:'preparing', orderType:'delivery', createdAt: new Date(Date.now()-8*60000).toISOString() },
  { id:'BB3C4D', customerName:'Arjun Singh', customerPhone:'87654 32109', items:[
    {menuItemId:'3',name:'Bingsu Mango',image:'',size:undefined,addOns:[],quantity:1,unitPrice:249,totalPrice:249},
  ], total:299, status:'placed', orderType:'pickup', createdAt: new Date(Date.now()-2*60000).toISOString() },
  { id:'BB5E6F', customerName:'Mehak Kapoor', customerPhone:'76543 21098', items:[
    {menuItemId:'4',name:'Korean Ramen',image:'',size:undefined,addOns:[],quantity:2,unitPrice:279,totalPrice:558},
  ], total:638, status:'out_for_delivery', orderType:'delivery', createdAt: new Date(Date.now()-25*60000).toISOString() },
  { id:'BB7G8H', customerName:'Rohit Verma', customerPhone:'65432 10987', items:[
    {menuItemId:'5',name:'UFO Burger',image:'',size:undefined,addOns:[],quantity:1,unitPrice:329,totalPrice:329},
  ], total:389, status:'delivered', orderType:'delivery', createdAt: new Date(Date.now()-2*3600000).toISOString() },
];

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [etaModal, setEtaModal] = useState<string | null>(null);
  const [etaInput, setEtaInput] = useState('20');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order #${orderId} → ${STATUS_LABELS[newStatus]}`);
    } catch {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order #${orderId} updated`);
    }
  };

  const handleSetEta = (orderId: string) => {
    const mins = parseInt(etaInput);
    if (isNaN(mins) || mins < 1) return toast.error('Enter valid minutes');
    toast.success(`ETA for #${orderId} set to ${mins} min`);
    setEtaModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Orders</h1>
          <p className="text-text-secondary text-sm mt-0.5">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-2 bg-success/20 border border-success/30 rounded-full px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-success text-sm font-bold">Live updates</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(['all','placed','preparing','out_for_delivery','delivered'] as FilterStatus[]).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-all shrink-0
              ${filter===s ? 'bg-primary text-white border-primary' : 'bg-card text-text-secondary border-white/10 hover:border-primary/40'}`}>
            {s==='all' ? 'All Orders' : STATUS_LABELS[s as Order['status']]}
            <span className="ml-1.5 text-xs opacity-70">
              {s==='all' ? orders.length : orders.filter(o=>o.status===s).length}
            </span>
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((order, i) => (
            <motion.div key={order.id}
              layout
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, scale:0.97 }}
              transition={{ delay: i*0.04 }}
              className="bg-card rounded-2xl border border-white/10 overflow-hidden hover:border-primary/20 transition-colors"
            >
              {/* Order header */}
              <div className="flex items-center gap-4 p-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-white font-mono font-bold text-sm">#{order.id}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status ?? 'placed']}`}>
                      {STATUS_LABELS[order.status ?? 'placed']}
                    </span>
                    <span className="text-text-secondary text-xs">
                      {order.orderType === 'delivery' ? '🛵 Delivery' : order.orderType === 'pickup' ? '🏃 Pickup' : '🪑 Dine-in'}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-sm mt-1">{order.customerName}</p>
                  <p className="text-text-secondary text-xs">{order.customerPhone}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-white font-bold">{formatCurrency(order.total ?? 0)}</p>
                  <p className="text-text-secondary text-xs">{order.items?.length} items</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {NEXT_STATUS[order.status ?? 'placed'] && (
                    <button
                      onClick={() => handleStatusUpdate(order.id!, NEXT_STATUS[order.status ?? 'placed']!)}
                      className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors"
                    >
                      → {STATUS_LABELS[NEXT_STATUS[order.status ?? 'placed']!].split(' ').slice(1).join(' ')}
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => { setEtaInput('20'); setEtaModal(order.id!); }}
                      className="px-3 py-1.5 rounded-full bg-warning/20 border border-warning/30 text-warning text-xs font-bold hover:bg-warning/30 transition-colors"
                    >
                      ⏱ Set ETA
                    </button>
                  )}
                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id!)}
                    className="px-3 py-1.5 rounded-full bg-white/10 text-text-secondary text-xs font-bold hover:bg-white/20 transition-colors"
                  >
                    {expanded === order.id ? '▲ Less' : '▼ More'}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {expanded === order.id && (
                  <motion.div
                    initial={{ height:0, opacity:0 }}
                    animate={{ height:'auto', opacity:1 }}
                    exit={{ height:0, opacity:0 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="p-4 space-y-2">
                      <p className="text-text-secondary text-xs font-bold uppercase tracking-wide mb-2">Order Items</p>
                      {order.items?.map((item, j) => (
                        <div key={j} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-text-secondary">{item.quantity}×</span>
                            <span className="text-white">{item.name}</span>
                            {item.size && <span className="text-text-secondary text-xs">({item.size})</span>}
                          </div>
                          <span className="text-white font-semibold">{formatCurrency(item.totalPrice)}</span>
                        </div>
                      ))}
                      <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-primary">{formatCurrency(order.total ?? 0)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-card rounded-2xl border border-white/10">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-white font-bold">No {filter} orders</p>
          </div>
        )}
      </div>

      {/* ETA Modal */}
      <Modal isOpen={!!etaModal} onClose={() => setEtaModal(null)} title="⏱️ Set Delivery ETA" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-text-secondary text-sm">Set preparation time (route time will be added automatically)</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={etaInput}
              onChange={e => setEtaInput(e.target.value)}
              min="1" max="120"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm
                outline-none focus:border-primary/60 transition-colors text-center font-bold text-2xl"
            />
            <span className="text-text-secondary font-semibold">minutes</span>
          </div>
          <div className="flex gap-2">
            {[10,15,20,30].map(m => (
              <button key={m} onClick={() => setEtaInput(String(m))}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all
                  ${etaInput===String(m)?'border-primary bg-primary/20 text-primary':'border-white/20 text-text-secondary hover:border-white/40'}`}>
                {m}m
              </button>
            ))}
          </div>
          <button
            onClick={() => handleSetEta(etaModal!)}
            className="w-full py-3 rounded-full bg-bubble-gradient text-white font-bold shadow-brand hover:opacity-90 transition-opacity"
          >
            Confirm ETA → ~{parseInt(etaInput)+15} min total
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;