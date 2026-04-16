import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UserWithRelations } from '@/api/users';
import { dashboardKeys } from '@/hooks/dashboard/use-dashboard';
import type { User } from '@pantera-negra/shared';
import { QueryKeys } from '@/lib/query-keys';

// Query keys
export const userKeys = {
  all: [QueryKeys.users] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Get all users query
export function useUsers(tenantId?: string) {
  return useQuery({
    queryKey: [...userKeys.lists(), tenantId],
    queryFn: () => usersApi.getAll(tenantId),
  });
}

// Get user by ID query
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'email_verified'>) => usersApi.create(user),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate dashboard stats since new users affect statistics
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...user }: { id: string } & Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>) =>
      usersApi.update(id, user),
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      // Invalidate dashboard stats since user updates affect statistics
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate dashboard stats since deleting users affects statistics
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

