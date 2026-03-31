// import React, { useState, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Modal, PrimaryButton } from '../../components/ui';
// import { TintedIcon } from '../../components/ui/TintedIcon';
// import toast from 'react-hot-toast';
// import icons from '../../data/icons.json';

// // ── Firebase import (adjust path to your firebase config) ──────
// // import { db } from '../../firebase/config';
// // import { doc, setDoc } from 'firebase/firestore';

// // ══════════════════════════════════════════════════════════════
// // TYPES
// // ══════════════════════════════════════════════════════════════
// interface FeedPost {
//   id:      string;
//   image:   string;   // Firebase Storage download URL
//   caption: string;
//   link:    string;
// }

// type FormPost = Omit<FeedPost, 'id'> & { id?: string };

// // ── Seed data (replace with Firestore fetch on mount) ─────────
// const INITIAL_POSTS: FeedPost[] = [
//   {
//     id: 'insta_bobbabobba_1',
//     image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&h=400&fit=crop',
//     caption: 'Fresh bubble tea drop 🫧',
//     link: 'https://www.instagram.com/p/POST_ID_1/',
//   },
//   {
//     id: 'insta_bobbabobba_2',
//     image: 'https://images.unsplash.com/photo-1606791422814-b32c705e3e2f?w=400&h=400&fit=crop',
//     caption: 'Matcha season is here 🍵✨',
//     link: 'https://www.instagram.com/p/POST_ID_2/',
//   },
//   {
//     id: 'insta_bobbabobba_3',
//     image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
//     caption: 'Pearls that hit different 🖤',
//     link: 'https://www.instagram.com/p/POST_ID_3/',
//   },
// ];

// const EMPTY_FORM: FormPost = { image: '', caption: '', link: '' };

// // ── Firebase stub — swap with real Firestore call ─────────────
// const saveFeedToFirebase = async (posts: FeedPost[]): Promise<void> => {
//   // Real implementation:
//   // await setDoc(doc(db, 'config', 'instagramFeed'), {
//   //   posts,
//   //   updatedAt: new Date().toISOString(),
//   // });
//   await new Promise(r => setTimeout(r, 900)); // simulate latency
// };

// // ══════════════════════════════════════════════════════════════
// // COMPONENT
// // ══════════════════════════════════════════════════════════════
// const AdminSocialFeedPage: React.FC = () => {
//   const [posts,      setPosts]      = useState<FeedPost[]>(INITIAL_POSTS);
//   const [modal,      setModal]      = useState<'add' | FeedPost | null>(null);
//   const [delId,      setDelId]      = useState<string | null>(null);
//   const [form,       setForm]       = useState<FormPost>(EMPTY_FORM);
//   const [imgPreview, setImgPreview] = useState('');
//   const [saving,     setSaving]     = useState(false);
//   const [jsonMode,   setJsonMode]   = useState(false);
//   const [jsonText,   setJsonText]   = useState('');
//   const [jsonError,  setJsonError]  = useState('');

//   // ── Open modals ─────────────────────────────────────────────
//   const openAdd = () => {
//     setForm(EMPTY_FORM);
//     setImgPreview('');
//     setModal('add');
//   };

//   const openEdit = (post: FeedPost) => {
//     setForm({ id: post.id, image: post.image, caption: post.caption, link: post.link });
//     setImgPreview(post.image);
//     setModal(post);
//   };

//   // ── Save single post ─────────────────────────────────────────
//   const handleSave = () => {
//     if (!form.image.trim()) return toast.error('Image URL is required');
//     if (!form.link.trim())  return toast.error('Instagram link is required');

//     if (modal === 'add') {
//       const newPost: FeedPost = {
//         id:      form.id?.trim() || `insta_post_${Date.now()}`,
//         image:   form.image.trim(),
//         caption: form.caption.trim(),
//         link:    form.link.trim(),
//       };
//       setPosts(p => [newPost, ...p]);
//       toast.success('Post added!');
//     } else if (modal && modal !== 'add') {
//       setPosts(p => p.map(post =>
//         post.id === (modal as FeedPost).id
//           ? { ...post, image: form.image.trim(), caption: form.caption.trim(), link: form.link.trim() }
//           : post
//       ));
//       toast.success('Post updated!');
//     }
//     setModal(null);
//   };

//   // ── Delete ───────────────────────────────────────────────────
//   const confirmDelete = () => {
//     setPosts(p => p.filter(post => post.id !== delId));
//     toast.success('Post removed from feed');
//     setDelId(null);
//   };

//   // ── Reorder ──────────────────────────────────────────────────
//   const movePost = (idx: number, dir: -1 | 1) => {
//     const next = [...posts];
//     const swap = idx + dir;
//     if (swap < 0 || swap >= next.length) return;
//     [next[idx], next[swap]] = [next[swap], next[idx]];
//     setPosts(next);
//   };

//   // ── Publish to Firebase ──────────────────────────────────────
//   const handlePublish = async () => {
//     setSaving(true);
//     try {
//       await saveFeedToFirebase(posts);
//       toast.success(`Feed published! ${posts.length} posts saved to Firebase`);
//     } catch {
//       toast.error('Failed to save — check Firebase connection');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── JSON bulk import ─────────────────────────────────────────
//   const openJsonImport = () => {
//     setJsonText(JSON.stringify(posts, null, 2));
//     setJsonError('');
//     setJsonMode(true);
//   };

//   const handleJsonImport = () => {
//     try {
//       const parsed: FeedPost[] = JSON.parse(jsonText);
//       if (!Array.isArray(parsed)) throw new Error('Root must be an array [ ]');
//       parsed.forEach((p, i) => {
//         if (!p.id)    throw new Error(`Item[${i}]: missing "id"`);
//         if (!p.image) throw new Error(`Item[${i}]: missing "image"`);
//         if (!p.link)  throw new Error(`Item[${i}]: missing "link"`);
//       });
//       setPosts(parsed);
//       setJsonMode(false);
//       toast.success(`Imported ${parsed.length} posts`);
//     } catch (e: any) {
//       setJsonError(e.message || 'Invalid JSON');
//     }
//   };

//   const copyJson = () => {
//     navigator.clipboard.writeText(JSON.stringify(posts, null, 2));
//     toast.success('JSON copied to clipboard');
//   };

//   // ══════════════════════════════════════════════════════════════
//   return (
//     <div className="space-y-6">

//       {/* ── Page header ────────────────────────────────────────── */}
//       <div className="flex items-start justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="font-display text-3xl font-bold text-white">Social Feed</h1>
//           <p className="text-text-secondary text-sm mt-0.5">
//             {posts.length} post{posts.length !== 1 ? 's' : ''} · first 9 shown on site
//           </p>
//         </div>

//         <div className="flex items-center gap-2 flex-wrap">
//           {/* JSON tools */}
//           <button onClick={openJsonImport}
//             className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20
//               bg-white/5 text-text-secondary text-sm font-bold hover:border-white/40 hover:text-white transition-colors">
//             <span className="font-mono text-xs">{'{ }'}</span> JSON
//           </button>
//           <button onClick={copyJson}
//             className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20
//               bg-white/5 text-text-secondary text-sm font-bold hover:border-white/40 hover:text-white transition-colors">
//             📋 Copy JSON
//           </button>

//           {/* Add post */}
//           <button onClick={openAdd}
//             className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20
//               bg-white/5 text-white text-sm font-bold hover:border-primary/40 hover:bg-primary/10 transition-colors">
//             + Add Post
//           </button>

//           {/* Publish */}
//           <motion.button
//             onClick={handlePublish}
//             disabled={saving}
//             whileHover={{ scale: 1.03 }}
//             whileTap={{ scale: 0.97 }}
//             className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white
//               disabled:opacity-60 disabled:cursor-not-allowed"
//             style={{
//               background: saving ? 'rgba(255,100,30,0.3)' : 'linear-gradient(135deg,#FF3B30 0%,#FF7A00 55%,#FFD600 100%)',
//               boxShadow: '0 0 20px rgba(255,100,20,0.35)',
//             }}
//           >
//             {saving ? (
//               <>
//                 <motion.span
//                   animate={{ rotate: 360 }}
//                   transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
//                   className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
//                 />
//                 Saving…
//               </>
//             ) : (
//               <><span>🔥</span> Publish to Firebase</>
//             )}
//           </motion.button>
//         </div>
//       </div>

//       {/* ── Instagram grid preview ──────────────────────────────── */}
//       <div>
//         <div className="flex items-center gap-3 mb-3">
//           <div className="h-px flex-1 bg-white/10" />
//           <span className="text-text-secondary text-xs font-semibold tracking-widest uppercase">
//             Site Preview · {Math.min(posts.length, 9)} / 9 slots filled
//           </span>
//           <div className="h-px flex-1 bg-white/10" />
//         </div>

//         <div className="grid grid-cols-3 gap-2 sm:gap-3 rounded-2xl p-3 bg-card border border-white/10">
//           {posts.slice(0, 9).map((post, i) => (
//             <motion.div
//               key={post.id}
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: i * 0.04 }}
//               className="relative aspect-square overflow-hidden rounded-xl group cursor-pointer"
//               onClick={() => openEdit(post)}
//             >
//               {post.image ? (
//                 <img
//                   src={post.image}
//                   alt={post.caption}
//                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                 />
//               ) : (
//                 <div className="w-full h-full bg-white/10 flex items-center justify-center text-3xl">📷</div>
//               )}
//               {/* Hover overlay */}
//               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
//                 transition-opacity duration-300 flex flex-col items-center justify-center gap-1 p-2">
//                 <span className="text-white text-[11px] font-bold text-center line-clamp-2 leading-tight">
//                   {post.caption || '—'}
//                 </span>
//                 <span className="text-white/50 text-[10px]">click to edit</span>
//               </div>
//               {/* Position badge */}
//               <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60
//                 backdrop-blur-sm flex items-center justify-center pointer-events-none">
//                 <span className="text-white text-[10px] font-bold">{i + 1}</span>
//               </div>
//             </motion.div>
//           ))}
//           {/* Empty slots */}
//           {Array.from({ length: Math.max(0, 9 - posts.length) }).map((_, i) => (
//             <div key={`empty-${i}`}
//               className="aspect-square rounded-xl border border-dashed border-white/10
//                 bg-white/5 flex flex-col items-center justify-center gap-1 cursor-pointer
//                 hover:border-primary/30 hover:bg-primary/5 transition-colors"
//               onClick={openAdd}
//             >
//               <span className="text-white/20 text-xl">+</span>
//               <span className="text-white/20 text-[10px]">add post</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── All posts list ──────────────────────────────────────── */}
//       <div className="space-y-2">
//         <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider px-1">
//           All Posts — use ↑↓ to reorder · first 9 appear on site
//         </p>

//         <AnimatePresence mode="popLayout">
//           {posts.map((post, idx) => (
//             <motion.div
//               key={post.id}
//               layout
//               initial={{ opacity: 0, y: 8 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, x: -20, scale: 0.97 }}
//               transition={{ duration: 0.2 }}
//               className="flex items-center gap-3 p-3 rounded-2xl border border-white/10
//                 bg-card hover:border-white/20 transition-colors"
//             >
//               {/* Position */}
//               <span className="text-text-secondary text-xs font-bold w-5 text-center shrink-0 tabular-nums">
//                 {idx + 1}
//               </span>

//               {/* Thumbnail */}
//               <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/10">
//                 {post.image ? (
//                   <img src={post.image} alt={post.caption}
//                     className="w-full h-full object-cover" />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
//                 )}
//               </div>

//               {/* Info */}
//               <div className="flex-1 min-w-0">
//                 <p className="text-white text-sm font-semibold truncate">
//                   {post.caption || <span className="text-text-secondary italic text-xs">No caption</span>}
//                 </p>
//                 <p className="text-text-secondary text-xs truncate mt-0.5">{post.link}</p>
//                 <p className="text-white/25 text-[10px] font-mono mt-0.5 truncate">{post.id}</p>
//               </div>

//               {/* Visibility badge */}
//               <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 hidden sm:block
//                 ${idx < 9
//                   ? 'text-success bg-success/20 border-success/30'
//                   : 'text-text-secondary bg-white/10 border-white/10'}`}>
//                 {idx < 9 ? '✓ Shown' : 'Hidden'}
//               </span>

//               {/* Reorder arrows */}
//               <div className="flex flex-col gap-0.5 shrink-0">
//                 <button onClick={() => movePost(idx, -1)} disabled={idx === 0}
//                   className="p-1.5 rounded-lg border border-white/10 text-text-secondary
//                     hover:text-white hover:border-white/30 transition-colors
//                     disabled:opacity-20 disabled:cursor-not-allowed">
//                   <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
//                     <path d="M5 8V2M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5"
//                       strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                 </button>
//                 <button onClick={() => movePost(idx, 1)} disabled={idx === posts.length - 1}
//                   className="p-1.5 rounded-lg border border-white/10 text-text-secondary
//                     hover:text-white hover:border-white/30 transition-colors
//                     disabled:opacity-20 disabled:cursor-not-allowed">
//                   <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
//                     <path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5"
//                       strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                 </button>
//               </div>

//               {/* Edit */}
//               <button onClick={() => openEdit(post)}
//                 className="p-2 rounded-xl border border-white/20 text-text-secondary
//                   hover:text-white hover:bg-white/10 transition-colors shrink-0">
//                 <TintedIcon src={icons.edit.url} alt="edit" section="adminSocialFeed" tintKey="edit" size={14} />
//               </button>

//               {/* Delete */}
//               <button onClick={() => setDelId(post.id)}
//                 className="p-2 rounded-xl border border-red-400/20 text-red-400/60
//                   hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0">
//                 <TintedIcon src={icons.delete.url} alt="delete" section="adminSocialFeed" tintKey="delete" size={14} />
//               </button>
//             </motion.div>
//           ))}
//         </AnimatePresence>

//         {/* Empty state */}
//         {posts.length === 0 && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//             className="text-center py-16 bg-card rounded-2xl border border-dashed border-white/15">
//             <p className="text-4xl mb-3">📷</p>
//             <p className="text-white font-bold">No posts yet</p>
//             <p className="text-text-secondary text-sm mt-1">Add your first post or import JSON</p>
//             <button onClick={openAdd}
//               className="mt-4 px-6 py-2.5 rounded-full border border-primary/40 text-primary
//                 text-sm font-bold hover:bg-primary/10 transition-colors">
//               + Add First Post
//             </button>
//           </motion.div>
//         )}
//       </div>

//       {/* ── Publish reminder ────────────────────────────────────── */}
//       {posts.length > 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
//           className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl
//             border border-orange-400/20 bg-orange-400/5 flex-wrap"
//         >
//           <div className="flex items-center gap-3">
//             <span className="text-xl">💡</span>
//             <div>
//               <p className="text-white text-sm font-bold">Changes are local until published</p>
//               <p className="text-text-secondary text-xs">
//                 Hit "Publish to Firebase" to push to Firestore. The site reads live from there.
//               </p>
//             </div>
//           </div>
//           <button onClick={handlePublish} disabled={saving}
//             className="px-5 py-2 rounded-full text-sm font-bold text-white shrink-0 disabled:opacity-50"
//             style={{ background: 'linear-gradient(135deg,#FF3B30,#FF9500)' }}>
//             {saving ? 'Saving…' : '🔥 Publish Now'}
//           </button>
//         </motion.div>
//       )}

//       {/* ══════════════════════════════════════════════════════════ */}
//       {/* ADD / EDIT MODAL                                          */}
//       {/* ══════════════════════════════════════════════════════════ */}
//       <Modal
//         isOpen={!!modal}
//         onClose={() => setModal(null)}
//         title={modal === 'add' ? '➕ Add Instagram Post' : '✏️ Edit Post'}
//         size="md"
//       >
//         <div className="p-5 space-y-4">
//           <div className="grid sm:grid-cols-2 gap-5">

//             {/* ── Left: fields ─────────────────────────────────── */}
//             <div className="space-y-4">

//               {/* Post ID */}
//               <div>
//                 <label className="text-text-secondary text-xs font-semibold block mb-1.5">
//                   Post ID
//                   <span className="text-text-secondary font-normal ml-1">(auto-generated if blank)</span>
//                 </label>
//                 <input type="text"
//                   placeholder="e.g. insta_bobbabobba_4"
//                   value={form.id ?? ''}
//                   onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
//                   className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5
//                     text-white text-sm font-mono outline-none focus:border-primary/60
//                     placeholder:text-text-secondary"
//                 />
//               </div>

//               {/* Image URL */}
//               <div>
//                 <label className="text-text-secondary text-xs font-semibold block mb-1.5">
//                   Image URL <span className="text-red-400">*</span>
//                 </label>
//                 <input type="url"
//                   placeholder="https://firebasestorage.googleapis.com/…"
//                   value={form.image}
//                   onChange={e => {
//                     setForm(f => ({ ...f, image: e.target.value }));
//                     setImgPreview(e.target.value);
//                   }}
//                   className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5
//                     text-white text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary"
//                 />
//                 <p className="text-text-secondary text-[10px] mt-1">
//                   Firebase Storage → Upload image → Copy Download URL → paste here
//                 </p>
//               </div>

//               {/* Caption */}
//               <div>
//                 <label className="text-text-secondary text-xs font-semibold block mb-1.5">Caption</label>
//                 <textarea rows={3}
//                   placeholder="Fresh bubble tea drop 🫧 #BobbaBobba"
//                   value={form.caption}
//                   onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
//                   className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5
//                     text-white text-sm outline-none focus:border-primary/60 resize-none
//                     placeholder:text-text-secondary"
//                 />
//               </div>

//               {/* Instagram link */}
//               <div>
//                 <label className="text-text-secondary text-xs font-semibold block mb-1.5">
//                   Instagram Post Link <span className="text-red-400">*</span>
//                 </label>
//                 <input type="url"
//                   placeholder="https://www.instagram.com/p/POST_ID/"
//                   value={form.link}
//                   onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
//                   className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5
//                     text-white text-sm outline-none focus:border-primary/60 placeholder:text-text-secondary"
//                 />
//               </div>
//             </div>

//             {/* ── Right: preview ───────────────────────────────── */}
//             <div className="space-y-3">
//               <label className="text-text-secondary text-xs font-semibold block">Preview</label>

//               {/* Image preview */}
//               <div className="aspect-square rounded-xl overflow-hidden border border-white/20 bg-white/5
//                 flex items-center justify-center relative group">
//                 {imgPreview ? (
//                   <>
//                     <img src={imgPreview} alt="preview"
//                       className="w-full h-full object-cover"
//                       onError={() => setImgPreview('')}
//                     />
//                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
//                       transition-opacity flex items-center justify-center p-4">
//                       <span className="text-white text-sm font-bold text-center">
//                         {form.caption || '—'}
//                       </span>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="flex flex-col items-center gap-2 text-text-secondary">
//                     <span className="text-4xl">📷</span>
//                     <span className="text-xs text-center px-4">Paste an image URL to see preview</span>
//                   </div>
//                 )}
//               </div>

//               {/* Mini post card */}
//               <div className="bg-white/5 rounded-xl border border-white/10 p-3">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="w-6 h-6 rounded-full shrink-0"
//                     style={{ background: 'linear-gradient(135deg,#FF3B30,#FF9500,#FFD600)' }} />
//                   <span className="text-white text-xs font-bold">@bobbabobbaofficial</span>
//                 </div>
//                 <p className="text-text-secondary text-xs leading-relaxed line-clamp-2">
//                   {form.caption || 'Caption will appear here…'}
//                 </p>
//                 {form.link && (
//                   <a href={form.link} target="_blank" rel="noopener noreferrer"
//                     className="text-primary text-[10px] mt-1.5 block truncate hover:underline">
//                     {form.link}
//                   </a>
//                 )}
//               </div>

//               {/* Firebase storage guide */}
//               <div className="bg-white/5 rounded-xl border border-white/10 p-3 space-y-1">
//                 <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wider mb-1.5">
//                   📦 Firebase Storage Steps
//                 </p>
//                 {[
//                   '1. Firebase Console → Storage',
//                   '2. Upload image to /instagram/ folder',
//                   '3. Click image → Copy Download URL',
//                   '4. Paste URL in the "Image URL" field',
//                 ].map(s => (
//                   <p key={s} className="text-text-secondary text-[10px] leading-relaxed">{s}</p>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <PrimaryButton className="w-full justify-center" onClick={handleSave}>
//             {modal === 'add' ? '➕ Add to Feed' : '✓ Save Changes'}
//           </PrimaryButton>
//         </div>
//       </Modal>

//       {/* ══════════════════════════════════════════════════════════ */}
//       {/* JSON IMPORT / EXPORT MODAL                                */}
//       {/* ══════════════════════════════════════════════════════════ */}
//       <Modal
//         isOpen={jsonMode}
//         onClose={() => setJsonMode(false)}
//         title="{ } JSON Import / Export"
//         size="lg"
//       >
//         <div className="p-5 space-y-4">
//           <div className="flex items-center justify-between flex-wrap gap-2">
//             <p className="text-text-secondary text-sm">
//               Edit directly. Each item needs{' '}
//               <code className="text-primary text-xs bg-primary/10 px-1 py-0.5 rounded">id</code>{' '}
//               <code className="text-primary text-xs bg-primary/10 px-1 py-0.5 rounded">image</code>{' '}
//               <code className="text-primary text-xs bg-primary/10 px-1 py-0.5 rounded">caption</code>{' '}
//               <code className="text-primary text-xs bg-primary/10 px-1 py-0.5 rounded">link</code>
//             </p>
//             <button
//               onClick={() => { navigator.clipboard.writeText(jsonText); toast.success('Copied!'); }}
//               className="text-xs text-text-secondary hover:text-white transition-colors px-3 py-1.5
//                 rounded-lg border border-white/20 hover:border-white/40">
//               📋 Copy
//             </button>
//           </div>

//           <textarea
//             rows={14}
//             value={jsonText}
//             onChange={e => { setJsonText(e.target.value); setJsonError(''); }}
//             spellCheck={false}
//             className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white
//               text-xs font-mono outline-none focus:border-primary/60 resize-none leading-relaxed
//               scrollbar-thin scrollbar-thumb-white/10"
//           />

//           <AnimatePresence>
//             {jsonError && (
//               <motion.p
//                 initial={{ opacity: 0, y: -4 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0 }}
//                 className="text-red-400 text-sm flex items-center gap-2"
//               >
//                 <span>⚠️</span> {jsonError}
//               </motion.p>
//             )}
//           </AnimatePresence>

//           <div className="flex gap-3">
//             <button onClick={() => setJsonMode(false)}
//               className="flex-1 py-2.5 rounded-full border border-white/20 text-text-secondary
//                 text-sm font-bold hover:border-white/40 hover:text-white transition-colors">
//               Cancel
//             </button>
//             <PrimaryButton className="flex-1 justify-center" onClick={handleJsonImport}>
//               Import JSON
//             </PrimaryButton>
//           </div>
//         </div>
//       </Modal>

//       {/* ── Delete confirm ───────────────────────────────────────── */}
//       <Modal isOpen={!!delId} onClose={() => setDelId(null)} title="⚠️ Remove Post" size="sm">
//         <div className="p-5 space-y-4">
//           <p className="text-text-secondary text-sm">
//             Remove this post from the feed? Publish again after to apply changes to the live site.
//           </p>
//           <div className="flex gap-3">
//             <button onClick={() => setDelId(null)}
//               className="flex-1 py-2.5 rounded-full border border-white/20 text-text-secondary
//                 text-sm font-bold hover:border-white/40 hover:text-white transition-colors">
//               Cancel
//             </button>
//             <button onClick={confirmDelete}
//               className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm font-bold
//                 hover:bg-red-600 transition-colors">
//               Remove Post
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default AdminSocialFeedPage;