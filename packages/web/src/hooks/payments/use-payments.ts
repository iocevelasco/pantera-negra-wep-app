import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/api/payments';
import { dashboardKeys } from '@/hooks/dashboard/use-dashboard';
import type { Payment } from '@pantera-negra/shared';
import { QueryKeys } from '@/lib/query-keys';

// Query keys
export const paymentKeys = {
  all: [QueryKeys.payments] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters: Record<string, string | undefined>) => [...paymentKeys.lists(), { filters }] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  byMembership: (membershipId: string) => [...paymentKeys.all, 'membership', membershipId] as const,
};

/**
 * Get all payments with optional filters
 */
export function usePayments(params?: {
  membershipId?: string;
  memberId?: string;
  side_id?: string;
}) {
  return useQuery({
    queryKey: paymentKeys.list(params || {}),
    queryFn: () => paymentsApi.getAll(params),
    enabled: !!params?.membershipId || !!params?.memberId,
  });
}

/**
 * Get payments by membership ID
 */
export function usePaymentsByMembership(membershipId: string) {
  return useQuery({
    queryKey: paymentKeys.byMembership(membershipId),
    queryFn: () => paymentsApi.getAll({ membershipId }),
    enabled: !!membershipId,
  });
}

/**
 * Create payment mutation
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payment: {
      memberId: string;
      paymentType: Payment['paymentType'];
      plan: string;
      currency?: string;
      amount?: number;
    }) => paymentsApi.create(payment),
    onSuccess: () => {
      // Invalidate payment queries
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      // Invalidate dashboard stats since payments affect statistics
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
