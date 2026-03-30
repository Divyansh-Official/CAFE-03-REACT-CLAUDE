import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique cart entry id
  menuItemId: string;
  name: string;
  image: string;
  size?: string;
  sizePrice?: number;
  addOns: { id: string; name: string; price: number }[];
  quantity: number;
  unitPrice: number;
  isVeg: boolean;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string;
  discount: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: '',
      discount: 0,

      addItem: (item) => {
        const id = `${item.menuItemId}-${item.size ?? 'default'}-${Date.now()}`;
        // Check if same item+size exists
        const existing = get().items.find(
          (i) => i.menuItemId === item.menuItemId && i.size === item.size
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, { ...item, id }] }));
        }
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
        }));
      },

      clearCart: () => set({ items: [], couponCode: '', discount: 0 }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      applyCoupon: (code, discount) => set({ couponCode: code, discount }),
      removeCoupon: () => set({ couponCode: '', discount: 0 }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const gst = subtotal * 0.05;
        const delivery = subtotal > 0 ? 40 : 0;
        return subtotal + gst + delivery - get().discount;
      },

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'bobba-cart',
      partialize: (state) => ({ items: state.items, couponCode: state.couponCode, discount: state.discount }),
    }
  )
);
