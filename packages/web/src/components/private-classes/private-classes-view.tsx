import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PrivatePlansTab } from './private-plans-tab';
import { PrivateStudentsTab } from './private-students-tab';
import { PrivateSessionsTab } from './private-sessions-tab';

export function PrivateClassesView() {
  const { t } = useTranslation();

  return (
    <DashboardLayout title={t('privateClasses.title', 'Clases Privadas')}>
      <div className="flex flex-1 flex-col gap-4 p-3 md:p-6">
        <div>
          <p className="text-muted-foreground">
            {t('privateClasses.description', 'Gestiona tus planes privados, estudiantes y sesiones')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('privateClasses.management', 'Gestión de Clases Privadas')}</CardTitle>
            <CardDescription>
              {t('privateClasses.managementDescription', 'Administra planes, estudiantes y sesiones privadas')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="plans" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="plans">
                  {t('privateClasses.tabs.plans', 'Planes')}
                </TabsTrigger>
                <TabsTrigger value="students">
                  {t('privateClasses.tabs.students', 'Estudiantes')}
                </TabsTrigger>
                <TabsTrigger value="sessions">
                  {t('privateClasses.tabs.sessions', 'Sesiones')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="plans" className="mt-6">
                <PrivatePlansTab />
              </TabsContent>
              <TabsContent value="students" className="mt-6">
                <PrivateStudentsTab />
              </TabsContent>
              <TabsContent value="sessions" className="mt-6">
                <PrivateSessionsTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
