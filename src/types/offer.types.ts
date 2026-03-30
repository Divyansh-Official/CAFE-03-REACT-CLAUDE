export type OfferType = 'percentage' | 'flat' | 'bogo';

export interface Offer {
  id: string;
  name: string;
  code?: string;
  type: OfferType;
  value: number; // percentage or flat amount
  description: string;
  bannerImage?: string;
  bannerColor?: string;
  applicableItemIds: string[];
  applicableCategoryIds: string[];
  isActive: boolean;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
}
