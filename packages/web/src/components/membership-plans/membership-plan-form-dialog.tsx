import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { MembershipPlan } from '@pantera-negra/shared';

const membershipPlanFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['monthly', 'quarterly', 'yearly', 'custom']),
  duration: z.number().int().positive('La duración debe ser un número positivo'),
  description: z.string().min(1, 'La descripción es requerida'),
  price: z.number().min(0, 'El precio debe ser no negativo').optional().nullable(),
  active: z.boolean().default(true),
});

type MembershipPlanFormValues = z.infer<typeof membershipPlanFormSchema>;

interface MembershipPlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: MembershipPlan | null;
  onSubmit: (data: Omit<MembershipPlan, 'id' | 'created_at' | 'updated_at'>) => void;
  isLoading?: boolean;
}

export function MembershipPlanFormDialog({
  open,
  onOpenChange,
  plan,
  onSubmit,
  isLoading = false,
}: MembershipPlanFormDialogProps) {
  const { t } = useTranslation();

  const form = useForm<MembershipPlanFormValues>({
    resolver: zodResolver(membershipPlanFormSchema),
    defaultValues: {
      name: '',
      type: 'monthly',
      duration: 1,
      description: '',
      price: undefined,
      active: true,
    },
  });

  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        type: plan.type,
        duration: plan.duration,
        description: plan.description,
        price: plan.price ?? undefined,
        active: plan.active,
      });
    } else {
      form.reset({
        name: '',
        type: 'monthly',
        duration: 1,
        description: '',
        price: undefined,
        active: true,
      });
    }
  }, [plan, form, open]);

  const handleSubmit = (data: MembershipPlanFormValues) => {
    onSubmit({
      ...data,
      price: data.price ?? undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {plan
              ? t('membershipPlans.editPlan', 'Editar Plan de Membresía')
              : t('membershipPlans.createPlan', 'Crear Plan de Membresía')}
          </DialogTitle>
          <DialogDescription>
            {plan
              ? t('membershipPlans.editPlanDescription', 'Modifica los detalles del plan de membresía')
              : t('membershipPlans.createPlanDescription', 'Completa los datos para crear un nuevo plan de membresía')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('membershipPlans.form.name', 'Nombre')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('membershipPlans.form.namePlaceholder', 'Ej: Plan Mensual')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('membershipPlans.form.type', 'Tipo')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">
                          {t('membershipPlans.types.monthly', 'Mensual')}
                        </SelectItem>
                        <SelectItem value="quarterly">
                          {t('membershipPlans.types.quarterly', 'Trimestral')}
                        </SelectItem>
                        <SelectItem value="yearly">
                          {t('membershipPlans.types.yearly', 'Anual')}
                        </SelectItem>
                        <SelectItem value="custom">
                          {t('membershipPlans.types.custom', 'Personalizado')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('membershipPlans.form.duration', 'Duración (meses)')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('membershipPlans.form.description', 'Descripción')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('membershipPlans.form.descriptionPlaceholder', 'Descripción del plan...')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('membershipPlans.form.price', 'Precio (opcional)')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={t('membershipPlans.form.pricePlaceholder', 'Ej: 50.00')}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? undefined : parseFloat(value) || 0);
                      }}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('membershipPlans.form.priceDescription', 'Precio del plan en euros (opcional)')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('membershipPlans.form.active', 'Activo')}
                    </FormLabel>
                    <FormDescription>
                      {t('membershipPlans.form.activeDescription', 'Los planes inactivos no estarán disponibles para seleccionar')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t('common.cancel', 'Cancelar')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? t('common.saving', 'Guardando...')
                  : plan
                  ? t('common.update', 'Actualizar')
                  : t('common.create', 'Crear')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
