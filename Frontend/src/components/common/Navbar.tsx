import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-900 text-white h-16 flex items-center justify-between px-6 border-b border-slate-800 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Shield className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wide flex items-center gap-2">
            Shadow Sentinel
            <span className="text-xs bg-slate-800 text-indigo-400 border border-slate-700 px-2 py-0.5 rounded">
              Gov Engine v1.0
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 text-sm border-r border-slate-700 pr-4">
            <div className="bg-slate-800 p-1.5 rounded-full text-slate-300">
              <UserIcon className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-xs text-slate-200">{user.email}</div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-indigo-400">
                ROLE: {user.role} ({user.orgId})
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors"
          aria-label="Log Out"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
