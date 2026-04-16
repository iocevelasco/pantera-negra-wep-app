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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RegistrationRequest } from '@pantera-negra/shared';
import { useTranslation } from 'react-i18next';

interface ConfirmRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: RegistrationRequest;
  onConfirm: (userId: string, createMembership?: boolean, membershipData?: any) => void;
}

export function ConfirmRegistrationDialog({
  open,
  onOpenChange,
  registration,
  onConfirm,
}: ConfirmRegistrationDialogProps) {
  const { t } = useTranslation();
  const [createMembership, setCreateMembership] = useState(false);
  const [membershipData, setMembershipData] = useState({
    name: registration.name || registration.email.split('@')[0] || 'Member',
    memberType: 'Adult' as 'Adult' | 'Kid',
    plan: 'monthly' as string,
  });

  const handleConfirm = () => {
    onConfirm(
      registration.id,
      createMembership,
      createMembership ? membershipData : undefined
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t('registrations.confirmDialog.title', 'Confirmar Registro')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'registrations.confirmDialog.description',
              '¿Deseas confirmar el registro de {{email}}?',
              { email: registration.email }
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="createMembership"
              checked={createMembership}
              onCheckedChange={(checked) => setCreateMembership(checked === true)}
            />
            <Label htmlFor="createMembership" className="cursor-pointer">
              {t('registrations.confirmDialog.createMembership', 'Crear membresía automáticamente')}
            </Label>
          </div>

          {createMembership && (
            <div className="space-y-4 pl-6 border-l-2">
              <div>
                <Label htmlFor="membershipName">
                  {t('registrations.confirmDialog.membershipName', 'Nombre de la membresía')}
                </Label>
                <Input
                  id="membershipName"
                  value={membershipData.name}
                  onChange={(e) =>
                    setMembershipData({ ...membershipData, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="memberType">
                  {t('registrations.confirmDialog.memberType', 'Tipo de miembro')}
                </Label>
                <Select
                  value={membershipData.memberType}
                  onValueChange={(value: 'Adult' | 'Kid') =>
                    setMembershipData({ ...membershipData, memberType: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Adult">
                      {t('registrations.confirmDialog.adult', 'Adulto')}
                    </SelectItem>
                    <SelectItem value="Kid">
                      {t('registrations.confirmDialog.kid', 'Niño')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="plan">
                  {t('registrations.confirmDialog.plan', 'Plan')}
                </Label>
                <Select
                  value={membershipData.plan}
                  onValueChange={(value) =>
                    setMembershipData({ ...membershipData, plan: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      {t('registrations.confirmDialog.monthly', 'Mensual')}
                    </SelectItem>
                    <SelectItem value="quarterly">
                      {t('registrations.confirmDialog.quarterly', 'Trimestral')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button onClick={handleConfirm}>
            {t('registrations.confirm', 'Confirmar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

