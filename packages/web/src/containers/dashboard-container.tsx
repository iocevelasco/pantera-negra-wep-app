import { DashboardView } from '@/components/dashboard/dashboard-view';
import { DashboardProvider } from '@/providers/dashboard-provider';

export function DashboardContainer() {
  return (
    <DashboardProvider>
      <DashboardView />
    </DashboardProvider>
  );
}

