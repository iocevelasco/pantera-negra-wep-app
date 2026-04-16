import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/api/auth';
import { useAuth } from '@/providers/auth-provider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user-store';
import { QueryKeys } from '@/lib/query-keys';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@pantera-negra/shared';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [QueryKeys.currentUser] as const,
};

// Register mutation
export function useRegister() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => authApi.register(credentials),
    onSuccess: (data: AuthResponse) => {
      login(data.accessToken, data.user);
      // Set query data and invalidate to trigger refetch
      queryClient.setQueryData(authKeys.currentUser(), data.user);
      // Invalidate to ensure fresh data is fetched
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
      // Also update user store
      useUserStore.getState().setUser(data.user as any);
      // Redirect based on user role
      const userRoles = data.user.roles || [];
      if (userRoles.includes('admin') || userRoles.includes('owner')) {
        navigate('/');
      } else if (userRoles.includes('student')) {
        navigate('/mi-membresia');
      } else {
        navigate('/');
      }
      toast.success(t('auth.register.success') || 'Registration successful!');
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.register.errors.registerFailed') || 'Registration failed');
    },
  });
}

// Login mutation
export function useLogin() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data: AuthResponse) => {
      login(data.accessToken, data.user);
      // Set query data and invalidate to trigger refetch
      queryClient.setQueryData(authKeys.currentUser(), data.user);
      // Invalidate to ensure fresh data is fetched
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
      // Also update user store
      useUserStore.getState().setUser(data.user as any);
      // Redirect based on user role
      const userRoles = data.user.roles || [];
      if (userRoles.includes('admin') || userRoles.includes('owner')) {
        navigate('/');
      } else if (userRoles.includes('student')) {
        navigate('/mi-membresia');
      } else {
        navigate('/');
      }
      toast.success(t('auth.login.success'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.login.errors.loginFailed'));
    },
  });
}

// Google login mutation
export function useGoogleLogin() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => authApi.getGoogleAuthUrl(),
    onSuccess: (url: string) => {
      window.location.href = url;
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.login.errors.loginFailed'));
    },
  });
}

// Logout mutation
export function useLogout() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      // Clear user store
      useUserStore.getState().clearUser();
      // Call logout from auth provider
      logout();
      toast.success(t('auth.logout.success'));
    },
    onError: (error: Error) => {
      // Even if logout fails on server, clear local state
      queryClient.clear();
      // Clear user store
      useUserStore.getState().clearUser();
      // Call logout from auth provider
      logout();
      toast.error(error.message || t('auth.logout.errors.logoutFailed'));
    },
  });
}

// Refresh token mutation
export function useRefreshToken() {
  const { login, setToken } = useAuth();

  return useMutation({
    mutationFn: () => authApi.refreshToken(),
    onSuccess: (data: AuthResponse) => {
      login(data.accessToken, data.user);
    },
    onError: () => {
      // If refresh fails, logout user
      setToken(null);
    },
  });
}

// Forgot password mutation
export function useForgotPassword() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (request: ForgotPasswordRequest) => authApi.forgotPassword(request),
    onSuccess: (data) => {
      toast.success(data.message || t('auth.forgotPassword.success') || 'Password reset email sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.forgotPassword.errors.failed') || 'Failed to send password reset email');
    },
  });
}

// Reset password mutation
export function useResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (request: ResetPasswordRequest) => authApi.resetPassword(request),
    onSuccess: (data) => {
      toast.success(data.message || t('auth.resetPassword.success') || 'Password reset successfully');
      navigate('/login');
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.resetPassword.errors.failed') || 'Failed to reset password');
    },
  });
}

