import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStudentPrivatePlan, useStudentPrivateSessions } from '@/hooks/private-classes/use-student-private-classes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function StudentPrivateClassesView() {
  const { t } = useTranslation();
  const { data: plan, isLoading: planLoading } = useStudentPrivatePlan();
  const { data: sessions = [], isLoading: sessionsLoading } = useStudentPrivateSessions({ limit: 10 });

  const isLoading = planLoading || sessionsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <Skeleton className="h-5 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64 mt-2" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructor Info Skeleton */}
          <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg border">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>

          {/* Plan Details Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Recent Sessions Skeleton */}
          <div className="pt-4 border-t">
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border"
                >
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return null; // Don't show if no plan
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t('privateClasses.status.active', 'Activo')}
          </Badge>
        );
      case 'consumed':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {t('privateClasses.status.consumed', 'Consumido')}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            {t('privateClasses.status.cancelled', 'Cancelado')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSessionStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            {t('privateClasses.session.scheduled', 'Programada')}
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t('privateClasses.session.completed', 'Completada')}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            {t('privateClasses.session.cancelled', 'Cancelada')}
          </Badge>
        );
      case 'no_show':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            {t('privateClasses.session.noShow', 'No asistió')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isExpired = plan.enrollment.expires_at
    ? new Date(plan.enrollment.expires_at) < new Date()
    : false;

  const isExpiringSoon = plan.enrollment.expires_at
    ? new Date(plan.enrollment.expires_at) >= new Date() &&
      new Date(plan.enrollment.expires_at) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t('privateClasses.myPlan', 'Mi Plan Privado')}
        </CardTitle>
        <CardDescription>
          {t('privateClasses.planDescription', 'Información sobre tu plan y sesiones privadas')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructor Info */}
        {plan.instructor && (
          <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg border">
            <Avatar className="h-10 w-10">
              <AvatarImage src={plan.instructor.picture} alt={plan.instructor.name} />
              <AvatarFallback>
                {plan.instructor.name?.[0]?.toUpperCase() || plan.instructor.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {plan.instructor.name || plan.instructor.email}
              </p>
              <p className="text-sm text-muted-foreground">{plan.instructor.email}</p>
            </div>
          </div>
        )}

        {/* Plan Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('privateClasses.planName', 'Plan')}</span>
            <span className="text-sm">{plan.plan.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('privateClasses.sessionsRemaining', 'Sesiones Restantes')}</span>
            <span className="text-sm font-bold">{plan.enrollment.sessions_remaining} / {plan.plan.sessions_total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('privateClasses.status', 'Estado')}</span>
            {getStatusBadge(plan.enrollment.status)}
          </div>
          {plan.enrollment.expires_at && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('privateClasses.expiresAt', 'Vence')}</span>
              <span className={`text-sm ${isExpired ? 'text-destructive font-bold' : isExpiringSoon ? 'text-orange-600' : ''}`}>
                {format(new Date(plan.enrollment.expires_at), 'dd/MM/yyyy', { locale: es })}
                {isExpired && <AlertCircle className="h-3 w-3 inline ml-1" />}
                {isExpiringSoon && !isExpired && <AlertCircle className="h-3 w-3 inline ml-1" />}
              </span>
            </div>
          )}
          {plan.plan.schedule && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2">{t('privateClasses.schedule', 'Horario')}</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {t('privateClasses.days', 'Días')}: {plan.plan.schedule.days.map((day) => {
                    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                    return days[day];
                  }).join(', ')}
                </p>
                <p>
                  {t('privateClasses.time', 'Hora')}: {plan.plan.schedule.start_time}
                </p>
                <p>
                  {t('privateClasses.duration', 'Duración')}: {plan.plan.schedule.duration_minutes} {t('privateClasses.minutes', 'minutos')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">{t('privateClasses.recentSessions', 'Sesiones Recientes')}</p>
            <div className="space-y-2">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {format(new Date(session.startAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                    {session.instructor && (
                      <p className="text-xs text-muted-foreground">{session.instructor.name || session.instructor.email}</p>
                    )}
                  </div>
                  {getSessionStatusBadge(session.status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
