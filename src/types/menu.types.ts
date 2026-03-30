// menu.types.ts
export interface MenuCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  gallery: string[];
  itemCount: number;
  sortOrder: number;
  isActive: boolean;
}

export interface SizeVariant {
  label: string; // e.g. "350ml" | "500ml"
  price: number;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  categorySlug: string;
  name: string;
  description: string;
  image: string;
  gallery: string[];
  isVeg: boolean;
  isBestSeller: boolean;
  isAvailable: boolean;
  basePrice: number;
  sizes?: SizeVariant[];
  addOns?: AddOn[];
  tags: string[];
  offerId?: string;
}

export interface MenuFilters {
  search: string;
  type: 'all' | 'veg' | 'nonveg';
  tag: 'all' | 'bestseller' | 'offer';
}

// Re-export from separate files for convenience
export type { Order, OrderItem, OrderStatus, DeliveryInfo } from './order.types';
export type { User, Address } from './user.types';
export type { Offer } from './offer.types';
