import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserRole } from '@pantera-negra/shared';

export interface UserData {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  roles: UserRole[]; // Array of roles
  role?: UserRole; // Deprecated: kept for backward compatibility, use roles instead
  picture?: string;
  email_verified?: boolean;
  subscriptionStatus?: 'active' | 'expired' | 'suspended';
  subscriptionExpiresAt?: string;
  active_tenant_id?: string;
  tenants?: string[];
  roles_by_tenant?: Record<string, string[]>;
  membership_id?: string;
  tenant_id?: string;
  rank?: 'White' | 'Blue' | 'Purple' | 'Brown' | 'Black';
  stripes?: number;
  private_owner_instructor_id?: string; // Reference to instructor for private classes
}

interface UserState {
  user: UserData | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: UserData | null) => void;
  updateUser: (updates: Partial<UserData>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      setUser: (user) => set({ user, isInitialized: true }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      clearUser: () => set({ user: null, isInitialized: true }),
      setLoading: (loading) => set({ isLoading: loading }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }), // Only persist user data
    }
  )
);

