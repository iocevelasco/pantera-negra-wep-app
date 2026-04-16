import { Badge } from "@/components/ui/badge"

const classes = [
  {
    title: "Fundamentals",
    time: "18:00 - 19:00",
    instructor: "Prof. Silva",
    attendees: 12,
    max: 20,
    status: "Open",
  },
  {
    title: "Advanced Gi",
    time: "19:00 - 20:30",
    instructor: "Prof. Silva",
    attendees: 18,
    max: 20,
    status: "Almost Full",
  },
  {
    title: "No-Gi All Levels",
    time: "07:00 - 08:00 (Tomorrow)",
    instructor: "Coach Mike",
    attendees: 5,
    max: 20,
    status: "Open",
  },
  {
    title: "Competition Training",
    time: "18:00 - 19:30 (Tomorrow)",
    instructor: "Prof. Silva",
    attendees: 15,
    max: 20,
    status: "Open",
  },
]

export function UpcomingClasses() {
  return (
    <div className="space-y-6">
      {classes.map((cls, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{cls.title}</p>
            <p className="text-xs text-muted-foreground">
              {cls.time} • {cls.instructor}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              {cls.attendees}/{cls.max}
            </div>
            <Badge variant={cls.status === "Almost Full" ? "secondary" : "outline"} className="text-[10px]">
              {cls.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
