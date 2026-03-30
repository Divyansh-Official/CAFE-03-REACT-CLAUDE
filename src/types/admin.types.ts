export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  byCategory: Record<string, number>;
}

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  activeOffers: number;
  totalUsers: number;
  totalMenuItems: number;
  instagramFollowers: number;
}

export interface StaffMember {
  id: string;
  name: string;
  staffId: string;
  role: 'staff' | 'main_admin';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface DeliverySettings {
  radiusKm: number;
  isKitchenBusy: boolean;
  extraBusyMinutes: number;
  feeTiers: { upToKm: number; fee: number }[];
}

export interface AdminReport {
  fromDate: string;
  toDate: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topItems: { name: string; count: number; revenue: number }[];
  categoryBreakdown: Record<string, number>;
}
