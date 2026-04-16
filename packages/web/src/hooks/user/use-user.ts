import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useUserStore, type UserData } from '@/stores/user-store';
import { useEffect } from 'react';
import { QueryKeys } from '@/lib/query-keys';
import { useAuth } from '@/providers/auth-provider';

export function useUser() {
  const { user, setUser, setLoading, setInitialized } = useUserStore();
  const queryClient = useQueryClient();
  const { token, isAuthenticated } = useAuth();
  const hasToken = !!token || !!localStorage.getItem('auth_token');

  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QueryKeys.currentUser],
    queryFn: async () => {
      const data = await authApi.getCurrentUser();
      return data as UserData;
    },
    // Always try to fetch if we have a token, regardless of store state
    // This ensures we get fresh data after login
    enabled: hasToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary requests
    // Use cached data from store as initial data if available
    initialData: user || undefined,
  });

  // Sync store with query data
  useEffect(() => {
    if (userData) {
      setUser(userData);
      setInitialized(true);
    }
    setLoading(isLoading);
  }, [userData, isLoading, setUser, setLoading, setInitialized]);

  // Clear store on error (e.g., token expired)
  useEffect(() => {
    if (error) {
      setUser(null);
      setInitialized(true);
    }
  }, [error, setUser, setInitialized]);

  return {
    user: user || userData,
    isLoading: isLoading || useUserStore.getState().isLoading,
    error,
    refetch,
    updateUser: (updates: Partial<UserData>) => {
      if (user) {
        useUserStore.getState().updateUser(updates);
        // Invalidate query to refetch
        queryClient.invalidateQueries({ queryKey: [QueryKeys.currentUser] });
      }
    },
  };
}
