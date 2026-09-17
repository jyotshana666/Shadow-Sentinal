import React, { useEffect, useState } from 'react';
import { auditService } from '../../services/audit.service';
import { AuditLog } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { formatDate } from '../../utils/formatters';
import { FileText, Search } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await auditService.getAllAuditLogs();
      if (resp.success) {
        setLogs(resp.data || []);
        setFilteredLogs(resp.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch administrative audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLogs(logs);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredLogs(
        logs.filter(
          (l) =>
            l.actor.toLowerCase().includes(query) ||
            l.action.toLowerCase().includes(query) ||
            l.target?.toLowerCase().includes(query) ||
            l.details?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, logs]);

  if (isLoading) return <LoadingSpinner message="Fetching administrative security audit logs..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Administrative Security Audit Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable audit record of administrative operations and telemetry ingestion
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search actor, action, details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchLogs} />}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">No audit log records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-indigo-400 font-mono text-[11px]">{log.action}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{log.actor}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{log.target}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-md truncate">{log.details}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(log.timestamp)}</td>
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
