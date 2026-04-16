import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { useUser } from './use-user';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { QueryKeys } from '@/lib/query-keys';

interface UpdateUserProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * Hook to update user profile information (name, email, phone)
 * Only allows users to update their own profile
 */
export function useUpdateUserProfile() {
  const { t } = useTranslation();
  const { user, refetch } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserProfileData) => {
      if (!user?.id) {
        throw new Error('User not found');
      }
      
      // Only update allowed fields
      const updateData: Partial<{ name?: string; email?: string; phone?: string }> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) (updateData as any).phone = data.phone; // Phone might not be in User type yet
      
      return usersApi.update(user.id, updateData);
    },
    onSuccess: async (data) => {
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.currentUser] });
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.users] });
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.user, data.id] });
      await refetch();
      toast.success(t('portal.profile.updateSuccess'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('portal.profile.updateError'));
    },
  });
}

