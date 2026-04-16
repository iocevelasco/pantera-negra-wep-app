import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RegistrationRequest } from '@pantera-negra/shared';
import { useTranslation } from 'react-i18next';

interface RejectRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: RegistrationRequest;
  onReject: (userId: string, reason?: string) => void;
}

export function RejectRegistrationDialog({
  open,
  onOpenChange,
  registration,
  onReject,
}: RejectRegistrationDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  const handleReject = () => {
    onReject(registration.id, reason || undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t('registrations.rejectDialog.title', 'Rechazar Registro')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'registrations.rejectDialog.description',
              '¿Estás seguro de que deseas rechazar el registro de {{email}}?',
              { email: registration.email }
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="rejectionReason">
              {t('registrations.rejectDialog.reason', 'Motivo del rechazo (opcional)')}
            </Label>
            <Textarea
              id="rejectionReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t(
                'registrations.rejectDialog.reasonPlaceholder',
                'Ingresa el motivo del rechazo...'
              )}
              className="mt-1"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button variant="destructive" onClick={handleReject}>
            {t('registrations.reject', 'Rechazar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

