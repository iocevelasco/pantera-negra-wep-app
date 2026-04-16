import { apiClient } from '@/lib/api-client';
import type { Attendance, ApiResponse } from '@pantera-negra/shared';

// Attendance endpoints
export const attendanceApi = {
  // Get all attendance records (with optional filters)
  getAll: async (params?: {
    membershipId?: string;
    classId?: string;
    date?: string;
  }): Promise<Attendance[]> => {
    const queryParams = new URLSearchParams();
    if (params?.membershipId) {
      queryParams.append('membershipId', params.membershipId);
    }
    if (params?.classId) {
      queryParams.append('classId', params.classId);
    }
    if (params?.date) {
      queryParams.append('date', params.date);
    }

    const url = `/api/attendance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<ApiResponse<Attendance[]>>(url);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch attendance');
    }
    return response.data;
  },

  // Get attendance count for a membership
  getCountByMembership: async (membershipId: string): Promise<number> => {
    const attendances = await attendanceApi.getAll({ membershipId });
    return attendances.filter((a) => a.checkedIn).length;
  },

  // Self check-in for authenticated students
  selfCheckIn: async (classId: string): Promise<Attendance> => {
    const response = await apiClient.post<ApiResponse<Attendance>>('/api/attendance/self-check-in', {
      classId,
    });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to check in');
    }
    return response.data;
  },
};

