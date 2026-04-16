import { useTranslation } from 'react-i18next';
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
import type { MembershipPlan } from '@pantera-negra/shared';

interface DeleteMembershipPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: MembershipPlan | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteMembershipPlanDialog({
  open,
  onOpenChange,
  plan,
  onConfirm,
  isLoading = false,
}: DeleteMembershipPlanDialogProps) {
  const { t } = useTranslation();

  if (!plan) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('membershipPlans.deleteConfirm', '¿Eliminar plan de membresía?')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              'membershipPlans.deleteConfirmDescription',
              '¿Estás seguro de que deseas eliminar el plan "{name}"? Esta acción no se puede deshacer.',
              { name: plan.name }
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('common.cancel', 'Cancelar')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading
              ? t('common.deleting', 'Eliminando...')
              : t('common.delete', 'Eliminar')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
