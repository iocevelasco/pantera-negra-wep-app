import React, {useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import type { Classes } from '@pantera-negra/shared';
import { useUser } from '@/hooks/user/use-user';
import { useQuery } from '@tanstack/react-query';
import { tenantsApi } from '@/api/tenants';
import { QueryKeys } from '@/lib/query-keys';

// Extended schema to include isPrivate
const classFormSchema = z.object({
  name: z.string().min(1, 'schedule.management.form.nameRequired'),
  type: z.enum(['Gi', 'No-Gi', 'Kids']).optional(),
  instructor: z.string().optional(),
  startTime: z.string().min(1, 'schedule.management.form.startTimeRequired'),
  endTime: z.string().min(1, 'schedule.management.form.endTimeRequired'),
  date: z.string().min(1, 'schedule.management.form.dateRequired'),
  location: z.string().optional(), // Will be set automatically from tenant
  capacity: z.number().int().positive('schedule.management.form.capacityMin').optional(),
  isPrivate: z.boolean().optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  }
  return true;
}, {
  message: 'schedule.management.form.timeError',
  path: ['endTime'],
});

export type ClassFormData = z.infer<typeof classFormSchema>;

interface ClassFormProps {
  defaultValues?: Partial<ClassFormData & { id?: string }>;
  onSubmit: (data: ClassFormData) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClassForm({ defaultValues, onSubmit, onCancel, isLoading }: ClassFormProps) {
  const { t } = useTranslation();
  const { user } = useUser();

  // Fetch tenant information to get tenant name for location
  const { data: tenant } = useQuery({
    queryKey: [QueryKeys.tenant, user?.tenant_id],
    queryFn: () => tenantsApi.getById(user!.tenant_id!),
    enabled: !!user?.tenant_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      type: defaultValues?.type,
      instructor: defaultValues?.instructor,
      startTime: defaultValues?.startTime || '',
      endTime: defaultValues?.endTime || '',
      date: defaultValues?.date || '',
      location: defaultValues?.location || tenant?.name || '',
      capacity: defaultValues?.capacity,
      isPrivate: defaultValues?.isPrivate || false,
    },
  });

  // Update location when tenant is loaded
  useEffect(() => {
    if (tenant?.name && !defaultValues?.location) {
      setValue('location', tenant.name);
    }
  }, [tenant?.name, setValue, defaultValues?.location]);

  const onSubmitForm = async (data: ClassFormData) => {
    // Ensure location is set from tenant if not provided
    const submitData = {
      ...data,
      location: data.location || tenant?.name || '',
    };
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          {t('schedule.management.form.name')}
          <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="name"
          placeholder={t('schedule.management.form.namePlaceholder')}
          {...register('name')}
          disabled={isLoading}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {t(errors.name.message || 'schedule.management.form.nameRequired')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">
            {t('schedule.management.form.startTime')}
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="startTime"
            type="time"
            placeholder={t('schedule.management.form.startTimePlaceholder')}
            {...register('startTime')}
            disabled={isLoading}
            className={errors.startTime ? 'border-destructive' : ''}
          />
          {errors.startTime && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {t(errors.startTime.message || 'schedule.management.form.startTimeRequired')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">
            {t('schedule.management.form.endTime')}
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="endTime"
            type="time"
            placeholder={t('schedule.management.form.endTimePlaceholder')}
            {...register('endTime')}
            disabled={isLoading}
            className={errors.endTime ? 'border-destructive' : ''}
          />
          {errors.endTime && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {t(errors.endTime.message || 'schedule.management.form.endTimeRequired')}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">
          {t('schedule.management.form.date')}
          <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="date"
          type="date"
          placeholder={t('schedule.management.form.datePlaceholder')}
          {...register('date')}
          disabled={isLoading}
          className={errors.date ? 'border-destructive' : ''}
        />
        {errors.date && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {t(errors.date.message || 'schedule.management.form.dateRequired')}
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? t('common.processing') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}

