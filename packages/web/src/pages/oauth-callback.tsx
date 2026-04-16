import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';
import { authApi } from '@/api/auth';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/hooks/auth/use-auth';
import { useUserStore } from '@/stores/user-store';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UserRole } from '@pantera-negra/shared';

export function OAuthCallbackPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const queryClient = useQueryClient();
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  useEffect(() => {
    const handleCallback = async () => {
      if (error) {
        // Redirect to login with error
        navigate(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      if (!token) {
        // No token provided, redirect to login
        navigate('/login?error=no_token');
        return;
      }

      try {
        // Set token in localStorage first so API client can use it
        localStorage.setItem('auth_token', token);
        
        // Get user info using the token
        const user = await authApi.getCurrentUser();
        
        // Login the user (this will also set token and user in state)
        login(token, user);
        // Set query data and invalidate to trigger refetch
        queryClient.setQueryData(authKeys.currentUser(), user);
        queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
        // Also update user store
        useUserStore.getState().setUser(user);

        // Redirect based on user roles
        const userRoles = (user.roles || []) as UserRole[];
        if (userRoles.includes('admin') || userRoles.includes('owner')) {
          navigate('/');
        } else if (userRoles.includes('student')) {
          navigate('/mi-membresia');
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        // Clear token on error
        localStorage.removeItem('auth_token');
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        navigate(`/login?error=${encodeURIComponent(errorMessage)}`);
      }
    };

    handleCallback();
  }, [token, error, navigate, login, queryClient]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('auth.oauth.error') || 'Error en la autenticación'}:
                {' '}
                {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.oauth.processing') || 'Procesando autenticación...'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

