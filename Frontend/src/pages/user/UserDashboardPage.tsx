import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { browserService } from '../../services/browser.service';
import { alertService } from '../../services/alert.service';
import { userService } from '../../services/user.service';
import { BrowserSession, AlertDto } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { RiskBadge } from '../../components/common/RiskBadge';
import { formatDate, formatDuration } from '../../utils/formatters';
import { Shield, Activity, AlertTriangle, Globe, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<BrowserSession[]>([]);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sessionsResp, alertsResp, blockedResp] = await Promise.all([
        browserService.getMySessions(),
        alertService.getMyAlerts(),
        userService.getBlockedDomains(),
      ]);

      if (sessionsResp.success) setSessions(sessionsResp.data || []);
      if (alertsResp.success) setAlerts(alertsResp.data || []);
      if (blockedResp) setBlockedDomains(blockedResp.blockedDomains || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load telemetry dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <LoadingSpinner message="Loading user governance dashboard..." />;

  const aiSessionsCount = sessions.filter((s) => s.siteType === 'ai_website' || s.siteType === 'ai_capable_website').length;
  const activeAlertsCount = alerts.filter((a) => a.status === 'OPEN').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            User Telemetry Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time corporate AI usage telemetry & active security status
          </p>
        </div>
        <div className="text-right text-xs text-slate-400">
          Account: <span className="text-white font-semibold">{user?.email}</span> ({user?.orgId})
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchData} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800">
            <Activity className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sessions</div>
            <div className="text-2xl font-bold text-white mt-1">{sessions.length}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-950 text-purple-400 rounded-lg border border-purple-800">
            <Cpu className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Tool Visits</div>
            <div className="text-2xl font-bold text-white mt-1">{aiSessionsCount}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-rose-950 text-rose-400 rounded-lg border border-rose-800">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Alerts</div>
            <div className="text-2xl font-bold text-white mt-1">{activeAlertsCount}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-950 text-amber-400 rounded-lg border border-amber-800">
            <Globe className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Blocked Policy Domains</div>
            <div className="text-2xl font-bold text-white mt-1">{blockedDomains.length}</div>
          </div>
        </div>
      </div>

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Recent Browsing Telemetry
            </h3>
            <Link to="/activity" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              View All ({sessions.length}) →
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No browser activity sessions recorded yet. Telemetry will sync when the Chrome extension is active.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Domain</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">AI Capability</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Start Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sessions.slice(0, 5).map((s) => (
                    <tr key={s.sessionId} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-medium text-white">{s.domain}</td>
                      <td className="py-2.5 px-3">{s.siteCategory || 'unknown'}</td>
                      <td className="py-2.5 px-3">
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
                      <td className="py-2.5 px-3">{formatDuration(s.duration)}</td>
                      <td className="py-2.5 px-3 text-slate-400">{formatDate(s.startTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security Alerts Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Active Alerts ({activeAlertsCount})
            </h3>
            <Link to="/alerts" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Manage →
            </Link>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              <Shield className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              No security governance alerts. Operations normal.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {alerts.slice(0, 4).map((a) => (
                <div key={a.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <RiskBadge level={a.riskLevel} />
                    <span className="text-[10px] text-slate-500">{formatDate(a.createdAt)}</span>
                  </div>
                  <div className="font-semibold text-white">{a.domain}</div>
                  <div className="text-slate-400 line-clamp-2 text-[11px]">{a.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
