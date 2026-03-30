// ─── useCart ──────────────────────────────────────────────────

import { useCartStore, CartItem } from '../store/cartStore';
import { formatCurrency } from '../utils/helpers';

export const useCart = () => {
  const store = useCartStore();
  const subtotal = store.getSubtotal();
  const gst = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const total = subtotal + gst + deliveryFee - store.discount;

  return {
    ...store,
    subtotal,
    gst,
    deliveryFee,
    total,
    formattedTotal: formatCurrency(total),
    isEmpty: store.items.length === 0,
  };
};

// ─── useMenu ──────────────────────────────────────────────────
import { useQuery } from '@tanstack/react-query';
import { menuService } from '../services/menuService';

export const useMenu = () => {
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: menuService.getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const featured = useQuery({
    queryKey: ['featured-items'],
    queryFn: menuService.getFeaturedItems,
    staleTime: 5 * 60 * 1000,
  });

  return { categories, featured };
};

export const useCategory = (slug: string) => {
  const category = useQuery({
    queryKey: ['category', slug],
    queryFn: () => menuService.getCategoryBySlug(slug),
    enabled: !!slug,
  });

  const items = useQuery({
    queryKey: ['category-items', slug],
    queryFn: () => menuService.getItemsByCategory(slug),
    enabled: !!slug,
  });

  return { category, items };
};

// ─── useOffers ────────────────────────────────────────────────
import { useEffect } from 'react';
import { offerService } from '../services/allServices';
import { useOfferStore } from '../store/offerStore';

export const useOffers = () => {
  const { activeOffers, setActiveOffers, getOfferForItem, getOfferForCategory } = useOfferStore();

  const query = useQuery({
    queryKey: ['active-offers'],
    queryFn: offerService.getActiveOffers,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) setActiveOffers(query.data);
  }, [query.data, setActiveOffers]);

  return { activeOffers, getOfferForItem, getOfferForCategory, isLoading: query.isLoading };
};

// ─── useOrders ────────────────────────────────────────────────
import { useState, useRef, useCallback } from 'react';
import { orderService } from '../services/allServices';
import { Order } from '../types/order.types';

export const useOrders = () => {
  const orders = useQuery({
    queryKey: ['my-orders'],
    queryFn: orderService.getUserOrders,
    staleTime: 2 * 60 * 1000,
  });

  return { orders };
};

export const useOrderTracking = (orderId: string | undefined) => {
  const [status, setStatus] = useState<Order['status'] | null>(null);
  const [eta, setEta] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const poll = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await orderService.getOrderStatus(orderId);
      setStatus(res.status);
      setEta(res.estimatedMinutes);
    } catch { /* ignore */ }
  }, [orderId]);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, 30_000);
    return () => clearInterval(intervalRef.current);
  }, [poll]);

  return { status, eta };
};

// ─── useAdmin ────────────────────────────────────────────────
import { adminService } from '../services/allServices';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useAdmin = () => {
  const queryClient = useQueryClient();

  const dashboard = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.getDashboardStats,
    staleTime: 60_000,
  });

  const allOrders = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminService.getAllOrders(),
    staleTime: 30_000,
  });

  const allUsers = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getAllUsers,
    staleTime: 2 * 60_000,
  });

  const updateOrderStatus = async (orderId: string, status: string, eta?: number) => {
    try {
      await adminService.updateOrderStatus(orderId, status, eta);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order');
    }
  };

  return { dashboard, allOrders, allUsers, updateOrderStatus };
};