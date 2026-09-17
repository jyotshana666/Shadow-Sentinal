import { apiFetch } from '../api/client';
import { ApiResponse, AlertDto } from '../types';

export const alertService = {
  async getMyAlerts(): Promise<ApiResponse<AlertDto[]>> {
    return apiFetch<ApiResponse<AlertDto[]>>('/api/v1/alerts/my');
  },

  async getAllAlerts(): Promise<ApiResponse<AlertDto[]>> {
    return apiFetch<ApiResponse<AlertDto[]>>('/api/v1/alerts');
  },

  async updateAlertStatus(alertId: string, status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'): Promise<ApiResponse<AlertDto>> {
    return apiFetch<ApiResponse<AlertDto>>(`/api/v1/alerts/${alertId}/status?status=${status}`, {
      method: 'PATCH',
    });
  },
};
