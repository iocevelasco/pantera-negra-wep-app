import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Clock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { classesApi } from '@/api/classes';
import { useSelfCheckIn } from '@/hooks/attendance/use-attendance';
import { useAttendances } from '@/hooks/attendance/use-attendance';
import { useIsMobile } from '@/hooks/use-mobile';
import { QueryKeys } from '@/lib/query-keys';

interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membershipId?: string;
}

export function CheckInDialog({ open, onOpenChange, membershipId }: CheckInDialogProps) {
  const { t } = useTranslation();
  const selfCheckInMutation = useSelfCheckIn();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's classes
  const { data: todayClasses = [], isLoading: classesLoading } = useQuery({
    queryKey: [QueryKeys.classes, today],
    queryFn: () => classesApi.getAll({ date: today }),
    enabled: open, // Only fetch when dialog is open
  });

  // Fetch today's attendances to check which classes are already checked in
  const { data: todayAttendances = [] } = useAttendances({
    membershipId,
    date: today,
  });

  const checkedInClassIds = new Set(todayAttendances.map((a) => a.classId));

  // Helper function to translate class type (optional - only for display)
  function getClassTypeLabel(type?: string): string {
    if (!type) return '';
    switch (type) {
      case 'Gi':
        return t('schedule.gi');
      case 'No-Gi':
        return t('schedule.noGi');
      case 'Kids':
        return t('schedule.kids');
      default:
        return type;
    }
  }

  function handleCheckIn(classId: string) {
    selfCheckInMutation.mutate(classId, {
      onSuccess: () => {
        // Invalidate user-related queries to refresh data
        queryClient.invalidateQueries({ queryKey: [QueryKeys.currentUser] });
        
        // Invalidate membership queries (with and without ID)
        if (membershipId) {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.membership, membershipId] });
        }
        queryClient.invalidateQueries({ queryKey: [QueryKeys.membership] });
        
        // Invalidate attendance queries
        queryClient.invalidateQueries({ queryKey: [QueryKeys.attendanceCount] });
        queryClient.invalidateQueries({ queryKey: [QueryKeys.attendance] });
        
        // Invalidate today's classes to refresh check-in status
        queryClient.invalidateQueries({ queryKey: [QueryKeys.classes, today] });
        
        // Show Oss message with success
        toast.success(t('portal.attendance.checkInSuccessOss'), {
          icon: '👊',
          duration: 3000,
        });
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || t('portal.attendance.checkInError'));
      },
    });
  }

  // Shared content component
  const content = (
    <div className="space-y-4 max-h-[450px] overflow-y-auto px-1 py-2 custom-scrollbar">
      {classesLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl bg-secondary/20" />
          <Skeleton className="h-20 w-full rounded-2xl bg-secondary/20" />
        </div>
      ) : todayClasses.length === 0 ? (
        <div className="text-center py-12 px-6 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
          <div className="inline-flex p-4 bg-secondary rounded-full mb-4">
            <Clock className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">{t('portal.attendance.noClassesToday')}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {todayClasses.map((classItem) => {
            const isCheckedIn = checkedInClassIds.has(classItem.id);
            return (
              <div
                key={classItem.id}
                className="group relative flex items-center justify-between p-4 bg-secondary/20 border border-border/30 rounded-2xl transition-all duration-300 hover:border-primary/40 hover:bg-secondary/30"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors tracking-tight">
                    {classItem.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {classItem.startTime} - {classItem.endTime}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium opacity-80 italic normal-case tracking-normal">
                      {classItem.instructor}
                    </span>
                  </div>
                </div>
                <div className="ml-4 shrink-0">
                  {isCheckedIn ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t('portal.attendance.checkedIn')}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleCheckIn(classItem.id)}
                      disabled={selfCheckInMutation.isPending}
                      className="bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-tighter px-5 rounded-full shadow-lg shadow-primary/20"
                    >
                      {selfCheckInMutation.isPending
                        ? t('common.processing')
                        : t('portal.attendance.checkInButton')}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Render Drawer for mobile, Dialog for desktop
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{t('portal.attendance.selectClass')}</DrawerTitle>
            <DrawerDescription>{t('portal.attendance.selectClassDescription')}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('portal.attendance.selectClass')}</DialogTitle>
          <DialogDescription>{t('portal.attendance.selectClassDescription')}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}

