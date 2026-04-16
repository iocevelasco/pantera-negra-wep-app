import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  PrivatePlan,
  CreatePrivatePlanRequest,
} from '@pantera-negra/shared';

export const privatePlansApi = {
  getAll: async (active?: boolean): Promise<PrivatePlan[]> => {
    const params = active !== undefined ? `?active=${active}` : '';
    const response = await apiClient.get<ApiResponse<PrivatePlan[]>>(
      `/api/me/private/plans${params}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch private plans');
    }
    return response.data;
  },

  create: async (data: CreatePrivatePlanRequest): Promise<PrivatePlan> => {
    const response = await apiClient.post<ApiResponse<PrivatePlan>>(
      '/api/me/private/plans',
      data
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create private plan');
    }
    return response.data;
  },
};
