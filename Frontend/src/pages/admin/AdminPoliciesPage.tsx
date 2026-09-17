import React, { useEffect, useState } from 'react';
import { policyService } from '../../services/policy.service';
import { PolicyDto } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ShieldCheck, Plus, Edit, Trash2, X, CheckCircle, XCircle } from 'lucide-react';

export const AdminPoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyDto | null>(null);
  const [formData, setFormData] = useState<PolicyDto>({
    name: '',
    description: '',
    domainPattern: '',
    minRiskLevel: 'HIGH',
    action: 'ALERT',
    enabled: true,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchPolicies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await policyService.getAllPolicies();
      if (resp.success) {
        setPolicies(resp.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch governance policies.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingPolicy(null);
    setFormData({
      name: '',
      description: '',
      domainPattern: '*openai.com*',
      minRiskLevel: 'HIGH',
      action: 'ALERT',
      enabled: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (policy: PolicyDto) => {
    setEditingPolicy(policy);
    setFormData({ ...policy });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeletePolicy = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this governance policy rule?')) return;

    try {
      const resp = await policyService.deletePolicy(id);
      if (resp.success) {
        setPolicies((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete policy.');
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name || !formData.domainPattern) {
      setFormError('Policy Name and Domain Pattern are required.');
      return;
    }

    try {
      if (editingPolicy && editingPolicy.id) {
        const resp = await policyService.updatePolicy(editingPolicy.id, formData);
        if (resp.success) {
          setPolicies((prev) => prev.map((p) => (p.id === editingPolicy.id ? resp.data : p)));
        }
      } else {
        const resp = await policyService.createPolicy(formData);
        if (resp.success) {
          setPolicies((prev) => [...prev, resp.data]);
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save governance policy rule.');
    }
  };

  if (isLoading) return <LoadingSpinner message="Fetching enterprise policy rules..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Governance Policy Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data-driven enterprise AI security policies and risk escalation thresholds
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Policy Rule
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchPolicies} />}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {policies.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">No governance policy rules configured.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Policy Name</th>
                  <th className="py-3 px-4">Domain Pattern</th>
                  <th className="py-3 px-4">Min Risk Threshold</th>
                  <th className="py-3 px-4">Policy Action</th>
                  <th className="py-3 px-4">Enabled</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {policies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{p.description}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-indigo-300">{p.domainPattern}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-amber-400">{p.minRiskLevel}</span>
                    </td>
                    <td className="py-3 px-4 font-bold uppercase">{p.action}</td>
                    <td className="py-3 px-4">
                      {p.enabled ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> Enabled
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 px-2.5 py-1 rounded"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => p.id && handleDeletePolicy(p.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 px-2.5 py-1 rounded"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Policy Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-slate-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
              {editingPolicy ? 'Edit Governance Policy Rule' : 'Create Governance Policy Rule'}
            </h3>

            {formError && <ErrorAlert message={formError} />}

            <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Policy Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Unapproved AI Tool Block Rule"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short explanation of rule rationale"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Domain Pattern (Regex or Wildcard)</label>
                <input
                  type="text"
                  required
                  value={formData.domainPattern}
                  onChange={(e) => setFormData({ ...formData, domainPattern: e.target.value })}
                  placeholder="*openai.com*"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Min Risk Level</label>
                  <select
                    value={formData.minRiskLevel}
                    onChange={(e) => setFormData({ ...formData, minRiskLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Policy Action</label>
                  <select
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="ALERT">ALERT</option>
                    <option value="BLOCK">BLOCK</option>
                    <option value="MONITOR">MONITOR</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600"
                />
                <label htmlFor="enabled" className="font-semibold text-slate-300">
                  Enable policy rule immediately
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-md"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
