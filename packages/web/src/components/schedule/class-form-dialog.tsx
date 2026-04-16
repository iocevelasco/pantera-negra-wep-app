import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ClassForm, type ClassFormData } from './class-form';
import { useTranslation } from 'react-i18next';

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<ClassFormData & { id?: string }>;
  onSubmit: (data: ClassFormData) => void | Promise<void>;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function ClassFormDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isLoading,
  mode = 'create',
}: ClassFormDialogProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const handleSubmit = async (data: ClassFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const title = mode === 'create' 
    ? t('schedule.management.newClass')
    : t('schedule.management.editClass');

  const description = mode === 'create'
    ? t('schedule.management.subtitle')
    : t('schedule.management.subtitle');

  const content = (
    <ClassForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}

