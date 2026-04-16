import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { privateSessionsApi } from '@/api/private-sessions';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { QueryKeys } from '@/lib/query-keys';

export function PrivateSessionsTab() {
  const { t } = useTranslation();

  const { data: sessions, isLoading } = useQuery({
    queryKey: [QueryKeys.privateSessions],
    queryFn: () => privateSessionsApi.getAll({ limit: 50 }),
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLabels: Record<string, string> = {
      scheduled: t('privateClasses.sessions.status.scheduled', 'Programada'),
      completed: t('privateClasses.sessions.status.completed', 'Completada'),
      cancelled: t('privateClasses.sessions.status.cancelled', 'Cancelada'),
      no_show: t('privateClasses.sessions.status.noShow', 'No asistió'),
    };

    const statusColors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {t('privateClasses.sessions.title', 'Sesiones Privadas')}
        </h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('privateClasses.sessions.create', 'Crear Sesión')}
        </Button>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t('privateClasses.sessions.empty', 'No hay sesiones programadas')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getStatusIcon(session.status)}
                  <div>
                    <p className="font-semibold">
                      {format(new Date(session.startAt), "PPP 'a las' HH:mm", { locale: es })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.participants?.length || 0}{' '}
                      {(session.participants?.length || 0) === 1
                        ? t('privateClasses.sessions.participant', 'participante')
                        : t('privateClasses.sessions.participants', 'participantes')}
                    </p>
                  </div>
                </div>
                {getStatusBadge(session.status)}
              </div>
              {session.participants && session.participants.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    {t('privateClasses.sessions.participantsList', 'Participantes')}:
                  </p>
                  <ul className="text-sm mt-1 space-y-1">
                    {session.participants.map((participant) => (
                    <li key={participant.id} className="flex items-center gap-2">
                      <span className="font-medium">{participant.name || participant.email}</span>
                      {participant.rank && (
                        <Badge variant="outline" className="text-xs">
                          {participant.rank}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              )}
              {session.price_cents && (
                <p className="text-sm font-medium mt-2">
                  {t('privateClasses.sessions.price', 'Precio')}: ${(session.price_cents / 100).toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
