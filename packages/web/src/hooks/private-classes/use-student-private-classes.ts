import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentPrivateApi } from '@/api/student-private';
import { usersApi } from '@/api/users';
import { QueryKeys } from '@/lib/query-keys';
import { useUser } from '@/hooks/user/use-user';
import type {
  StudentPrivatePlan,
  StudentPrivateSession,
  Instructor,
} from '@pantera-negra/shared';

// Query keys
export const studentPrivateKeys = {
  all: ['student-private'] as const,
  plan: () => [...studentPrivateKeys.all, 'plan'] as const,
  sessions: () => [...studentPrivateKeys.all, 'sessions'] as const,
  sessionsWithStatus: (status?: string) => [...studentPrivateKeys.sessions(), { status }] as const,
};

/**
 * Hook to get student's active private plan
 */
export function useStudentPrivatePlan() {
  return useQuery({
    queryKey: studentPrivateKeys.plan(),
    queryFn: () => studentPrivateApi.getPlan(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get student's private sessions
 */
export function useStudentPrivateSessions(params?: {
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  limit?: number;
}) {
  return useQuery({
    queryKey: studentPrivateKeys.sessionsWithStatus(params?.status),
    queryFn: () => studentPrivateApi.getSessions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get available instructors
 */
export function useInstructors() {
  return useQuery<Instructor[]>({
    queryKey: [QueryKeys.users, 'instructors'],
    queryFn: () => usersApi.getInstructors(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to enable private classes and assign instructor
 */
export function useEnablePrivateClasses() {
  const queryClient = useQueryClient();
  const { refetch: refetchUser } = useUser();

  return useMutation({
    mutationFn: (instructorId: string) => studentPrivateApi.enable({ instructorId }),
    onSuccess: async () => {
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: studentPrivateKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.currentUser] });
      await refetchUser();
    },
  });
}

/**
 * Hook to disable private classes
 */
export function useDisablePrivateClasses() {
  const queryClient = useQueryClient();
  const { refetch: refetchUser } = useUser();

  return useMutation({
    mutationFn: () => studentPrivateApi.disable(),
    onSuccess: async () => {
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: studentPrivateKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.currentUser] });
      await refetchUser();
    },
  });
}
