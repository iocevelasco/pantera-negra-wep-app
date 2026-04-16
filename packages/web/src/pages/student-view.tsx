import { Card, CardContent } from '@/components/ui/card';
import { useStudentData } from '@/components/student/student-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { StudentProfile } from '@/components/student/student-profile';
import { StudentSummary } from '@/components/student/student-summary';
import { PendingRegistrationAlert } from '@/components/student/pending-registration-alert';
import { RejectedRegistrationAlert } from '@/components/student/rejected-registration-alert';
import { TenantSelectionAlert } from '@/components/student/tenant-selection-alert';
import { PrivateClassesToggle } from '@/components/student/private-classes-toggle';
import { StudentPrivateClassesView } from '@/components/student/student-private-classes-view';
import { StudentLayout } from '@/components/student/student-layout';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/hooks/auth/use-auth';
import { useUser } from '@/hooks/user/use-user';


function StudentViewContent() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user: currentUser } = useUser();
  const {
    user,
    isLoading,
    isPending,
    isRejected,
    isConfirmed,
    refetch,
  } = useStudentData();

  const handleTenantSelected = () => {
    // Refetch user data after tenant selection
    refetch();
    queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">{t('portal.error.userNotFound')}</p>
        </CardContent>
      </Card>
    );
  }

  // Check if user needs to select tenant
  const needsTenantSelection = !user.tenant_id;
  const hasPrivateClasses = !!currentUser?.private_owner_instructor_id;

  return (
    <div className={cn(
      "flex flex-col gap-4 sm:gap-6",
      isConfirmed && !needsTenantSelection ? "" : "max-w-2xl mx-auto"
    )}>
      {/* Tenant Selection Alert - Priority: Show first if user doesn't have tenant */}
      {needsTenantSelection && (
        <TenantSelectionAlert
          user={user}
          onTenantSelected={handleTenantSelected}
        />
      )}

      {/* Registration Status Alerts - Only show if user has tenant */}
      {!needsTenantSelection && isPending && (
        <PendingRegistrationAlert user={user} />
      )}
      
      {!needsTenantSelection && isRejected && (
        <RejectedRegistrationAlert
          user={user}
          rejectionReason={(user as any).registration?.rejectionReason}
        />
      )}

      {/* Confirmed User Content - Only show if user has tenant and is confirmed */}
      {isConfirmed && !needsTenantSelection && (
        <div className='max-w-2xl mx-auto space-y-4 sm:space-y-6'>
          <StudentProfile />
          <PrivateClassesToggle />
          <StudentSummary allowImageUpload={true} />
          {hasPrivateClasses && <StudentPrivateClassesView />}
        </div>
      )}
    </div>
  );
}

export function StudentViewPage() {
  return (
    <StudentLayout>
      <StudentViewContent />
    </StudentLayout>
  );
}
