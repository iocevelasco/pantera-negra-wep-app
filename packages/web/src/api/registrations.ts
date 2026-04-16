import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  RegistrationRequest,
  RegistrationListResponse,
  ConfirmRegistrationRequest,
  RejectRegistrationRequest,
  AssignMembershipRequest,
} from '@pantera-negra/shared';

export const registrationsApi = {
  // Get all registration requests
  getAll: async (params?: {
    status?: 'pending' | 'confirmed' | 'rejected' | 'all';
    limit?: number;
    page?: number;
  }): Promise<RegistrationListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const response = await apiClient.get<ApiResponse<RegistrationRequest[]>>(
      `/api/admin/registrations?${queryParams.toString()}`
    );

    // The response includes pagination in the data field
    const data = response as any;
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch registrations');
    }

    return {
      data: data.data || [],
      pagination: data.pagination || {
        total: 0,
        page: 1,
        limit: 20,
        pages: 0,
      },
    };
  },

  // Get registration by user ID
  getById: async (userId: string): Promise<RegistrationRequest> => {
    const response = await apiClient.get<ApiResponse<RegistrationRequest>>(
      `/api/admin/registrations/${userId}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch registration');
    }
    return response.data;
  },

  // Confirm registration
  confirm: async (
    userId: string,
    data?: ConfirmRegistrationRequest
  ): Promise<{ user: RegistrationRequest }> => {
    const response = await apiClient.put<ApiResponse<{ user: RegistrationRequest }>>(
      `/api/admin/registrations/${userId}/confirm`,
      data || {}
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to confirm registration');
    }
    return response.data;
  },

  // Reject registration
  reject: async (userId: string, data?: RejectRegistrationRequest): Promise<void> => {
    const response = await apiClient.put<ApiResponse<void>>(
      `/api/admin/registrations/${userId}/reject`,
      data || {}
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to reject registration');
    }
  },

  // Assign membership
  assignMembership: async (
    userId: string,
    data: AssignMembershipRequest
  ): Promise<{ user: RegistrationRequest }> => {
    const response = await apiClient.post<ApiResponse<{ user: RegistrationRequest }>>(
      `/api/admin/registrations/${userId}/assign-membership`,
      data
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to assign membership');
    }
    return response.data;
  },
};

