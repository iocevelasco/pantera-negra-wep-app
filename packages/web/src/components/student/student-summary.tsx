import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Calendar,
  Hash,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { usersApi } from "@/api/users";
import { useUser } from "@/hooks/user/use-user";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useStudentData } from "./student-layout";
import { StudentMembership } from "./student-membership";
import { QueryKeys } from "@/lib/query-keys";

interface StudentSummaryProps {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    picture?: string;
    membership_id?: string;
  } | null;
  allowImageUpload?: boolean;
}

export function StudentSummary({
  user: propsUser,
  allowImageUpload = true,
}: StudentSummaryProps = {}) {
  const { t } = useTranslation();
  const { 
    user: hookUser, 
    membership,
    attendanceCount,
    payments,
    attendanceLoading,
    paymentsLoading,
    isPending,
    isRejected,
  } = useStudentData();
  
  // Use props if provided, otherwise use hook data
  const user = propsUser ?? hookUser;
  
  const { refetch: refetchUser } = useUser();
  const queryClient = useQueryClient();

  // Don't show summary if registration is pending or rejected
  if (isPending || isRejected) {
    return null;
  }

  // Calculate user initials for avatar fallback
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  const isLoadingData = attendanceLoading || paymentsLoading;

  // Calculate remaining classes if plan has class limit
  const getRemainingClasses = () => {
    if (!membership?.plan) return null;
    const planLower = membership.plan.toLowerCase();
    const classMatch = planLower.match(/(\d+)\s*(clase|class)/);
    if (classMatch) {
      const totalClasses = parseInt(classMatch[1], 10);
      const remaining = Math.max(0, totalClasses - attendanceCount);
      return { total: totalClasses, remaining };
    }
    return null;
  };

  // Get last completed payment
  const lastPayment = payments
    .filter((p) => p.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const classInfo = getRemainingClasses();

  // Early returns for loading state
  if (isLoadingData) {
    return (
      <Card variant="interactive" className="pt-0 overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-2xl h-full">
        <CardContent className="p-0 space-y-0 h-full flex flex-col">
          <div className="space-y-2 border-b border-border/50 pb-4 p-4">
            <Skeleton className="h-8 w-40 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="p-6 sm:p-8 flex-1 flex flex-col space-y-6">
            <Skeleton className="h-28 w-28 rounded-full mx-auto" />
            <div className="h-1.5 w-full bg-primary/20" />
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="interactive" className="pt-0 overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-2xl h-full">
      <CardContent className="p-0 space-y-0 h-full flex flex-col">
        {/* Decorative Top Bar */}
        <div className="space-y-2 border-b border-border/50 pb-4 p-4">
            <div className="flex items-center gap-3 justify-center">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-center tracking-tight text-foreground">
                {t("portal.summary.title", "Resumen")}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center font-medium flex items-center gap-2 opacity-70 uppercase tracking-widest">
              {t("portal.attendance.description")} • {t("portal.payments.description")}
            </p>
          </div>
        <div className="p-6 sm:p-8 flex-1 flex flex-col space-y-6 sm:space-y-8">
          {/* Photo and Basic Info */}
          {user && (
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 from-primary to-primary/20 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500" />
                {allowImageUpload ? (
                  <ImageUpload
                  currentImageUrl={user.picture}
                  uploadAsAvatar={true}
                  userId={user.id}
                  onUploadSuccess={async (url) => {
                    try {
                      if (user.id) {
                        await usersApi.update(user.id, { picture: url });
                        await refetchUser();
                        await queryClient.invalidateQueries({ queryKey: [QueryKeys.user] });
                        toast.success(t('portal.profile.avatarUpdated') || 'Avatar updated successfully');
                      }
                    } catch (error) {
                      console.error('Failed to update user avatar:', error);
                      toast.error(t('portal.profile.avatarUpdateError') || 'Failed to update avatar');
                    }
                  }}
                  onUploadError={(error) => {
                    toast.error(error);
                  }}
                  folder="users/avatars"
                  size="lg"
                  />
                ) : (
                  <Avatar className="h-28 w-28 sm:h-36 sm:w-32 border-2 border-primary/20">
                    <AvatarImage src={user.picture} alt={user.name || user.email} />
                    <AvatarFallback className="text-2xl bg-secondary text-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          )}
          <div className="h-1.5 w-full bg-primary shadow-[0_0_15px_rgba(239,35,60,0.5)]" />
          <div className="space-y-6 flex-1">
            {/* Student ID */}
            {user?.id && (
              <div className="flex flex-col p-4 bg-secondary/20 rounded-2xl border border-border/30">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2 opacity-60 flex items-center gap-1.5">
                  <Hash className="h-3 w-3 text-primary" />
                  {t("portal.profile.studentId")}
                </span>
                <span className="text-sm font-mono font-bold text-foreground">{user.id.slice(0, 8).toUpperCase()}</span>
              </div>
            )}

            {/* Membership Information - Using StudentMembership component */}
            <StudentMembership />

            {/* Attendance Statistics - Featured Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/20 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-500" />
              <div className="relative bg-secondary/40 rounded-2xl p-6 border border-primary/10 shadow-inner overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5 pointer-events-none transform rotate-12">
                  <TrendingUp className="w-32 h-32 text-primary" />
                </div>
                
                <div className="flex flex-col items-center sm:flex-row sm:justify-between gap-6 relative z-10">
                  <div className="text-center sm:text-left space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/80">
                      {t("portal.attendance.totalCheckIns")}
                    </p>
                    <div className="text-5xl sm:text-6xl font-black tracking-tighter text-foreground flex items-baseline gap-2">
                      {attendanceCount}
                      <span className="text-sm font-bold text-muted-foreground opacity-50 uppercase tracking-widest">clases</span>
                    </div>
                  </div>

                  {classInfo && (
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <div className="text-center p-3 bg-secondary/60 rounded-xl border border-border/50">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">
                          {t("portal.attendance.remainingClasses")}
                        </p>
                        <p className={`text-xl font-black ${classInfo.remaining === 0 ? "text-primary animate-pulse" : "text-foreground"}`}>
                          {classInfo.remaining} / {classInfo.total}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Last Payment Card */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground opacity-70">
                <DollarSign className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-[0.2em]">
                  {t("portal.payments.title")}
                </h4>
              </div>

              {lastPayment ? (
                <div className="p-4 bg-secondary/20 rounded-xl border border-border/30 flex items-center justify-between group hover:border-primary/20 transition-all">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">
                      {lastPayment.currency || "USD"} {lastPayment.amount.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium opacity-70">
                      {format(new Date(lastPayment.date), "dd MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] font-black uppercase tracking-tighter px-2">
                    {t("portal.payments.completed")}
                  </Badge>
                </div>
              ) : (
                <div className="p-4 text-center bg-secondary/10 rounded-xl border border-dashed border-border/50">
                  <p className="text-xs text-muted-foreground font-medium">{t("portal.payments.noPayments")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
