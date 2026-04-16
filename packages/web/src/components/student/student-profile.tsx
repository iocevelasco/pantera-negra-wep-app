import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CheckInDialog } from "./check-in-dialog";
import { BeltBadge } from "@/components/belt-badge";
import { UserInfoEditable } from "./user-info-editable";
import { useStudentData } from "./student-layout";
import type { UserData } from "@/stores/user-store";

interface StudentProfileProps {
  user?: UserData;
  isLoading?: boolean;
}

export function StudentProfile(props?: StudentProfileProps) {
  const { t } = useTranslation();
  const hookData = useStudentData();
  const { user: hookUser, isLoading: hookIsLoading } = hookData;
  
  // Use props if provided, otherwise use hook data
  const user = props?.user ?? hookUser;
  const isLoading = props?.isLoading ?? hookIsLoading;
  
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);

  if (isLoading || !user) {
    return (
      <Card
        variant="interactive"
        className="overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-2xl pt-0"
      >
        <CardContent className="p-0 space-y-0">
          <div className="sm:p-6 sm:space-y-6 space-y-4 pt-6 flex flex-col p-2">
            <div className="space-y-3 pb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
            <div className="h-1.5 w-full bg-primary/20" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const studentEnabled = (user as any).student_enabled !== false; // Default to true if not set (for backward compatibility)

  return (
    <Card
      variant="interactive"
      className="overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-2xl pt-0"
    >
      <CardContent className="p-0 space-y-0">
        <div className="sm:p-6 sm:space-y-6 space-y-4 pt-6 flex flex-col p-2">
          {/* User Info - Editable */}
          <UserInfoEditable
            name={user.name}
            email={user.email}
            phone={user.phone}
            className="pb-4"
          />
          <div className="h-1.5 w-full bg-primary shadow-[0_0_15px_rgba(239,35,60,0.5)]" />

          {/* Belt Rank - Featured */}
          {user.rank && (
            <div className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-2xl border border-primary/10 shadow-inner">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3 opacity-60">
                {t("portal.profile.beltAndRank", "Cinturón y Grados")}
              </p>
              <BeltBadge user={{ rank: user.rank, stripes: user.stripes }} />
            </div>
          )}

          {/* Check-in Button */}
          {user.membership_id && studentEnabled && (
            <div className="pt-4">
              <Button
                onClick={() => setCheckInDialogOpen(true)}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl shadow-[0_0_20px_rgba(239,35,60,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                {t("attendance.checkIn")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CheckInDialog
        open={checkInDialogOpen}
        onOpenChange={setCheckInDialogOpen}
        membershipId={user.membership_id}
      />
    </Card>
  );
}
