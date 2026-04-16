import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUsersStore } from "@/stores/users-store";
import { useUpdateUser, useDeleteUser, useUsers } from '@/hooks/users/use-users';
import { useUser } from '@/hooks/user/use-user';
import type { UserWithRelations } from '@/api/users';

/**
 * Hook to unify all user table actions
 * This hook centralizes all actions that can be performed on users in the table
 */
export function useMemberActions() {
  const { t } = useTranslation();
  const { user: currentUser } = useUser();
  
  // Determine tenant filter: if user is admin, filter by their tenant_id
  const tenantFilterId = currentUser?.role === 'admin' && currentUser?.tenant_id 
    ? currentUser.tenant_id 
    : undefined;
  
  const { data: users = [] } = useUsers(tenantFilterId);
  const { openEditModal, openProfileModal } = useUsersStore();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  /**
   * Handle editing a user
   * Opens the edit modal with the selected user
   */
  const handleEdit = (user: UserWithRelations) => {
    openEditModal(user);
  };

  /**
   * Handle deleting a user
   * Deletes the user (confirmation should be handled by the caller)
   */
  const handleDelete = (id: string) => {
    deleteUserMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t('members.messages.deleteSuccess'));
      },
      onError: (error) => {
        toast.error(error.message || t('members.messages.deleteError'));
      },
    });
  };

  /**
   * Handle viewing a user's profile
   * Opens the profile modal with the selected user
   */
  const handleViewProfile = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      openProfileModal(user);
    }
  };

  return {
    handleEdit,
    handleDelete,
    handleViewProfile,
    isDeleting: deleteUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
  };
}
