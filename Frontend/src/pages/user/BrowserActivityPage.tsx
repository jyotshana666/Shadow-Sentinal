import React, { useEffect, useState } from 'react';
import { browserService } from '../../services/browser.service';
import { classificationService } from '../../services/classification.service';
import { riskService } from '../../services/risk.service';
import { BrowserSession, ClassificationResponseDto, RiskResponseDto } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { RiskBadge } from '../../components/common/RiskBadge';
import { formatDate, formatDuration, formatNumber } from '../../utils/formatters';
import { Activity, Search, Info, X, Zap, Cpu } from 'lucide-react';

export const BrowserActivityPage: React.FC = () => {
  const [sessions, setSessions] = useState<BrowserSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<BrowserSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for session detail inspection
  const [selectedSession, setSelectedSession] = useState<BrowserSession | null>(null);
  const [classification, setClassification] = useState<ClassificationResponseDto | null>(null);
  const [risk, setRisk] = useState<RiskResponseDto | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await browserService.getMySessions();
      if (resp.success) {
        setSessions(resp.data || []);
        setFilteredSessions(resp.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch browser activity telemetry.');
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
            s.siteCategory?.toLowerCase().includes(query) ||
            s.siteType?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, sessions]);

  const handleInspectSession = async (session: BrowserSession) => {
    setSelectedSession(session);
    setClassification(null);
    setRisk(null);
    setIsDetailLoading(true);

    try {
      const [classResp, riskResp] = await Promise.all([
        classificationService.getClassificationForSession(session.sessionId).catch(() => null),
        riskService.getRiskForSession(session.sessionId).catch(() => null),
      ]);

      if (classResp && classResp.success) setClassification(classResp.data);
      if (riskResp && riskResp.success) setRisk(riskResp.data);
    } catch (e) {
      // Ignore inspection error
    } finally {
      setIsDetailLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Fetching user telemetry sessions..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Browser Activity Sessions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Telemetry logs captured by Shadow Sentinel Extension edge collectors
          </p>
        </div>

        {/* Filter Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter by domain or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchSessions} />}

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">
            No matching session telemetry logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Site Type</th>
                  <th className="py-3 px-4">AI Category</th>
                  <th className="py-3 px-4">Interactions</th>
                  <th className="py-3 px-4">SSE Stream</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Start Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSessions.map((s) => (
                  <tr key={s.sessionId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{s.domain}</td>
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
                    <td className="py-3 px-4 font-mono">{s.interactionCount}</td>
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
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleInspectSession(s)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-800 px-2.5 py-1 rounded transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Session Details Inspection Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-200">
            <button
              onClick={() => setSelectedSession(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                Session Telemetry Inspection
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Session ID: {selectedSession.sessionId}
              </p>
            </div>

            {isDetailLoading ? (
              <LoadingSpinner message="Retrieving Classification & Risk evidence..." />
            ) : (
              <div className="space-y-4 text-xs">
                {/* Session Attributes */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Domain</span>
                    <span className="font-semibold text-white text-sm">{selectedSession.domain}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Category</span>
                    <span className="font-semibold text-slate-200">{selectedSession.siteCategory}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Start / End Time</span>
                    <span>{formatDate(selectedSession.startTime)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Duration & Visits</span>
                    <span>{formatDuration(selectedSession.duration)} ({selectedSession.visitCount} visits)</span>
                  </div>
                </div>

                {/* Classification Decision */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
                    Classification Engine Decision
                  </h4>
                  {classification ? (
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>Site Type: <span className="font-mono text-purple-300">{classification.siteType}</span></div>
                      <div>AI Capability: <span className="font-mono text-indigo-300">{classification.aiCapability}</span></div>
                      <div>Generation Active: <span className="font-mono">{classification.generationActive ? 'YES' : 'NO'}</span></div>
                      <div>Classification Source: <span className="font-mono text-slate-400">{classification.classifiedBy}</span></div>
                      <div className="col-span-2 mt-1">
                        Confidence Score: <span className="font-bold text-white">{classification.confidenceScore}%</span>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${Math.min(classification.confidenceScore, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">No classification record returned by backend.</div>
                  )}
                </div>

                {/* Risk Evaluation */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
                      Risk Assessment & Policy Evaluation
                    </h4>
                    {risk && <RiskBadge level={risk.riskLevel} />}
                  </div>
                  {risk ? (
                    <div className="space-y-1 mt-2">
                      <div className="text-slate-400 font-semibold mb-1">Explainable Governance Reasons:</div>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {risk.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">No risk assessment record returned by backend.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
