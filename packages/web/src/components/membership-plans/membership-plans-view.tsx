import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { membershipPlansApi } from '@/api/membership-plans';
import type { MembershipPlan } from '@pantera-negra/shared';
import { MembershipPlansTable } from './membership-plans-table';
import { MembershipPlanFormDialog } from './membership-plan-form-dialog';
import { DeleteMembershipPlanDialog } from './delete-membership-plan-dialog';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { QueryKeys } from '@/lib/query-keys';

export function MembershipPlansView() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<MembershipPlan | null>(null);

  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: [QueryKeys.membershipPlans],
    queryFn: () => membershipPlansApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: membershipPlansApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.membershipPlans] });
      toast.success(t('membershipPlans.createSuccess', 'Plan de membresía creado exitosamente'));
      setIsFormOpen(false);
      setEditingPlan(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t('membershipPlans.createError', 'Error al crear el plan de membresía')
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MembershipPlan> }) =>
      membershipPlansApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.membershipPlans] });
      toast.success(t('membershipPlans.updateSuccess', 'Plan de membresía actualizado exitosamente'));
      setIsFormOpen(false);
      setEditingPlan(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t('membershipPlans.updateError', 'Error al actualizar el plan de membresía')
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: membershipPlansApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.membershipPlans] });
      toast.success(t('membershipPlans.deleteSuccess', 'Plan de membresía eliminado exitosamente'));
      setDeletingPlan(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t('membershipPlans.deleteError', 'Error al eliminar el plan de membresía')
      );
    },
  });

  const handleCreate = () => {
    setEditingPlan(null);
    setIsFormOpen(true);
  };

  const handleEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleDelete = (plan: MembershipPlan) => {
    setDeletingPlan(plan);
  };

  const handleFormSubmit = (data: Omit<MembershipPlan, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingPlan) {
      deleteMutation.mutate(deletingPlan.id);
    }
  };

  return (
    <DashboardLayout title={t('membershipPlans.title', 'Gestión de Planes de Membresía')}>
      <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              {t('membershipPlans.title', 'Gestión de Planes de Membresía')}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t('membershipPlans.subtitle', 'Administra los tipos de planes de membresía disponibles')}
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('membershipPlans.create', 'Crear Plan')}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('membershipPlans.loadError', 'Error al cargar los planes de membresía')}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('membershipPlans.loading', 'Cargando...')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                {t('membershipPlans.loadingPlans', 'Cargando planes de membresía...')}
              </div>
            </CardContent>
          </Card>
        ) : (
          <MembershipPlansTable
            plans={plans}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <MembershipPlanFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          plan={editingPlan}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        <DeleteMembershipPlanDialog
          open={!!deletingPlan}
          onOpenChange={(open) => !open && setDeletingPlan(null)}
          plan={deletingPlan}
          onConfirm={handleConfirmDelete}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
