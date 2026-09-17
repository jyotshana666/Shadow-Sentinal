import { apiFetch } from '../api/client';
import { ApiResponse, UserResponseDto } from '../types';

export const userService = {
  async getAllUsers(): Promise<ApiResponse<UserResponseDto[]>> {
    return apiFetch<ApiResponse<UserResponseDto[]>>('/api/v1/users');
  },

  async getBlockedDomains(): Promise<{ blockedDomains: string[] }> {
    return apiFetch<{ blockedDomains: string[] }>('/api/v1/users/me/blocked-domains');
  },
};
