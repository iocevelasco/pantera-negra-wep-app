import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { getMembershipStatusColor } from './member-status.utils';
import type { Membership } from '@pantera-negra/shared';

interface MemberStatusBadgeProps {
  member: Membership
  variant?: 'badge' | 'span';
  className?: string;
}

export function MemberStatusBadge({
  member,
  variant = 'badge',
  className,
}: MemberStatusBadgeProps) {
  const { t } = useTranslation();
  const statusColor = getMembershipStatusColor(member, t);

  if (variant === 'span') {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${className || ''}`}
        style={{
          backgroundColor: statusColor.bgStyle.backgroundColor,
          color: statusColor.textColor,
        }}
      >
        {statusColor.label}
      </span>
    );
  }

  return (
    <Badge
      variant="outline"
      className={className}
      style={{
        color: statusColor.textColor,
        borderColor: statusColor.textColor,
        backgroundColor: statusColor.bgStyle.backgroundColor,
      }}
    >
      {statusColor.label}
    </Badge>
  );
}

