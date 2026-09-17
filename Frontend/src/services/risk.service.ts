import { apiFetch } from '../api/client';
import { ApiResponse, RiskResponseDto } from '../types';

export const riskService = {
  async getRiskForSession(sessionId: string): Promise<ApiResponse<RiskResponseDto>> {
    return apiFetch<ApiResponse<RiskResponseDto>>(`/api/v1/risk/sessions/${sessionId}`);
  },

  async getRiskByLevel(level: string): Promise<ApiResponse<RiskResponseDto[]>> {
    return apiFetch<ApiResponse<RiskResponseDto[]>>(`/api/v1/risk/level/${level}`);
  },
};
