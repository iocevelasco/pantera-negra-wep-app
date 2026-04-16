import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, MapPin, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useClasses } from "@/hooks/classes/use-classes";
import { useClassManagement } from "@/components/schedule/use-class-management";
import { ClassFormDialog } from "@/components/schedule/class-form-dialog";
import { BulkClassFormDialog } from "@/components/schedule/bulk-class-form-dialog";
import { DeleteClassDialog } from "@/components/schedule/delete-class-dialog";
import { ScheduleCalendarView } from "@/components/schedule/schedule-calendar-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function ScheduleManagementPage() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { data: classes = [], isLoading, error } = useClasses();
  const {
    isFormOpen,
    isBulkFormOpen,
    editingClass,
    deletingClass,
    isLoading: isManaging,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSubmit,
    handleDelete,
    openDeleteDialog,
    closeDeleteDialog,
    openBulkForm,
    closeBulkForm,
    handleBulkSubmit,
  } = useClassManagement();

  const handleClassClick = (classItem: typeof classes[0]) => {
    openEditForm(classItem);
  };

  return (
    <DashboardLayout title={t("schedule.management.title")}>
      <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              {t("schedule.management.title")}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("schedule.management.subtitle")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openBulkForm}>
              <Calendar className="mr-2 h-4 w-4" />
              {t("schedule.management.bulk.createBulk")}
            </Button>
            <Button onClick={openCreateForm}>
              <Plus className="mr-2 h-4 w-4" />
              {t("schedule.management.newClass")}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("schedule.management.messages.loadError")}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">
            {t("common.loading")}
          </div>
        ) : (
          <>
            <ScheduleCalendarView
              classes={classes}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onClassClick={handleClassClick}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">
                      {t("schedule.management.scheduledClasses")}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t("schedule.management.scheduledClassesDescription")}
                  </CardDescription>
                  <div className="mt-2 text-2xl font-bold">
                    {classes.length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <ClassFormDialog
          open={isFormOpen}
          onOpenChange={closeForm}
          defaultValues={editingClass ? {
            name: editingClass.name,
            type: editingClass.type,
            instructor: editingClass.instructor,
            startTime: editingClass.startTime,
            endTime: editingClass.endTime,
            date: editingClass.date,
            location: editingClass.location,
            capacity: editingClass.capacity,
          } : undefined}
          onSubmit={handleSubmit}
          isLoading={isManaging}
          mode={editingClass ? 'edit' : 'create'}
        />

        <BulkClassFormDialog
          open={isBulkFormOpen}
          onOpenChange={closeBulkForm}
          onSubmit={handleBulkSubmit}
          isLoading={isManaging}
        />

        <DeleteClassDialog
          open={!!deletingClass}
          onOpenChange={(open) => !open && closeDeleteDialog()}
          classItem={deletingClass}
          onConfirm={() => deletingClass && handleDelete(deletingClass)}
          isLoading={isManaging}
        />
      </div>
    </DashboardLayout>
  );
}

