import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { attendanceApi } from '@/api/attendance';
import type { Membership } from '@pantera-negra/shared';
import { QueryKeys } from '@/lib/query-keys';

interface StudentAttendanceProps {
  membership: Membership | null | undefined;
  membershipId?: string;
  isLoading?: boolean;
}

export function StudentAttendance({ membership, membershipId, isLoading: membershipLoading }: StudentAttendanceProps) {
  const { t } = useTranslation();

  // Check if user registration is pending or rejected - don't show attendance info in that case
  const registrationStatus = (membership as any)?.user?.registration?.status;
  const isPending = registrationStatus === 'pending';
  const isRejected = registrationStatus === 'rejected';
  
  if (isPending || isRejected) {
    return null;
  }

  // Fetch attendance count
  const {
    data: attendanceCount = 0,
    isLoading: attendanceLoading,
  } = useQuery({
    queryKey: [QueryKeys.attendanceCount, membershipId],
    queryFn: async () => {
      if (!membershipId) {
        return 0;
      }
      const attendances = await attendanceApi.getAll({ membershipId });
      return attendances.filter((a) => a.checkedIn).length;
    },
    enabled: !!membershipId,
  });

  const isLoading = membershipLoading || attendanceLoading;

  // Calculate remaining classes if plan has class limit
  const getRemainingClasses = () => {
    if (!membership?.plan) return null;
    const planLower = membership.plan.toLowerCase();
    
    // Check if plan has class limit (e.g., "10 clases", "X clases")
    const classMatch = planLower.match(/(\d+)\s*(clase|class)/);
    if (classMatch) {
      const totalClasses = parseInt(classMatch[1], 10);
      const remaining = Math.max(0, totalClasses - attendanceCount);
      return { total: totalClasses, remaining };
    }
    return null;
  };

  const classInfo = getRemainingClasses();

  if (isLoading) {
    return (
      <Card variant="interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          {t('portal.attendance.title')}
        </CardTitle>
        <CardDescription>{t('portal.attendance.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          {/* Total Check-ins */}
          <div className="flex items-center justify-center py-3 sm:py-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2 flex items-center justify-center gap-2">
                {attendanceCount}
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('portal.attendance.totalCheckIns')}</p>
            </div>
          </div>

          {/* Remaining Classes (if applicable) */}
          {classInfo && (
            <div className="pt-3 sm:pt-4 border-t">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground">{t('portal.attendance.totalClasses')}</span>
                <span className="text-xs sm:text-sm font-medium">{classInfo.total}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mt-2">
                <span className="text-xs sm:text-sm text-muted-foreground">{t('portal.attendance.remainingClasses')}</span>
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    classInfo.remaining === 0 ? 'text-destructive' : 'text-foreground'
                  }`}
                >
                  {classInfo.remaining}
                </span>
              </div>
              {classInfo.remaining === 0 && (
                <p className="text-xs text-destructive mt-2">{t('portal.attendance.noClassesRemaining')}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

