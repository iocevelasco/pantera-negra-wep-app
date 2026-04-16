import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/user/use-user';
import { useMembership } from './use-memberships';
import { tenantsApi } from '@/api/tenants';
import type { Membership, Tenant } from '@pantera-negra/shared';
import type { UserData } from '@/stores/user-store';
import { QueryKeys } from '@/lib/query-keys';

export interface UserWithMembership {
  user: UserData | null;
  membership: Membership | null | undefined;
  tenant: Tenant | null | undefined;
  isLoading: boolean;
  membershipLoading: boolean;
  tenantLoading: boolean;
  error: Error | null;
  membershipError: Error | null;
  tenantError: Error | null;
  isPending: boolean;
  isRejected: boolean;
  isConfirmed: boolean;
  refetch: () => void;
  refetchMembership: () => void;
  refetchTenant: () => void;
}

/**
 * Custom hook that unifies user and membership data
 * Combines useUser and useMembership to provide a single source of truth
 * for student portal data
 */
export function useUserWithMembership(): UserWithMembership {
  const { user, isLoading: userLoading, error: userError, refetch: refetchUser } = useUser();
  
  const {
    data: membership,
    isLoading: membershipLoading,
    error: membershipError,
    refetch: refetchMembership,
  } = useMembership(user?.membership_id || '');

  // Fetch tenant information
  const {
    data: tenant,
    isLoading: tenantLoading,
    error: tenantError,
    refetch: refetchTenant,
  } = useQuery({
    queryKey: [QueryKeys.tenant, user?.tenant_id],
    queryFn: () => {
      if (!user?.tenant_id) {
        throw new Error('No tenant ID provided');
      }
      return tenantsApi.getById(user.tenant_id);
    },
    enabled: !!user?.tenant_id,
  });

  // Calculate registration status
  const registrationStatus = (user as any)?.registration?.status;
  const isPending = registrationStatus === 'pending';
  const isRejected = registrationStatus === 'rejected';
  const isConfirmed = !isPending && !isRejected;

  return {
    user: user || null,
    membership,
    tenant: tenant || null,
    isLoading: userLoading,
    membershipLoading,
    tenantLoading,
    error: userError as Error | null,
    membershipError: membershipError as Error | null,
    tenantError: tenantError as Error | null,
    isPending,
    isRejected,
    isConfirmed,
    refetch: refetchUser,
    refetchMembership,
    refetchTenant,
  };
}

