import { useEffect, ReactNode } from 'react';
import { useUser } from '@/hooks/user/use-user';
import { useAuth } from '@/providers/auth-provider';

interface UserProviderProps {
  children: ReactNode;
}

/**
 * Provider component that initializes user data on app load
 * and syncs with auth state
 */
export function UserProvider({ children }: UserProviderProps) {
  const { isAuthenticated } = useAuth();
  const { user, refetch } = useUser();

  // Fetch user data when authenticated
  useEffect(() => {
    if (isAuthenticated && !user) {
      refetch();
    }
  }, [isAuthenticated, user, refetch]);

  return <>{children}</>;
}

