import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { paymentsApi } from '@/api/payments';
import type { Membership, Payment } from '@pantera-negra/shared';
import { QueryKeys } from '@/lib/query-keys';

interface StudentPaymentsProps {
  membership: Membership | null | undefined;
  membershipId?: string;
  isLoading?: boolean;
  user?: { registration?: { status?: string } } | null;
}

export function StudentPayments({ membership, membershipId, isLoading: membershipLoading, user }: StudentPaymentsProps) {
  const { t } = useTranslation();

  // Check if user registration is pending or rejected - don't show payments info in that case
  const registrationStatus = user?.registration?.status || (membership as any)?.user?.registration?.status;
  const isPending = registrationStatus === 'pending';
  const isRejected = registrationStatus === 'rejected';
  
  if (isPending || isRejected) {
    return null;
  }

  // Fetch payments
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useQuery({
    queryKey: [QueryKeys.payments, membershipId],
    queryFn: () => {
      if (!membershipId) {
        throw new Error('No membership ID');
      }
      return paymentsApi.getAll({ membershipId: membershipId });
    },
    enabled: !!membershipId,
  });

  const isLoading = membershipLoading || paymentsLoading;

  // Get last payment
  const lastPayment = payments
    .filter((p) => p.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // Get next expiration date
  const nextExpiration = membership?.subscriptionExpiresAt;

  if (isLoading) {
    return (
      <Card variant="interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t('portal.payments.title')}
        </CardTitle>
        <CardDescription>{t('portal.payments.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {paymentsError ? (
          <p className="text-xs sm:text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            {t('portal.payments.error')}
          </p>
        ) : lastPayment ? (
          <>
            {/* Last Payment */}
            <div className="space-y-2 sm:space-y-3 pb-3 border-b">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground">{t('portal.payments.lastPayment')}</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  {t('portal.payments.completed')}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  {t('portal.payments.date')}
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  {format(new Date(lastPayment.date), 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  {t('portal.payments.amount')}
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  {lastPayment.currency || 'USD'} {lastPayment.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground">{t('portal.payments.plan')}</span>
                <span className="text-xs sm:text-sm font-medium break-words text-right sm:text-left">{lastPayment.plan}</span>
              </div>
            </div>

            {/* Next Expiration */}
            {nextExpiration && (
              <div className="pt-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t('portal.payments.nextExpiration')}</span>
                  <span className="text-xs sm:text-sm font-medium">
                    {format(new Date(nextExpiration), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground">{t('portal.payments.noPayments')}</p>
        )}
      </CardContent>
    </Card>
  );
}

