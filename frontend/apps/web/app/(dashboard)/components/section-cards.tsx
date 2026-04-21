import { Badge } from "@workspace/ui/components/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartUpIcon, ChartDownIcon, Tree01Icon, AlertCircleIcon, CheckmarkCircle01Icon, Clock01Icon } from "@hugeicons/core-free-icons"

export interface DashboardStats {
  totalTrees: number
  pendingIncidents: number
  completedWorksThisMonth: number
  pendingWorksThisMonth: number
}

export function SectionCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    { label: "Tổng số cây xanh", value: stats.totalTrees, icon: Tree01Icon, footer: "Toàn bộ cây trong hệ thống", trend: "up" as const },
    { label: "Sự cố chờ xử lý", value: stats.pendingIncidents, icon: AlertCircleIcon, footer: "Cần được xử lý sớm", trend: "down" as const },
    { label: "Công việc hoàn thành", value: stats.completedWorksThisMonth, icon: CheckmarkCircle01Icon, footer: "Trong tháng này", trend: "up" as const },
    { label: "Công việc đang chờ", value: stats.pendingWorksThisMonth, icon: Clock01Icon, footer: "Trong tháng này", trend: "down" as const },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => (
        <Card key={card.label} className="@container/card">
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value.toLocaleString("vi-VN")}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <HugeiconsIcon icon={card.trend === "up" ? ChartUpIcon : ChartDownIcon} strokeWidth={2} />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              <HugeiconsIcon icon={card.icon} strokeWidth={2} className="size-4" />
              {card.footer}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export function SectionCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="@container/card">
          <CardHeader>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-20 mt-1" />
          </CardHeader>
          <CardFooter>
            <Skeleton className="h-4 w-40" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
