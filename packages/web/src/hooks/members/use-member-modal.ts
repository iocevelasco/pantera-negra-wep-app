import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUsersStore } from "@/stores/users-store";
import { useCreateUser, useUpdateUser } from '@/hooks/users/use-users';
import type { User } from '@pantera-negra/shared';

/**
 * Hook to manage user modal state and actions
 * Handles both create and edit modes
 */
export function useMemberModal() {
  const { t } = useTranslation();
  const {
    isAddModalOpen,
    isEditModalOpen,
    selectedUser,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
  } = useUsersStore();

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  /**
   * Handle creating a new user
   */
  const handleCreateUser = (data: Omit<User, 'id' | 'created_at' | 'updated_at' | 'email_verified'> & { email_verified?: boolean }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success(t('members.messages.createSuccess'));
        closeAddModal();
      },
      onError: (error) => {
        toast.error(error.message || t('members.messages.createError'));
      },
    });
  };

  /**
   * Handle updating an existing user
   */
  const handleUpdateUser = (data: Omit<User, 'id' | 'created_at' | 'updated_at' | 'email_verified'>) => {
    if (!selectedUser) {
      console.error('No selected user to update');
      return;
    }

    updateMutation.mutate(
      { id: selectedUser.id, ...data },
      {
        onSuccess: () => {
          toast.success(t('members.messages.updateSuccess'));
          closeEditModal();
        },
        onError: (error) => {
          toast.error(error.message || t('members.messages.updateError'));
        },
      }
    );
  };

  return {
    // Modal state
    isAddModalOpen,
    isEditModalOpen,
    selectedUser,
    
    // Modal actions
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
    
    // Submit handlers
    handleCreateMember: handleCreateUser,
    handleUpdateMember: handleUpdateUser,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
