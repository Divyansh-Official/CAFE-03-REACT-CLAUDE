import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, PrimaryButton, Badge } from '../../components/ui';
import { TintedIcon } from '../../components/ui/TintedIcon';
import { formatDate } from '../../utils/helpers';
import { adminService } from '../../services/allServices';
import { Offer } from '../../types/offer.types';
import toast from 'react-hot-toast';
import icons from '../../data/icons.json';

// ══════════════════════════════════════════════════════════════
// ADMIN OFFERS PAGE
// ══════════════════════════════════════════════════════════════
const MOCK_OFFERS: Offer[] = [
  {
    id:'o1', name:'Welcome Bobba', type:'percentage', value:10,
    description:'10% off on first order',
    bannerImage:'', bannerColor:'#FF3B30',
    applicableItemIds:[], applicableCategoryIds:['c1','c2'],
    isActive:true,  startDate:'2024-03-01', endDate:'2024-04-30',
    usageCount:234, createdAt:'2024-03-01',
  },
  {
    id:'o2', name:'Weekend Bingsu', type:'flat', value:50,
    description:'₹50 off on Bingsu orders',
    bannerImage:'', bannerColor:'#FF9500',
    applicableItemIds:[], applicableCategoryIds:['c9','c10'],
    isActive:true, startDate:'2024-03-25', endDate:'2024-03-31',
    usageCount:67, createdAt:'2024-03-20',
  },
  {
    id:'o3', name:'Momo Mania', type:'percentage', value:15,
    description:'15% off all Hungroo momos',
    bannerImage:'', bannerColor:'#FFD600',
    applicableItemIds:[], applicableCategoryIds:['c19'],
    isActive:false, startDate:'2024-02-01', endDate:'2024-02-28',
    usageCount:412, createdAt:'2024-02-01',
  },
];

type OfferForm = {
  name:string; type:Offer['type']; value:number; description:string;
  startDate:string; endDate:string; bannerImage:string; bannerColor:string;
};
const EMPTY_OFFER: OfferForm = {
  name:'', type:'percentage', value:10, description:'',
  startDate:'', endDate:'', bannerImage:'', bannerColor:'#FF3B30',
};

export const AdminOffersPage: React.FC = () => {
  const [offers,   setOffers]   = useState(MOCK_OFFERS);
  const [modal,    setModal]    = useState<Offer | 'new' | null>(null);
  const [form,     setForm]     = useState<OfferForm>(EMPTY_OFFER);
  const [delId,    setDelId]    = useState<string | null>(null);
  const [imgPreview, setImgPreview] = useState('');

  const openNew = () => {
    setForm(EMPTY_OFFER);
    setImgPreview('');
    setModal('new');
  };

  const openEdit = (offer: Offer) => {
    setForm({
      name:offer.name, type:offer.type, value:offer.value, description:offer.description,
      startDate:offer.startDate, endDate:offer.endDate,
      bannerImage:offer.bannerImage ?? '', bannerColor:offer.bannerColor ?? '#FF3B30',
    });
    setImgPreview(offer.bannerImage ?? '');
    setModal(offer);
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Offer name required');
    if (modal === 'new') {
      setOffers(prev => [...prev, {
        ...form, id:`o${Date.now()}`,
        applicableItemIds:[], applicableCategoryIds:[],
        isActive:true, usageCount:0, createdAt:new Date().toISOString(),
      }]);
      toast.success('Offer created!');
    } else if (modal) {
      setOffers(prev => prev.map(o => o.id===(modal as Offer).id ? {...o,...form} : o));
      toast.success('Offer updated!');
    }
    setModal(null);
  };

  const toggleActive = (id: string) => {
    setOffers(prev => prev.map(o => o.id===id ? {...o,isActive:!o.isActive} : o));
    toast.success('Offer toggled');
  };

  const deleteOffer = () => {
    setOffers(prev => prev.filter(o => o.id !== delId));
    toast.success('Offer deleted');
    setDelId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Offers</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {offers.filter(o=>o.isActive).length} active
          </p>
        </div>
        <PrimaryButton onClick={openNew}>+ Create Offer</PrimaryButton>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {offers.map((offer, i) => (
          <motion.div key={offer.id}
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
            className={`bg-card rounded-2xl border overflow-hidden transition-colors
              ${offer.isActive ? 'border-primary/20' : 'border-white/10'}`}
          >
            {/* Banner image if set, else colour stripe */}
            {offer.bannerImage ? (
              <div className="h-28 relative overflow-hidden">
                <img src={offer.bannerImage} alt={offer.name}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-2 left-3 right-3">
                  <p className="text-white font-display font-bold text-lg leading-tight drop-shadow">
                    {offer.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-2 w-full"
                style={{ background: offer.isActive
                  ? 'linear-gradient(135deg,#FF3B30,#FF9500,#FFD600)'
                  : 'rgba(255,255,255,0.1)' }}
              />
            )}

            <div className="p-5">
              {!offer.bannerImage && (
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-bold">{offer.name}</p>
                    <p className="text-text-secondary text-xs mt-0.5">{offer.description}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border shrink-0 ml-2
                    ${offer.isActive
                      ? 'text-success bg-success/20 border-success/30'
                      : 'text-text-secondary bg-white/10 border-white/10'}`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-display text-3xl font-bold bg-bubble-gradient bg-clip-text text-transparent">
                  {offer.type==='percentage' ? `${offer.value}%` : `₹${offer.value}`}
                </span>
                <span className="text-text-secondary text-sm">off</span>
              </div>

              <p className="text-text-secondary text-xs mb-4">
                Used {offer.usageCount}× · {formatDate(offer.startDate)} – {formatDate(offer.endDate)}
              </p>

              <div className="flex gap-2">
                <button onClick={() => toggleActive(offer.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                    ${offer.isActive
                      ? 'border-red-400/30 text-red-400 hover:bg-red-400/10'
                      : 'border-success/30 text-success hover:bg-success/10'}`}>
                  {offer.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => openEdit(offer)}
                  className="p-2 rounded-xl border border-white/20 hover:bg-white/10 transition-colors">
                  <TintedIcon src={icons.edit.url} alt="edit" section="adminOffers" tintKey="icon" size={14} />
                </button>
                {/* Delete button */}
                <button onClick={() => setDelId(offer.id)}
                  className="p-2 rounded-xl border border-red-400/20 hover:bg-red-400/10 transition-colors">
                  <TintedIcon src={icons.delete.url} alt="delete" section="adminOffers" tintKey="delete" size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={!!modal} onClose={() => setModal(null)}
        title={modal === 'new' ? 'Create Offer' : `Edit: ${(modal as Offer)?.name}`} size="md">
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Left */}
            <div className="space-y-3">
              <div>
                <label className="text-text-secondary text-xs font-semibold block mb-1">Offer Name *</label>
                <input type="text" placeholder="e.g. Weekend Bingsu"
                  value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                    text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary" />
              </div>
              <div>
                <label className="text-text-secondary text-xs font-semibold block mb-1">Description</label>
                <input type="text" placeholder="Short description"
                  value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                    text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-text-secondary text-xs font-semibold block mb-1">Type</label>
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value as Offer['type']}))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none">
                    <option value="percentage">% Off</option>
                    <option value="flat">₹ Flat Off</option>
                    <option value="bogo">BOGO</option>
                  </select>
                </div>
                <div>
                  <label className="text-text-secondary text-xs font-semibold block mb-1">Value</label>
                  <input type="number" value={form.value}
                    onChange={e=>setForm(f=>({...f,value:Number(e.target.value)}))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-text-secondary text-xs font-semibold block mb-1">Start Date</label>
                  <input type="date" value={form.startDate}
                    onChange={e=>setForm(f=>({...f,startDate:e.target.value}))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none" />
                </div>
                <div>
                  <label className="text-text-secondary text-xs font-semibold block mb-1">End Date</label>
                  <input type="date" value={form.endDate}
                    onChange={e=>setForm(f=>({...f,endDate:e.target.value}))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none" />
                </div>
              </div>
            </div>

            {/* Right — banner image */}
            <div className="space-y-3">
              <div>
                <label className="text-text-secondary text-xs font-semibold block mb-1">
                  Banner Image URL
                  <span className="text-text-secondary font-normal ml-1">(shown on homepage offer strip)</span>
                </label>
                <input type="url" placeholder="https://…"
                  value={form.bannerImage}
                  onChange={e => {
                    setForm(f=>({...f,bannerImage:e.target.value}));
                    setImgPreview(e.target.value);
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white
                    text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary"
                />
              </div>

              {/* Banner preview */}
              <div className="w-full h-28 rounded-xl overflow-hidden border border-white/20 bg-white/5
                flex items-center justify-center relative">
                {imgPreview ? (
                  <>
                    <img src={imgPreview} alt="banner preview"
                      className="w-full h-full object-cover"
                      onError={() => setImgPreview('')}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                      <p className="text-white text-xs font-bold">{form.name || 'Offer Name'}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-text-secondary text-xs text-center px-4">
                    Banner preview will appear here
                  </p>
                )}
              </div>

              {/* Fallback banner colour */}
              <div>
                <label className="text-text-secondary text-xs font-semibold block mb-1">
                  Fallback Colour <span className="font-normal">(used if no image)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.bannerColor}
                    onChange={e=>setForm(f=>({...f,bannerColor:e.target.value}))}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                  />
                  <span className="text-text-secondary text-sm font-mono">{form.bannerColor}</span>
                </div>
              </div>
            </div>
          </div>

          <PrimaryButton className="w-full justify-center" onClick={handleSave}>
            {modal === 'new' ? 'Create Offer' : 'Save Changes'}
          </PrimaryButton>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!delId} onClose={() => setDelId(null)} title="⚠️ Delete Offer" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-text-secondary text-sm">
            Delete "{offers.find(o=>o.id===delId)?.name}"? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDelId(null)}
              className="flex-1 py-2.5 rounded-full border border-white/20 text-text-secondary
                text-sm font-bold hover:border-white/40 hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={deleteOffer}
              className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm font-bold
                hover:bg-red-600 transition-colors">
              Delete Offer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// ADMIN STAFF PAGE — with delete
// ══════════════════════════════════════════════════════════════
const MOCK_STAFF = [
  { id:'s1', name:'Rajan Kumar',   staffId:'STAFF001', role:'staff',      isActive:true,  lastLogin:'2024-03-30T09:15:00Z' },
  { id:'s2', name:'Anita Singh',   staffId:'STAFF002', role:'staff',      isActive:true,  lastLogin:'2024-03-29T18:30:00Z' },
  { id:'s3', name:'Vikram Sharma', staffId:'ADMIN001', role:'main_admin', isActive:true,  lastLogin:'2024-03-30T11:00:00Z' },
];

export const AdminStaffPage: React.FC = () => {
  const [staff,     setStaff]     = useState(MOCK_STAFF);
  const [addModal,  setAddModal]  = useState(false);
  const [delId,     setDelId]     = useState<string | null>(null);
  const [newStaff,  setNewStaff]  = useState({ name:'', staffId:'', password:'', role:'staff' });

  const handleAdd = () => {
    if (!newStaff.name || !newStaff.staffId || !newStaff.password)
      return toast.error('All fields required');
    setStaff(prev => [...prev, { id:`s${Date.now()}`, ...newStaff, isActive:true, lastLogin:'' }]);
    toast.success(`${newStaff.name} added as staff`);
    setAddModal(false);
    setNewStaff({ name:'', staffId:'', password:'', role:'staff' });
  };

  const toggleActive = (id: string) =>
    setStaff(prev => prev.map(s => s.id===id ? {...s,isActive:!s.isActive} : s));

  const confirmDelete = () => {
    const member = staff.find(s => s.id === delId);
    setStaff(prev => prev.filter(s => s.id !== delId));
    toast.success(`${member?.name} removed`);
    setDelId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Staff</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {staff.filter(s=>s.isActive).length} active members
          </p>
        </div>
        <PrimaryButton onClick={() => setAddModal(true)}>+ Add Staff</PrimaryButton>
      </div>

      <div className="space-y-3">
        {staff.map((member, i) => (
          <motion.div key={member.id}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
            className={`bg-card rounded-2xl p-5 border flex items-center gap-4 flex-wrap transition-opacity
              ${member.isActive ? 'border-white/10' : 'border-white/5 opacity-60'}`}
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-bubble-gradient flex items-center
              justify-center font-bold text-white text-lg shrink-0">
              {member.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-bold">{member.name}</p>
                {member.role === 'main_admin' && (
                  <span className="text-xs text-secondary font-bold">👑 Admin</span>
                )}
              </div>
              <p className="text-text-secondary text-xs">ID: {member.staffId}</p>
              {member.lastLogin && (
                <p className="text-text-secondary text-xs">
                  Last login: {new Date(member.lastLogin).toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <span className={`text-xs font-bold px-2 py-1 rounded-full border
                ${member.isActive
                  ? 'text-success bg-success/20 border-success/30'
                  : 'text-text-secondary bg-white/10 border-white/10'}`}>
                {member.isActive ? 'Active' : 'Inactive'}
              </span>

              {/* Toggle active */}
              <button onClick={() => toggleActive(member.id)}
                className="px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold
                  text-text-secondary hover:border-white/40 hover:text-white transition-colors">
                {member.isActive ? 'Deactivate' : 'Activate'}
              </button>

              {/* Delete — available for ALL staff including admin */}
              <button
                onClick={() => setDelId(member.id)}
                className="p-2 rounded-full border border-red-400/20 hover:bg-red-400/10 transition-colors"
                title="Delete staff member"
              >
                <TintedIcon src={icons.delete.url} alt="delete" section="adminStaff" tintKey="delete" size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add staff modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Staff Member" size="sm">
        <div className="p-5 space-y-4">
          {[['name','Full Name','text'],['staffId','Staff ID','text'],['password','Password','password']].map(([f,l,t]) => (
            <input key={f} type={t} placeholder={l}
              value={newStaff[f as keyof typeof newStaff]}
              onChange={e => setNewStaff(s=>({...s,[f]:e.target.value}))}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary"
            />
          ))}
          <div className="flex gap-2">
            {[['staff','🧑 Staff'],['main_admin','👑 Admin']].map(([r,l]) => (
              <button key={r} onClick={() => setNewStaff(s=>({...s,role:r}))}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                  ${newStaff.role===r
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-white/20 text-text-secondary hover:border-white/40'}`}>
                {l}
              </button>
            ))}
          </div>
          <PrimaryButton className="w-full justify-center" onClick={handleAdd}>
            Add Staff Member
          </PrimaryButton>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!delId} onClose={() => setDelId(null)} title="⚠️ Remove Staff" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-text-secondary text-sm">
            Remove "{staff.find(s=>s.id===delId)?.name}" from staff? They will lose all access immediately.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDelId(null)}
              className="flex-1 py-2.5 rounded-full border border-white/20 text-text-secondary
                text-sm font-bold hover:border-white/40 hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={confirmDelete}
              className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm font-bold
                hover:bg-red-600 transition-colors">
              Remove
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
