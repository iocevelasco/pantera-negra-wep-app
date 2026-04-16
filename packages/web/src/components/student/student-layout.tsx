import { ReactNode, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { StudentSession } from './student-session';
import { Footer } from '@/components/footer';
import { usePushNotifications } from '@/hooks/notifications/use-push-notifications';
import { useUser } from '@/hooks/user/use-user';
import { useMembership } from '@/hooks/memberships/use-memberships';
import { useAttendanceCount } from '@/hooks/attendance/use-attendance';
import { usePaymentsByMembership } from '@/hooks/payments/use-payments';
import { tenantsApi } from '@/api/tenants';
import { NotificationActivationAlert } from '@/components/notifications/notification-activation-alert';
import { cn } from '@/lib/utils';
import type { Membership, Tenant, Payment } from '@pantera-negra/shared';
import type { UserData } from '@/stores/user-store';
import { QueryKeys } from '@/lib/query-keys';

interface StudentDataContextValue {
  user: UserData | null;
  membership: Membership | null | undefined;
  tenant: Tenant | null | undefined;
  attendanceCount: number;
  payments: Payment[];
  isLoading: boolean;
  membershipLoading: boolean;
  tenantLoading: boolean;
  attendanceLoading: boolean;
  paymentsLoading: boolean;
  error: Error | null;
  membershipError: Error | null;
  tenantError: Error | null;
  attendanceError: Error | null;
  paymentsError: Error | null;
  isPending: boolean;
  isRejected: boolean;
  isConfirmed: boolean;
  refetch: () => void;
  refetchMembership: () => void;
  refetchTenant: () => void;
  refetchAttendance: () => void;
  refetchPayments: () => void;
}

const StudentDataContext = createContext<StudentDataContextValue | null>(null);

export function useStudentData(): StudentDataContextValue {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error('useStudentData must be used within StudentLayout');
  }
  return context;
}

interface StudentLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
}

export function StudentLayout({ 
  children,
  showHeader = true,
  headerTitle,
  headerSubtitle
}: StudentLayoutProps) {
  const { t } = useTranslation();
  const { user, isLoading: userLoading, error: userError, refetch: refetchUser } = useUser();

  // Fetch membership
  const {
    data: membership,
    isLoading: membershipLoading,
    error: membershipError,
    refetch: refetchMembership,
  } = useMembership(user?.membership_id || '');

  // Fetch tenant information
  const {
    data: tenant,
    isLoading: tenantLoading,
    error: tenantError,
    refetch: refetchTenant,
  } = useQuery({
    queryKey: [QueryKeys.tenant, user?.tenant_id],
    queryFn: () => {
      if (!user?.tenant_id) {
        throw new Error('No tenant ID provided');
      }
      return tenantsApi.getById(user.tenant_id);
    },
    enabled: !!user?.tenant_id,
  });

  // Fetch attendance count
  const {
    data: attendanceCount = 0,
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useAttendanceCount(user?.membership_id || '');

  // Fetch payments
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = usePaymentsByMembership(user?.membership_id || '');

  // Calculate registration status
  const registrationStatus = (user as any)?.registration?.status;
  const isPending = registrationStatus === 'pending';
  const isRejected = registrationStatus === 'rejected';
  const isConfirmed = !isPending && !isRejected;

  // Auto-subscribe to push notifications when user enters student layout
  const { isActivating, hasActivated } = usePushNotifications({
    autoSubscribe: true,
    autoSubscribeCondition: () => !!user, // Only auto-subscribe when user is loaded
  });

  const contextValue: StudentDataContextValue = {
    user: user || null,
    membership,
    tenant: tenant || null,
    attendanceCount,
    payments,
    isLoading: userLoading,
    membershipLoading,
    tenantLoading,
    attendanceLoading,
    paymentsLoading,
    error: userError as Error | null,
    membershipError: membershipError as Error | null,
    tenantError: tenantError as Error | null,
    attendanceError: attendanceError as Error | null,
    paymentsError: paymentsError as Error | null,
    isPending,
    isRejected,
    isConfirmed,
    refetch: refetchUser,
    refetchMembership,
    refetchTenant,
    refetchAttendance,
    refetchPayments,
  };

  return (
    <StudentDataContext.Provider value={contextValue}>
      <div className="min-h-screen w-full relative bg-background text-foreground flex flex-col">
        {/* Background decoration - Full viewport */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10 z-0">
          <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        </div>

        {/* Content container */}
        <div className="relative z-10 container mx-auto max-w-7xl p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 pb-20 sm:pb-6">
          {/* Notification Activation Alert - Show at the top */}
          {(isActivating || hasActivated) && (
            <div className={cn("w-full")}>
              <NotificationActivationAlert
                isActivating={isActivating}
                isActivated={hasActivated}
              />
            </div>
          )}

          {/* Header */}
          {showHeader && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="p-2 rounded-xl">
                  <img 
                    src="/logo.png" 
                    alt="Pantera Negra Logo" 
                    className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
                    {headerTitle || t('portal.title')}
                  </h1>
                  <p className="text-xs sm:text-base text-muted-foreground mt-1 line-clamp-2 uppercase tracking-widest font-medium">
                    {headerSubtitle || t('portal.subtitle')}
                  </p>
                </div>
              </div>
              {/* Desktop Logout Button */}
              <div className="hidden sm:block">
                <StudentSession />
              </div>
            </div>
          )}

          {/* Main Content */}
          {children}
        </div>

        {/* Mobile Footer with Logout Button */}
        <footer className="fixed bottom-0 left-0 right-0 bg-background border-t sm:hidden z-50 p-4 shadow-lg">
          <div className="container mx-auto max-w-7xl">
            <StudentSession />
          </div>
        </footer>

        {/* Desktop Footer */}
        <div className="hidden sm:block relative z-10">
          <Footer />
        </div>
      </div>
    </StudentDataContext.Provider>
  );
}

