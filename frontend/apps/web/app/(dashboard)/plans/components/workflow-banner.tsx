"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import {
  CheckCircle2,
  Send,
  Ban,
  MessageSquare,
  Info,
  AlertTriangle,
} from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Textarea } from "@workspace/ui/components/textarea"
import { apiClient } from "@/lib/api-client"
import { ROLES, Role } from "@/lib/roles"

interface WorkflowBannerProps {
  planId: number
  status: string
  statusName: string
  rejectionReason?: string | null
  userRole: Role
  onStatusChange?: () => void
}

const STATUS_CONFIG: Record<
  string,
  { icon: any; color: string; desc: string }
> = {
  Draft: {
    icon: Info,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    desc: "Kế hoạch đang được soạn thảo bởi Đội trưởng.",
  },
  PendingApproval: {
    icon: Clock,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    desc: "Kế hoạch đang chờ Giám đốc phê duyệt.",
  },
  NeedsRevision: {
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    desc: "Giám đốc yêu cầu chỉnh sửa lại nội dung.",
  },
  Approved: {
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700 border-green-200",
    desc: "Kế hoạch đã được duyệt và đang triển khai.",
  },
  Rejected: {
    icon: Ban,
    color: "bg-red-100 text-red-700 border-red-200",
    desc: "Kế hoạch đã bị bác bỏ hoàn toàn.",
  },
  Completed: {
    icon: CheckCircle2,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    desc: "Kế hoạch đã hoàn thành tất cả hạng mục.",
  },
  Cancelled: {
    icon: Ban,
    color: "bg-gray-100 text-gray-500 border-gray-200",
    desc: "Kế hoạch đã bị hủy bỏ.",
  },
}

import { Clock } from "lucide-react"

export function WorkflowBanner({
  planId,
  status,
  statusName,
  rejectionReason,
  userRole,
  onStatusChange,
}: WorkflowBannerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"reject">("reject")
  const [reason, setReason] = useState("")

  const config = (STATUS_CONFIG[status] || STATUS_CONFIG.Draft)!
  const Icon = config.icon || Info

  const handleAction = async (action: "submit" | "approve" | "reject") => {
    if (action === "reject" && !dialogOpen) {
      setDialogType(action)
      setDialogOpen(true)
      return
    }

    setLoading(true)
    try {
      let endpoint = `/api/Planning/${planId}/`
      let body: any = undefined

      switch (action) {
        case "submit":
          endpoint += "submit"
          break
        case "approve":
          endpoint += "approve"
          break
        case "reject":
          endpoint += "reject"
          body = { id: planId, reason }
          break
      }

      await apiClient.put(endpoint, body || {})
      toast.success("Cập nhật trạng thái thành công")
      setDialogOpen(false)
      setReason("")
      if (onStatusChange) {
        onStatusChange()
      } else {
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  const isCaptain = userRole === ROLES.DoiTruong
  const isDirector = userRole === ROLES.GiamDoc

  return (
    <div className="mb-6 flex flex-col gap-4">
      <Card className={`overflow-hidden border-l-4 ${config.color} shadow-sm`}>
        <div className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <div
              className={`rounded-full border bg-white/50 p-2 ${config.color.split(" ")[2]}`}
            >
              <Icon className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight uppercase">
                  {statusName}
                </span>
                <Badge variant="outline" className="py-0 text-[10px]">
                  workflow v2
                </Badge>
              </div>
              <p className="text-sm opacity-90">{config.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Đội trưởng actions */}
            {isCaptain &&
              (status === "Draft" || status === "NeedsRevision") && (
                <Button
                  size="sm"
                  onClick={() => handleAction("submit")}
                  disabled={loading}
                  className="bg-amber-600 font-semibold text-white hover:bg-amber-700"
                >
                  <Send className="mr-2 size-4" /> Gửi duyệt
                </Button>
              )}

            {/* Giám đốc actions */}
            {isDirector && status === "PendingApproval" && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleAction("approve")}
                  disabled={loading}
                  className="bg-green-600 font-semibold text-white hover:bg-green-700"
                >
                  <CheckCircle2 className="mr-2 size-4" /> Phê duyệt
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleAction("reject")}
                  disabled={loading}
                >
                  <Ban className="mr-2 size-4" /> Bác bỏ
                </Button>
              </>
            )}
          </div>
        </div>

        {rejectionReason && (
          <div className="flex items-start gap-3 border-t border-dashed border-current/10 bg-white/60 px-4 py-3">
            <MessageSquare className="mt-0.5 size-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="mr-2 font-semibold text-muted-foreground">
                Ý kiến phê duyệt:
              </span>
              <span className="italic">"{rejectionReason}"</span>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bác bỏ kế hoạch</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do và phản hồi để Đội trưởng có thể nắm bắt thông
              tin.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Nhập nội dung phản hồi tại đây..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAction(dialogType)}
              disabled={!reason.trim() || loading}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
