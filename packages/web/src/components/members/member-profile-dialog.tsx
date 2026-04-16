import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useUsersStore } from "@/stores/users-store";
import { StudentProfile } from "@/components/student/student-profile";
import { StudentSummary } from "@/components/student/student-summary";
import type { UserData } from "@/stores/user-store";

/**
 * Converts UserWithRelations to UserData format for student components
 */
function convertToUserData(user: any): UserData & { created_at?: string } {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    picture: user.picture,
    email_verified: user.email_verified,
    membership_id: user.membership_id,
    tenant_id: user.tenant_id,
    rank: user.rank || 'White',
    stripes: user.stripes || 0,
    created_at: user.created_at,
  } as UserData & { created_at?: string };
}

export function MemberProfileDialog() {
  const { t } = useTranslation();
  const { isProfileModalOpen, selectedUser, closeProfileModal } =
    useUsersStore();

  if (!selectedUser) {
    return null;
  }

  // Convert UserWithRelations to UserData format
  const userData = convertToUserData(selectedUser);
  const membership = selectedUser.membership;

  return (
    <Dialog
      open={isProfileModalOpen}
      onOpenChange={(open) => !open && closeProfileModal()}
    >
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("members.profile.title", { defaultValue: "Perfil del Usuario" })}
          </DialogTitle>
          <DialogDescription>
            {t("members.profile.description", {
              defaultValue: "Información detallada del usuario",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mt-4">
          {/* Student Profile */}
          <div className="lg:col-span-2">
            <StudentProfile 
              user={userData}
            />
          </div>

          {/* Complete Summary: Membership, Attendance & Payments */}
          <div className="lg:col-span-2">
            <StudentSummary
              user={userData}
              allowImageUpload={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

