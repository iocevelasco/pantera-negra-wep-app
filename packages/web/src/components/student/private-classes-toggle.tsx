import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, User, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/hooks/user/use-user';
import { useInstructors, useEnablePrivateClasses, useDisablePrivateClasses } from '@/hooks/private-classes/use-student-private-classes';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Instructor } from '@pantera-negra/shared';

export function PrivateClassesToggle() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { data: instructors = [], isLoading: instructorsLoading } = useInstructors();
  const enableMutation = useEnablePrivateClasses();
  const disableMutation = useDisablePrivateClasses();
  
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showEnableDialog, setShowEnableDialog] = useState(false);

  const hasPrivateClasses = !!user?.private_owner_instructor_id;
  const currentInstructor = instructors.find(
    (inst) => inst.id === user?.private_owner_instructor_id
  );

  const handleEnable = () => {
    if (!selectedInstructorId) {
      toast.error(t('privateClasses.selectInstructor') || 'Please select an instructor');
      return;
    }
    enableMutation.mutate(selectedInstructorId, {
      onSuccess: () => {
        toast.success(t('privateClasses.enabledSuccess') || 'Private classes enabled successfully');
        setShowEnableDialog(false);
        setSelectedInstructorId('');
      },
      onError: (error: Error) => {
        toast.error(error.message || t('privateClasses.enableError') || 'Failed to enable private classes');
      },
    });
  };

  const handleDisable = () => {
    disableMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(t('privateClasses.disabledSuccess') || 'Private classes disabled successfully');
        setShowDisableDialog(false);
      },
      onError: (error: Error) => {
        toast.error(error.message || t('privateClasses.disableError') || 'Failed to disable private classes');
      },
    });
  };

  if (instructorsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {t('privateClasses.title', 'Clases Privadas')}
          </CardTitle>
          <CardDescription>
            {t('privateClasses.description', 'Habilita clases privadas con un instructor de tu elección')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPrivateClasses && currentInstructor ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentInstructor.picture} alt={currentInstructor.name} />
                    <AvatarFallback>
                      {currentInstructor.name?.[0]?.toUpperCase() || currentInstructor.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{currentInstructor.name || currentInstructor.email}</p>
                    <p className="text-sm text-muted-foreground">{currentInstructor.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t('privateClasses.active', 'Activo')}
                </Badge>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDisableDialog(true)}
                disabled={disableMutation.isPending}
                className="w-full"
              >
                {disableMutation.isPending ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2 animate-spin" />
                    {t('common.processing', 'Procesando...')}
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    {t('privateClasses.disable', 'Deshabilitar Clases Privadas')}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {instructors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{t('privateClasses.noInstructors', 'No hay instructores disponibles')}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t('privateClasses.selectInstructor', 'Seleccionar Instructor')}
                    </label>
                    <Select
                      value={selectedInstructorId}
                      onValueChange={setSelectedInstructorId}
                      disabled={enableMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('privateClasses.instructorPlaceholder', 'Selecciona un instructor')} />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={instructor.picture} alt={instructor.name} />
                                <AvatarFallback className="text-xs">
                                  {instructor.name?.[0]?.toUpperCase() || instructor.email[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{instructor.name || instructor.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => setShowEnableDialog(true)}
                    disabled={!selectedInstructorId || enableMutation.isPending}
                    className="w-full"
                  >
                    {enableMutation.isPending ? (
                      <>
                        <GraduationCap className="h-4 w-4 mr-2 animate-spin" />
                        {t('common.processing', 'Procesando...')}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t('privateClasses.enable', 'Habilitar Clases Privadas')}
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enable Confirmation Dialog */}
      <AlertDialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('privateClasses.enableConfirmTitle', 'Habilitar Clases Privadas')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('privateClasses.enableConfirmDescription', '¿Estás seguro de que deseas habilitar clases privadas con este instructor? Podrás ver y gestionar tus clases privadas desde tu perfil.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancelar')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnable}>
              {t('privateClasses.confirm', 'Confirmar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable Confirmation Dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('privateClasses.disableConfirmTitle', 'Deshabilitar Clases Privadas')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('privateClasses.disableConfirmDescription', '¿Estás seguro de que deseas deshabilitar las clases privadas? Esta acción no cancelará planes activos, pero no podrás acceder a nuevas clases privadas hasta que las habilites nuevamente.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancelar')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisable} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('privateClasses.disable', 'Deshabilitar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
