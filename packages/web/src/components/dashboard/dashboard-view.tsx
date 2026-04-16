import { DashboardLayout } from '@/components/dashboard-layout';
import { DashboardSummary } from './dashboard-summary';
import { useUser } from '@/hooks/user/use-user';
import { useTranslation } from '@/hooks/use-translation';

export function DashboardView() {
  const { t } = useTranslation();
  // Get user information
  const { user } = useUser();

  return (
    <DashboardLayout title={t('dashboard.title')}>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            {t('dashboard.greeting', { 
              name: user?.name || t('layout.user.name') 
            })}
          </h2>
        </div>
        <DashboardSummary />
      </div>
    </DashboardLayout>
  );
}

