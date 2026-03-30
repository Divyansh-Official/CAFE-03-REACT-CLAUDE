import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, PrimaryButton, SecondaryButton, Badge, Spinner } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { adminService } from '../../services/allServices';
import type { Offer } from '../../types/offer.types';
import toast from 'react-hot-toast';
import icons from '../../data/icons.json';
import { CategoryPieChart, DailyOrdersChart, PeakHoursHeatmap, SalesChart } from './SalesChart';

// ══════════════════════════════════════════════════════════════
// ADMIN OFFERS PAGE
// ══════════════════════════════════════════════════════════════
const MOCK_OFFERS: Offer[] = [
  { id:'o1', name:'Welcome Bobba',    type:'percentage', value:10, description:'10% off on first order', bannerColor:'#FF3B30', applicableItemIds:[], applicableCategoryIds:['c1','c2'], isActive:true,  startDate:'2024-03-01', endDate:'2024-04-30', usageCount:234, createdAt:'2024-03-01' },
  { id:'o2', name:'Weekend Bingsu',   type:'flat',       value:50, description:'₹50 off on Bingsu orders', bannerColor:'#FF9500', applicableItemIds:[], applicableCategoryIds:['c9','c10'], isActive:true, startDate:'2024-03-25', endDate:'2024-03-31', usageCount:67, createdAt:'2024-03-20' },
  { id:'o3', name:'Momo Mania',       type:'percentage', value:15, description:'15% off all Hungroo momos', bannerColor:'#FFD600', applicableItemIds:[], applicableCategoryIds:['c19'], isActive:false, startDate:'2024-02-01', endDate:'2024-02-28', usageCount:412, createdAt:'2024-02-01' },
];

type OfferForm = { name:string; type:Offer['type']; value:number; description:string; startDate:string; endDate:string };
const EMPTY_OFFER: OfferForm = { name:'', type:'percentage', value:10, description:'', startDate:'', endDate:'' };

export const AdminOffersPage: React.FC = () => {
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [modal, setModal] = useState<Offer | 'new' | null>(null);
  const [form, setForm] = useState<OfferForm>(EMPTY_OFFER);

  const toggleOffer = async (id: string) => {
    setOffers(prev => prev.map(o => o.id===id ? {...o, isActive:!o.isActive} : o));
    toast.success('Offer updated');
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Offer name required');
    if (modal === 'new') {
      setOffers(prev => [...prev, { ...form, id:`o${Date.now()}`, bannerColor:'#FF3B30',
        applicableItemIds:[], applicableCategoryIds:[], isActive:true, usageCount:0, createdAt:new Date().toISOString() }]);
      toast.success('Offer created!');
    } else if (modal) {
      setOffers(prev => prev.map(o => o.id===modal.id ? {...o,...form} : o));
      toast.success('Offer updated!');
    }
    setModal(null);
  };

  const openEdit = (offer: Offer) => {
    setForm({ name:offer.name, type:offer.type, value:offer.value, description:offer.description,
      startDate:offer.startDate, endDate:offer.endDate });
    setModal(offer);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Offers</h1>
          <p className="text-text-secondary text-sm mt-0.5">{offers.filter(o=>o.isActive).length} active offers</p>
        </div>
        <PrimaryButton onClick={() => { setForm(EMPTY_OFFER); setModal('new'); }}>+ Create Offer</PrimaryButton>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer, i) => (
          <motion.div key={offer.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
            className={`bg-card rounded-2xl border overflow-hidden transition-colors
              ${offer.isActive?'border-primary/20':'border-white/10'}`}
          >
            {/* Color stripe */}
            <div className="h-1.5 w-full" style={{ background: offer.isActive ? 'linear-gradient(135deg,#FF3B30,#FF9500,#FFD600)' : 'rgba(255,255,255,0.1)' }} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-bold">{offer.name}</p>
                  <p className="text-text-secondary text-xs mt-0.5">{offer.description}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full border shrink-0 ml-2
                  ${offer.isActive?'text-success bg-success/20 border-success/30':'text-text-secondary bg-white/10 border-white/10'}`}>
                  {offer.isActive?'Active':'Inactive'}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="font-display text-3xl font-bold bg-bubble-gradient bg-clip-text text-transparent">
                  {offer.type==='percentage'?`${offer.value}%`:`₹${offer.value}`}
                </span>
                <span className="text-text-secondary text-sm">off</span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary mb-4">
                <span>Used {offer.usageCount}×</span>
                <span>{formatDate(offer.startDate)} – {formatDate(offer.endDate)}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleOffer(offer.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                    ${offer.isActive?'border-red-400/30 text-red-400 hover:bg-red-400/10':'border-success/30 text-success hover:bg-success/10'}`}>
                  {offer.isActive?'Deactivate':'Activate'}
                </button>
                <button onClick={() => openEdit(offer)}
                  className="px-3 py-2 rounded-xl border border-white/20 text-text-secondary hover:text-white hover:bg-white/10 transition-colors">
                  <img src={icons.edit.url} alt="" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal==='new'?'Create Offer':'Edit Offer'} size="md">
        <div className="p-5 space-y-4">
          <input type="text" placeholder="Offer name *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary" />
          <input type="text" placeholder="Description" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Discount Type</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value as Offer['type']}))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none">
                <option value="percentage">Percentage %</option>
                <option value="flat">Flat ₹</option>
                <option value="bogo">BOGO</option>
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Value</label>
              <input type="number" value={form.value} onChange={e=>setForm(f=>({...f,value:Number(e.target.value)}))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary/60" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Start Date</label>
              <input type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none" />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1 block">End Date</label>
              <input type="date" value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none" />
            </div>
          </div>
          <PrimaryButton className="w-full justify-center" onClick={handleSave}>
            {modal==='new'?'Create Offer':'Save Changes'}
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// ADMIN USERS PAGE
// ══════════════════════════════════════════════════════════════
const MOCK_USERS = [
  { id:'u1', name:'Priya Sharma',  phone:'98765 43210', totalOrders:14, totalSpent:8420,  memberSince:'2024-01-15', lastOrder:'2024-03-28' },
  { id:'u2', name:'Arjun Singh',   phone:'87654 32109', totalOrders:8,  totalSpent:3840,  memberSince:'2024-02-01', lastOrder:'2024-03-25' },
  { id:'u3', name:'Mehak Kapoor',  phone:'76543 21098', totalOrders:22, totalSpent:14380, memberSince:'2023-12-10', lastOrder:'2024-03-29' },
  { id:'u4', name:'Rohit Verma',   phone:'65432 10987', totalOrders:5,  totalSpent:2250,  memberSince:'2024-03-01', lastOrder:'2024-03-20' },
  { id:'u5', name:'Simran Kaur',   phone:'54321 09876', totalOrders:31, totalSpent:21500, memberSince:'2023-11-05', lastOrder:'2024-03-30' },
];

export const AdminUsersPage: React.FC = () => {
  const [msgModal, setMsgModal] = useState<typeof MOCK_USERS[0] | 'all' | null>(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const filtered = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  const handleSendWA = () => {
    toast.success(msgModal === 'all'
      ? `WhatsApp broadcast sent to ${MOCK_USERS.length} users!`
      : `WhatsApp sent to ${(msgModal as typeof MOCK_USERS[0]).name}`
    );
    setMsgModal(null);
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Users</h1>
          <p className="text-text-secondary text-sm mt-0.5">{MOCK_USERS.length} registered users</p>
        </div>
        <button onClick={() => { setMessage(''); setMsgModal('all'); }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 border border-success/30 text-success text-sm font-bold hover:bg-success/30 transition-colors">
          <img src={icons.whatsapp.url} alt="" className="w-4 h-4" />
          Broadcast to All
        </button>
      </div>

      <div className="relative">
        <img src={icons.search.url} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users…"
          className="w-full bg-card border border-white/20 rounded-full py-2.5 pl-11 pr-5 text-white text-sm
            outline-none focus:border-primary/60 placeholder:text-text-secondary" />
      </div>

      <div className="bg-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead>
              <tr className="border-b border-white/10">
                {['User','Phone','Orders','Spent','Member Since','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-text-secondary font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <motion.tr key={user.id}
                  initial={{ opacity:0 }}
                  animate={{ opacity:1 }}
                  transition={{ delay:i*0.04 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-bubble-gradient flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-white font-semibold">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-text-secondary">{user.phone}</td>
                  <td className="px-5 py-3 text-white font-bold">{user.totalOrders}</td>
                  <td className="px-5 py-3 text-success font-bold">{formatCurrency(user.totalSpent)}</td>
                  <td className="px-5 py-3 text-text-secondary">{formatDate(user.memberSince)}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => { setMessage(''); setMsgModal(user); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/20 border border-success/30
                        text-success text-xs font-bold hover:bg-success/30 transition-colors">
                      <img src={icons.whatsapp.url} alt="" className="w-3 h-3" />
                      WhatsApp
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!msgModal} onClose={() => setMsgModal(null)}
        title={msgModal==='all'?'📢 Broadcast to All Users':`💬 WhatsApp ${(msgModal as typeof MOCK_USERS[0])?.name}`}
        size="md">
        <div className="p-5 space-y-4">
          <p className="text-text-secondary text-sm">
            {msgModal==='all'
              ? `This message will be sent to all ${MOCK_USERS.length} users via WhatsApp`
              : `Send a personal WhatsApp message`}
          </p>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message here… Use {name} to personalize"
            rows={4}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm
              outline-none focus:border-primary/60 resize-none placeholder:text-text-secondary"
          />
          <div className="flex gap-2 flex-wrap">
            {['🎉 New Offer Alert!','🧋 Come visit us!','📦 Your order is ready!'].map(t => (
              <button key={t} onClick={() => setMessage(t)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-text-secondary hover:text-white hover:bg-white/20 transition-colors border border-white/10">
                {t}
              </button>
            ))}
          </div>
          <button onClick={handleSendWA}
            className="w-full py-3 rounded-full bg-success text-white font-bold flex items-center justify-center gap-2 hover:bg-success/90 transition-colors">
            <img src={icons.whatsapp.url} alt="" className="w-5 h-5" />
            Send WhatsApp
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// ADMIN DELIVERY PAGE
// ══════════════════════════════════════════════════════════════
export const AdminDeliveryPage: React.FC = () => {
  const [settings, setSettings] = useState({
    radiusKm: 5,
    isKitchenBusy: false,
    extraBusyMinutes: 15,
    feeTiers: [
      { upToKm:2, fee:20 },
      { upToKm:4, fee:35 },
      { upToKm:6, fee:50 },
    ],
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    toast.success('Delivery settings saved!');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Delivery Settings</h1>
        <p className="text-text-secondary text-sm mt-0.5">Manage delivery zones, fees, and kitchen status</p>
      </div>

      {/* Kitchen busy toggle */}
      <div className={`rounded-2xl p-5 border transition-all ${settings.isKitchenBusy?'bg-warning/10 border-warning/30':'bg-card border-white/10'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-bold ${settings.isKitchenBusy?'text-warning':'text-white'}`}>
              {settings.isKitchenBusy ? '🔥 Kitchen is Busy!' : '✅ Kitchen is Available'}
            </p>
            <p className="text-text-secondary text-sm mt-0.5">
              {settings.isKitchenBusy
                ? `Adds ${settings.extraBusyMinutes} min to all ETAs automatically`
                : 'Normal delivery times in effect'}
            </p>
          </div>
          <button
            onClick={() => setSettings(s=>({...s, isKitchenBusy:!s.isKitchenBusy}))}
            className={`w-14 h-7 rounded-full relative transition-colors ${settings.isKitchenBusy?'bg-warning':'bg-white/20'}`}
          >
            <motion.div
              className="w-6 h-6 bg-white rounded-full absolute top-0.5 shadow"
              animate={{ left: settings.isKitchenBusy ? '30px' : '2px' }}
              transition={{ type:'spring', stiffness:400, damping:25 }}
            />
          </button>
        </div>
        {settings.isKitchenBusy && (
          <div className="mt-4 flex items-center gap-3">
            <label className="text-text-secondary text-sm">Extra minutes to add:</label>
            <input type="number" value={settings.extraBusyMinutes}
              onChange={e => setSettings(s=>({...s,extraBusyMinutes:parseInt(e.target.value)||0}))}
              className="w-20 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white text-sm outline-none"
            />
          </div>
        )}
      </div>

      {/* Delivery radius */}
      <div className="bg-card rounded-2xl p-5 border border-white/10">
        <h3 className="font-bold text-white mb-4">Delivery Radius</h3>
        <div className="flex items-center gap-4">
          <input type="range" min="1" max="15" step="0.5" value={settings.radiusKm}
            onChange={e => setSettings(s=>({...s,radiusKm:parseFloat(e.target.value)}))}
            className="flex-1 accent-primary"
          />
          <span className="font-bold text-white w-16 text-right">{settings.radiusKm} km</span>
        </div>
        <p className="text-text-secondary text-xs mt-2">Maximum delivery distance from cafe</p>
      </div>

      {/* Fee tiers */}
      <div className="bg-card rounded-2xl p-5 border border-white/10">
        <h3 className="font-bold text-white mb-4">Delivery Fee Tiers</h3>
        <div className="space-y-3">
          {settings.feeTiers.map((tier, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-text-secondary text-sm w-16 shrink-0">Up to</span>
              <input type="number" value={tier.upToKm}
                onChange={e => setSettings(s=>({...s, feeTiers:s.feeTiers.map((t,j)=>j===i?{...t,upToKm:Number(e.target.value)}:t)}))}
                className="w-20 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none text-center"
              />
              <span className="text-text-secondary text-sm">km →</span>
              <span className="text-text-secondary text-sm">₹</span>
              <input type="number" value={tier.fee}
                onChange={e => setSettings(s=>({...s, feeTiers:s.feeTiers.map((t,j)=>j===i?{...t,fee:Number(e.target.value)}:t)}))}
                className="w-20 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none text-center"
              />
            </div>
          ))}
        </div>
      </div>

      <PrimaryButton className="w-full justify-center" size="lg" onClick={save}>
        {saved ? '✓ Saved!' : 'Save Settings'}
      </PrimaryButton>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// ADMIN STAFF PAGE
// ══════════════════════════════════════════════════════════════
const MOCK_STAFF = [
  { id:'s1', name:'Rajan Kumar',   staffId:'STAFF001', role:'staff',      isActive:true,  lastLogin:'2024-03-30T09:15:00Z' },
  { id:'s2', name:'Anita Singh',   staffId:'STAFF002', role:'staff',      isActive:true,  lastLogin:'2024-03-29T18:30:00Z' },
  { id:'s3', name:'Vikram Sharma', staffId:'ADMIN001', role:'main_admin', isActive:true,  lastLogin:'2024-03-30T11:00:00Z' },
];

export const AdminStaffPage: React.FC = () => {
  const [staff, setStaff] = useState(MOCK_STAFF);
  const [addModal, setAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name:'', staffId:'', password:'', role:'staff' });

  const handleAdd = () => {
    if (!newStaff.name || !newStaff.staffId || !newStaff.password) return toast.error('All fields required');
    setStaff(prev => [...prev, { id:`s${Date.now()}`, ...newStaff, isActive:true, lastLogin:'' }]);
    toast.success(`Staff ${newStaff.name} added`);
    setAddModal(false);
    setNewStaff({ name:'', staffId:'', password:'', role:'staff' });
  };

  const toggleActive = (id: string) => {
    setStaff(prev => prev.map(s => s.id===id ? {...s, isActive:!s.isActive} : s));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Staff Management</h1>
          <p className="text-text-secondary text-sm mt-0.5">{staff.filter(s=>s.isActive).length} active members</p>
        </div>
        <PrimaryButton onClick={() => setAddModal(true)}>+ Add Staff</PrimaryButton>
      </div>

      <div className="space-y-3">
        {staff.map((member, i) => (
          <motion.div key={member.id}
            initial={{ opacity:0, y:8 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:i*0.06 }}
            className={`bg-card rounded-2xl p-5 border flex items-center gap-4 flex-wrap
              ${member.isActive?'border-white/10':'border-white/5 opacity-60'}`}
          >
            <div className="w-12 h-12 rounded-full bg-bubble-gradient flex items-center justify-center font-bold text-white text-lg shrink-0">
              {member.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-bold">{member.name}</p>
                {member.role === 'main_admin' && <span className="text-xs text-secondary font-bold">👑 Admin</span>}
              </div>
              <p className="text-text-secondary text-xs">ID: {member.staffId}</p>
              {member.lastLogin && (
                <p className="text-text-secondary text-xs">
                  Last login: {new Date(member.lastLogin).toLocaleString('en-IN')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-bold px-2 py-1 rounded-full border
                ${member.isActive?'text-success bg-success/20 border-success/30':'text-text-secondary bg-white/10 border-white/10'}`}>
                {member.isActive?'Active':'Inactive'}
              </span>
              {member.role !== 'main_admin' && (
                <button onClick={() => toggleActive(member.id)}
                  className="px-3 py-1.5 rounded-full border border-white/20 text-text-secondary text-xs font-bold hover:border-white/40 hover:text-white transition-colors">
                  {member.isActive?'Deactivate':'Activate'}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Staff Member" size="sm">
        <div className="p-5 space-y-4">
          {[['name','Full Name'],['staffId','Staff ID'],['password','Password']].map(([f,l]) => (
            <input key={f} type={f==='password'?'password':'text'} placeholder={l}
              value={newStaff[f as keyof typeof newStaff]}
              onChange={e => setNewStaff(s=>({...s,[f]:e.target.value}))}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm
                outline-none focus:border-primary/60 placeholder:text-text-secondary"
            />
          ))}
          <div className="flex gap-2">
            {['staff','main_admin'].map(r => (
              <button key={r} onClick={() => setNewStaff(s=>({...s,role:r}))}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                  ${newStaff.role===r?'border-primary bg-primary/20 text-primary':'border-white/20 text-text-secondary hover:border-white/40'}`}>
                {r==='staff'?'🧑 Staff':'👑 Main Admin'}
              </button>
            ))}
          </div>
          <PrimaryButton className="w-full justify-center" onClick={handleAdd}>Add Staff Member</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// ADMIN ANALYTICS PAGE
// ══════════════════════════════════════════════════════════════
export const AdminAnalyticsPage: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [fromDate, setFromDate] = useState('2024-03-01');
  const [toDate, setToDate]     = useState('2024-03-31');

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await adminService.downloadReport(fromDate, toDate, 'csv');
      toast.success('Report downloaded!');
    } catch {
      toast.success('Report ready! (Connect backend to download)');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Analytics</h1>
          <p className="text-text-secondary text-sm mt-0.5">Business insights and performance data</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}
            className="bg-card border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none" />
          <span className="text-text-secondary">to</span>
          <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)}
            className="bg-card border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none" />
          <button onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20
              text-white text-sm font-bold hover:bg-white/20 transition-colors"
          >
            {downloading ? <Spinner size="sm" /> : <img src={icons.download.url} alt="" className="w-4 h-4" />}
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Revenue', value:'₹3,84,200', icon:'💰', delta:'+23%' },
          { label:'Total Orders',  value:'1,247',     icon:'📦', delta:'+18%' },
          { label:'Avg Order Value',value:'₹308',     icon:'📊', delta:'+4%'  },
          { label:'Return Rate',   value:'68%',        icon:'❤️', delta:'+12%' },
        ].map(({ label, value, icon, delta }) => (
          <div key={label} className="bg-card rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-bold text-success">{delta}</span>
            </div>
            <p className="font-display text-xl font-bold text-white">{value}</p>
            <p className="text-text-secondary text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <SalesChart />
      <div className="grid md:grid-cols-2 gap-6">
        <CategoryPieChart />
        <DailyOrdersChart />
      </div>
      <PeakHoursHeatmap />
    </div>
  );
};