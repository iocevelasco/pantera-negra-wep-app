import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';
import { useUser } from '@/hooks/user/use-user';
import { isNetworkOwner } from '@/lib/roles';
import type { UserRole } from '@pantera-negra/shared';
import { ROUTES } from '@/lib/routes';

interface NetworkOwnerRouteProps {
  children: React.ReactNode;
}

export function NetworkOwnerRoute({ children }: NetworkOwnerRouteProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { user, isLoading: userLoading } = useUser();

  if (authLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  const userRoles = (user?.roles || []) as UserRole[];
  if (!isNetworkOwner(userRoles)) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
