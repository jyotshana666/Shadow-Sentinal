import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Verifying authentication credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-12 bg-white rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">403 — Access Forbidden</h2>
        <p className="text-sm text-slate-600 mt-2">
          Administrative privileges are required to access this resource. Your current account role is standard USER.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
