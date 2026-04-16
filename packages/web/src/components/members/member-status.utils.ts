import type { Membership } from '@pantera-negra/shared';

/**
 * Calculate membership status color based on expiration date
 * Returns color classes and styles for consistent status indicators
 * 
 * Color palette:
 * - Green (#07C58A): Active and not expiring soon (more than 7 days remaining)
 * - Orange (#FF9A3C): Expiring soon (7 days or less remaining)
 * - Red (#FF5C5C): Expired (Past Due)
 */
export function getMembershipStatusColor(
  member: Membership,
  t: (key: string, options?: { defaultValue?: string }) => string
): {
  borderClass: string;
  bgStyle: React.CSSProperties;
  textColor: string;
  label: string;
} {
  const memberWithDates = member as Membership & { subscriptionExpiresAt?: string };
  const now = new Date();

  if (!memberWithDates.subscriptionExpiresAt) {
    // Sin fecha: tratamos como activo
    return {
      borderClass: 'border-[rgba(7,197,138,1)]',
      bgStyle: { backgroundColor: 'rgba(7,197,138,0.08)' },
      textColor: '#07C58A',
      label: t('members.status.active'),
    };
  }

  const expirationDate = new Date(memberWithDates.subscriptionExpiresAt);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilExpiration = Math.ceil(
    (expirationDate.getTime() - now.getTime()) / msPerDay
  );

  // Expirado
  if (daysUntilExpiration < 0 || member.status === 'Past Due') {
    return {
      borderClass: 'border-[rgba(255,92,92,1)]',
      bgStyle: { backgroundColor: 'rgba(255,92,92,0.08)' },
      textColor: '#FF5C5C',
      label: t('members.status.pastDue'),
    };
  }

  // Por vencer pronto: 7 días o menos
  if (daysUntilExpiration <= 7) {
    return {
      borderClass: 'border-[rgba(255,154,60,1)]',
      bgStyle: { backgroundColor: 'rgba(255,154,60,0.08)' },
      textColor: '#FF9A3C',
      label: t('members.status.expiringSoon', { defaultValue: 'Por Vencer' }),
    };
  }

  // Activo y sin urgencia
  return {
    borderClass: 'border-[rgba(7,197,138,1)]',
    bgStyle: { backgroundColor: 'rgba(7,197,138,0.08)' },
    textColor: '#07C58A',
    label: t('members.status.active'),
  };
}

