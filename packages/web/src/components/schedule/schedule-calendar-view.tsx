import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { Classes } from '@pantera-negra/shared';
import { useUser } from '@/hooks/user/use-user';

interface ScheduleCalendarViewProps {
  classes: Classes[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onClassClick?: (classItem: Classes) => void;
}

export function ScheduleCalendarView({
  classes,
  currentDate,
  onDateChange,
  onClassClick,
}: ScheduleCalendarViewProps) {
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const locale = i18n.language.startsWith('pt') ? ptBR : es;

  const weekStart = startOfWeek(currentDate, { locale });
  const weekEnd = endOfWeek(currentDate, { locale });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const classesByDate = useMemo(() => {
    const grouped: Record<string, Classes[]> = {};
    classes.forEach((classItem) => {
      const dateKey = classItem.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(classItem);
    });
    return grouped;
  }, [classes]);

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Filter classes for instructor if user is instructor
  const filteredClasses = useMemo(() => {
    if (user?.role === 'instructor') {
      return classes.filter((classItem) => 
        classItem.instructor === user.name || classItem.instructor === user.email
      );
    }
    return classes;
  }, [classes, user]);

  const filteredClassesByDate = useMemo(() => {
    const grouped: Record<string, Classes[]> = {};
    filteredClasses.forEach((classItem) => {
      const dateKey = classItem.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(classItem);
    });
    return grouped;
  }, [filteredClasses]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {t('schedule.management.calendar')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleToday}>
              {t('common.today') || 'Hoy'}
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {format(weekStart, 'dd MMM', { locale })} - {format(weekEnd, 'dd MMM yyyy', { locale })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayClasses = filteredClassesByDate[dateKey] || [];
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={dateKey}
                className={`border rounded-lg p-3 min-h-[100px] ${
                  isToday ? 'bg-primary/5 border-primary' : ''
                }`}
              >
                <div className="font-semibold text-sm mb-2">
                  {format(day, 'EEE', { locale })}
                  <span className={`ml-1 ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-2">
                  {dayClasses.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {t('schedule.management.noClasses')}
                    </p>
                  ) : (
                    dayClasses.map((classItem) => (
                      <div
                        key={classItem.id}
                        className="text-xs p-2 bg-secondary rounded cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={() => onClassClick?.(classItem)}
                      >
                        <div className="font-medium truncate">{classItem.name}</div>
                        <div className="text-muted-foreground">
                          {classItem.startTime} - {classItem.endTime}
                        </div>
                        {classItem.type && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {classItem.type === 'Gi' && t('schedule.gi')}
                            {classItem.type === 'No-Gi' && t('schedule.noGi')}
                            {classItem.type === 'Kids' && t('schedule.kids')}
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

