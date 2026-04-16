import { apiClient } from '@/lib/api-client';
import type { MembershipPlan, ApiResponse } from '@pantera-negra/shared';

// Membership plan endpoints (admin only)
export const membershipPlansApi = {
  // Get all membership plans
  getAll: async (active?: boolean): Promise<MembershipPlan[]> => {
    const params = active !== undefined ? `?active=${active}` : '';
    const response = await apiClient.get<ApiResponse<MembershipPlan[]>>(
      `/api/admin/membership-plans${params}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch membership plans');
    }
    return response.data;
  },

  // Get membership plan by ID
  getById: async (id: string): Promise<MembershipPlan> => {
    const response = await apiClient.get<ApiResponse<MembershipPlan>>(
      `/api/admin/membership-plans/${id}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch membership plan');
    }
    return response.data;
  },

  // Create new membership plan
  create: async (plan: Omit<MembershipPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MembershipPlan> => {
    const response = await apiClient.post<ApiResponse<MembershipPlan>>(
      '/api/admin/membership-plans',
      plan
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create membership plan');
    }
    return response.data;
  },

  // Update membership plan
  update: async (id: string, plan: Partial<Omit<MembershipPlan, 'id' | 'created_at' | 'updated_at'>>): Promise<MembershipPlan> => {
    const response = await apiClient.put<ApiResponse<MembershipPlan>>(
      `/api/admin/membership-plans/${id}`,
      plan
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update membership plan');
    }
    return response.data;
  },

  // Delete membership plan
  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/admin/membership-plans/${id}`
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete membership plan');
    }
  },
};
