import { apiFetch } from '../api/client';
import { ApiResponse, BrowserSession } from '../types';

export const browserService = {
  async getMySessions(): Promise<ApiResponse<BrowserSession[]>> {
    return apiFetch<ApiResponse<BrowserSession[]>>('/api/v1/browser/sessions/my');
  },

  async getAllSessions(): Promise<ApiResponse<BrowserSession[]>> {
    return apiFetch<ApiResponse<BrowserSession[]>>('/api/v1/browser/sessions');
  },
};
