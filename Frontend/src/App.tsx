import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

import { UserDashboardPage } from './pages/user/UserDashboardPage';
import { BrowserActivityPage } from './pages/user/BrowserActivityPage';
import { UserAlertsPage } from './pages/user/UserAlertsPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSessionsPage } from './pages/admin/AdminSessionsPage';
import { AdminAlertsPage } from './pages/admin/AdminAlertsPage';
import { AdminPoliciesPage } from './pages/admin/AdminPoliciesPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected User Dashboard Routes */}
          <Route element={<ProtectedRoute requireAdmin={false} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/activity" element={<BrowserActivityPage />} />
              <Route path="/alerts" element={<UserAlertsPage />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/sessions" element={<AdminSessionsPage />} />
              <Route path="/admin/alerts" element={<AdminAlertsPage />} />
              <Route path="/admin/policies" element={<AdminPoliciesPage />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
            </Route>
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
