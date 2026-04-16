import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, CheckCircle2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface NotificationActivationAlertProps {
  isActivating?: boolean;
  isActivated?: boolean;
  className?: string;
}

export function NotificationActivationAlert({
  isActivating = false,
  isActivated = false,
  className,
}: NotificationActivationAlertProps) {
  const { t } = useTranslation();

  if (!isActivating && !isActivated) {
    return null;
  }

  return (
    <Alert
      className={cn(
        'border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm shadow-lg',
        isActivated && 'border-green-500/30 bg-gradient-to-r from-green-500/5 via-green-500/10 to-green-500/5',
        className
      )}
    >
      {isActivating ? (
        <>
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <div className="space-y-1">
            <AlertTitle className="flex items-center gap-2 text-primary font-bold">
              <Bell className="h-4 w-4" />
              {t('notifications.activating', 'Activando notificaciones...')}
            </AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              {t(
                'notifications.activationMessage',
                'Te notificaremos cuando tu cuenta esté completamente activada. Por favor, acepta los permisos cuando tu navegador lo solicite.'
              )}
            </AlertDescription>
          </div>
        </>
      ) : isActivated ? (
        <>
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <div className="space-y-1">
            <AlertTitle className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold">
              <Bell className="h-4 w-4" />
              {t('notifications.activated', '¡Notificaciones activadas!')}
            </AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              {t(
                'notifications.activatedMessage',
                'Recibirás notificaciones cuando tu cuenta esté completamente activada y sobre eventos importantes.'
              )}
            </AlertDescription>
          </div>
        </>
      ) : null}
    </Alert>
  );
}
