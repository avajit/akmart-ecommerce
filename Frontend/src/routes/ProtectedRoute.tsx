import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const rawRole = (user?.roleName || (user as any)?.role?.name || user?.role || '').toUpperCase();
  if (allowedRoles && user) {
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
    if (!normalizedAllowed.includes(rawRole)) {
      if (rawRole === 'SELLER') return <Navigate to="/seller/dashboard" replace />;
      if (rawRole === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
