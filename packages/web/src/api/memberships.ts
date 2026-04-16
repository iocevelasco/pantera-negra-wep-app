import { apiClient } from '@/lib/api-client';
import type {
  Membership,
  MembershipPlan,
  ApiResponse,
} from '@pantera-negra/shared';

// Membership endpoints
export const membershipsApi = {
  // Get all memberships
  getAll: async (): Promise<Membership[]> => {
    const response = await apiClient.get<ApiResponse<Membership[]>>('/api/memberships');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch memberships');
    }
    return response.data;
  },

  // Get membership by ID
  getById: async (id: string): Promise<Membership> => {
    const response = await apiClient.get<ApiResponse<Membership>>(`/api/memberships/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch membership');
    }
    return response.data;
  },

  // Create new membership
  create: async (membership: Omit<Membership, 'id' | 'lastSeen'> & { lastSeen?: string }): Promise<Membership> => {
    const response = await apiClient.post<ApiResponse<Membership>>('/api/memberships', membership);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create membership');
    }
    return response.data;
  },

  // Update membership
  update: async (id: string, membership: Partial<Omit<Membership, 'id'>>): Promise<Membership> => {
    const response = await apiClient.put<ApiResponse<Membership>>(`/api/memberships/${id}`, membership);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update membership');
    }
    return response.data;
  },

  // Delete membership
  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/memberships/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete membership');
    }
  },

  // Get available membership plans
  getPlans: async (): Promise<MembershipPlan[]> => {
    const response = await apiClient.get<ApiResponse<MembershipPlan[]>>('/api/memberships/plans');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch membership plans');
    }
    return response.data;
  },
};

