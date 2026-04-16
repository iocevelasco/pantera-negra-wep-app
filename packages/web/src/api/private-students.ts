import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  PrivateStudent,
} from '@pantera-negra/shared';

export const privateStudentsApi = {
  getAll: async (): Promise<PrivateStudent[]> => {
    const response = await apiClient.get<ApiResponse<PrivateStudent[]>>(
      '/api/me/private/students'
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch private students');
    }
    return response.data;
  },

  getById: async (studentId: string): Promise<PrivateStudent & { sessions: any[] }> => {
    const response = await apiClient.get<ApiResponse<PrivateStudent & { sessions: any[] }>>(
      `/api/me/private/students/${studentId}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch student details');
    }
    return response.data;
  },
};
