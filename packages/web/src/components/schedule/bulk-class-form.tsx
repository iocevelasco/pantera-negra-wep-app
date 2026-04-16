import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const bulkClassFormSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  selectedDays: z.array(z.number().min(0).max(5)).min(1, 'At least one day must be selected'),
  name: z.string().optional(),
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
  message: 'End time must be after start time',
  path: ['endTime'],
});

export type BulkClassFormData = z.infer<typeof bulkClassFormSchema>;

interface BulkClassFormProps {
  onSubmit: (data: BulkClassFormData) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BulkClassForm({ onSubmit, onCancel, isLoading }: BulkClassFormProps) {
  const { t } = useTranslation();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BulkClassFormData>({
    resolver: zodResolver(bulkClassFormSchema),
    defaultValues: {
      month: currentMonth,
      year: currentYear,
      startTime: '',
      endTime: '',
      selectedDays: [0, 1, 2, 3, 4], // Default: Monday to Friday
      name: '',
    },
  });

  const month = watch('month');
  const year = watch('year');
  const selectedDays = watch('selectedDays') || [];

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthNames = [
    t('common.months.january'),
    t('common.months.february'),
    t('common.months.march'),
    t('common.months.april'),
    t('common.months.may'),
    t('common.months.june'),
    t('common.months.july'),
    t('common.months.august'),
    t('common.months.september'),
    t('common.months.october'),
    t('common.months.november'),
    t('common.months.december'),
  ];

  // Generate year options (current year and next 2 years)
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  const onSubmitForm = async (data: BulkClassFormData) => {
    await onSubmit(data);
  };

  // Calculate how many classes will be created
  const getClassesCount = () => {
    if (!month || !year || !selectedDays || selectedDays.length === 0) return 0;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    let count = 0;
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      const normalizedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
      if (selectedDays.includes(normalizedDay)) {
        count++;
      }
    }
    return count;
  };

  // Days of the week: 0 = Monday, 1 = Tuesday, ..., 5 = Saturday
  const weekDays = [
    { value: 0, label: t('common.days.monday', { defaultValue: 'Lunes' }) },
    { value: 1, label: t('common.days.tuesday', { defaultValue: 'Martes' }) },
    { value: 2, label: t('common.days.wednesday', { defaultValue: 'Miércoles' }) },
    { value: 3, label: t('common.days.thursday', { defaultValue: 'Jueves' }) },
    { value: 4, label: t('common.days.friday', { defaultValue: 'Viernes' }) },
    { value: 5, label: t('common.days.saturday', { defaultValue: 'Sábado' }) },
  ];

  const handleDayToggle = (dayValue: number) => {
    const currentDays = selectedDays || [];
    if (currentDays.includes(dayValue)) {
      setValue('selectedDays', currentDays.filter(d => d !== dayValue), { shouldValidate: true });
    } else {
      setValue('selectedDays', [...currentDays, dayValue], { shouldValidate: true });
    }
  };

  const classesCount = getClassesCount();

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="month">
            {t('schedule.management.bulk.month')}
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Select
            value={month?.toString()}
            onValueChange={(value) => setValue('month', parseInt(value, 10))}
            disabled={isLoading}
          >
            <SelectTrigger id="month" className={errors.month ? 'border-destructive' : ''}>
              <SelectValue placeholder={t('schedule.management.bulk.selectMonth')} />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {monthNames[m - 1]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.month && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {t('schedule.management.bulk.monthRequired')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">
            {t('schedule.management.bulk.year')}
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Select
            value={year?.toString()}
            onValueChange={(value) => setValue('year', parseInt(value, 10))}
            disabled={isLoading}
          >
            <SelectTrigger id="year" className={errors.year ? 'border-destructive' : ''}>
              <SelectValue placeholder={t('schedule.management.bulk.selectYear')} />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.year && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {t('schedule.management.bulk.yearRequired')}
            </p>
          )}
        </div>
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
            {...register('startTime')}
            disabled={isLoading}
            className={errors.startTime ? 'border-destructive' : ''}
          />
          {errors.startTime && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {t('schedule.management.form.startTimeRequired')}
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
            {...register('endTime')}
            disabled={isLoading}
            className={errors.endTime ? 'border-destructive' : ''}
          />
          {errors.endTime && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.endTime.message || t('schedule.management.form.endTimeRequired')}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          {t('schedule.management.bulk.days')}
          <span className="text-destructive ml-1">*</span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {weekDays.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day.value}`}
                checked={selectedDays.includes(day.value)}
                onCheckedChange={() => handleDayToggle(day.value)}
                disabled={isLoading}
              />
              <Label
                htmlFor={`day-${day.value}`}
                className="font-normal cursor-pointer text-sm"
              >
                {day.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.selectedDays && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {t('schedule.management.bulk.daysRequired')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">
          {t('schedule.management.form.name')}
        </Label>
        <Input
          id="name"
          placeholder={t('schedule.management.bulk.namePlaceholder')}
          {...register('name')}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          {t('schedule.management.bulk.nameHint')}
        </p>
      </div>

      {classesCount > 0 && (
        <div className="rounded-md bg-muted p-3">
          <p className="text-sm font-medium">
            {t('schedule.management.bulk.willCreate', { count: classesCount })}
          </p>
        </div>
      )}

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
          disabled={isLoading || classesCount === 0}
          className="flex-1"
        >
          {isLoading ? t('common.processing') : t('schedule.management.bulk.create')}
        </Button>
      </div>
    </form>
  );
}

