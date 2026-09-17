import React, { useEffect, useState } from 'react';
import { userService } from '../../services/user.service';
import { UserResponseDto } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { formatDate } from '../../utils/formatters';
import { Users, Shield, CheckCircle } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await userService.getAllUsers();
      if (resp.success) {
        setUsers(resp.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user accounts list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) return <LoadingSpinner message="Fetching user accounts list..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Enterprise User Accounts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registered corporate user identities and assigned authorization roles
          </p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchUsers} />}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {users.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">No user accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3 text-purple-400" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{u.orgId}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" /> {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
