import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, PrimaryButton, SecondaryButton, Badge, Spinner } from '../../components/ui';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import icons from '../../data/icons.json';

interface ItemEntry {
  id: string; name: string; price: number; isVeg: boolean; isAvailable: boolean; isBestSeller: boolean;
}
interface CategoryEntry {
  id: string; name: string; slug: string; emoji: string; items: ItemEntry[];
}

const INITIAL_CATEGORIES: CategoryEntry[] = [
  { id:'c1', name:'Bobba Milk Tea', slug:'bobba-milk-tea', emoji:'🧋', items:[
    { id:'i1', name:'French Vanilla',   price:249, isVeg:true, isAvailable:true, isBestSeller:true },
    { id:'i2', name:'Royal Thai',       price:249, isVeg:true, isAvailable:true, isBestSeller:true },
    { id:'i3', name:'Japanese Matcha',  price:279, isVeg:true, isAvailable:true, isBestSeller:false },
    { id:'i4', name:'Strawberry Matcha',price:279, isVeg:true, isAvailable:true, isBestSeller:false },
  ]},
  { id:'c2', name:'Momos', slug:'momos', emoji:'🥟', items:[
    { id:'i5', name:'Steamed',          price:149, isVeg:true,  isAvailable:true,  isBestSeller:false },
    { id:'i6', name:'Fried',            price:159, isVeg:true,  isAvailable:true,  isBestSeller:true  },
    { id:'i7', name:'Afghan Momos',     price:199, isVeg:false, isAvailable:true,  isBestSeller:true  },
    { id:'i8', name:'Kurkure Momos',    price:179, isVeg:true,  isAvailable:false, isBestSeller:false },
  ]},
  { id:'c3', name:'Bingsu (Premium)', slug:'bingsu-premium-creamy', emoji:'🍨', items:[
    { id:'i9',  name:'Mango Magic',       price:299, isVeg:true, isAvailable:true, isBestSeller:true  },
    { id:'i10', name:'Blueberry Blast',   price:299, isVeg:true, isAvailable:true, isBestSeller:false },
    { id:'i11', name:'Biscoff Cream Cheese', price:329, isVeg:true, isAvailable:true, isBestSeller:false },
  ]},
];

const EMPTY_ITEM: Omit<ItemEntry,'id'> = { name:'', price:199, isVeg:true, isAvailable:true, isBestSeller:false };

const AdminMenuPage: React.FC = () => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [expandedCat, setExpandedCat] = useState<string | null>('c1');
  const [itemModal, setItemModal] = useState<{ catId: string; item?: ItemEntry } | null>(null);
  const [formItem, setFormItem] = useState<Omit<ItemEntry,'id'>>(EMPTY_ITEM);
  const [catModal, setCatModal] = useState(false);
  const [newCat, setNewCat] = useState({ name:'', emoji:'🍴' });
  const [search, setSearch] = useState('');

  /* ── Toggle item availability ── */
  const toggleAvailable = (catId: string, itemId: string) => {
    setCategories(prev => prev.map(c => c.id === catId
      ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i) }
      : c
    ));
  };

  const toggleBestSeller = (catId: string, itemId: string) => {
    setCategories(prev => prev.map(c => c.id === catId
      ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, isBestSeller: !i.isBestSeller } : i) }
      : c
    ));
  };

  /* ── Save item (add or edit) ── */
  const handleSaveItem = () => {
    if (!formItem.name.trim()) return toast.error('Item name required');
    if (!itemModal) return;
    const { catId, item } = itemModal;
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c;
      if (item) {
        return { ...c, items: c.items.map(i => i.id === item.id ? { ...i, ...formItem } : i) };
      }
      return { ...c, items: [...c.items, { id: `i${Date.now()}`, ...formItem }] };
    }));
    toast.success(item ? 'Item updated' : 'Item added');
    setItemModal(null);
  };

  /* ── Delete item ── */
  const deleteItem = (catId: string, itemId: string) => {
    setCategories(prev => prev.map(c =>
      c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
    ));
    toast.success('Item removed');
  };

  /* ── Add category ── */
  const handleAddCategory = () => {
    if (!newCat.name.trim()) return toast.error('Category name required');
    const slug = newCat.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    setCategories(prev => [...prev, { id:`c${Date.now()}`, name:newCat.name, slug, emoji:newCat.emoji, items:[] }]);
    toast.success('Category added');
    setCatModal(false);
    setNewCat({ name:'', emoji:'🍴' });
  };

  const filteredCats = search
    ? categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()))
      )
    : categories;

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
        <PrimaryButton onClick={() => setCatModal(true)}>+ Add Category</PrimaryButton>
      </div>

      {/* Search */}
      <div className="relative">
        <img src={icons.search.url} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search categories or items…"
          className="w-full bg-card border border-white/20 rounded-full py-2.5 pl-11 pr-5 text-white
            text-sm outline-none focus:border-primary/60 transition-colors placeholder:text-text-secondary"
        />
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {filteredCats.map(cat => (
          <div key={cat.id} className="bg-card rounded-2xl border border-white/10 overflow-hidden">
            {/* Category header */}
            <button
              onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
              className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold">{cat.name}</p>
                <p className="text-text-secondary text-xs">
                  {cat.items.length} items · {cat.items.filter(i=>i.isAvailable).length} available
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={cat.items.some(i=>!i.isAvailable) ? 'warning' : 'success'}>
                  {cat.items.filter(i=>i.isAvailable).length}/{cat.items.length}
                </Badge>
                <span className="text-text-secondary text-sm">{expandedCat===cat.id?'▲':'▼'}</span>
              </div>
            </button>

            {/* Items list */}
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
                          ${item.isAvailable ? 'border-white/10 bg-white/5' : 'border-white/5 bg-black/20 opacity-60'}`}
                      >
                        <img
                          src={item.isVeg ? icons.veg.url : icons.nonveg.url}
                          alt="" className="w-4 h-4 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                            {item.isBestSeller && <span className="text-[10px] text-secondary font-bold">🔥 Best</span>}
                          </div>
                          <p className="text-text-secondary text-xs">{formatCurrency(item.price)}</p>
                        </div>

                        {/* Toggles */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Available toggle */}
                          <button
                            onClick={() => toggleAvailable(cat.id, item.id)}
                            className={`w-9 h-5 rounded-full relative transition-colors ${item.isAvailable?'bg-success':'bg-white/20'}`}
                            title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${item.isAvailable?'left-4.5':'left-0.5'}`}
                              style={{ left: item.isAvailable ? '18px' : '2px' }} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => { setFormItem({...item}); setItemModal({ catId:cat.id, item }); }}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <img src={icons.edit.url} alt="Edit" className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteItem(cat.id, item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-400/10 transition-colors"
                          >
                            <img src={icons.delete.url} alt="Delete" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add item button */}
                    <button
                      onClick={() => { setFormItem(EMPTY_ITEM); setItemModal({ catId:cat.id }); }}
                      className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-text-secondary
                        text-sm font-semibold hover:border-primary/40 hover:text-primary transition-colors"
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

      {/* Item Modal */}
      <Modal isOpen={!!itemModal} onClose={() => setItemModal(null)}
        title={itemModal?.item ? `Edit: ${itemModal.item.name}` : 'Add New Item'} size="sm">
        <div className="p-5 space-y-4">
          <input type="text" placeholder="Item name *"
            value={formItem.name}
            onChange={e => setFormItem(f=>({...f, name:e.target.value}))}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm
              outline-none focus:border-primary/60 placeholder:text-text-secondary"
          />
          <div className="flex items-center gap-3">
            <label className="text-text-secondary text-sm">Price (₹)</label>
            <input type="number" value={formItem.price} min="0"
              onChange={e => setFormItem(f=>({...f, price:parseInt(e.target.value)||0}))}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm
                outline-none focus:border-primary/60"
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            {[
              { field:'isVeg',         label:'Veg',         icon:'🥦' },
              { field:'isBestSeller',  label:'Best Seller', icon:'🔥' },
              { field:'isAvailable',   label:'Available',   icon:'✅' },
            ].map(({ field, label, icon }) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={formItem[field as keyof typeof formItem] as boolean}
                  onChange={e => setFormItem(f=>({...f,[field]:e.target.checked}))}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-white text-sm">{icon} {label}</span>
              </label>
            ))}
          </div>
          <PrimaryButton className="w-full justify-center" onClick={handleSaveItem}>
            {itemModal?.item ? 'Save Changes' : 'Add Item'}
          </PrimaryButton>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title="Add Category" size="sm">
        <div className="p-5 space-y-4">
          <input type="text" placeholder="Category name *"
            value={newCat.name}
            onChange={e => setNewCat(c=>({...c, name:e.target.value}))}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm
              outline-none focus:border-primary/60 placeholder:text-text-secondary"
          />
          <div className="flex items-center gap-3">
            <label className="text-text-secondary text-sm shrink-0">Emoji</label>
            <input type="text" value={newCat.emoji} maxLength={2}
              onChange={e => setNewCat(c=>({...c, emoji:e.target.value}))}
              className="w-16 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-xl
                outline-none focus:border-primary/60 text-center"
            />
            <p className="text-text-secondary text-xs">Pick any emoji for this category</p>
          </div>
          <PrimaryButton className="w-full justify-center" onClick={handleAddCategory}>
            Add Category
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMenuPage;