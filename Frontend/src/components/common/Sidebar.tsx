import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Activity,
  Cpu,
  AlertTriangle,
  Users,
  ShieldCheck,
  FileText,
  Lock
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase px-3 mb-2">
        User Navigation
      </div>
      <nav className="space-y-1 mb-6">
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/activity" className={linkClass}>
          <Activity className="w-4 h-4" aria-hidden="true" />
          <span>Browser Activity</span>
        </NavLink>
        <NavLink to="/alerts" className={linkClass}>
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          <span>My Alerts</span>
        </NavLink>
      </nav>

      {isAdmin && (
        <>
          <div className="text-[10px] font-mono tracking-wider text-indigo-400 uppercase px-3 mb-2 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Admin Console</span>
          </div>
          <nav className="space-y-1">
            <NavLink to="/admin/dashboard" className={linkClass}>
              <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
              <span>Admin Overview</span>
            </NavLink>
            <NavLink to="/admin/users" className={linkClass}>
              <Users className="w-4 h-4" aria-hidden="true" />
              <span>User Accounts</span>
            </NavLink>
            <NavLink to="/admin/sessions" className={linkClass}>
              <Activity className="w-4 h-4" aria-hidden="true" />
              <span>All Telemetry</span>
            </NavLink>
            <NavLink to="/admin/alerts" className={linkClass}>
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              <span>Security Alerts</span>
            </NavLink>
            <NavLink to="/admin/policies" className={linkClass}>
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Policy Rules</span>
            </NavLink>
            <NavLink to="/admin/audit-logs" className={linkClass}>
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>Audit Logs</span>
            </NavLink>
          </nav>
        </>
      )}

      <div className="mt-auto pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        Shadow Sentinel Corporate Governance &copy; 2026
      </div>
    </aside>
  );
};
