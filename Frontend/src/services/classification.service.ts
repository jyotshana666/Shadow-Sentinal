import { apiFetch } from '../api/client';
import { ApiResponse, ClassificationResponseDto } from '../types';

export const classificationService = {
  async getClassificationForSession(sessionId: string): Promise<ApiResponse<ClassificationResponseDto>> {
    return apiFetch<ApiResponse<ClassificationResponseDto>>(`/api/v1/classification/sessions/${sessionId}`);
  },
};
