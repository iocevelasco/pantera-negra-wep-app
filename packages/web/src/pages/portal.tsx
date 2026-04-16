import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { QrCode, Trophy, ChevronRight, MapPin, Clock } from "lucide-react"

export function PortalPage() {
  return (
    <DashboardLayout title="Portal Alumno">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 md:max-w-4xl md:mx-auto w-full">
        {/* Welcome & Digital ID Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-neutral-400">Carnet Digital</CardDescription>
              <CardTitle className="text-2xl">John Doe</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-neutral-400">Plan</p>
                  <p className="font-semibold">Ilimitado</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-neutral-400">Estado</p>
                  <Badge variant="outline" className="text-green-400 border-green-400 bg-green-400/10">
                    Activo
                  </Badge>
                </div>
              </div>
              <div className="flex justify-center py-4">
                <div className="bg-white p-2 rounded-lg">
                  <QrCode className="h-32 w-32 text-black" />
                </div>
              </div>
              <p className="text-center text-xs text-neutral-500 font-mono">ID: 9482-3921-MC</p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Progreso
                </CardTitle>
                <CardDescription>Camino a Cinturón Azul</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Asistencia</span>
                  <span className="font-medium">32 / 50 Clases</span>
                </div>
                <Progress value={64} className="h-2" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-xs text-muted-foreground">Actual</p>
                    <p className="font-bold">Blanco</p>
                    <div className="mt-1 h-1 w-full bg-white border border-neutral-200 rounded-full"></div>
                  </div>
                  <div className="rounded-lg border p-3 text-center bg-blue-50/5 dark:bg-blue-900/10 border-blue-200/20">
                    <p className="text-xs text-muted-foreground">Siguiente</p>
                    <p className="font-bold text-blue-500">Azul</p>
                    <div className="mt-1 h-1 w-full bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Próxima Clase</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center rounded-lg border p-2 w-14 h-14 bg-muted/50">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Hoy</span>
                    <span className="text-xl font-bold">18</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold">Fundamentos (Gi)</h4>
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <Clock className="h-3 w-3" /> 18:00 - 19:00
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <MapPin className="h-3 w-3" /> Tatami A • Prof. Silva
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="sm">
                  Check In (QR)
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Tu Semana</h3>
          <div className="rounded-lg border overflow-hidden">
            {[
              { day: "Hoy", date: "Oct 24", class: "Fundamentos", time: "18:00", status: "Reservado" },
              { day: "Mañana", date: "Oct 25", class: "No-Gi Todos Niveles", time: "07:00", status: "Abierto" },
              { day: "Sábado", date: "Oct 26", class: "Open Mat", time: "10:00", status: "Abierto" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center">
                    <p className="text-xs text-muted-foreground uppercase font-medium">{item.day}</p>
                    <p className="text-sm font-bold">{item.date}</p>
                  </div>
                  <div>
                    <p className="font-medium">{item.class}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                {item.status === "Reservado" ? (
                  <Badge variant="secondary">Reservado</Badge>
                ) : (
                  <Button variant="ghost" size="sm">
                    Reservar <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

