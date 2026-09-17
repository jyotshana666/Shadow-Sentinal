import { apiFetch } from '../api/client';
import { ApiResponse, AuthResponseDto, UserResponseDto } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponseDto> {
    return apiFetch<AuthResponseDto>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, password: string, role?: string, orgId?: string): Promise<ApiResponse<AuthResponseDto>> {
    return apiFetch<ApiResponse<AuthResponseDto>>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role, orgId }),
    });
  },

  async getCurrentUser(): Promise<ApiResponse<UserResponseDto>> {
    return apiFetch<ApiResponse<UserResponseDto>>('/api/v1/users/me');
  },
};
