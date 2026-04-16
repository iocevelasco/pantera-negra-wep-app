import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { BeltBadge } from '@/components/belt-badge';
import { useDashboard } from '@/providers/dashboard-provider';
import { useTranslation } from '@/hooks/use-translation';

export function DashboardAtRiskMembers() {
  const { stats } = useDashboard();
  const { t } = useTranslation();
  
  const members = stats.data?.atRiskMembers || [];
  const isLoading = stats.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="ml-4 space-y-1 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('members.table.noMembers')}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {members.map((member) => (
        <div key={member.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {member.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{member.name}</p>
            <div className="flex items-center gap-2">
              <BeltBadge rank={member.rank as string} />
            </div>
          </div>
          <div className="ml-auto font-medium text-destructive text-sm">
            {member.daysSinceLastSeen} {t('dashboard.atRiskMembers.days')}
          </div>
        </div>
      ))}
    </div>
  );
}

