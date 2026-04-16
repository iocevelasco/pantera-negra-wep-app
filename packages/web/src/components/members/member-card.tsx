import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BeltBadge } from "@/components/belt-badge";
import { KidsBeltBadge } from "@/components/kids-belt-badge";
import { MemberStatusBadge } from "./member-status-badge";
import { MemberPaymentButton } from "./member-payment-button";
import type { UserWithRelations } from "@/api/users";

interface MemberCardProps {
  user: UserWithRelations;
  onEdit: (user: UserWithRelations) => void;
  onDelete: (user: UserWithRelations) => void;
  onViewProfile: (user: UserWithRelations) => void;
}

export function MemberCard({
  user,
  onEdit,
  onDelete,
  onViewProfile,
}: MemberCardProps) {
  const { t } = useTranslation();
  const membership = user.membership;
  const tenant = user.tenant;

  function handleCardClick() {
    onViewProfile(user);
  }

  function handleEditClick(e: React.MouseEvent) {
    e.stopPropagation();
    onEdit(user);
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(user);
  }

  return (
    <Card
      variant="interactive"
      onClick={handleCardClick}
    >
      <CardHeader className="pr-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-lg font-light truncate cursor-pointer">
                  {user.name || user.email}
                </CardTitle>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.name || user.email}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-muted-foreground mt-1 truncate cursor-pointer">
                  {user.email}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.email}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div
            className="flex gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  aria-label={t("members.actions")}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleEditClick}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>{t("members.actions.editDetails")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>{t("members.actions.deactivate")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {membership && (
          <MemberStatusBadge member={membership as any} variant="badge" />
        )}
        <div className="flex items-center justify-between gap-2 align-center content-center">
          {membership?.subscriptionExpiresAt && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                {t("members.subscriptionExpiresAt")}
              </span>
              <span className="text-sm font-medium">
                {format(
                  new Date(membership.subscriptionExpiresAt),
                  "dd/MM/yyyy",
                  { locale: es }
                )}
              </span>
            </div>
          )}
          {membership && (
            <MemberPaymentButton member={membership as any} />
          )}
        </div>
        {/* Belt Badge - Always shown, KidsBeltBadge for kids, BeltBadge for adults */}
        <div className="flex items-center justify-between gap-2">
          {membership?.memberType === "Kid" ? (
            <KidsBeltBadge user={{ rank: user.rank, stripes: user.stripes }} />
          ) : (
            <BeltBadge user={{ rank: user.rank, stripes: user.stripes }} />
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between">
              {tenant && <Badge variant="secondary">{tenant.name}</Badge>}
            </div>
            {membership && (
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {membership.memberType === "Adult"
                    ? t("members.memberType.adult")
                    : t("members.memberType.kid")}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
