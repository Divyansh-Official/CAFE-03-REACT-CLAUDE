import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, PrimaryButton, Badge } from '../../components/ui';
import { TintedIcon } from '../../components/ui/TintedIcon';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import icons from '../../data/icons.json';

// ── Types ──────────────────────────────────────────────────────
type ServingType = 'full_only' | 'half_full';

interface ServingPrice {
  type: ServingType;
  fullPrice:  number;
  halfPrice?: number;   // only when type === 'half_full'
}

interface ItemEntry {
  id:           string;
  name:         string;
  imageUrl:     string;   // pasted by admin — fetched via Firebase or direct URL
  serving:      ServingPrice;
  isVeg:        boolean;
  isAvailable:  boolean;
  isBestSeller: boolean;
  description:  string;
}

interface CategoryEntry {
  id:       string;
  name:     string;
  slug:     string;
  iconUrl:  string;   // pasted icon/image URL — no emoji input
  items:    ItemEntry[];
}

// ── Initial seed data ──────────────────────────────────────────
const INITIAL_CATEGORIES: CategoryEntry[] = [
  {
    id: 'c1', name: 'Bobba Milk Tea', slug: 'bobba-milk-tea',
    iconUrl: '',
    items: [
      { id:'i1', name:'French Vanilla',    imageUrl:'', serving:{ type:'half_full', fullPrice:249, halfPrice:199 }, isVeg:true,  isAvailable:true,  isBestSeller:true,  description:'' },
      { id:'i2', name:'Royal Thai',        imageUrl:'', serving:{ type:'half_full', fullPrice:249, halfPrice:199 }, isVeg:true,  isAvailable:true,  isBestSeller:true,  description:'' },
      { id:'i3', name:'Japanese Matcha',   imageUrl:'', serving:{ type:'half_full', fullPrice:279, halfPrice:229 }, isVeg:true,  isAvailable:true,  isBestSeller:false, description:'' },
      { id:'i4', name:'Strawberry Matcha', imageUrl:'', serving:{ type:'half_full', fullPrice:279, halfPrice:229 }, isVeg:true,  isAvailable:true,  isBestSeller:false, description:'' },
    ],
  },
  {
    id: 'c2', name: 'Momos', slug: 'momos',
    iconUrl: '',
    items: [
      { id:'i5', name:'Steamed',     imageUrl:'', serving:{ type:'full_only', fullPrice:149 }, isVeg:true,  isAvailable:true,  isBestSeller:false, description:'' },
      { id:'i6', name:'Fried',       imageUrl:'', serving:{ type:'full_only', fullPrice:159 }, isVeg:true,  isAvailable:true,  isBestSeller:true,  description:'' },
      { id:'i7', name:'Afghan Momos',imageUrl:'', serving:{ type:'full_only', fullPrice:199 }, isVeg:false, isAvailable:true,  isBestSeller:true,  description:'' },
    ],
  },
];

// ── Empty form templates ───────────────────────────────────────
const EMPTY_ITEM: Omit<ItemEntry,'id'> = {
  name:'', imageUrl:'',
  serving:{ type:'full_only', fullPrice:199 },
  isVeg:true, isAvailable:true, isBestSeller:false, description:'',
};

const EMPTY_CAT = { name:'', iconUrl:'' };

// ══════════════════════════════════════════════════════════════
const AdminMenuPage: React.FC = () => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [expandedCat, setExpandedCat] = useState<string | null>('c1');
  const [search, setSearch] = useState('');

  // Item modal
  const [itemModal, setItemModal] = useState<{ catId:string; item?:ItemEntry } | null>(null);
  const [formItem, setFormItem]   = useState<Omit<ItemEntry,'id'>>(EMPTY_ITEM);
  const [imgPreview, setImgPreview] = useState('');

  // Category modal
  const [catModal, setCatModal] = useState(false);
  const [formCat, setFormCat]   = useState(EMPTY_CAT);
  const [catImgPreview, setCatImgPreview] = useState('');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{type:'cat'|'item'; catId:string; itemId?:string} | null>(null);

  // ── Helpers ─────────────────────────────────────────────────
  const updateCategories = (fn: (prev: CategoryEntry[]) => CategoryEntry[]) =>
    setCategories(fn);

  const openAddItem = (catId: string) => {
    setFormItem(EMPTY_ITEM);
    setImgPreview('');
    setItemModal({ catId });
  };

  const openEditItem = (catId: string, item: ItemEntry) => {
    setFormItem({ ...item });
    setImgPreview(item.imageUrl);
    setItemModal({ catId, item });
  };

  // ── Save item ─────────────────────────────────────────────
  const handleSaveItem = () => {
    if (!formItem.name.trim())         return toast.error('Item name required');
    if (formItem.serving.fullPrice < 1) return toast.error('Full price required');
    if (formItem.serving.type === 'half_full' && !formItem.serving.halfPrice)
      return toast.error('Half price required');

    const { catId, item } = itemModal!;
    updateCategories(prev => prev.map(c => {
      if (c.id !== catId) return c;
      if (item) {
        return { ...c, items: c.items.map(i => i.id === item.id ? { ...i, ...formItem } : i) };
      }
      return { ...c, items: [...c.items, { id:`i${Date.now()}`, ...formItem }] };
    }));
    toast.success(item ? 'Item updated ✓' : 'Item added ✓');
    setItemModal(null);
  };

  // ── Save category ────────────────────────────────────────
  const handleSaveCat = () => {
    if (!formCat.name.trim()) return toast.error('Category name required');
    const slug = formCat.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    updateCategories(prev => [...prev, {
      id: `c${Date.now()}`, name: formCat.name, slug, iconUrl: formCat.iconUrl, items: [],
    }]);
    toast.success('Category added ✓');
    setCatModal(false);
    setFormCat(EMPTY_CAT);
    setCatImgPreview('');
  };

  // ── Delete ───────────────────────────────────────────────
  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const { type, catId, itemId } = deleteConfirm;
    if (type === 'cat') {
      updateCategories(prev => prev.filter(c => c.id !== catId));
      toast.success('Category deleted');
    } else {
      updateCategories(prev => prev.map(c =>
        c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
      ));
      toast.success('Item deleted');
    }
    setDeleteConfirm(null);
  };

  // ── Toggle helpers ────────────────────────────────────────
  const toggleField = (catId:string, itemId:string, field:'isAvailable'|'isBestSeller') =>
    updateCategories(prev => prev.map(c => c.id===catId
      ? { ...c, items: c.items.map(i => i.id===itemId ? {...i,[field]:!i[field]} : i) }
      : c
    ));

  const filtered = search
    ? categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()))
      )
    : categories;

  // ── Serving display helper ────────────────────────────────
  const servingLabel = (s: ServingPrice) =>
    s.type === 'half_full'
      ? `Half ${formatCurrency(s.halfPrice!)} / Full ${formatCurrency(s.fullPrice)}`
      : formatCurrency(s.fullPrice);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Menu Manager</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {categories.length} categories · {categories.reduce((s,c)=>s+c.items.length,0)} items
          </p>
        </div>
        <PrimaryButton onClick={() => { setFormCat(EMPTY_CAT); setCatImgPreview(''); setCatModal(true); }}>
          + Add Category
        </PrimaryButton>
      </div>

      {/* Search */}
      <div className="relative">
        <TintedIcon src={icons.search.url} alt="" section="adminMenu" tintKey="search" size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search categories or items…"
          className="w-full bg-card border border-white/20 rounded-full py-2.5 pl-11 pr-5 text-white
            text-sm outline-none focus:border-primary/60 transition-colors placeholder:text-text-secondary"
        />
      </div>

      {/* Category list */}
      <div className="space-y-4">
        {filtered.map(cat => (
          <div key={cat.id} className="bg-card rounded-2xl border border-white/10 overflow-hidden">

            {/* Category header row */}
            <div className="flex items-center gap-3 p-4">
              {/* Icon or placeholder */}
              <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden flex items-center justify-center shrink-0">
                {cat.iconUrl
                  ? <img src={cat.iconUrl} alt={cat.name} className="w-full h-full object-cover" />
                  : <span className="text-2xl">🍴</span>
                }
              </div>

              {/* Name + count */}
              <button
                onClick={() => setExpandedCat(expandedCat===cat.id ? null : cat.id)}
                className="flex-1 text-left min-w-0"
              >
                <p className="text-white font-bold">{cat.name}</p>
                <p className="text-text-secondary text-xs">
                  {cat.items.length} items · {cat.items.filter(i=>i.isAvailable).length} available
                </p>
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Badge variant={cat.items.some(i=>!i.isAvailable) ? 'warning' : 'success'}>
                  {cat.items.filter(i=>i.isAvailable).length}/{cat.items.length}
                </Badge>
                {/* Delete category */}
                <button
                  onClick={() => setDeleteConfirm({ type:'cat', catId:cat.id })}
                  className="p-2 rounded-lg hover:bg-red-400/10 transition-colors ml-1"
                  title="Delete category"
                >
                  <TintedIcon src={icons.delete.url} alt="delete" section="adminMenu" tintKey="delete" size={16} />
                </button>
                <span className="text-text-secondary ml-1">{expandedCat===cat.id?'▲':'▼'}</span>
              </div>
            </div>

            {/* Items */}
            <AnimatePresence>
              {expandedCat === cat.id && (
                <motion.div
                  initial={{ height:0, opacity:0 }}
                  animate={{ height:'auto', opacity:1 }}
                  exit={{ height:0, opacity:0 }}
                  className="overflow-hidden border-t border-white/10"
                >
                  <div className="p-4 space-y-2">
                    {cat.items.map(item => (
                      <div key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                          ${item.isAvailable ? 'border-white/10 bg-white/5' : 'border-white/5 opacity-55'}`}
                      >
                        {/* Item image */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 shrink-0">
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-lg">🍴</div>
                          }
                        </div>

                        {/* Veg icon */}
                        <img
                          src={item.isVeg ? icons.veg.url : icons.nonveg.url}
                          alt="" className="w-4 h-4 shrink-0"
                        />

                        {/* Name + price */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                            {item.isBestSeller && (
                              <span className="text-[10px] text-secondary font-bold shrink-0">🔥 Best</span>
                            )}
                          </div>
                          <p className="text-text-secondary text-xs mt-0.5">{servingLabel(item.serving)}</p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Available toggle */}
                          <button
                            onClick={() => toggleField(cat.id, item.id, 'isAvailable')}
                            className={`w-9 h-5 rounded-full relative transition-colors ${item.isAvailable?'bg-success':'bg-white/20'}`}
                            title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                          >
                            <motion.div
                              className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow"
                              animate={{ left: item.isAvailable ? '18px' : '2px' }}
                              transition={{ type:'spring', stiffness:500, damping:30 }}
                            />
                          </button>

                          {/* Edit */}
                          <button onClick={() => openEditItem(cat.id, item)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                            <TintedIcon src={icons.edit.url} alt="edit" section="adminMenu" tintKey="edit" size={14} />
                          </button>

                          {/* Delete item */}
                          <button
                            onClick={() => setDeleteConfirm({ type:'item', catId:cat.id, itemId:item.id })}
                            className="p-1.5 rounded-lg hover:bg-red-400/10 transition-colors">
                            <TintedIcon src={icons.delete.url} alt="delete" section="adminMenu" tintKey="delete" size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add item */}
                    <button
                      onClick={() => openAddItem(cat.id)}
                      className="w-full py-2.5 rounded-xl border border-dashed border-white/20
                        text-text-secondary text-sm font-semibold hover:border-primary/40
                        hover:text-primary transition-colors"
                    >
                      + Add Item to {cat.name}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* ── Add/Edit Item Modal ─────────────────────────────── */}
      <Modal
        isOpen={!!itemModal}
        onClose={() => setItemModal(null)}
        title={itemModal?.item ? `Edit: ${itemModal.item.name}` : 'Add New Item'}
        size="lg"
      >
        <div className="p-5 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Left column */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-text-secondary text-xs font-semibold block mb-1.5">Item Name *</label>
                <input type="text" placeholder="e.g. Japanese Matcha Bobba"
                  value={formItem.name}
                  onChange={e => setFormItem(f=>({...f,name:e.target.value}))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                    text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-text-secondary text-xs font-semibold block mb-1.5">Description</label>
                <textarea
                  placeholder="Short description…"
                  rows={2}
                  value={formItem.description}
                  onChange={e => setFormItem(f=>({...f,description:e.target.value}))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                    text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary resize-none"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-text-secondary text-xs font-semibold block mb-1.5">
                  Image URL
                  <span className="text-text-secondary font-normal ml-1">(paste Firebase or direct link)</span>
                </label>
                <div className="flex gap-2">
                  <input type="url" placeholder="https://…"
                    value={formItem.imageUrl}
                    onChange={e => { setFormItem(f=>({...f,imageUrl:e.target.value})); setImgPreview(e.target.value); }}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white
                      text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary"
                  />
                </div>
                {/* Preview */}
                {imgPreview && (
                  <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-white/20">
                    <img src={imgPreview} alt="preview"
                      className="w-full h-full object-cover"
                      onError={() => setImgPreview('')}
                    />
                  </div>
                )}
              </div>

              {/* Flags */}
              <div className="flex gap-4 flex-wrap">
                {([
                  ['isVeg',        '🥦 Veg'],
                  ['isBestSeller', '🔥 Best Seller'],
                  ['isAvailable',  '✅ Available'],
                ] as [keyof typeof formItem, string][]).map(([field, label]) => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox"
                      checked={formItem[field] as boolean}
                      onChange={e => setFormItem(f=>({...f,[field]:e.target.checked}))}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-white text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Right column — serving & price */}
            <div className="space-y-4">
              <div>
                <label className="text-text-secondary text-xs font-semibold block mb-1.5">Serving Type *</label>
                <div className="flex gap-2">
                  {([
                    ['full_only', '🍽️ Full Only'],
                    ['half_full', '½ Half & Full'],
                  ] as [ServingType, string][]).map(([val, label]) => (
                    <button key={val}
                      onClick={() => setFormItem(f=>({
                        ...f,
                        serving: val === 'full_only'
                          ? { type:'full_only', fullPrice: f.serving.fullPrice }
                          : { type:'half_full', fullPrice: f.serving.fullPrice, halfPrice: f.serving.halfPrice ?? 0 }
                      }))}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all
                        ${formItem.serving.type === val
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-white/20 text-text-secondary hover:border-white/40'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full price (always shown) */}
              <div>
                <label className="text-text-secondary text-xs font-semibold block mb-1.5">
                  {formItem.serving.type === 'half_full' ? 'Full Serving Price (₹) *' : 'Price (₹) *'}
                </label>
                <input
                  type="number" min="0" placeholder="e.g. 249"
                  value={formItem.serving.fullPrice || ''}
                  onChange={e => setFormItem(f=>({
                    ...f,
                    serving:{ ...f.serving, fullPrice: Number(e.target.value) }
                  }))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                    text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary"
                />
              </div>

              {/* Half price (only when half_full) */}
              <AnimatePresence>
                {formItem.serving.type === 'half_full' && (
                  <motion.div
                    initial={{ opacity:0, height:0 }}
                    animate={{ opacity:1, height:'auto' }}
                    exit={{ opacity:0, height:0 }}
                    className="overflow-hidden"
                  >
                    <label className="text-text-secondary text-xs font-semibold block mb-1.5">
                      Half Serving Price (₹) *
                    </label>
                    <input
                      type="number" min="0" placeholder="e.g. 199"
                      value={formItem.serving.halfPrice ?? ''}
                      onChange={e => setFormItem(f=>({
                        ...f,
                        serving:{ ...f.serving, halfPrice: Number(e.target.value) }
                      }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                        text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Price preview card */}
              {formItem.serving.fullPrice > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-text-secondary text-xs mb-2 font-semibold">Price Preview</p>
                  {formItem.serving.type === 'half_full' ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Half serving</span>
                        <span className="text-white font-bold">
                          {formatCurrency(formItem.serving.halfPrice ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Full serving</span>
                        <span className="text-white font-bold">
                          {formatCurrency(formItem.serving.fullPrice)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Price</span>
                      <span className="text-white font-bold">
                        {formatCurrency(formItem.serving.fullPrice)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <PrimaryButton className="w-full justify-center" onClick={handleSaveItem}>
            {itemModal?.item ? 'Save Changes ✓' : 'Add Item to Menu'}
          </PrimaryButton>
        </div>
      </Modal>

      {/* ── Add Category Modal ──────────────────────────────── */}
      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title="Add Category" size="sm">
        <div className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-text-secondary text-xs font-semibold block mb-1.5">Category Name *</label>
            <input type="text" placeholder="e.g. Popping Slushies"
              value={formCat.name}
              onChange={e => setFormCat(c=>({...c,name:e.target.value}))}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white
                text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary"
            />
          </div>

          {/* Icon URL — no emoji */}
          <div>
            <label className="text-text-secondary text-xs font-semibold block mb-1.5">
              Category Icon URL
              <span className="text-text-secondary font-normal ml-1">(Firebase or direct image link)</span>
            </label>
            <input type="url" placeholder="https://…"
              value={formCat.iconUrl}
              onChange={e => { setFormCat(c=>({...c,iconUrl:e.target.value})); setCatImgPreview(e.target.value); }}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary"
            />
            {catImgPreview && (
              <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-white/20">
                <img src={catImgPreview} alt="preview" className="w-full h-full object-cover"
                  onError={() => setCatImgPreview('')} />
              </div>
            )}
          </div>

          <PrimaryButton className="w-full justify-center" onClick={handleSaveCat}>
            Add Category
          </PrimaryButton>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ────────────────────────────── */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="⚠️ Confirm Delete"
        size="sm"
      >
        <div className="p-5 space-y-4">
          <p className="text-text-secondary text-sm">
            {deleteConfirm?.type === 'cat'
              ? `Delete the entire "${categories.find(c=>c.id===deleteConfirm.catId)?.name}" category and all its items? This cannot be undone.`
              : 'Delete this item? This cannot be undone.'
            }
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-2.5 rounded-full border border-white/20 text-text-secondary
                text-sm font-bold hover:border-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm font-bold
                hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMenuPage;
