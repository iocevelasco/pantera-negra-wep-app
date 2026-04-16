import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Membership } from '@pantera-negra/shared';

interface MembershipsState {
  // UI State
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isProfileModalOpen: boolean;
  selectedMembership: Membership | null;
  searchQuery: string;
  statusFilter: Membership['status'] | 'all';
  memberTypeFilter: Membership['memberType'] | 'all';
  viewMode: 'cards' | 'table';

  // Actions
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: (membership: Membership) => void;
  closeEditModal: () => void;
  openProfileModal: (membership: Membership) => void;
  closeProfileModal: () => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: Membership['status'] | 'all') => void;
  setMemberTypeFilter: (memberType: Membership['memberType'] | 'all') => void;
  setViewMode: (mode: 'cards' | 'table') => void;
  resetFilters: () => void;
}

export const useMembershipsStore = create<MembershipsState>()(
  persist(
    (set) => ({
      // Initial state
      isAddModalOpen: false,
      isEditModalOpen: false,
      isProfileModalOpen: false,
      selectedMembership: null,
      searchQuery: '',
      statusFilter: 'all',
      memberTypeFilter: 'all',
      viewMode: 'cards',

      // Actions
      openAddModal: () => set({ isAddModalOpen: true }),
      closeAddModal: () => set({ isAddModalOpen: false, selectedMembership: null }),
      openEditModal: (membership) => set({ isEditModalOpen: true, selectedMembership: membership }),
      closeEditModal: () => set({ isEditModalOpen: false, selectedMembership: null }),
      openProfileModal: (membership) => set({ isProfileModalOpen: true, selectedMembership: membership }),
      closeProfileModal: () => set({ isProfileModalOpen: false, selectedMembership: null }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setStatusFilter: (status) => set({ statusFilter: status }),
      setMemberTypeFilter: (memberType) => set({ memberTypeFilter: memberType }),
      setViewMode: (mode) => set({ viewMode: mode }),
      resetFilters: () =>
        set({
          searchQuery: '',
          statusFilter: 'all',
          memberTypeFilter: 'all',
        }),
    }),
    {
      name: 'memberships-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist filters and view mode, not modal state or selected membership
        statusFilter: state.statusFilter,
        memberTypeFilter: state.memberTypeFilter,
        searchQuery: state.searchQuery,
        viewMode: state.viewMode,
      }),
    }
  )
);

