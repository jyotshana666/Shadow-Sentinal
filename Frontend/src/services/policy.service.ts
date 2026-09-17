import { apiFetch } from '../api/client';
import { ApiResponse, PolicyDto } from '../types';

export const policyService = {
  async getAllPolicies(): Promise<ApiResponse<PolicyDto[]>> {
    return apiFetch<ApiResponse<PolicyDto[]>>('/api/v1/policies');
  },

  async getPolicyById(id: string): Promise<ApiResponse<PolicyDto>> {
    return apiFetch<ApiResponse<PolicyDto>>(`/api/v1/policies/${id}`);
  },

  async createPolicy(policy: PolicyDto): Promise<ApiResponse<PolicyDto>> {
    return apiFetch<ApiResponse<PolicyDto>>('/api/v1/policies', {
      method: 'POST',
      body: JSON.stringify(policy),
    });
  },

  async updatePolicy(id: string, policy: PolicyDto): Promise<ApiResponse<PolicyDto>> {
    return apiFetch<ApiResponse<PolicyDto>>(`/api/v1/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(policy),
    });
  },

  async deletePolicy(id: string): Promise<ApiResponse<void>> {
    return apiFetch<ApiResponse<void>>(`/api/v1/policies/${id}`, {
      method: 'DELETE',
    });
  },
};
