import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { galleryService, type GalleryImage } from '../../services/firebaseService';
import { PrimaryButton, Spinner, Modal } from '../../components/ui';
import { TintedIcon } from '../../components/ui/TintedIcon';
import icons from '../../data/icons.json';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { key: 'all',    label: 'All',          emoji: '✨' },
  { key: 'drinks', label: 'Bobba Drinks', emoji: '🧋' },
  { key: 'bingsu', label: 'Bingsu',       emoji: '🍧' },
  { key: 'food',   label: 'Food',         emoji: '🥟' },
  { key: 'cafe',   label: 'Cafe Vibes',   emoji: '☕' },
];

// Fallback placeholder images when Firebase returns nothing
const FALLBACK: GalleryImage[] = Array.from({ length: 12 }, (_, i) => ({
  id:       `fb${i}`,
  category: CATEGORIES[1 + (i % 4)].key,
  url:      `https://picsum.photos/seed/gallery${i}/600/600`,
  caption:  '',
  addedBy:  '',
  addedAt:  new Date().toISOString(),
}));

const GalleryPage: React.FC = () => {
  const { user } = useAuthStore();
  const isMainAdmin = user?.role === 'main_admin';

  const [images,      setImages]      = useState<GalleryImage[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('all');
  const [lightbox,    setLightbox]    = useState<number | null>(null);
  const [addModal,    setAddModal]    = useState(false);
  const [delId,       setDelId]       = useState<string | null>(null);
  const [form,        setForm]        = useState({ url:'', category:'drinks', caption:'' });
  const [addLoading,  setAddLoading]  = useState(false);
  const [urlPreview,  setUrlPreview]  = useState('');

  // ── Fetch from Firebase ──────────────────────────────────
  const fetchImages = useCallback(async (cat: string) => {
    setLoading(true);
    try {
      const data = await galleryService.getImages(cat === 'all' ? undefined : cat);
      setImages(data.length > 0 ? data : FALLBACK.filter(f => cat === 'all' || f.category === cat));
    } catch {
      setImages(FALLBACK.filter(f => cat === 'all' || f.category === cat));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(filter); }, [filter, fetchImages]);

  // ── Add image ────────────────────────────────────────────
  const handleAdd = async () => {
    if (!form.url.trim()) return toast.error('Image URL required');
    setAddLoading(true);
    try {
      await galleryService.addImage({
        url:      form.url.trim(),
        category: form.category,
        caption:  form.caption,
        addedBy:  user?.id ?? 'admin',
        addedAt:  new Date().toISOString(),
      });
      toast.success('Image added to gallery ✓');
      setAddModal(false);
      setForm({ url:'', category:'drinks', caption:'' });
      setUrlPreview('');
      fetchImages(filter);
    } catch {
      // If Firebase not configured, add to local state
      setImages(prev => [{
        id: `local${Date.now()}`,
        url: form.url.trim(),
        category: form.category,
        caption: form.caption,
        addedBy: 'admin',
        addedAt: new Date().toISOString(),
      }, ...prev]);
      toast.success('Image added (local — configure Firebase to persist)');
      setAddModal(false);
      setForm({ url:'', category:'drinks', caption:'' });
      setUrlPreview('');
    } finally {
      setAddLoading(false);
    }
  };

  // ── Delete image ─────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await galleryService.deleteImage(delId!);
      setImages(prev => prev.filter(img => img.id !== delId));
      toast.success('Image removed');
    } catch {
      setImages(prev => prev.filter(img => img.id !== delId));
      toast.success('Image removed');
    }
    setDelId(null);
  };

  const displayed = filter === 'all'
    ? images
    : images.filter(img => img.category === filter);

  return (
    <div className="min-h-screen pt-24 pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-3">
            Our <span className="bg-bubble-gradient bg-clip-text text-transparent">Gallery</span>
          </h1>
          <p className="text-text-secondary text-lg">A visual feast of everything we craft 📸</p>
        </motion.div>

        {/* Admin — add image button */}
        {isMainAdmin && (
          <div className="flex justify-center mb-6">
            <PrimaryButton onClick={() => setAddModal(true)}>
              <TintedIcon src={icons.image.url} alt="" section="adminMenu" tintKey="edit" size={16}
                className="brightness-0 invert" />
              + Add Image
            </PrimaryButton>
          </div>
        )}

        {/* Filter pills */}
        <div className="flex gap-2 justify-center flex-wrap mb-10">
          {CATEGORIES.map(cat => (
            <motion.button key={cat.key} whileTap={{ scale:0.95 }}
              onClick={() => setFilter(cat.key)}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold border
                transition-all duration-200
                ${filter===cat.key
                  ? 'bg-primary text-white border-primary shadow-brand'
                  : 'bg-card text-text-secondary border-white/10 hover:border-primary/40 hover:text-white'}`}
            >
              <span>{cat.emoji}</span>{cat.label}
            </motion.button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-white font-bold text-xl mb-2">No images yet</p>
            {isMainAdmin && (
              <p className="text-text-secondary text-sm">Add images using the button above</p>
            )}
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {displayed.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity:0, scale:0.92 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ delay: i*0.03 }}
                className="break-inside-avoid relative group"
              >
                <button
                  className="w-full overflow-hidden rounded-2xl block border border-white/10
                    hover:border-primary/40 transition-colors cursor-zoom-in"
                  onClick={() => setLightbox(i)}
                >
                  <img
                    src={img.url}
                    alt={img.caption || `Gallery ${i+1}`}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={e => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/err${i}/400/400`;
                    }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                    transition-opacity duration-300 flex items-center justify-center rounded-2xl">
                    <span className="text-white text-3xl">🔍</span>
                  </div>
                </button>

                {/* Admin delete button */}
                {isMainAdmin && (
                  <button
                    onClick={e => { e.stopPropagation(); setDelId(img.id); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 border border-white/20
                      items-center justify-center hidden group-hover:flex transition-all hover:bg-red-500/80"
                  >
                    <TintedIcon src={icons.delete.url} alt="delete" section="adminMenu" tintKey="delete" size={12} />
                  </button>
                )}

                {img.caption && (
                  <p className="text-text-secondary text-xs mt-1 px-1 truncate">{img.caption}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-center text-text-secondary text-sm mt-8">
          {displayed.length} photos
        </p>
      </div>

      {/* ── Lightbox ─────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center
                justify-center text-white text-xl hover:bg-white/20 z-10">
              ×
            </button>
            <button disabled={lightbox===0} onClick={e => { e.stopPropagation(); setLightbox(i=>(i??0)-1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center
                justify-center text-white text-2xl hover:bg-white/20 disabled:opacity-30 z-10">
              ‹
            </button>
            <motion.img
              key={lightbox}
              src={displayed[lightbox]?.url}
              alt="Gallery"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
              onClick={e => e.stopPropagation()}
            />
            <button disabled={lightbox===displayed.length-1}
              onClick={e => { e.stopPropagation(); setLightbox(i=>(i??0)+1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center
                justify-center text-white text-2xl hover:bg-white/20 disabled:opacity-30 z-10">
              ›
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 rounded-full
              px-4 py-1.5 text-white text-sm font-semibold">
              {lightbox+1} / {displayed.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Image Modal (admin only) ──────────────────── */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="📷 Add Gallery Image" size="sm">
        <div className="p-5 space-y-4">
          <div>
            <label className="text-text-secondary text-xs font-semibold block mb-1.5">
              Image URL * <span className="font-normal">(Firebase Storage or direct link)</span>
            </label>
            <input type="url" placeholder="https://…"
              value={form.url}
              onChange={e => { setForm(f=>({...f,url:e.target.value})); setUrlPreview(e.target.value); }}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary"
            />
            {urlPreview && (
              <div className="mt-2 h-28 rounded-xl overflow-hidden border border-white/20">
                <img src={urlPreview} alt="preview" className="w-full h-full object-cover"
                  onError={() => setUrlPreview('')} />
              </div>
            )}
          </div>

          <div>
            <label className="text-text-secondary text-xs font-semibold block mb-1.5">Category</label>
            <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none">
              {CATEGORIES.filter(c=>c.key!=='all').map(c => (
                <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-text-secondary text-xs font-semibold block mb-1.5">Caption (optional)</label>
            <input type="text" placeholder="e.g. Matcha Bobba special"
              value={form.caption} onChange={e=>setForm(f=>({...f,caption:e.target.value}))}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary"
            />
          </div>

          <PrimaryButton className="w-full justify-center" onClick={handleAdd} loading={addLoading}>
            Add to Gallery
          </PrimaryButton>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!delId} onClose={() => setDelId(null)} title="⚠️ Remove Image" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-text-secondary text-sm">
            Remove this image from the gallery? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDelId(null)}
              className="flex-1 py-2.5 rounded-full border border-white/20 text-text-secondary
                text-sm font-bold hover:border-white/40 hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete}
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

export default GalleryPage;
