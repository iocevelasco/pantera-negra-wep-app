import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronLeft, ChevronRight, Filter, Plus } from "lucide-react"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SchedulePage() {
  return (
    <DashboardLayout title="Calendario">
      <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] p-4 md:p-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-card">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Oct 21 - Oct 27, 2024</span>
            </div>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="gi">Gi</SelectItem>
                <SelectItem value="nogi">No-Gi</SelectItem>
                <SelectItem value="kids">Kids</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nueva Clase
            </Button>
          </div>
        </div>

        <div className="flex-1 border rounded-lg overflow-hidden bg-card min-h-0">
          <ScheduleCalendar />
        </div>
      </div>
    </DashboardLayout>
  )
}

