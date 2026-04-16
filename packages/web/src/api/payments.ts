import { apiClient } from '@/lib/api-client';
import type { Payment, ApiResponse } from '@pantera-negra/shared';

// Payment endpoints
export const paymentsApi = {
  // Get all payments
  getAll: async (params?: { membershipId?: string; memberId?: string; side_id?: string }): Promise<Payment[]> => {
    const queryParams = new URLSearchParams();
    // Support both membershipId (backend) and memberId (legacy) for compatibility
    if (params?.membershipId) {
      queryParams.append('membershipId', params.membershipId);
    } else if (params?.memberId) {
      queryParams.append('membershipId', params.memberId); // Map memberId to membershipId
    }
    if (params?.side_id) queryParams.append('side_id', params.side_id);
    
    const url = `/api/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<ApiResponse<Payment[]>>(url);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch payments');
    }
    return response.data;
  },

  // Create payment
  create: async (payment: {
    memberId: string;
    paymentType: Payment['paymentType'];
    plan: string;
    currency?: string;
    amount?: number;
  }): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>('/api/payments', payment);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create payment');
    }
    return response.data;
  },
};

