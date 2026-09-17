import { apiFetch } from '../api/client';
import { ApiResponse, AuditLog } from '../types';

export const auditService = {
  async getAllAuditLogs(): Promise<ApiResponse<AuditLog[]>> {
    return apiFetch<ApiResponse<AuditLog[]>>('/api/v1/admin/audit-logs');
  },
};
