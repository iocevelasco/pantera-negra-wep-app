import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  PrivateSession,
  CreatePrivateSessionRequest,
} from '@pantera-negra/shared';

export const privateSessionsApi = {
  getAll: async (params?: {
    status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<PrivateSession[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<ApiResponse<PrivateSession[]>>(
      `/api/me/private/sessions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch private sessions');
    }
    return response.data;
  },

  getById: async (sessionId: string): Promise<PrivateSession> => {
    const response = await apiClient.get<ApiResponse<PrivateSession>>(
      `/api/me/private/sessions/${sessionId}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch session details');
    }
    return response.data;
  },

  create: async (data: CreatePrivateSessionRequest): Promise<PrivateSession> => {
    const response = await apiClient.post<ApiResponse<PrivateSession>>(
      '/api/me/private/sessions',
      data
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create private session');
    }
    return response.data;
  },

  checkin: async (sessionId: string): Promise<{
    id: string;
    status: string;
    enrollment_updates: Array<{
      student_id: string;
      enrollment_id: string;
      sessions_remaining: number;
      status: string;
    }>;
  }> => {
    const response = await apiClient.post<ApiResponse<{
      id: string;
      status: string;
      enrollment_updates: Array<{
        student_id: string;
        enrollment_id: string;
        sessions_remaining: number;
        status: string;
      }>;
    }>>(
      `/api/me/private/sessions/${sessionId}/checkin`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to check in session');
    }
    return response.data;
  },
};
