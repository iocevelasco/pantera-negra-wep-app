import { apiClient } from '@/lib/api-client';
import type { Tenant, ApiResponse } from '@pantera-negra/shared';

// Tenant endpoints
export const tenantsApi = {
  // Get all tenants
  getAll: async (): Promise<Tenant[]> => {
    const response = await apiClient.get<ApiResponse<Tenant[]>>('/api/tenants');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch tenants');
    }
    return response.data;
  },

  // Get tenant by ID
  getById: async (id: string): Promise<Tenant> => {
    const response = await apiClient.get<ApiResponse<Tenant>>(`/api/tenants/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch tenant');
    }
    return response.data;
  },
};

