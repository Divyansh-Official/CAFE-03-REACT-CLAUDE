import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'user' | 'staff' | 'main_admin';
}

export const RouteGuard: React.FC<Props> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location, showAuth: true }} replace />;
  }

  if (requiredRole === 'main_admin' && user?.role !== 'main_admin') {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole === 'staff' && !['staff', 'main_admin'].includes(user?.role ?? '')) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
