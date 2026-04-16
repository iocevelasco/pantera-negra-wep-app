import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMemberActions } from "@/hooks/members/use-member-actions";
import { MemberModal } from "./member-modal";
import { MemberProfileDialog } from "./member-profile-dialog";
import { DeleteMemberDialog } from "./delete-member-dialog";
import { MemberCard } from "./member-card";
import type { UserWithRelations } from "@/api/users";

interface MembersListProps {
  users: UserWithRelations[];
}

export function MembersList({
  users,
}: MembersListProps) {
  const { t } = useTranslation();
  const { handleEdit, handleDelete, handleViewProfile } = useMemberActions();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRelations | null>(null);

  function handleConfirmDelete() {
    if (userToDelete) {
      handleDelete(userToDelete.id);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  }

  function handleCardClick(user: UserWithRelations) {
    handleViewProfile(user.id);
  }

  if (users.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        {t("members.table.noMembers")}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <MemberCard
            key={user.id}
            user={user}
            onEdit={handleEdit}
            onDelete={(user) => {
              setUserToDelete(user);
              setDeleteConfirmOpen(true);
            }}
            onViewProfile={handleCardClick}
          />
        ))}
      </div>

      {/* Edit User Modal */}
      <MemberModal mode="edit" />

      {/* User Profile Dialog */}
      <MemberProfileDialog />

      {/* Delete Confirmation Dialog */}
      <DeleteMemberDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        member={userToDelete as any}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

