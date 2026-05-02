"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"
import { Badge } from "@workspace/ui/components/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { apiClient } from "@/lib/api-client"
import { Loader2 } from "lucide-react"
import { WorkflowBanner } from "./workflow-banner"
import { useAuth } from "@/hooks/use-auth"
import { Role } from "@/lib/roles"

interface PlanDetailSheetProps {
  planId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRefresh: () => void
}

export function PlanDetailSheet({ planId, open, onOpenChange, onRefresh }: PlanDetailSheetProps) {
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (open && planId) {
      loadPlan()
    } else {
      setPlan(null)
    }
  }, [open, planId])

  async function loadPlan() {
    setLoading(true)
    try {
      const data = await apiClient.get(`/api/planning/${planId}`)
      setPlan(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{loading ? "Đang tải..." : plan?.name ?? `Kế hoạch #${planId}`}</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin size-8 text-green-600" /></div>
        ) : plan ? (
          <div className="flex flex-col gap-6">
            <WorkflowBanner 
              planId={plan.id}
              status={plan.status}
              statusName={plan.statusName}
              rejectionReason={plan.rejectionReason}
              userRole={user?.role as Role}
              onStatusChange={() => {
                loadPlan()
                onRefresh()
              }}
            />

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground mb-1">Ngày bắt đầu</p>
                    <p className="font-medium">{plan.startDate ? new Date(plan.startDate).toLocaleDateString("vi-VN") : "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground mb-1">Ngày kết thúc</p>
                    <p className="font-medium">{plan.endDate ? new Date(plan.endDate).toLocaleDateString("vi-VN") : "—"}</p>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/30 p-3 border-b">
                    <h3 className="text-sm font-semibold">Danh sách công tác</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Công tác</TableHead>
                            <TableHead>Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plan.works?.map((w: any) => (
                            <TableRow key={w.id}>
                                <TableCell className="text-xs font-medium">{w.workTypeName}</TableCell>
                                <TableCell><Badge variant="outline" className="text-[10px]">{w.status}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          </div>
        ) : (
          <p className="text-center py-10 text-muted-foreground">Không tìm thấy dữ liệu.</p>
        )}
      </SheetContent>
    </Sheet>
  )
}
