"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"

export const description = "Biểu đồ thống kê tiến độ chăm sóc cây xanh"

// Dữ liệu mô phỏng: Cây trồng mới và Cây bảo dưỡng
const chartData = [
  { date: "2024-04-01", bao_duong: 222, trong_moi: 15 },
  { date: "2024-04-05", bao_duong: 373, trong_moi: 29 },
  { date: "2024-04-10", bao_duong: 261, trong_moi: 19 },
  { date: "2024-04-15", bao_duong: 120, trong_moi: 17 },
  { date: "2024-04-20", bao_duong: 89,  trong_moi: 15 },
  { date: "2024-04-25", bao_duong: 215, trong_moi: 25 },
  { date: "2024-04-30", bao_duong: 454, trong_moi: 38 },
  { date: "2024-05-05", bao_duong: 481, trong_moi: 39 },
  { date: "2024-05-10", bao_duong: 293, trong_moi: 33 },
  { date: "2024-05-15", bao_duong: 473, trong_moi: 38 },
  { date: "2024-05-20", bao_duong: 177, trong_moi: 23 },
  { date: "2024-05-25", bao_duong: 201, trong_moi: 25 },
  { date: "2024-05-30", bao_duong: 340, trong_moi: 28 },
  { date: "2024-06-05", bao_duong: 88,  trong_moi: 14 },
  { date: "2024-06-10", bao_duong: 155, trong_moi: 20 },
  { date: "2024-06-15", bao_duong: 307, trong_moi: 35 },
  { date: "2024-06-20", bao_duong: 408, trong_moi: 45 },
  { date: "2024-06-25", bao_duong: 141, trong_moi: 19 },
  { date: "2024-06-30", bao_duong: 446, trong_moi: 40 },
]

const chartConfig = {
  trees: {
    label: "Số lượng cây",
  },
  bao_duong: {
    label: "Bảo dưỡng",
    color: "hsl(var(--primary))",
  },
  trong_moi: {
    label: "Trồng mới",
    color: "#10b981", // Màu xanh lá cho cây trồng mới
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card shadow-sm border-border">
      <CardHeader>
        <CardTitle className="text-xl text-green-800">Thống Kê Công Tác Quản Lý</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Tổng số lượng cây được chăm sóc trong khoảng thời gian
          </span>
          <span className="@[540px]/card:hidden">Dữ liệu tổng hợp</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 tháng qua</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 ngày qua</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 ngày qua</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-36 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Chọn khoảng thời gian"
            >
              <SelectValue placeholder="3 tháng qua" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">3 tháng qua</SelectItem>
              <SelectItem value="30d" className="rounded-lg">30 ngày qua</SelectItem>
              <SelectItem value="7d" className="rounded-lg">7 ngày qua</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillBaoDuong" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-bao_duong)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-bao_duong)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillTrongMoi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-trong_moi)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-trong_moi)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("vi-VN", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="trong_moi"
              type="monotone"
              fill="url(#fillTrongMoi)"
              stroke="var(--color-trong_moi)"
              stackId="a"
            />
            <Area
              dataKey="bao_duong"
              type="monotone"
              fill="url(#fillBaoDuong)"
              stroke="var(--color-bao_duong)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}