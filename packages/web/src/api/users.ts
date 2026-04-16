import { apiClient } from '@/lib/api-client';
import type { User, ApiResponse, Instructor } from '@pantera-negra/shared';

export interface UserWithRelations extends User {
  membership?: {
    id: string;
    name: string;
    status: string;
    memberType: string;
    joined: string;
    lastSeen: string;
    plan?: string;
    lastPaymentDate?: string;
    subscriptionExpiresAt?: string;
  };
  tenant?: {
    id: string;
    slug: string;
    name: string;
  };
}

// User endpoints
export const usersApi = {
  // Get all users
  getAll: async (tenantId?: string): Promise<UserWithRelations[]> => {
    const params = tenantId ? `?tenant_id=${tenantId}` : '';
    const response = await apiClient.get<ApiResponse<UserWithRelations[]>>(`/api/users${params}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch users');
    }
    return response.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<UserWithRelations> => {
    const response = await apiClient.get<ApiResponse<UserWithRelations>>(`/api/users/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch user');
    }
    return response.data;
  },

  // Create new user
  create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'email_verified'> & { email_verified?: boolean }): Promise<UserWithRelations> => {
    const response = await apiClient.post<ApiResponse<UserWithRelations>>('/api/users', user);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create user');
    }
    return response.data;
  },

  // Update user
  update: async (id: string, user: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<UserWithRelations> => {
    const response = await apiClient.put<ApiResponse<UserWithRelations>>(`/api/users/${id}`, user);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update user');
    }
    return response.data;
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/users/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete user');
    }
  },

  // Get all instructors
  getInstructors: async (): Promise<Instructor[]> => {
    const response = await apiClient.get<ApiResponse<Instructor[]>>(`/api/users/instructors`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch instructors');
    }
    return response.data;
  },
};

