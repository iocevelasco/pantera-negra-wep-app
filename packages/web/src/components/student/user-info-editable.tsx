import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, User, Edit2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUpdateUserProfile } from '@/hooks/user/use-update-user-profile';
import { cn } from '@/lib/utils';

interface UserInfoEditableProps {
  name?: string;
  email: string;
  phone?: string;
  className?: string;
}

export function UserInfoEditable({ name, email, phone, className }: UserInfoEditableProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name || '');
  const [editedEmail, setEditedEmail] = useState(email || '');
  const [editedPhone, setEditedPhone] = useState(phone || '');
  
  const updateMutation = useUpdateUserProfile();

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(name || '');
    setEditedEmail(email || '');
    setEditedPhone(phone || '');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(name || '');
    setEditedEmail(email || '');
    setEditedPhone(phone || '');
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        name: editedName || undefined,
        email: editedEmail,
        phone: editedPhone || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex flex-col gap-4 w-full", className)}>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-primary" />
            {t("portal.profile.name", "Nombre")}
          </label>
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder={t("portal.profile.namePlaceholder", "Nombre completo")}
            className="w-full"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-primary" />
            {t("portal.profile.email", "Email")}
          </label>
          <Input
            type="email"
            value={editedEmail}
            onChange={(e) => setEditedEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-primary" />
            {t("portal.profile.phone", "Teléfono")}
          </label>
          <Input
            type="tel"
            value={editedPhone}
            onChange={(e) => setEditedPhone(e.target.value)}
            placeholder={t("portal.profile.phonePlaceholder", "+1234567890")}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            size="sm"
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            {t("common.save", "Guardar")}
          </Button>
          <Button
            onClick={handleCancel}
            disabled={updateMutation.isPending}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            {t("common.cancel", "Cancelar") || "Cancelar"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 w-full text-center space-y-1 relative group", className)}>
      <button
        onClick={handleEdit}
        className="absolute top-0 right-0 p-1.5 rounded-md hover:bg-secondary/50 transition-colors"
        aria-label={t("portal.profile.editInfo", "Editar información")}
      >
        <Edit2 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
      </button>
      
      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
        {name || email}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2 font-medium opacity-80">
        <Mail className="h-3.5 w-3.5 text-primary" />
        <span className="truncate max-w-full">{email}</span>
      </p>
      {phone && (
        <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2 font-medium opacity-80">
          <Phone className="h-3.5 w-3.5 text-primary" />
          <span className="truncate max-w-full">{phone}</span>
        </p>
      )}
    </div>
  );
}

