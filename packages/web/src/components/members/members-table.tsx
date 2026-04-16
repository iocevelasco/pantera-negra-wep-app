import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMemberActions } from "@/hooks/members/use-member-actions";
import { MemberModal } from "./member-modal";
import { MemberProfileDialog } from "./member-profile-dialog";
import { DeleteMemberDialog } from "./delete-member-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BeltBadge } from "@/components/belt-badge";
import { KidsBeltBadge } from "@/components/kids-belt-badge";
import { MemberStatusBadge } from "./member-status-badge";
import { MemberPaymentButton } from "./member-payment-button";
import type { UserWithRelations } from "@/api/users";

interface MembersTableProps {
  users: UserWithRelations[];
}

export function MembersTable({
  users,
}: MembersTableProps) {
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

  function handleRowClick(user: UserWithRelations) {
    handleViewProfile(user.id);
  }

  function handleEditClick(e: React.MouseEvent, user: UserWithRelations) {
    e.stopPropagation();
    handleEdit(user);
  }

  function handleDeleteClick(e: React.MouseEvent, user: UserWithRelations) {
    e.stopPropagation();
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("members.table.name")}</TableHead>
              <TableHead>{t("members.table.payment")}</TableHead>
              <TableHead>{t("members.table.status")}</TableHead>
              <TableHead>{t("members.table.plan")}</TableHead>
              <TableHead>{t("members.table.tenant")}</TableHead>
              <TableHead>{t("members.table.expiresAt")}</TableHead>
              <TableHead>{t("members.table.belt")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const membership = user.membership;
              const tenant = user.tenant;

              return (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(user)}
                >
                  <TableCell className="font-medium">
                    {user.name || user.email}
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex items-center justify-between gap-2">
                    {membership && (
                      <MemberStatusBadge member={membership as any} variant="badge" />
                    )}
                                        {membership && (
                                          <div onClick={(e) => e.stopPropagation()}>
                        <MemberPaymentButton member={membership as any} />
                      </div>
                    )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {membership && (
                      <Badge variant="outline">
                        {membership.memberType === "Adult"
                          ? t("members.memberType.adult")
                          : t("members.memberType.kid")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {membership?.plan ? (
                      <span className="text-sm">{membership.plan}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tenant && <Badge variant="secondary">{tenant.name}</Badge>}
                  </TableCell>
                  <TableCell>
                    {membership?.subscriptionExpiresAt ? (
                      <span className="text-sm">
                        {format(
                          new Date(membership.subscriptionExpiresAt),
                          "dd/MM/yyyy",
                          { locale: es }
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {membership?.memberType === "Kid" ? (
                      <KidsBeltBadge user={{ rank: user.rank, stripes: user.stripes }} />
                    ) : (
                      <BeltBadge user={{ rank: user.rank, stripes: user.stripes }} />
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={t("members.table.actions")}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleEditClick(e, user)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>{t("members.actions.editDetails")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteClick(e, user)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>{t("members.actions.deactivate")}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
