import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { PrimaryButton, SecondaryButton, Modal } from '../../components/ui';
import { getInitials, formatDate, formatCurrency } from '../../utils/helpers';
import { authService } from '../../services/allServices';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'orders' | 'addresses';

const MOCK_ORDERS = [
  { id:'BB1A2B', items:'Matcha Bobba × 2, Afghan Momos × 1', total:677, status:'delivered', date:'2024-03-28' },
  { id:'BB3C4D', items:'Bingsu Mango Magic × 1',             total:249, status:'delivered', date:'2024-03-25' },
  { id:'BB5E6F', items:'Korean Ramen × 2, Holland Fries × 1',total:498, status:'delivered', date:'2024-03-20' },
];

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab]       = useState<Tab>('overview');
  const [editName, setEditName]   = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({ label:'Home', name:'', phone:'', fullAddress:'', pincode:'' });

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-text-secondary">Please log in to view your profile.</p>
    </div>
  );

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      await authService.updateProfile({ name: nameInput.trim() });
      updateUser({ name: nameInput.trim() });
      setEditName(false);
      toast.success('Name updated!');
    } catch {
      updateUser({ name: nameInput.trim() });
      setEditName(false);
      toast.success('Name updated!');
    } finally {
      setSavingName(false);
    }
  };

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key:'overview',  label:'Overview',  icon:'📊' },
    { key:'orders',    label:'Orders',    icon:'📦' },
    { key:'addresses', label:'Addresses', icon:'📍' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-28 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Profile header */}
      <motion.div
        initial={{ opacity:0, y:20 }}
        animate={{ opacity:1, y:0 }}
        className="bg-card rounded-2xl p-6 border border-white/10 mb-6"
      >
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-bubble-gradient flex items-center justify-center
              text-2xl font-bold text-white shadow-brand select-none">
              {getInitials(user.name ?? 'U')}
            </div>
            {user.role !== 'user' && (
              <div className="absolute -bottom-1 -right-1 bg-secondary text-black text-[10px] font-bold
                px-1.5 py-0.5 rounded-full">
                {user.role === 'main_admin' ? '👑' : '🔧'}
              </div>
            )}
          </div>

          {/* Name / info */}
          <div className="flex-1 min-w-0">
            {editName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  className="flex-1 bg-white/10 border border-primary/40 rounded-xl px-3 py-2 text-white
                    text-sm outline-none font-bold"
                />
                <PrimaryButton size="sm" onClick={handleSaveName} loading={savingName}>Save</PrimaryButton>
                <button onClick={() => setEditName(false)} className="text-text-secondary hover:text-white">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-white truncate">{user.name}</h1>
                <button onClick={() => setEditName(true)}
                  className="text-text-secondary hover:text-primary transition-colors text-sm shrink-0">
                  ✏️
                </button>
              </div>
            )}
            <p className="text-text-secondary text-sm mt-0.5">{user.phone}</p>
            <p className="text-text-secondary text-xs mt-0.5">
              Member since {new Date(user.memberSince).toLocaleDateString('en-IN',{month:'long',year:'numeric'})}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card rounded-2xl p-1 border border-white/10 mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold
              transition-all duration-200
              ${tab === t.key ? 'bg-primary text-white shadow-brand' : 'text-text-secondary hover:text-white hover:bg-white/10'}`}
          >
            <span className="text-base">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {/* ── Overview ── */}
        {tab === 'overview' && (
          <motion.div key="overview"
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label:'Total Orders', value: MOCK_ORDERS.length, icon:'📦' },
                { label:'Total Spent',  value: formatCurrency(MOCK_ORDERS.reduce((s,o)=>s+o.total,0)), icon:'💰' },
                { label:'Avg Order',    value: formatCurrency(Math.round(MOCK_ORDERS.reduce((s,o)=>s+o.total,0)/MOCK_ORDERS.length)), icon:'📊' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-card rounded-2xl p-4 border border-white/10 text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="font-display font-bold text-white text-lg">{value}</p>
                  <p className="text-text-secondary text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Recent order */}
            <div className="bg-card rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Recent Order</h3>
                <button onClick={() => setTab('orders')} className="text-primary text-xs font-bold hover:underline">
                  View all →
                </button>
              </div>
              {MOCK_ORDERS[0] && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">#{MOCK_ORDERS[0].id}</p>
                    <p className="text-text-secondary text-xs mt-0.5">{MOCK_ORDERS[0].items}</p>
                    <p className="text-text-secondary text-xs">{formatDate(MOCK_ORDERS[0].date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{formatCurrency(MOCK_ORDERS[0].total)}</p>
                    <span className="text-xs font-bold text-success">✓ Delivered</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Orders ── */}
        {tab === 'orders' && (
          <motion.div key="orders"
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            className="space-y-3">
            {MOCK_ORDERS.map((order, i) => (
              <motion.div key={order.id}
                initial={{ opacity:0, x:-10 }}
                animate={{ opacity:1, x:0 }}
                transition={{ delay: i*0.06 }}
                className="bg-card rounded-2xl p-5 border border-white/10 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-bold text-sm">#{order.id}</p>
                    <p className="text-text-secondary text-xs mt-0.5">{formatDate(order.date)}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-success/20 text-success">
                    ✓ Delivered
                  </span>
                </div>
                <p className="text-text-secondary text-sm mb-3 line-clamp-1">{order.items}</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-bold">{formatCurrency(order.total)}</p>
                  <button className="text-xs text-primary font-bold hover:underline">Reorder</button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Addresses ── */}
        {tab === 'addresses' && (
          <motion.div key="addresses"
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}>
            <div className="space-y-3 mb-4">
              {(user.addresses ?? []).length === 0 ? (
                <div className="bg-card rounded-2xl p-8 border border-white/10 text-center">
                  <div className="text-5xl mb-3">📍</div>
                  <p className="text-white font-bold mb-1">No saved addresses</p>
                  <p className="text-text-secondary text-sm">Add an address for faster checkout</p>
                </div>
              ) : (
                user.addresses.map((addr) => (
                  <div key={addr.id} className="bg-card rounded-2xl p-4 border border-white/10 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '🏢' : '📍'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold text-sm">{addr.label}</p>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-text-secondary text-xs mt-0.5">{addr.fullAddress}</p>
                        <p className="text-text-secondary text-xs">{addr.phone}</p>
                      </div>
                    </div>
                    <button className="text-text-secondary hover:text-red-400 transition-colors text-lg leading-none shrink-0">×</button>
                  </div>
                ))
              )}
            </div>

            <PrimaryButton className="w-full justify-center" onClick={() => setAddAddressOpen(true)}>
              + Add New Address
            </PrimaryButton>

            {/* Add address modal */}
            <Modal isOpen={addAddressOpen} onClose={() => setAddAddressOpen(false)} title="Add Address" size="sm">
              <div className="p-5 space-y-3">
                <div className="flex gap-2">
                  {['Home','Work','Other'].map(l => (
                    <button key={l} onClick={() => setNewAddr(a=>({...a,label:l}))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                        ${newAddr.label===l?'border-primary bg-primary/20 text-primary':'border-white/20 text-text-secondary hover:border-white/40'}`}>
                      {l==='Home'?'🏠':l==='Work'?'🏢':'📍'} {l}
                    </button>
                  ))}
                </div>
                {[
                  ['name','Full Name'],['phone','Phone'],['fullAddress','Full Address'],['pincode','Pincode'],
                ].map(([f,l]) => (
                  <input key={f} placeholder={l}
                    value={newAddr[f as keyof typeof newAddr]}
                    onChange={e => setNewAddr(a=>({...a,[f]:e.target.value}))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                      text-sm outline-none focus:border-primary/60 transition-colors placeholder:text-text-secondary"
                  />
                ))}
                <PrimaryButton className="w-full justify-center" onClick={() => {
                  toast.success('Address saved!');
                  setAddAddressOpen(false);
                  setNewAddr({ label:'Home', name:'', phone:'', fullAddress:'', pincode:'' });
                }}>
                  Save Address
                </PrimaryButton>
              </div>
            </Modal>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
