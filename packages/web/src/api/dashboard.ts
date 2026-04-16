import { apiClient } from '@/lib/api-client';
import type { DashboardStats, ApiResponse } from '@pantera-negra/shared';

// Dashboard endpoints
export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (tenantId?: string): Promise<DashboardStats> => {
    const params = tenantId ? `?tenant_id=${tenantId}` : '';
    const response = await apiClient.get<ApiResponse<DashboardStats>>(`/api/dashboard/stats${params}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch dashboard stats');
    }
    return response.data;
  },
};

