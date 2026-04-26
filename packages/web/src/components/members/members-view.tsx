import { DashboardLayout } from '@/components/dashboard-layout';
import { useTranslation } from 'react-i18next';
import { MembersTableContainer } from './members-table-container';
import { MemberModal } from './member-modal';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { useUsersStore } from '@/stores/users-store';

export function MembersView() {
  const { t } = useTranslation();
  const { openAddModal } = useUsersStore();

  return (
    <DashboardLayout title={t('members.title')}>
      <div className="flex flex-1 flex-col gap-4 p-3 md:p-6">
        <WelcomeBanner onAddMember={openAddModal} />
        <MembersTableContainer
          loadingLabel={t('common.loading')}
        />
        <MemberModal mode="create" />
      </div>
    </DashboardLayout>
  );
}
