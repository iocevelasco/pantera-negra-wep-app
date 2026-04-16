import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';
import { isAdmin, isStudent, getPrimaryRole } from '@/lib/roles';
import type { UserRole } from '@pantera-negra/shared';
import { ROUTES } from '@/lib/routes';

interface AuthGuardProps {
  children: React.ReactNode;
  /**
   * If true, redirects authenticated users away from this route (e.g., login page)
   * If false, redirects unauthenticated users to login (default behavior)
   */
  redirectIfAuthenticated?: boolean;
}

/**
 * AuthGuard component that protects routes based on authentication status
 * 
 * - When redirectIfAuthenticated is true: Prevents authenticated users from accessing the route (e.g., login page)
 * - When redirectIfAuthenticated is false: Protects the route, redirecting unauthenticated users to login
 */
export function AuthGuard({ children, redirectIfAuthenticated = false }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  // If this guard is for routes that should not be accessible when authenticated (like login)
  if (redirectIfAuthenticated) {
    if (isAuthenticated) {
      // Redirect based on user roles
      const userRoles = (user?.roles || []) as UserRole[];
      if (isAdmin(userRoles)) {
        return <Navigate to={ROUTES.ADMIN_ROOT} replace />;
      } else if (isStudent(userRoles)) {
        return <Navigate to={ROUTES.STUDENT_MEMBERSHIP} replace />;
      } else {
        return <Navigate to={ROUTES.ADMIN_ROOT} replace />;
      }
    }
    return <>{children}</>;
  }

  // Default behavior: protect the route
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}

