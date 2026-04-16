import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';
import { useUser } from '@/hooks/user/use-user';
import { isAdmin, isStudent } from '@/lib/roles';
import type { UserRole } from '@pantera-negra/shared';
import { ROUTES } from '@/lib/routes';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { user, isLoading: userLoading } = useUser();

  const isLoading = authLoading || userLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check if user is admin
  const userRoles = (user?.roles || []) as UserRole[];
  if (!isAdmin(userRoles)) {
    // Redirect students to their view
    if (isStudent(userRoles)) {
      return <Navigate to={ROUTES.STUDENT_MEMBERSHIP} replace />;
    }
    // For other roles, redirect to login
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}

