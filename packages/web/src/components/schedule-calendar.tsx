import { cn } from "@/lib/utils"

const HOURS = Array.from({ length: 14 }, (_, i) => i + 6) // 6am to 8pm
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const CLASSES = [
  {
    id: 1,
    name: "Morning Fundamentals",
    type: "Gi",
    day: "Mon",
    startTime: 7,
    duration: 1,
    instructor: "Prof. Silva",
    color: "bg-blue-600 border-blue-700",
  },
  {
    id: 2,
    name: "Lunch BJJ",
    type: "No-Gi",
    day: "Mon",
    startTime: 12,
    duration: 1,
    instructor: "Coach Mike",
    color: "bg-purple-600 border-purple-700",
  },
  {
    id: 3,
    name: "Advanced Gi",
    type: "Gi",
    day: "Mon",
    startTime: 18, // 6pm
    duration: 1.5,
    instructor: "Prof. Silva",
    color: "bg-neutral-800 border-neutral-700",
  },
  {
    id: 4,
    name: "Morning Fundamentals",
    type: "Gi",
    day: "Tue",
    startTime: 7,
    duration: 1,
    instructor: "Prof. Silva",
    color: "bg-blue-600 border-blue-700",
  },
  {
    id: 5,
    name: "Kids Class",
    type: "Kids",
    day: "Tue",
    startTime: 16.5, // 4:30pm
    duration: 1,
    instructor: "Coach Sarah",
    color: "bg-amber-600 border-amber-700",
  },
  {
    id: 6,
    name: "All Levels",
    type: "Gi",
    day: "Tue",
    startTime: 18,
    duration: 1.5,
    instructor: "Prof. Silva",
    color: "bg-blue-600 border-blue-700",
  },
  {
    id: 7,
    name: "Morning Fundamentals",
    type: "Gi",
    day: "Wed",
    startTime: 7,
    duration: 1,
    instructor: "Prof. Silva",
    color: "bg-blue-600 border-blue-700",
  },
  {
    id: 8,
    name: "No-Gi Advanced",
    type: "No-Gi",
    day: "Wed",
    startTime: 18,
    duration: 1.5,
    instructor: "Coach Mike",
    color: "bg-purple-600 border-purple-700",
  },
  {
    id: 9,
    name: "Open Mat",
    type: "Open",
    day: "Sat",
    startTime: 10,
    duration: 2,
    instructor: "All Instructors",
    color: "bg-green-600 border-green-700",
  },
]

export function ScheduleCalendar() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header Row */}
      <div className="grid grid-cols-8 border-b min-w-[800px]">
        <div className="p-2 border-r bg-muted/30 sticky left-0 z-10 text-xs font-medium text-muted-foreground text-center py-4">
          Time
        </div>
        {DAYS.map((day) => (
          <div key={day} className="p-2 border-r last:border-r-0 text-center py-4 bg-muted/10">
            <span className="font-semibold text-sm block">{day}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-8 flex-1 min-w-[800px] relative">
        {/* Time Column */}
        <div className="border-r bg-muted/5 sticky left-0 z-10">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-20 border-b last:border-b-0 text-xs text-muted-foreground p-2 text-right relative"
            >
              <span className="-top-2.5 absolute right-2 bg-background px-1">{hour}:00</span>
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {DAYS.map((day) => (
          <div key={day} className="border-r last:border-r-0 relative bg-background/50">
            {/* Hour grid lines */}
            {HOURS.map((hour) => (
              <div key={hour} className="h-20 border-b border-dashed border-muted/50 last:border-b-0" />
            ))}

            {/* Classes */}
            {CLASSES.filter((c) => c.day === day).map((cls) => {
              // Calculate position
              // Start time is relative to the first hour (6am)
              const topOffset = (cls.startTime - 6) * 80 // 80px per hour
              const height = cls.duration * 80

              return (
                <div
                  key={cls.id}
                  className={cn(
                    "absolute left-1 right-1 rounded-md border p-2 text-xs text-white shadow-sm hover:brightness-110 cursor-pointer transition-all z-10 overflow-hidden",
                    cls.color,
                  )}
                  style={{
                    top: `${topOffset}px`,
                    height: `${height - 2}px`, // -2 for gap
                  }}
                >
                  <div className="font-bold truncate">{cls.name}</div>
                  <div className="opacity-90 truncate">{cls.instructor}</div>
                  <div className="mt-1 opacity-75 text-[10px]">
                    {cls.startTime}:00 - {cls.startTime + cls.duration}:{Number.isInteger(cls.duration) ? "00" : "30"}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
