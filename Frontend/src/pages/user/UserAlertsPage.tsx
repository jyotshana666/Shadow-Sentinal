import React, { useEffect, useState } from 'react';
import { alertService } from '../../services/alert.service';
import { AlertDto } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { RiskBadge } from '../../components/common/RiskBadge';
import { formatDate } from '../../utils/formatters';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const UserAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await alertService.getMyAlerts();
      if (resp.success) {
        setAlerts(resp.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user security alerts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (isLoading) return <LoadingSpinner message="Loading user security alerts..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Security Governance Alerts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Governance policy warnings triggered by high-risk browser telemetry
          </p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchAlerts} />}

      {alerts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Active Governance Alerts</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Your browsing telemetry currently adheres to enterprise AI governance policies.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-3">
                  <RiskBadge level={alert.riskLevel} />
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      alert.status === 'OPEN'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : alert.status === 'ACKNOWLEDGED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    STATUS: {alert.status}
                  </span>
                </div>
                <div className="text-base font-bold text-white mt-2">{alert.domain}</div>
                <div className="text-xs text-slate-300">{alert.reason}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-2">
                  <Clock className="w-3.5 h-3.5" /> Triggered on {formatDate(alert.createdAt)}
                  {alert.resolvedAt && <span>• Resolved on {formatDate(alert.resolvedAt)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
