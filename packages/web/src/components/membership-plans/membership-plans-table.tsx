import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import type { MembershipPlan } from '@pantera-negra/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MembershipPlansTableProps {
  plans: MembershipPlan[];
  onEdit: (plan: MembershipPlan) => void;
  onDelete: (plan: MembershipPlan) => void;
}

export function MembershipPlansTable({
  plans,
  onEdit,
  onDelete,
}: MembershipPlansTableProps) {
  const { t } = useTranslation();

  if (plans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('membershipPlans.noPlans', 'No hay planes de membresía')}</CardTitle>
          <CardDescription>
            {t('membershipPlans.noPlansDescription', 'Crea tu primer plan de membresía para comenzar')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('membershipPlans.table.name', 'Nombre')}</TableHead>
            <TableHead>{t('membershipPlans.table.type', 'Tipo')}</TableHead>
            <TableHead>{t('membershipPlans.table.duration', 'Duración')}</TableHead>
            <TableHead>{t('membershipPlans.table.price', 'Precio')}</TableHead>
            <TableHead>{t('membershipPlans.table.status', 'Estado')}</TableHead>
            <TableHead>{t('membershipPlans.table.description', 'Descripción')}</TableHead>
            <TableHead className="text-right">{t('membershipPlans.table.actions', 'Acciones')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">{plan.name}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {t(`membershipPlans.types.${plan.type}`, plan.type)}
                </Badge>
              </TableCell>
              <TableCell>
                {plan.duration} {plan.duration === 1 
                  ? t('membershipPlans.month', 'mes')
                  : t('membershipPlans.months', 'meses')}
              </TableCell>
              <TableCell>
                {plan.price !== undefined && plan.price !== null
                  ? new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(plan.price)
                  : t('membershipPlans.noPrice', 'N/A')}
              </TableCell>
              <TableCell>
                <Badge variant={plan.active ? 'default' : 'secondary'}>
                  {plan.active
                    ? t('membershipPlans.active', 'Activo')
                    : t('membershipPlans.inactive', 'Inactivo')}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">{plan.description}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={t('membershipPlans.table.actions', 'Acciones')}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEdit(plan)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span>{t('membershipPlans.edit', 'Editar')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(plan)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>{t('membershipPlans.delete', 'Eliminar')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
