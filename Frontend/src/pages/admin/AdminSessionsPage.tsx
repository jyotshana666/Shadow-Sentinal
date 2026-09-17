import React, { useEffect, useState } from 'react';
import { browserService } from '../../services/browser.service';
import { BrowserSession } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { formatDate, formatDuration } from '../../utils/formatters';
import { Activity, Search, Zap } from 'lucide-react';

export const AdminSessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<BrowserSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<BrowserSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await browserService.getAllSessions();
      if (resp.success) {
        setSessions(resp.data || []);
        setFilteredSessions(resp.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch all telemetry sessions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSessions(sessions);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredSessions(
        sessions.filter(
          (s) =>
            s.domain.toLowerCase().includes(query) ||
            s.userId?.toLowerCase().includes(query) ||
            s.siteCategory?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, sessions]);

  if (isLoading) return <LoadingSpinner message="Fetching system-wide session telemetry..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            System-Wide Telemetry Sessions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            All browser session telemetry logs captured across corporate accounts
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search domain, user ID, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchSessions} />}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">No session telemetry records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Site Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">SSE Stream</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Start Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSessions.map((s) => (
                  <tr key={s.sessionId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{s.domain}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{s.userId?.substring(0, 8)}...</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded ${
                          s.siteType === 'ai_website' || s.siteType === 'ai_capable_website'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {s.siteType || 'monitored'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{s.siteCategory || 'unknown'}</td>
                    <td className="py-3 px-4">
                      {s.sseDetected ? (
                        <span className="text-amber-400 flex items-center gap-1 font-semibold text-[11px]">
                          <Zap className="w-3 h-3" /> Yes ({s.totalSseEvents})
                        </span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{formatDuration(s.duration)}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(s.startTime)}</td>
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
