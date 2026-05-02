"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@workspace/ui/components/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group"
import { apiClient } from "@/lib/api-client"

interface MonthlyStatDto { 
  month: string; 
  completedWorks?: number; 
  CompletedWorks?: number;
  newIncidents?: number; 
  NewIncidents?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

const chartConfig = {
  completedWorks: { label: "Công việc hoàn thành", color: "hsl(var(--primary))" },
  newIncidents:   { label: "Sự cố mới", color: "#f59e0b" },
} satisfies ChartConfig

function formatMonth(ym: string) {
  const [y, m] = ym.split("-")
  return `T${m}/${y}`
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("6m")
  const [data, setData] = React.useState<MonthlyStatDto[]>([])

  React.useEffect(() => {
    if (isMobile) setTimeRange("3m")
  }, [isMobile])

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiClient.get<any[]>("/api/reports/monthly-stats")
        if (!res || !Array.isArray(res)) {
          console.warn("Monthly stats: invalid data format", res);
          return;
        }
        const mapped = res.map(item => ({
          month: item.month ?? item.Month,
          completedWorks: item.completedWorks ?? item.CompletedWorks ?? 0,
          newIncidents: item.newIncidents ?? item.NewIncidents ?? 0,
        }));
        setData(mapped);
      } catch (err: any) {
        console.error("Monthly stats fetch error:", err.message || err);
      }
    };
    loadData();
  }, [])

  const months = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12
  const filtered = data.slice(-months)

  return (
    <Card className="@container/card shadow-sm border-border">
      <CardHeader>
        <CardTitle className="text-xl text-green-800">Thống Kê Công Tác Quản Lý</CardTitle>
        <CardDescription>Công việc hoàn thành và sự cố mới theo tháng</CardDescription>
        <CardAction>
          <ToggleGroup
            type="single" value={timeRange} onValueChange={setTimeRange} variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="3m">3 tháng</ToggleGroupItem>
            <ToggleGroupItem value="6m">6 tháng</ToggleGroupItem>
            <ToggleGroupItem value="12m">12 tháng</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex w-32 @[767px]/card:hidden" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 tháng</SelectItem>
              <SelectItem value="6m">6 tháng</SelectItem>
              <SelectItem value="12m">12 tháng</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filtered}>
            <defs>
              <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-completedWorks)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-completedWorks)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillIncidents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-newIncidents)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-newIncidents)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={formatMonth} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent labelFormatter={(v) => formatMonth(v as string)} indicator="dot" />}
            />
            <Area dataKey="newIncidents" type="monotone" fill="url(#fillIncidents)" stroke="var(--color-newIncidents)" stackId="a" />
            <Area dataKey="completedWorks" type="monotone" fill="url(#fillCompleted)" stroke="var(--color-completedWorks)" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
