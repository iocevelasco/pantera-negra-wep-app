import { useQuery } from '@tanstack/react-query';
import { tenantsApi } from '@/api/tenants';
import type { Tenant } from '@pantera-negra/shared';
import { QueryKeys } from '@/lib/query-keys';

/**
 * Hook to fetch and return the list of tenants
 * @returns List of tenants
 */
export function useTenants() {
  const { data: tenants = [], isLoading, error } = useQuery<Tenant[]>({
    queryKey: [QueryKeys.tenants],
    queryFn: () => tenantsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return tenants;
}

