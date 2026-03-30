import { create } from 'zustand';
import type { Offer } from '../types/offer.types';

interface OfferStore {
  activeOffers: Offer[];
  setActiveOffers: (offers: Offer[]) => void;
  getOfferForItem: (itemId: string) => Offer | undefined;
  getOfferForCategory: (categoryId: string) => Offer | undefined;
}

export const useOfferStore = create<OfferStore>((set, get) => ({
  activeOffers: [],
  setActiveOffers: (offers) => set({ activeOffers: offers }),
  getOfferForItem: (itemId) =>
    get().activeOffers.find((o) => o.applicableItemIds.includes(itemId)),
  getOfferForCategory: (categoryId) =>
    get().activeOffers.find((o) => o.applicableCategoryIds.includes(categoryId)),
}));
