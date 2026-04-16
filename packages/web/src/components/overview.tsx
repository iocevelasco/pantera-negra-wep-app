"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useDashboard } from "@/providers/dashboard-provider"
import { Skeleton } from "@/components/ui/skeleton"

export function Overview() {
  const { stats } = useDashboard();
  
  if (stats.isLoading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  if (stats.error) {
    return (
      <div className="flex items-center justify-center h-[350px] text-sm text-muted-foreground">
        Error loading attendance data
      </div>
    );
  }

  const attendanceData = stats.data?.attendanceByDayOfWeek || {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  };

  // Transform data for the chart, ensuring correct order (Mon-Sun)
  const data = [
    {
      name: "Mon",
      total: attendanceData.Mon,
    },
    {
      name: "Tue",
      total: attendanceData.Tue,
    },
    {
      name: "Wed",
      total: attendanceData.Wed,
    },
    {
      name: "Thu",
      total: attendanceData.Thu,
    },
    {
      name: "Fri",
      total: attendanceData.Fri,
    },
    {
      name: "Sat",
      total: attendanceData.Sat,
    },
    {
      name: "Sun",
      total: attendanceData.Sun,
    },
  ];

  // Custom tooltip formatter
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            {payload[0].value} {payload[0].value === 1 ? 'attendance' : 'attendances'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis 
          dataKey="name" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value}`} 
        />
        <Tooltip
          content={customTooltip}
          cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
        />
        <Bar 
          dataKey="total" 
          fill="currentColor" 
          radius={[4, 4, 0, 0]} 
          className="fill-primary" 
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
