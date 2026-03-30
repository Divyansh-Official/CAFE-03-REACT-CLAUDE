import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore, collection, getDocs, addDoc, deleteDoc,
  doc, query, where, orderBy, Firestore,
} from 'firebase/firestore';
import {
  getStorage, ref, uploadString, getDownloadURL, deleteObject, type FirebaseStorage,
} from 'firebase/storage';

// ── Firebase config ────────────────────────────────────────────
// Replace these values with your actual Firebase project settings.
// In production, load from environment variables (VITE_FIREBASE_*).
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            ?? '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        ?? '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         ?? '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             ?? '',
};

// Initialise only once
let app: FirebaseApp;
let db:  Firestore;
let storage: FirebaseStorage;

const isConfigured = !!firebaseConfig.projectId;

if (isConfigured) {
  app     = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db      = getFirestore(app);
  storage = getStorage(app);
}

// ── Types ──────────────────────────────────────────────────────
export interface GalleryImage {
  id:          string;
  category:    string;   // 'drinks' | 'bingsu' | 'food' | 'cafe' | 'all'
  url:         string;
  caption?:    string;
  addedBy:     string;   // admin uid
  addedAt:     string;   // ISO string
}

export interface FirebaseMenuImage {
  itemId:   string;
  imageUrl: string;
}

// ── Gallery service ────────────────────────────────────────────
export const galleryService = {
  /**
   * Fetch all gallery images, optionally filtered by category.
   * Falls back to empty array if Firebase is not configured.
   */
  getImages: async (category?: string): Promise<GalleryImage[]> => {
    if (!isConfigured) {
      console.warn('[Firebase] Not configured — gallery will be empty.');
      return [];
    }
    try {
      const col = collection(db, 'gallery');
      const q   = category && category !== 'all'
        ? query(col, where('category', '==', category), orderBy('addedAt', 'desc'))
        : query(col, orderBy('addedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImage));
    } catch (err) {
      console.error('[Firebase] getImages error:', err);
      return [];
    }
  },

  /** Add a gallery image (main admin only) */
  addImage: async (data: Omit<GalleryImage, 'id'>): Promise<string> => {
    if (!isConfigured) throw new Error('Firebase not configured');
    const ref = await addDoc(collection(db, 'gallery'), data);
    return ref.id;
  },

  /** Delete a gallery image */
  deleteImage: async (id: string): Promise<void> => {
    if (!isConfigured) throw new Error('Firebase not configured');
    await deleteDoc(doc(db, 'gallery', id));
  },
};

// ── Menu image service ─────────────────────────────────────────
export const menuImageService = {
  /**
   * Get the Firebase image URL for a menu item.
   * Returns null if not found — caller should fall back to item.image.
   */
  getImageUrl: async (itemId: string): Promise<string | null> => {
    if (!isConfigured) return null;
    try {
      const col  = collection(db, 'menuImages');
      const q    = query(col, where('itemId', '==', itemId));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return (snap.docs[0].data() as FirebaseMenuImage).imageUrl;
    } catch {
      return null;
    }
  },

  /** Save or update a menu item's image URL */
  setImageUrl: async (itemId: string, imageUrl: string): Promise<void> => {
    if (!isConfigured) throw new Error('Firebase not configured');
    await addDoc(collection(db, 'menuImages'), { itemId, imageUrl });
  },
};

export { isConfigured };
