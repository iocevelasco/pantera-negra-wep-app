import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserWithRelations } from '@/api/users';
import type { UserRole } from '@pantera-negra/shared';
import type { Membership } from '@pantera-negra/shared';

interface UsersState {
  // UI State
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isProfileModalOpen: boolean;
  selectedUser: UserWithRelations | null;
  searchQuery: string;
  roleFilter: UserRole | 'all';
  tenantFilter: string | 'all';
  membershipStatusFilter: Membership['status'] | 'all';
  membershipTypeFilter: Membership['memberType'] | 'all';

  // Actions
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: (user: UserWithRelations) => void;
  closeEditModal: () => void;
  openProfileModal: (user: UserWithRelations) => void;
  closeProfileModal: () => void;
  setSearchQuery: (query: string) => void;
  setRoleFilter: (role: UserRole | 'all') => void;
  setTenantFilter: (tenant: string | 'all') => void;
  setMembershipStatusFilter: (status: Membership['status'] | 'all') => void;
  setMembershipTypeFilter: (memberType: Membership['memberType'] | 'all') => void;
  resetFilters: () => void;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set) => ({
      // Initial state
      isAddModalOpen: false,
      isEditModalOpen: false,
      isProfileModalOpen: false,
      selectedUser: null,
      searchQuery: '',
      roleFilter: 'all',
      tenantFilter: 'all',
      membershipStatusFilter: 'all',
      membershipTypeFilter: 'all',

      // Actions
      openAddModal: () => set({ isAddModalOpen: true }),
      closeAddModal: () => set({ isAddModalOpen: false, selectedUser: null }),
      openEditModal: (user) => set({ isEditModalOpen: true, selectedUser: user }),
      closeEditModal: () => set({ isEditModalOpen: false, selectedUser: null }),
      openProfileModal: (user) => set({ isProfileModalOpen: true, selectedUser: user }),
      closeProfileModal: () => set({ isProfileModalOpen: false, selectedUser: null }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setRoleFilter: (role) => set({ roleFilter: role }),
      setTenantFilter: (tenant) => set({ tenantFilter: tenant }),
      setMembershipStatusFilter: (status) => set({ membershipStatusFilter: status }),
      setMembershipTypeFilter: (memberType) => set({ membershipTypeFilter: memberType }),
      resetFilters: () =>
        set({
          searchQuery: '',
          roleFilter: 'all',
          tenantFilter: 'all',
          membershipStatusFilter: 'all',
          membershipTypeFilter: 'all',
        }),
    }),
    {
      name: 'users-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist filters, not modal state or selected user
        roleFilter: state.roleFilter,
        tenantFilter: state.tenantFilter,
        membershipStatusFilter: state.membershipStatusFilter,
        membershipTypeFilter: state.membershipTypeFilter,
        searchQuery: state.searchQuery,
      }),
    }
  )
);

