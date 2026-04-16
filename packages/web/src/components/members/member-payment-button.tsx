import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateMembership } from "@/hooks/memberships/use-memberships";
import { paymentsApi } from '@/api/payments';
import { dashboardKeys } from '@/hooks/dashboard/use-dashboard';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';
import type { Membership } from '@pantera-negra/shared';

// Payment amounts constants (matching backend)
const PAYMENT_AMOUNTS = {
  TRANSFER: 54000,
  CASH: 47000,
} as const;

interface MemberPaymentButtonProps {
  member: Membership
  onSuccess?: () => void;
}

type PaymentType = 'transfer' | 'cash' | 'card';

export function MemberPaymentButton({ member, onSuccess }: MemberPaymentButtonProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>('transfer');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const updateMemberMutation = useUpdateMembership();

  // Check if membership is expired based on status or expiration date
  const isExpired = (() => {
    if (member.status === 'Past Due') {
      return true;
    }
    if (member.subscriptionExpiresAt) {
      const expirationDate = new Date(member.subscriptionExpiresAt);
      const now = new Date();
      return now > expirationDate;
    }
    return false;
  })();

  // Payment is confirmed if status is Active AND not expired
  const isPaymentConfirmed = member.status === 'Active' && !isExpired;
  // Disable button if membership is up to date (Active status and not expired)
  const isDisabled = isPaymentConfirmed;

  function handlePaymentClick(e: React.MouseEvent) {
    e.stopPropagation(); // Prevent row click
    if (isPaymentConfirmed) {
      return; // Don't open modal if already paid
    }
    setIsConfirmOpen(true);
  }

  async function handleConfirmPayment() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    setIsCreatingPayment(true);
    
    try {
      // Create payment record
      await paymentsApi.create({
        memberId: member.id,
        paymentType,
        plan: member.plan || 'Mensual',
        currency: 'ARS',
      });

      // Invalidate dashboard stats since payment affects revenue and recent payments
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

      // Update member status and last payment date
      updateMemberMutation.mutate(
        {
          id: member.id,
          lastPaymentDate: today,
          status: 'Active',
        },
        {
          onSuccess: () => {
            toast.success(
              t('members.payment.confirmed', {
                defaultValue: 'Pago confirmado para {{name}}',
                name: member.name,
              })
            );
            setIsConfirmOpen(false);
            setPaymentType('transfer'); // Reset to default
            onSuccess?.();
          },
          onError: (error) => {
            toast.error(
              error.message ||
                t('members.payment.error', {
                  defaultValue: 'Error al confirmar el pago',
                })
            );
          },
          onSettled: () => {
            setIsCreatingPayment(false);
          },
        }
      );
    } catch (error) {
      setIsCreatingPayment(false);
      toast.error(
        error instanceof Error
          ? error.message
          : t('members.payment.error', {
              defaultValue: 'Error al crear el registro de pago',
            })
      );
    }
  }

  const currentLocale = i18n.language || 'es';
  const currentMonth = new Date().toLocaleDateString(currentLocale, {
    month: 'long',
    year: 'numeric',
  });

  // Calculate amount based on payment type
  const getAmount = (type: PaymentType): number => {
    if (type === 'transfer') return PAYMENT_AMOUNTS.TRANSFER;
    if (type === 'cash') return PAYMENT_AMOUNTS.CASH;
    return PAYMENT_AMOUNTS.TRANSFER; // Default for card
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  return (
    <>
      <Button
        variant={isPaymentConfirmed ? 'outline' : 'default'}
        size="sm"
        onClick={handlePaymentClick}
        disabled={isDisabled}
        className="flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        {isPaymentConfirmed
          ? t('members.payment.paid', { defaultValue: 'Pagado' })
          : t('members.payment.pay', { defaultValue: 'Pagar' })}
      </Button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('members.payment.confirmTitle', {
                defaultValue: 'Confirmar Pago',
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('members.payment.confirmDescription', {
                defaultValue:
                  '¿Confirmas el pago de la cuota de {{month}} para {{name}}? Esta acción actualizará el estado de la membresía a "Activa" y extenderá la fecha de vencimiento.',
                month: currentMonth,
                name: member.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-type">
                {t('members.payment.type', { defaultValue: 'Tipo de Pago' })}
              </Label>
              <Select value={paymentType} onValueChange={(value) => setPaymentType(value as PaymentType)}>
                <SelectTrigger id="payment-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">
                    {t('members.payment.transfer', { defaultValue: 'Transferencia' })} - {formatCurrency(PAYMENT_AMOUNTS.TRANSFER)}
                  </SelectItem>
                  <SelectItem value="cash">
                    {t('members.payment.cash', { defaultValue: 'Efectivo' })} - {formatCurrency(PAYMENT_AMOUNTS.CASH)}
                  </SelectItem>
                  <SelectItem value="card">
                    {t('members.payment.card', { defaultValue: 'Tarjeta' })} - {formatCurrency(PAYMENT_AMOUNTS.TRANSFER)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>{t('members.payment.amount', { defaultValue: 'Monto' })}:</strong>{' '}
              {formatCurrency(getAmount(paymentType))}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsConfirmOpen(false);
                setPaymentType('transfer');
              }}
            >
              {t('common.cancel', { defaultValue: 'Cancelar' })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPayment}
              disabled={updateMemberMutation.isPending || isCreatingPayment}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updateMemberMutation.isPending || isCreatingPayment
                ? t('common.processing', { defaultValue: 'Procesando...' })
                : t('members.payment.confirm', { defaultValue: 'Confirmar Pago' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

