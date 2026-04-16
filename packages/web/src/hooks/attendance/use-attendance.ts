import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import { dashboardKeys } from '@/hooks/dashboard/use-dashboard';
import type { Attendance } from '@pantera-negra/shared';
import { QueryKeys } from '@/lib/query-keys';

// Query keys
export const attendanceKeys = {
  all: [QueryKeys.attendance] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (filters: Record<string, string | undefined>) => [...attendanceKeys.lists(), { filters }] as const,
  details: () => [...attendanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...attendanceKeys.details(), id] as const,
  byMembership: (membershipId: string) => [...attendanceKeys.all, 'membership', membershipId] as const,
  byClass: (classId: string) => [...attendanceKeys.all, 'class', classId] as const,
  byDate: (date: string) => [...attendanceKeys.all, 'date', date] as const,
};

/**
 * Get all attendance records with optional filters
 */
export function useAttendances(params?: {
  membershipId?: string;
  classId?: string;
  date?: string;
}) {
  return useQuery({
    queryKey: attendanceKeys.list(params || {}),
    queryFn: () => attendanceApi.getAll(params),
  });
}

/**
 * Get attendance count for a membership
 */
export function useAttendanceCount(membershipId: string) {
  return useQuery({
    queryKey: attendanceKeys.byMembership(membershipId),
    queryFn: () => attendanceApi.getCountByMembership(membershipId),
    enabled: !!membershipId,
  });
}

/**
 * Self check-in mutation for authenticated students
 * Automatically uses the student's membership and today's date
 */
export function useSelfCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: string) => attendanceApi.selfCheckIn(classId),
    onSuccess: (data) => {
      // Invalidate attendance queries
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.byMembership(data.membershipId) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.byClass(data.classId) });
      
      // Invalidate dashboard stats since attendance affects statistics
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}


