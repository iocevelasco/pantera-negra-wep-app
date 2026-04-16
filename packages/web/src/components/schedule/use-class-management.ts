import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateClass, useUpdateClass, useDeleteClass, useCreateBulkClasses } from '@/hooks/classes/use-classes';
import type { Classes } from '@pantera-negra/shared';
import type { ClassFormData } from './class-form';
import type { BulkClassFormData } from './bulk-class-form';

export function useClassManagement() {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkFormOpen, setIsBulkFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classes | null>(null);
  const [deletingClass, setDeletingClass] = useState<Classes | null>(null);

  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();
  const bulkCreateMutation = useCreateBulkClasses();

  const openCreateForm = () => {
    setEditingClass(null);
    setIsFormOpen(true);
  };

  const openEditForm = (classItem: Classes) => {
    setEditingClass(classItem);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingClass(null);
  };

  const handleSubmit = async (data: ClassFormData) => {
    try {
      if (editingClass) {
        await updateMutation.mutateAsync({
          id: editingClass.id,
          ...data,
        });
        toast.success(t('schedule.management.messages.updateSuccess'));
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('schedule.management.messages.createSuccess'));
      }
      closeForm();
    } catch (error) {
      const errorMessage = editingClass
        ? t('schedule.management.messages.updateError')
        : t('schedule.management.messages.createError');
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDelete = async (classItem: Classes) => {
    try {
      await deleteMutation.mutateAsync(classItem.id);
      toast.success(t('schedule.management.messages.deleteSuccess'));
      setDeletingClass(null);
    } catch (error) {
      toast.error(t('schedule.management.messages.deleteError'));
    }
  };

  const openDeleteDialog = (classItem: Classes) => {
    setDeletingClass(classItem);
  };

  const closeDeleteDialog = () => {
    setDeletingClass(null);
  };

  const openBulkForm = () => {
    setIsBulkFormOpen(true);
  };

  const closeBulkForm = () => {
    setIsBulkFormOpen(false);
  };

  const handleBulkSubmit = async (data: BulkClassFormData) => {
    try {
      // Use selectedDays directly (already in the format: 0 = Monday, 1 = Tuesday, ..., 5 = Saturday)
      const result = await bulkCreateMutation.mutateAsync({
        month: data.month,
        year: data.year,
        startTime: data.startTime,
        endTime: data.endTime,
        daysOfWeek: data.selectedDays,
        name: data.name || 'Class',
      });
      
      toast.success(t('schedule.management.messages.bulkCreateSuccess', { count: result.length }));
      closeBulkForm();
    } catch (error) {
      toast.error(t('schedule.management.messages.bulkCreateError'));
      throw error;
    }
  };

  return {
    isFormOpen,
    isBulkFormOpen,
    editingClass,
    deletingClass,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || bulkCreateMutation.isPending,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSubmit,
    handleDelete,
    openDeleteDialog,
    closeDeleteDialog,
    openBulkForm,
    closeBulkForm,
    handleBulkSubmit,
  };
}

