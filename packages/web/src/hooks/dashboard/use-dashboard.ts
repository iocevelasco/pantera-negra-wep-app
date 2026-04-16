import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard';
import { QueryKeys } from '@/lib/query-keys';

// Query keys
export const dashboardKeys = {
  all: [QueryKeys.dashboard] as const,
  stats: (tenantId?: string) => [...dashboardKeys.all, 'stats', tenantId] as const,
};

// Get dashboard statistics query
export function useDashboardStats(tenantId?: string) {
  return useQuery({
    queryKey: dashboardKeys.stats(tenantId),
    queryFn: () => dashboardApi.getStats(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

