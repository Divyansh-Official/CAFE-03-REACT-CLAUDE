export interface Address {
  id: string;
  label: string; // 'Home' | 'Work' | 'Other'
  name: string;
  phone: string;
  fullAddress: string;
  landmark?: string;
  pincode: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  addresses: Address[];
  role: 'user' | 'staff' | 'main_admin';
  isWhatsAppEnabled: boolean;
  totalOrders: number;
  totalSpent: number;
  memberSince: string;
  lastOrderAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
