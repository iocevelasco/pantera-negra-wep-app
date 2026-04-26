import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  GoogleLoginResponse,
} from '@pantera-negra/shared';

// Auth endpoints
export const authApi = {
  // Register a new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/api/auth/register',
      credentials,
      { skipAuth: true }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to register');
    }
    return response.data;
  },

  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/api/auth/login',
      credentials,
      { skipAuth: true }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to login');
    }
    return response.data;
  },

  // Get Google OAuth URL
  getGoogleAuthUrl: async (): Promise<string> => {
    const response = await apiClient.get<ApiResponse<GoogleLoginResponse>>(
      '/api/auth/google',
      { skipAuth: true }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get Google auth URL');
    }
    return response.data.url;
  },

  // Refresh access token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/api/auth/refresh',
      {},
      { skipAuth: true }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to refresh token');
    }
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/api/auth/logout');
  },

  // Get current user with full details
  getCurrentUser: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/api/auth/me');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get current user');
    }
    return response.data;
  },

  // Request password reset
  forgotPassword: async (request: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/api/auth/forgot-password',
      request,
      { skipAuth: true }
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to request password reset');
    }
    return { message: response.message || 'If an account with that email exists, a password reset link has been sent.' };
  },

  // Reset password with token
  resetPassword: async (request: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/api/auth/reset-password',
      request,
      { skipAuth: true }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to reset password');
    }
    return response.data;
  },

  // Register a new dojo (admin onboarding — creates user + tenant in one step)
  registerDojo: async (data: {
    name: string;
    email: string;
    password: string;
    academyName: string;
    martialArt: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/api/auth/register-dojo',
      data,
      { skipAuth: true }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al crear la academia');
    }
    return response.data;
  },

  // Complete Google OAuth registration by selecting tenant
  completeGoogleRegistration: async (tenant_id: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/api/auth/google/complete',
      { tenant_id }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to complete registration');
    }
    return response.data;
  },
};

