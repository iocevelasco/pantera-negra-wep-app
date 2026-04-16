import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { registrationsApi } from '@/api/registrations';
import type { RegistrationRequest } from '@pantera-negra/shared';
import { ConfirmRegistrationDialog } from './confirm-registration-dialog';
import { RejectRegistrationDialog } from './reject-registration-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Search, CheckCircle2, XCircle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { QueryKeys } from '@/lib/query-keys';

export function RegistrationsTableContainer() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'pending' | 'confirmed' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationRequest | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Reset page to 1 when status filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const { data, isLoading, error } = useQuery({
    queryKey: [QueryKeys.registrations, statusFilter, page],
    queryFn: () => registrationsApi.getAll({ status: statusFilter, limit: 20, page }),
  });
  
  const handleConfirm = async (userId: string, createMembership?: boolean, membershipData?: any) => {
    try {
      await registrationsApi.confirm(userId, { createMembership, membershipData });
      toast.success(t('registrations.confirmSuccess', 'Registro confirmado exitosamente'));
      queryClient.invalidateQueries({ queryKey: [QueryKeys.registrations] });
      setConfirmDialogOpen(false);
      setSelectedRegistration(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('registrations.confirmError', 'Error al confirmar el registro')
      );
    }
  };

  const handleReject = async (userId: string, reason?: string) => {
    try {
      await registrationsApi.reject(userId, { reason });
      toast.success(t('registrations.rejectSuccess', 'Registro rechazado exitosamente'));
      queryClient.invalidateQueries({ queryKey: [QueryKeys.registrations] });
      setRejectDialogOpen(false);
      setSelectedRegistration(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('registrations.rejectError', 'Error al rechazar el registro')
      );
    }
  };

  const filteredRegistrations = data?.data.filter((reg) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      reg.email.toLowerCase().includes(query) ||
      reg.name?.toLowerCase().includes(query) ||
      false
    );
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            {t('registrations.status.pending', 'Pendiente')}
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t('registrations.status.confirmed', 'Confirmado')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            {t('registrations.status.rejected', 'Rechazado')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-destructive">
            {error instanceof Error
              ? error.message
              : t('registrations.loadError', 'Error al cargar las solicitudes')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('registrations.title', 'Solicitudes de Registro')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('registrations.searchPlaceholder', 'Buscar por email o nombre...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={(value: 'pending' | 'confirmed' | 'rejected' | 'all') => {
                setStatusFilter(value);
                setPage(1); // Reset page when filter changes
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t('registrations.status.pending', 'Pendientes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t('registrations.status.pending', 'Pendientes')}</SelectItem>
                <SelectItem value="confirmed">{t('registrations.status.confirmed', 'Confirmados')}</SelectItem>
                <SelectItem value="rejected">{t('registrations.status.rejected', 'Rechazados')}</SelectItem>
                <SelectItem value="all">{t('registrations.status.all', 'Todos')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('registrations.noResults', 'No se encontraron solicitudes')}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('registrations.table.name', 'Nombre')}</TableHead>
                      <TableHead>{t('registrations.table.email', 'Email')}</TableHead>
                      <TableHead>{t('registrations.table.rank', 'Rango')}</TableHead>
                      <TableHead>{t('registrations.table.status', 'Estado')}</TableHead>
                      <TableHead>{t('registrations.table.requestedAt', 'Fecha Solicitud')}</TableHead>
                      <TableHead className="text-right">{t('registrations.table.actions', 'Acciones')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{reg.name || reg.email.split('@')[0]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{reg.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {reg.rank} {reg.stripes > 0 && `(${reg.stripes})`}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(reg.registration.status)}</TableCell>
                        <TableCell>
                          {reg.registration.requestedAt
                            ? format(new Date(reg.registration.requestedAt), 'dd/MM/yyyy HH:mm', { locale: es })
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {reg.registration.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => {
                                    setSelectedRegistration(reg);
                                    setConfirmDialogOpen(true);
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  {t('registrations.confirm', 'Confirmar')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedRegistration(reg);
                                    setRejectDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  {t('registrations.reject', 'Rechazar')}
                                </Button>
                              </>
                            )}
                            {reg.registration.status === 'confirmed' && !reg.membership_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // TODO: Open assign membership dialog
                                  toast.info(t('registrations.assignMembershipInfo', 'Funcionalidad próximamente'));
                                }}
                              >
                                {t('registrations.assignMembership', 'Asignar Membresía')}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data?.pagination && data.pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t('registrations.pagination', 'Página {{page}} de {{pages}}', {
                      page: data.pagination.page,
                      pages: data.pagination.pages,
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      {t('common.previous', 'Anterior')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.pagination.pages}
                      onClick={() => setPage(page + 1)}
                    >
                      {t('common.next', 'Siguiente')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedRegistration && (
        <>
          <ConfirmRegistrationDialog
            open={confirmDialogOpen}
            onOpenChange={setConfirmDialogOpen}
            registration={selectedRegistration}
            onConfirm={handleConfirm}
          />
          <RejectRegistrationDialog
            open={rejectDialogOpen}
            onOpenChange={setRejectDialogOpen}
            registration={selectedRegistration}
            onReject={handleReject}
          />
        </>
      )}
    </>
  );
}

