import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, Mail, MessageCircle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { UserData } from '@/stores/user-store';

interface RejectedRegistrationAlertProps {
  user: UserData;
  rejectionReason?: string;
}

export function RejectedRegistrationAlert({ user, rejectionReason }: RejectedRegistrationAlertProps) {
  const { t } = useTranslation();
  
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
    gradient: 'from-primary to-primary/20',
    border: 'border-primary/20',
    iconBg: 'bg-primary/20 dark:bg-primary/30',
    iconBorder: 'border-primary/50',
    iconText: 'text-primary',
    mailIcon: 'text-primary',
    containerBg: 'bg-primary/5',
    containerBorder: 'border-primary/20',
    blur: 'bg-primary/20',
    noteBg: 'bg-secondary',
    noteBorder: 'border-border/50',
    noteText: 'text-muted-foreground',
    reasonBg: 'bg-secondary/40',
    reasonText: 'text-primary',
    reasonBorder: 'border-border/50',
    topBar: 'bg-primary shadow-[0_0_15px_rgba(239,35,60,0.5)]',
  };

  return (
    <Card variant="interactive" className="overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-2xl">
      <CardContent className="p-0 space-y-0">
        {/* Decorative Top Bar */}
        <div className={cn('h-1.5 w-full', colorClasses.topBar)} />

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
                  'absolute -inset-4 rounded-full blur-xl',
                  colorClasses.blur
                )} />
                <div className={cn(
                  'relative p-4 rounded-full border',
                  colorClasses.iconBg,
                  colorClasses.iconBorder,
                  colorClasses.iconText
                )}>
                  <AlertCircle className="h-8 w-8" />
                </div>
              </div>

              <div className="space-y-3 max-w-sm mx-auto">
                <h4 className={cn(
                  'text-lg sm:text-xl font-bold tracking-tight',
                  colorClasses.iconText
                )}>
                  {t('portal.profile.registrationRejected.title', 'Registro No Aprobado')}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {t('portal.profile.registrationRejected', 'Hola {name}, lamentamos informarte que tu solicitud de registro no ha sido aprobada en este momento.', { name: userName })}
                </p>
              </div>

              {/* Rejection Reason */}
              {rejectionReason && (
                <div className={cn(
                  'w-full mt-2 p-4 rounded-xl border text-left relative group',
                  colorClasses.reasonBg,
                  colorClasses.reasonBorder
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn('mt-1 p-1.5 rounded-lg', colorClasses.reasonBg, colorClasses.reasonText)}>
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className={cn(
                        'text-[10px] uppercase tracking-widest font-bold opacity-80',
                        colorClasses.reasonText
                      )}>
                        {t('portal.profile.rejectionReason', 'Motivo del Administrador')}
                      </p>
                      <p className="text-sm text-foreground/90 leading-relaxed italic">
                        "{rejectionReason}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Note/Contact Info */}
              <div className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest',
                colorClasses.noteBg,
                colorClasses.noteBorder,
                colorClasses.noteText
              )}>
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{t('portal.profile.registrationRejected.contact', 'Contacta al administrador para más info')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
