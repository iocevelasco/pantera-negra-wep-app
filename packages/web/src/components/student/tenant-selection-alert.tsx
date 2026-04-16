import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, Loader2, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useTenants } from '@/hooks/tenants/use-tenants';
import { authApi } from '@/api/auth';
import { useAuth } from '@/providers/auth-provider';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/hooks/auth/use-auth';
import { useUserStore } from '@/stores/user-store';
import { useUpdateUser } from '@/hooks/users/use-users';
import { toast } from 'sonner';
import type { UserData } from '@/stores/user-store';
import { QueryKeys } from '@/lib/query-keys';

interface TenantSelectionAlertProps {
  user: UserData;
  onTenantSelected?: () => void;
}

export function TenantSelectionAlert({ user, onTenantSelected }: TenantSelectionAlertProps) {
  const { t } = useTranslation();
  const tenants = useTenants();
  const { login } = useAuth();
  const queryClient = useQueryClient();
  const updateUserMutation = useUpdateUser();
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (user.tenant_id) {
    return null;
  }
  
  const userName = user.name?.split(' ')[0] || user.email.split('@')[0];
  const userInitials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  const colorClasses = {
    gradient: 'from-blue-500 to-blue-500/20',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/20 dark:bg-blue-500/30',
    iconBorder: 'border-blue-500/50',
    iconText: 'text-blue-600 dark:text-blue-400',
    mailIcon: 'text-blue-500',
    containerBg: 'bg-blue-500/5 dark:bg-blue-500/10',
    containerBorder: 'border-blue-500/20',
    blur: 'bg-blue-500/20',
    noteBg: 'bg-blue-500/10',
    noteBorder: 'border-blue-500/20',
    noteText: 'text-blue-600 dark:text-blue-400',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTenant) {
      setError(t('auth.selectTenant.errors.tenantRequired') || 'Debes seleccionar una sede');
      return;
    }

    if (!user.id) {
      setError('Usuario no encontrado');
      return;
    }

    setError(null);

    try {
      // Update user with tenant_id using the mutation
      const updatedUser = await updateUserMutation.mutateAsync({
        id: user.id,
        tenant_id: selectedTenant,
      });

      // After updating tenant_id, we need to regenerate tokens with the new tenant
      // Use the complete registration endpoint to get new tokens
      const tokenData = await authApi.completeGoogleRegistration(selectedTenant);

      // Update token and user
      localStorage.setItem('auth_token', tokenData.accessToken);
      login(tokenData.accessToken, tokenData.user);
      queryClient.setQueryData(authKeys.currentUser(), tokenData.user);
      useUserStore.getState().setUser(tokenData.user);

      // Invalidate user queries to refetch with new tenant
      queryClient.invalidateQueries({ queryKey: [QueryKeys.currentUser] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.users] });

      toast.success(t('auth.selectTenant.success') || 'Sede seleccionada exitosamente');
      
      if (onTenantSelected) {
        onTenantSelected();
      }
    } catch (err) {
      console.error('Complete registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    }
  };

  return (
    <Card variant="interactive" className="overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-2xl">
      <CardContent className="p-0 space-y-0">
        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
          {/* Welcome Message */}
          <div className="text-center pb-4 border-b border-border/50">
            <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {t('portal.profile.welcome', { name: userName })}
            </p>
          </div>

          {/* Avatar and User Info */}
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="relative group">
              <div className={cn(
                'absolute -inset-1 bg-gradient-to-tr rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500',
                colorClasses.gradient
              )} />
            </div>
            <div className="flex-1 w-full text-center space-y-1">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {user.name || user.email}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2 font-medium opacity-80">
                <Mail className={cn('h-3.5 w-3.5', colorClasses.mailIcon)} />
                <span className="truncate max-w-full">{user.email}</span>
              </p>
            </div>
          </div>

          {/* Tenant Selection Form */}
          <div className="space-y-4 pt-6 border-t border-border/50">
            <div className={cn(
              'flex flex-col items-center gap-6 p-6 rounded-2xl border shadow-inner',
              colorClasses.containerBg,
              colorClasses.containerBorder
            )}>
              <div className="relative">
                <div className={cn(
                  'absolute -inset-4 rounded-full blur-xl',
                  colorClasses.blur
                )} />
                <div className={cn(
                  'relative p-4 rounded-full border',
                  colorClasses.iconBg,
                  colorClasses.iconBorder,
                  colorClasses.iconText
                )}>
                  <Building2 className="h-8 w-8" />
                </div>
              </div>

              <div className="space-y-4 w-full max-w-sm">
                <div className="text-center space-y-2">
                  <h4 className={cn(
                    'text-lg sm:text-xl font-bold tracking-tight',
                    colorClasses.iconText
                  )}>
                    {t('auth.selectTenant.title', 'Selecciona tu sede')}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('auth.selectTenant.subtitle', 'Para continuar con tu registro, necesitas seleccionar la sede donde te registrarás.')}
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" role="alert" aria-live="assertive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenant_id">
                      {t('auth.selectTenant.tenant', 'Sede')}
                      <span className="text-destructive ml-1" aria-label={t('common.required')}>
                        *
                      </span>
                    </Label>
                    <Select
                      value={selectedTenant}
                      onValueChange={setSelectedTenant}
                      disabled={updateUserMutation.isPending}
                    >
                      <SelectTrigger
                        id="tenant_id"
                        aria-required="true"
                        className={error && !selectedTenant ? 'border-destructive' : ''}
                      >
                        <SelectValue
                          placeholder={t('auth.selectTenant.tenantPlaceholder', 'Selecciona una sede')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {error && !selectedTenant && (
                      <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                        <AlertCircle className="h-3 w-3" aria-hidden="true" />
                        {t('auth.selectTenant.errors.tenantRequired', 'Debes seleccionar una sede')}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateUserMutation.isPending || !selectedTenant}
                    aria-busy={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('auth.selectTenant.submitting', 'Completando registro...')}
                      </>
                    ) : (
                      t('auth.selectTenant.submit', 'Continuar')
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
