// API Client with interceptor for token validation
// Note: Token validation interceptor is created but not included in the flow

import { getApiBaseUrl } from '@pantera-negra/shared';

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private getBaseURL(): string {
    const envUrl = import.meta.env?.VITE_API_BASE_URL as string | undefined;
    return getApiBaseUrl(envUrl);
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { skipAuth = false, ...fetchConfig } = config;

    const baseURL = this.getBaseURL();
    const url = `${baseURL}${endpoint}`;
    const isFormData = fetchConfig.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(fetchConfig.headers as Record<string, string>),
    };

    // Token interceptor - created but not included
    // In a real implementation, you would:
    // 1. Get token from storage/cookie
    // 2. Add to headers: Authorization: `Bearer ${token}`
    // 3. Handle token refresh on 401
    // 4. Handle token expiration
    const token = this.getToken();
    if (token && !skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
      });

      // Handle token validation (401)
      if (response.status === 401 && !skipAuth) {
        // Token is invalid or expired
        // In a real implementation, you would:
        // 1. Try to refresh the token
        // 2. Redirect to login if refresh fails
        // 3. Retry the original request
        this.handleUnauthorized();
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: 'An error occurred',
          message: response.statusText,
        }));
        throw new Error(error.error || error.message || 'Request failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private handleUnauthorized(): void {
    // Clear token and user data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient();

