import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import type { Classes } from '@pantera-negra/shared';

interface DeleteClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: Classes | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteClassDialog({
  open,
  onOpenChange,
  classItem,
  onConfirm,
  isLoading,
}: DeleteClassDialogProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const handleConfirm = () => {
    onConfirm();
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{t('schedule.management.deleteClass')}</DrawerTitle>
            <DrawerDescription>
              {t('schedule.management.messages.deleteConfirm')}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <p className="text-sm text-muted-foreground">
              {classItem && t('schedule.management.messages.deleteDescription', { name: classItem.name })}
            </p>
          </div>
          <DrawerFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? t('common.processing') : t('common.delete')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('schedule.management.deleteClass')}</DialogTitle>
          <DialogDescription>
            {t('schedule.management.messages.deleteConfirm')}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {classItem && t('schedule.management.messages.deleteDescription', { name: classItem.name })}
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? t('common.processing') : t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

