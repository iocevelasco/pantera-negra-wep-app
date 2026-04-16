import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  StudentPrivatePlan,
  StudentPrivateSession,
  EnablePrivateClassesRequest,
  EnablePrivateClassesResponse,
  DisablePrivateClassesResponse,
} from '@pantera-negra/shared';

export const studentPrivateApi = {
  // Get student's active private plan
  getPlan: async (): Promise<StudentPrivatePlan | null> => {
    const response = await apiClient.get<ApiResponse<StudentPrivatePlan | null>>(
      '/api/me/private/plan'
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch private plan');
    }
    return response.data || null;
  },

  // Get student's private sessions
  getSessions: async (params?: {
    status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    limit?: number;
  }): Promise<StudentPrivateSession[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<ApiResponse<StudentPrivateSession[]>>(
      `/api/me/private/sessions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch private sessions');
    }
    return response.data;
  },

  // Enable private classes and assign instructor
  enable: async (data: EnablePrivateClassesRequest): Promise<EnablePrivateClassesResponse> => {
    const response = await apiClient.put<ApiResponse<EnablePrivateClassesResponse>>(
      '/api/me/private/enable',
      data
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to enable private classes');
    }
    return response.data;
  },

  // Disable private classes
  disable: async (): Promise<DisablePrivateClassesResponse> => {
    const response = await apiClient.put<ApiResponse<DisablePrivateClassesResponse>>(
      '/api/me/private/disable'
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to disable private classes');
    }
    return response.data;
  },
};
