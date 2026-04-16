import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';
import type { UserWithRelations } from '@/api/users';

interface DeleteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: UserWithRelations | null;
  onConfirm: () => void;
}

export function DeleteMemberDialog({
  open,
  onOpenChange,
  member,
  onConfirm,
}: DeleteMemberDialogProps) {
  const { t } = useTranslation();

  function handleConfirm() {
    onConfirm();
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('members.messages.deleteConfirm', {
              defaultValue: '¿Estás seguro de que deseas eliminar este usuario?',
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {member &&
              t('members.messages.deleteDescription', {
                defaultValue:
                  'Esta acción no se puede deshacer. Se eliminará permanentemente el usuario {{name}}.',
                name: member.name || member.email,
              })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('members.actions.deactivate')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
