import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipsApi } from "@/api/memberships";
import { dashboardKeys } from '@/hooks/dashboard/use-dashboard';
import type { Membership } from '@pantera-negra/shared';
import { QueryKeys } from '@/lib/query-keys';

// Query keys
export const membershipKeys = {
  all: [QueryKeys.memberships] as const,
  lists: () => [...membershipKeys.all, 'list'] as const,
  list: (filters: string) => [...membershipKeys.lists(), { filters }] as const,
  details: () => [...membershipKeys.all, 'detail'] as const,
  detail: (id: string) => [...membershipKeys.details(), id] as const,
};

// Get all memberships query
export function useMemberships() {
  return useQuery({
    queryKey: membershipKeys.lists(),
    queryFn: () => membershipsApi.getAll(),
  });
}

// Get membership by ID query
export function useMembership(id: string) {
  return useQuery({
    queryKey: membershipKeys.detail(id),
    queryFn: () => membershipsApi.getById(id),
    enabled: !!id,
  });
}

// Create membership mutation
export function useCreateMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membership: Omit<Membership, 'id'>) => membershipsApi.create(membership),
    onSuccess: () => {
      // Invalidate and refetch memberships list
      queryClient.invalidateQueries({ queryKey: membershipKeys.lists() });
      // Invalidate dashboard stats since new memberships affect statistics
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

// Update membership mutation
export function useUpdateMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...membership }: { id: string } & Partial<Omit<Membership, 'id'>>) =>
      membershipsApi.update(id, membership),
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: membershipKeys.lists() });
      queryClient.invalidateQueries({ queryKey: membershipKeys.detail(data.id) });
      // Invalidate dashboard stats since membership updates affect statistics
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

// Delete membership mutation
export function useDeleteMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => membershipsApi.delete(id),
    onSuccess: () => {
      // Invalidate and refetch memberships list
      queryClient.invalidateQueries({ queryKey: membershipKeys.lists() });
      // Invalidate dashboard stats since deleting memberships affects statistics
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

// Update membership status mutation
export function useUpdateMembershipStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Membership['status'] }) =>
      membershipsApi.update(id, { status }),
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: membershipKeys.lists() });
      queryClient.invalidateQueries({ queryKey: membershipKeys.detail(data.id) });
      // Invalidate dashboard stats since status changes affect statistics
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

