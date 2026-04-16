import { DashboardLayout } from '@/components/dashboard-layout';
import { useTranslation } from 'react-i18next';
import { RegistrationsTableContainer } from './registrations-table-container';

export function RegistrationsView() {
  const { t } = useTranslation();

  return (
    <DashboardLayout title={t('registrations.title', 'Solicitudes de Registro')}>
      <div className="flex flex-1 flex-col gap-4 p-3 md:p-6">
        <RegistrationsTableContainer />
      </div>
    </DashboardLayout>
  );
}

