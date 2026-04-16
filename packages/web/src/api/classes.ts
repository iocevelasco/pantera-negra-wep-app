import { apiClient } from '@/lib/api-client';
import type { Classes, ApiResponse } from '@pantera-negra/shared';

// Classes endpoints
export const classesApi = {
  // Get all classes with optional filters
  // Note: type filter is optional - check-in doesn't require it
  getAll: async (params?: {
    date?: string;
    type?: string; // Simplified - no strict type requirement
  }): Promise<Classes[]> => {
    const queryParams = new URLSearchParams();
    if (params?.date) {
      queryParams.append('date', params.date);
    }
    if (params?.type) {
      queryParams.append('type', params.type);
    }

    const url = `/api/classes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<ApiResponse<Classes[]>>(url);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch classes');
    }
    return response.data;
  },

  // Get class by ID
  getById: async (id: string): Promise<Classes> => {
    const response = await apiClient.get<ApiResponse<Classes>>(`/api/classes/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch class');
    }
    return response.data;
  },

  // Create new class
  create: async (classData: Omit<Classes, 'id' | 'enrolled'>): Promise<Classes> => {
    const response = await apiClient.post<ApiResponse<Classes>>('/api/classes', classData);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create class');
    }
    return response.data;
  },

  // Update class
  update: async (id: string, classData: Partial<Omit<Classes, 'id' | 'enrolled'>>): Promise<Classes> => {
    const response = await apiClient.put<ApiResponse<Classes>>(`/api/classes/${id}`, classData);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update class');
    }
    return response.data;
  },

  // Delete class
  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/classes/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete class');
    }
  },

  // Create multiple classes for a month
  createBulk: async (params: {
    month: number; // 1-12
    year: number;
    startTime: string;
    endTime: string;
    daysOfWeek: number[]; // 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    name?: string;
  }): Promise<Classes[]> => {
    const response = await apiClient.post<ApiResponse<Classes[]>>('/api/classes/bulk', params);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create classes in bulk');
    }
    return response.data;
  },
};


