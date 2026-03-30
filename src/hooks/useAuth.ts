// ─── useAuth ──────────────────────────────────────────────────

import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/allServices';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, clearAuth, updateUser } = useAuthStore();

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    clearAuth();
    toast.success('Logged out successfully');
  }, [clearAuth]);

  const isAdmin = user?.role === 'main_admin' || user?.role === 'staff';
  const isMainAdmin = user?.role === 'main_admin';

  return { user, token, isAuthenticated, setAuth, clearAuth, updateUser, logout, isAdmin, isMainAdmin };
};