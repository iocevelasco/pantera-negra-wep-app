import { Card, CardContent } from '@/components/ui/card';
import { Clock, Mail, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { UserData } from '@/stores/user-store';

interface PendingRegistrationAlertProps {
  user: UserData;
}

export function PendingRegistrationAlert({ user }: PendingRegistrationAlertProps) {
  const { t } = useTranslation();
  
  const userName = user.name?.split(' ')[0] || user.email.split('@')[0];

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

          {/* Status Message */}
          <div className="space-y-4 pt-6 border-t border-border/50">
            <div className={cn(
              'flex flex-col items-center gap-6 p-6 rounded-2xl border shadow-inner text-center',
              colorClasses.containerBg,
              colorClasses.containerBorder
            )}>
              <div className="relative">
                <div className={cn(
                  'absolute -inset-4 rounded-full blur-xl animate-pulse',
                  colorClasses.blur
                )} />
                <div className={cn(
                  'relative p-4 rounded-full border',
                  colorClasses.iconBg,
                  colorClasses.iconBorder,
                  colorClasses.iconText
                )}>
                  <Clock className="h-8 w-8" />
                </div>
              </div>

              <div className="space-y-3 max-w-sm mx-auto">
                <h4 className={cn(
                  'text-lg sm:text-xl font-bold tracking-tight',
                  colorClasses.iconText
                )}>
                  {t('portal.profile.pendingApproval.title', 'Registro en Revisión')}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {t('portal.profile.pendingApproval', 'Hola {{name}}, tu solicitud de registro está siendo revisada por nuestro equipo. Te notificaremos por correo electrónico una vez que sea aprobada.', { name: userName })}
                </p>
              </div>

              {/* Note */}
              <div className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest',
                colorClasses.noteBg,
                colorClasses.noteBorder,
                colorClasses.noteText
              )}>
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>{t('portal.profile.pendingApproval.note', 'Notificación en camino')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
