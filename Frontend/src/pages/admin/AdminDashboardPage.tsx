import React, { useEffect, useState } from 'react';
import { userService } from '../../services/user.service';
import { browserService } from '../../services/browser.service';
import { alertService } from '../../services/alert.service';
import { policyService } from '../../services/policy.service';
import { auditService } from '../../services/audit.service';
import { UserResponseDto, BrowserSession, AlertDto, PolicyDto, AuditLog } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { RiskBadge } from '../../components/common/RiskBadge';
import { formatDate } from '../../utils/formatters';
import { Users, Activity, AlertTriangle, ShieldCheck, FileText, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [sessions, setSessions] = useState<BrowserSession[]>([]);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [policies, setPolicies] = useState<PolicyDto[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersResp, sessionsResp, alertsResp, policiesResp, auditResp] = await Promise.all([
        userService.getAllUsers(),
        browserService.getAllSessions(),
        alertService.getAllAlerts(),
        policyService.getAllPolicies(),
        auditService.getAllAuditLogs(),
      ]);

      if (usersResp.success) setUsers(usersResp.data || []);
      if (sessionsResp.success) setSessions(sessionsResp.data || []);
      if (alertsResp.success) setAlerts(alertsResp.data || []);
      if (policiesResp.success) setPolicies(policiesResp.data || []);
      if (auditResp.success) setAuditLogs(auditResp.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load enterprise administrative dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (isLoading) return <LoadingSpinner message="Loading enterprise admin console..." />;

  const openAlertsCount = alerts.filter((a) => a.status === 'OPEN').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            Enterprise Admin Console Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            System-wide user monitoring, policy configuration, and security audits
          </p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchAdminData} />}

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/admin/users" className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 hover:border-slate-700 transition-colors">
          <div className="p-2.5 bg-blue-950 text-blue-400 rounded-lg border border-blue-800">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Users</div>
            <div className="text-xl font-bold text-white mt-0.5">{users.length}</div>
          </div>
        </Link>

        <Link to="/admin/sessions" className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 hover:border-slate-700 transition-colors">
          <div className="p-2.5 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Sessions</div>
            <div className="text-xl font-bold text-white mt-0.5">{sessions.length}</div>
          </div>
        </Link>

        <Link to="/admin/alerts" className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 hover:border-slate-700 transition-colors">
          <div className="p-2.5 bg-rose-950 text-rose-400 rounded-lg border border-rose-800">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Open Alerts</div>
            <div className="text-xl font-bold text-white mt-0.5">{openAlertsCount}</div>
          </div>
        </Link>

        <Link to="/admin/policies" className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 hover:border-slate-700 transition-colors">
          <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Active Policies</div>
            <div className="text-xl font-bold text-white mt-0.5">{policies.length}</div>
          </div>
        </Link>

        <Link to="/admin/audit-logs" className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 hover:border-slate-700 transition-colors">
          <div className="p-2.5 bg-purple-950 text-purple-400 rounded-lg border border-purple-800">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Audit Logs</div>
            <div className="text-xl font-bold text-white mt-0.5">{auditLogs.length}</div>
          </div>
        </Link>
      </div>

      {/* Admin Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Latest System Security Alerts
            </h3>
            <Link to="/admin/alerts" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Manage All →
            </Link>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">No security alerts recorded.</div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 4).map((a) => (
                <div key={a.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <RiskBadge level={a.riskLevel} />
                    <span className="text-[10px] text-slate-500">{formatDate(a.createdAt)}</span>
                  </div>
                  <div className="font-semibold text-white">{a.domain} <span className="text-slate-400 text-[11px]">({a.userEmail})</span></div>
                  <div className="text-slate-400 text-[11px]">{a.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Recent Admin Audit Stream
            </h3>
            <Link to="/admin/audit-logs" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              View All →
            </Link>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">No audit log entries.</div>
          ) : (
            <div className="space-y-2">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-400">{log.action}</span>
                    <span className="text-slate-500">{formatDate(log.timestamp)}</span>
                  </div>
                  <div className="text-slate-300 mt-1">Actor: <code className="text-slate-400">{log.actor}</code></div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{log.details}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
