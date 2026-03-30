import api from './api';
import type { User } from '../types/user.types';
import type { Order } from '../types/order.types';
import type { Offer } from '../types/offer.types';

// ─── Auth Service ─────────────────────────────────────────────
export const authService = {
  sendOtp: async (phone: string) => {
    const { data } = await api.post('/auth/send-otp', { phone });
    return data;
  },
  verifyOtp: async (phone: string, otp: string) => {
    const { data } = await api.post('/auth/verify-otp', { phone, otp });
    return data; // { user, token }
  },
  createProfile: async (name: string) => {
    const { data } = await api.post('/auth/profile', { name });
    return data as User;
  },
  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data as User;
  },
  updateProfile: async (updates: Partial<User>) => {
    const { data } = await api.put('/auth/profile', updates);
    return data as User;
  },
  adminLogin: async (staffId: string, password: string, isMainAdmin: boolean) => {
    const { data } = await api.post('/auth/admin-login', { staffId, password, isMainAdmin });
    return data;
  },
  logout: async () => {
    await api.post('/auth/logout');
  },
};

// ─── Order Service ────────────────────────────────────────────
export const orderService = {
  placeOrder: async (orderData: Partial<Order>) => {
    const { data } = await api.post('/orders', orderData);
    return data as Order;
  },
  getOrderById: async (id: string) => {
    const { data } = await api.get(`/orders/${id}`);
    return data as Order;
  },
  getOrderStatus: async (id: string) => {
    const { data } = await api.get(`/orders/${id}/status`);
    return data as { status: Order['status']; estimatedMinutes: number };
  },
  getUserOrders: async () => {
    const { data } = await api.get('/orders/mine');
    return data as Order[];
  },
  getDeliveryEstimate: async (lat: number, lng: number) => {
    const { data } = await api.get(`/delivery/estimate?lat=${lat}&lng=${lng}`);
    return data as { minutes: number; fee: number };
  },
  generateUpiLink: async (orderId: string, amount: number) => {
    const { data } = await api.post('/payments/upi/generate', { orderId, amount });
    return data as { upiLink: string; qrDataUrl: string; upiId: string };
  },
  verifyPayment: async (orderId: string) => {
    const { data } = await api.get(`/payments/upi/verify/${orderId}`);
    return data as { paid: boolean };
  },
};

// ─── Offer Service ────────────────────────────────────────────
export const offerService = {
  getActiveOffers: async () => {
    const { data } = await api.get('/offers/active');
    return data as Offer[];
  },
  validateCoupon: async (code: string, subtotal: number) => {
    const { data } = await api.post('/offers/validate', { code, subtotal });
    return data as { valid: boolean; discount: number; message?: string };
  },
};

// ─── Social Service ───────────────────────────────────────────
export const socialService = {
  getInstagramPosts: async () => {
    const { data } = await api.get('/social/instagram');
    return data as {
      id: string;
      imageUrl: string;
      caption: string;
      likes: number;
      timestamp: string;
      permalink: string;
    }[];
  },
  getFeaturedReviews: async () => {
    const { data } = await api.get('/reviews/featured');
    return data as {
      id: string;
      name: string;
      rating: number;
      text: string;
      date: string;
      avatar?: string;
    }[];
  },
};

// ─── Admin Service ────────────────────────────────────────────
export const adminService = {
  getDashboardStats: async () => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },
  getSalesData: async (range: 'week' | 'month' | 'year') => {
    const { data } = await api.get(`/admin/reports/sales?range=${range}`);
    return data;
  },
  getAllOrders: async (status?: string) => {
    const { data } = await api.get(`/admin/orders${status ? `?status=${status}` : ''}`);
    return data as Order[];
  },
  updateOrderStatus: async (orderId: string, status: string, eta?: number) => {
    const { data } = await api.put(`/admin/orders/${orderId}/status`, { status, eta });
    return data;
  },
  getAllUsers: async () => {
    const { data } = await api.get('/admin/users');
    return data;
  },
  getDeliverySettings: async () => {
    const { data } = await api.get('/admin/delivery/settings');
    return data;
  },
  updateDeliverySettings: async (settings: object) => {
    const { data } = await api.put('/admin/delivery/settings', settings);
    return data;
  },
  createOffer: async (offer: Partial<Offer>) => {
    const { data } = await api.post('/admin/offers', offer);
    return data as Offer;
  },
  updateOffer: async (id: string, updates: Partial<Offer>) => {
    const { data } = await api.put(`/admin/offers/${id}`, updates);
    return data as Offer;
  },
  deleteOffer: async (id: string) => {
    await api.delete(`/admin/offers/${id}`);
  },
  downloadReport: async (from: string, to: string, type: 'csv' | 'pdf') => {
    const response = await api.get(`/admin/reports/download?from=${from}&to=${to}&type=${type}`, {
      responseType: 'blob',
    });
    return response.data;
  },
  sendWhatsAppBroadcast: async (userIds: string[], message: string) => {
    const { data } = await api.post('/admin/notifications/whatsapp', { userIds, message });
    return data;
  },
};
