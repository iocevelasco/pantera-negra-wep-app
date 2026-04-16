import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { privateStudentsApi } from '@/api/private-students';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryKeys } from '@/lib/query-keys';

export function PrivateStudentsTab() {
  const { t } = useTranslation();

  const { data: students, isLoading } = useQuery({
    queryKey: [QueryKeys.privateStudents],
    queryFn: () => privateStudentsApi.getAll(),
  });

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
      <h3 className="text-lg font-semibold">
        {t('privateClasses.students.title', 'Estudiantes con Planes Privados')}
      </h3>

      {!students || students.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t('privateClasses.students.empty', 'No hay estudiantes con planes privados')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {students.map((student) => (
            <div key={student.id} className="border rounded-lg p-4">
              <h4 className="font-semibold">{student.name || student.email}</h4>
              <p className="text-sm text-muted-foreground">{student.email}</p>
              {student.enrollments && student.enrollments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">
                    {student.enrollments.length} {t('privateClasses.students.activePlans', 'planes activos')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
