import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MemberForm } from './member-form';
import { useTranslation } from 'react-i18next';
import { useMemberModal } from '@/hooks/members/use-member-modal';
import type { User } from '@pantera-negra/shared';

interface MemberModalProps {
  mode: 'create' | 'edit';
}

export function MemberModal({ mode }: MemberModalProps) {
  const { t } = useTranslation();
  const {
    isAddModalOpen,
    isEditModalOpen,
    selectedUser,
    closeAddModal,
    closeEditModal,
    handleCreateMember,
    handleUpdateMember,
    isCreating,
    isUpdating,
  } = useMemberModal();
  const open = mode === 'create' ? isAddModalOpen : isEditModalOpen;
  const onOpenChange = mode === 'create' ? closeAddModal : closeEditModal;
  const onSubmit = mode === 'create' 
    ? handleCreateMember 
    : (data: Omit<User, 'id' | 'created_at' | 'updated_at' | 'email_verified'> & { email_verified?: boolean }) => {
        // Remove email_verified from update data as it's not part of User update
        const { email_verified, ...updateData } = data;
        handleUpdateMember(updateData);
      };
  const isLoading = mode === 'create' ? isCreating : isUpdating;
  const defaultValues = mode === 'edit' && selectedUser ? {
    ...selectedUser,
    memberType: selectedUser.membership?.memberType as 'Adult' | 'Kid' | undefined,
  } : undefined;

  function handleCancel() {
    onOpenChange();
  }

  // Don't render if in edit mode and no selected user
  if (mode === 'edit' && !selectedUser) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onOpenChange()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? t('members.addMember') : t('members.editMember')}
          </DialogTitle>
        </DialogHeader>
        <MemberForm
          onSubmit={onSubmit}
          onCancel={handleCancel}
          defaultValues={defaultValues}
          isLoading={isLoading}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
}
