import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthResponse } from '@pantera-negra/shared';
import { useUserStore } from '@/stores/user-store';
import { isTokenExpired, getTokenExpirationTime } from '@/lib/jwt-utils';
import { initializeVersionManager } from '@/lib/version-manager';

interface AuthContextValue {
  user: AuthResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthResponse['user']) => void;
  logout: () => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const SESSION_START_KEY = 'session_start_time';

// Session duration: 1 month in milliseconds
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Check if session is still valid
   * Session is invalid if:
   * 1. Token is expired (JWT exp claim)
   * 2. More than 1 month has passed since session start
   */
  const checkSessionValidity = useCallback((currentToken: string): boolean => {
    // Check if JWT token itself is expired
    if (isTokenExpired(currentToken)) {
      console.log('🔒 [AUTH] Session expired: JWT token expired');
      return false;
    }

    // Check if 1 month has passed since session start
    const sessionStartTime = localStorage.getItem(SESSION_START_KEY);
    if (sessionStartTime) {
      const startTime = parseInt(sessionStartTime, 10);
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed >= SESSION_DURATION) {
        console.log('🔒 [AUTH] Session expired: 1 month duration exceeded');
        return false;
      }
    } else {
      // If no session start time, check token expiration time
      // Use token expiration as fallback, but limit to 1 month max
      const tokenExpiration = getTokenExpirationTime(currentToken);
      if (tokenExpiration) {
        const now = Date.now();
        const tokenAge = tokenExpiration - now;
        
        // If token expires in more than 1 month, consider session invalid
        // Otherwise, use token expiration as session end
        if (tokenAge > SESSION_DURATION) {
          console.log('🔒 [AUTH] Session expired: Token expiration exceeds 1 month limit');
          return false;
        }
      }
    }

    return true;
  }, []);

  /**
   * Clear session and logout
   */
  const clearSession = useCallback(() => {
    setTokenState(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_START_KEY);
    useUserStore.getState().clearUser();
    
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
      sessionCheckIntervalRef.current = null;
    }
  }, []);

  /**
   * Setup periodic session check
   */
  const setupSessionCheck = useCallback((currentToken: string) => {
    // Clear any existing interval
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
    }

    // Check session validity every 5 minutes
    sessionCheckIntervalRef.current = setInterval(() => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken || !checkSessionValidity(storedToken)) {
        console.log('🔒 [AUTH] Session expired, logging out...');
        clearSession();
        navigate('/login');
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }, [checkSessionValidity, clearSession, navigate]);

  // Load auth state from localStorage on mount
  useEffect(() => {
    // Verificar y limpiar localStorage si la versión cambió
    // Esto debe ejecutarse antes de cargar el estado de autenticación
    initializeVersionManager();

    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        // Verify session is still valid
        if (checkSessionValidity(storedToken)) {
          setTokenState(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Ensure session start time is set
          if (!localStorage.getItem(SESSION_START_KEY)) {
            localStorage.setItem(SESSION_START_KEY, Date.now().toString());
          }
          
          // Setup periodic session check
          setupSessionCheck(storedToken);
        } else {
          // Session expired, clear it
          console.log('🔒 [AUTH] Stored session expired, clearing...');
          clearSession();
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        clearSession();
      }
    }
    setIsLoading(false);

    // Cleanup interval on unmount
    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
    };
  }, [checkSessionValidity, clearSession, setupSessionCheck]);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const login = (newToken: string, newUser: AuthResponse['user']) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    
    // Set session start time
    localStorage.setItem(SESSION_START_KEY, Date.now().toString());
    
    // Setup periodic session check
    setupSessionCheck(newToken);
    
    // Also update user store
    useUserStore.getState().setUser(newUser as any);
  };

  const logout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

