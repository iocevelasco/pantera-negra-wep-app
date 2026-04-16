import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MemberStatusBadge } from '@/components/members/member-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, AlertCircle, CheckCircle2, MapPin, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useStudentData } from './student-layout';
import type { Membership } from '@pantera-negra/shared';

interface StudentMembershipProps {
  membership?: Membership | null | undefined;
  isLoading?: boolean;
  error?: Error | null;
}

export function StudentMembership({
  membership: propsMembership,
  isLoading: propsIsLoading,
  error: propsError,
}: StudentMembershipProps = {}) {
  const { t } = useTranslation();
  const {
    membership: hookMembership,
    tenant: hookTenant,
    membershipLoading: hookMembershipLoading,
    membershipError: hookMembershipError,
    isPending,
    isRejected,
  } = useStudentData();

  // Use props if provided, otherwise use hook data
  const membership = propsMembership ?? hookMembership;
  const tenant = hookTenant; // Always use tenant from context (no need for props)
  const isLoading = propsIsLoading ?? hookMembershipLoading;
  const error = propsError ?? hookMembershipError;

  const title = t('portal.membership.title');

  // Check if user registration is pending or rejected - don't show membership info in that case
  if (isPending || isRejected) {
    return null;
  }

  if (isLoading) {
    return (
      <Card variant="interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !membership) {
    return (
      <Card variant="interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {t('portal.membership.error')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { subscriptionExpiresAt } = membership;
  const expirationDate = subscriptionExpiresAt
    ? format(new Date(subscriptionExpiresAt), 'dd/MM/yyyy', { locale: es })
    : null;

  const joinedDate = format(new Date(membership.joined), 'dd/MM/yyyy', { locale: es });

  const now = new Date();
  const isExpired = subscriptionExpiresAt ? new Date(subscriptionExpiresAt) < now : false;

  const isExpiringSoon = subscriptionExpiresAt
    ? new Date(subscriptionExpiresAt) >= now &&
      new Date(subscriptionExpiresAt) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    : false;

  // Determine membership type label
  const getMembershipTypeLabel = (plan?: string) => {
    if (!plan) return t('portal.membership.typeNotSpecified');
    const planLower = plan.toLowerCase();
    if (planLower.includes('mensual') || planLower.includes('monthly')) {
      return t('portal.membership.typeMonthly');
    }
    if (planLower.includes('trimestral') || planLower.includes('quarterly')) {
      return t('portal.membership.typeQuarterly');
    }
    if (planLower.includes('libre') || planLower.includes('unlimited')) {
      return t('portal.membership.typeUnlimited');
    }
    if (planLower.includes('clase') || planLower.includes('class')) {
      return t('portal.membership.typeClasses');
    }
    return plan;
  };

  return (
    <Card variant="interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
            {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <span className="text-xs sm:text-sm text-muted-foreground">{t('portal.membership.status')}</span>
          <MemberStatusBadge member={membership} variant="badge" />
        </div>

        {/* Membership Type */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <span className="text-xs sm:text-sm text-muted-foreground">{t('portal.membership.type')}</span>
          <span className="text-xs sm:text-sm font-medium text-right sm:text-left wrap-break-word">{getMembershipTypeLabel(membership.plan)}</span>
        </div>

        {/* Member Type */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <span className="text-xs sm:text-sm text-muted-foreground">{t('portal.membership.memberType')}</span>
          <Badge variant="outline" className="text-xs">
            {membership.memberType === 'Adult' ? t('portal.membership.adult') : t('portal.membership.kid')}
          </Badge>
        </div>

        {/* Monthly Price */}
        {membership.price !== undefined && membership.price > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {t('portal.membership.monthlyPrice', 'Precio mensual')}
            </span>
            <span className="text-xs sm:text-sm font-medium">
              €{membership.price.toFixed(2)}
            </span>
          </div>
        )}

        {/* Tenant */}
        {tenant && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {t('portal.membership.tenant')}
            </span>
            <span className="text-xs sm:text-sm font-medium">{tenant.name}</span>
          </div>
        )}

        {/* Start Date */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <span className="text-xs sm:text-sm text-muted-foreground">{t('portal.membership.startDate')}</span>
          <span className="text-xs sm:text-sm font-medium">{joinedDate}</span>
        </div>

        {/* Expiration Date */}
        {expirationDate && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <span className="text-xs sm:text-sm text-muted-foreground">{t('portal.membership.expirationDate')}</span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs sm:text-sm font-medium ${
                  isExpired
                    ? 'text-destructive'
                    : isExpiringSoon
                      ? 'text-orange-600'
                      : 'text-foreground'
                }`}
              >
                {expirationDate}
              </span>
              {isExpired ? (
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive shrink-0" />
              ) : isExpiringSoon ? (
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 shrink-0" />
              ) : (
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

