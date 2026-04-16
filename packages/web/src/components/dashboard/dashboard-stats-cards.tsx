import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Users, CalendarDays, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/providers/dashboard-provider';
import { useTranslation } from '@/hooks/use-translation';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function DashboardStatsCards() {
  const { stats } = useDashboard();
  const { t } = useTranslation();
  
  const isLoading = stats.isLoading;
  const error = stats.error;
  const data = stats.data;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{t('dashboard.error')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const revenueChangePercent = formatPercent(data.totalRevenue.changePercent);
  const attendanceChangePercent = formatPercent(data.monthlyAttendance.changePercent);
  const retentionPercent = data.retention.current;
  const retentionChange = data.retention.change;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.totalRevenue.title')}
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue.current)}</div>
          <p className="text-xs text-muted-foreground">
            {revenueChangePercent} {t('dashboard.totalRevenue.thisMonth')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.activeMembers.title')}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{data.activeMembers.current}</div>
          <p className="text-xs text-muted-foreground">
            +{data.activeMembers.change} {t('dashboard.activeMembers.new')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.monthlyAttendance.title')}
          </CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{data.monthlyAttendance.current}</div>
          <p className="text-xs text-muted-foreground">
            {attendanceChangePercent} {t('dashboard.monthlyAttendance.vsPreviousMonth')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.retention.title')}</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{retentionPercent.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {formatPercent(retentionChange)} {t('dashboard.retention.thisQuarter')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

