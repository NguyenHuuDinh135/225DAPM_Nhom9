"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "@workspace/ui/components/sonner"
import {
  ArrowLeft, Users, TreePine, ClipboardList,
  Calendar, CheckCircle2, Clock, AlertCircle,
  UserPlus, FileText, X,
} from "lucide-react"

interface ProgressEntry {
  id: number
  updaterId: string
  percentage: number | null
  note: string | null
  updatedDate: string | null
  images: string[]
}

interface WorkUser {
  userId: string
  fullName: string | null
  role: string | null
  status: string | null
}

interface WorkDetailFull {
  id: number
  workTypeId: number
  workTypeName: string | null
  planId: number
  planName: string | null
  creatorId: string
  startDate: string | null
  endDate: string | null
  status: string
  statusName: string
  users: WorkUser[]
  treeNames: string[]
  progresses: ProgressEntry[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  New: { label: "Mới", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
  InProgress: { label: "Đang thực hiện", color: "bg-amber-100 text-amber-700 border-amber-200", icon: ClipboardList },
  WaitingForApproval: { label: "Chờ duyệt", color: "bg-purple-100 text-purple-700 border-purple-200", icon: AlertCircle },
  Completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  Cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200", icon: X },
}

export default function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const [work, setWork] = useState<WorkDetailFull | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get<WorkDetailFull>(`/api/work-items/${id}`)
      .then(setWork)
      .catch(() => toast.error("Không thể tải thông tin công tác"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!work) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="size-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <X className="size-10 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Không tìm thấy công tác</h3>
        <Button variant="link" asChild className="mt-2">
          <Link href="/works">Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  const defaultStatus = { label: "Mới", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock }
  const statusCfg = STATUS_CONFIG[work.status] ?? defaultStatus
  const StatusIcon = statusCfg.icon
  const userRole = user?.role

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/works">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">Công tác #{work.id}</h1>
            <Badge className={`${statusCfg.color} border`}>
              <StatusIcon className="size-3 mr-1" />
              {statusCfg.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {work.workTypeName ?? "Không xác định"} &mdash; {work.planName ?? `Kế hoạch #${work.planId}`}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Time card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="size-4" />
              Thời gian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-medium">Bắt đầu:</span>{" "}
              {work.startDate ? new Date(work.startDate).toLocaleDateString("vi-VN") : "Chưa xác định"}
            </p>
            <p className="text-sm mt-1">
              <span className="font-medium">Kết thúc:</span>{" "}
              {work.endDate ? new Date(work.endDate).toLocaleDateString("vi-VN") : "Chưa xác định"}
            </p>
          </CardContent>
        </Card>

        {/* Assigned users card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="size-4" />
              Nhân viên ({work.users?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {work.users && work.users.length > 0 ? (
              <ul className="space-y-1">
                {work.users.map((u) => (
                  <li key={u.userId} className="text-sm flex items-center gap-2">
                    <span className="size-2 rounded-full bg-green-500" />
                    {u.fullName ?? u.userId.substring(0, 8)}
                    {u.role && <Badge variant="outline" className="text-[10px] ml-auto">{u.role}</Badge>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Chưa phân công</p>
            )}
          </CardContent>
        </Card>

        {/* Trees card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TreePine className="size-4" />
              Cây xanh ({work.treeNames?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {work.treeNames && work.treeNames.length > 0 ? (
              <ul className="space-y-1">
                {work.treeNames.map((name, idx) => (
                  <li key={idx} className="text-sm">{name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có cây nào</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4" />
            Lịch sử tiến độ ({work.progresses?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!work.progresses || work.progresses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Chưa có báo cáo tiến độ nào.</p>
          ) : (
            <div className="space-y-4">
              {[...work.progresses].reverse().map((p) => (
                <div key={p.id} className="flex gap-4 border-l-2 border-primary/20 pl-4 pb-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">
                        {p.updatedDate
                          ? new Date(p.updatedDate).toLocaleString("vi-VN", {
                              day: "2-digit", month: "2-digit", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })
                          : "—"}
                      </span>
                      {p.percentage != null && (
                        <Badge variant="outline" className="text-[10px]">{p.percentage}%</Badge>
                      )}
                    </div>
                    {p.note && <p className="text-sm">{p.note}</p>}
                    {p.images && p.images.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {p.images.map((src, idx) => (
                          <a key={idx} href={src} target="_blank" rel="noreferrer"
                            className="size-12 rounded-md overflow-hidden border hover:border-primary transition-colors">
                            <img src={src} alt="progress" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {(userRole === ROLES.DoiTruong || userRole === ROLES.GiamDoc) && (
          <Button asChild>
            <Link href={`/works/${id}/assign`}>
              <UserPlus className="size-4 mr-2" />
              Phân công nhân viên
            </Link>
          </Button>
        )}
        {work.status !== "Completed" && work.status !== "Cancelled" && (
          <Button variant="outline" asChild>
            <Link href={`/works/${id}/progress`}>
              <FileText className="size-4 mr-2" />
              Báo cáo tiến độ
            </Link>
          </Button>
        )}
        <Button variant="ghost" asChild>
          <Link href={`/plans/${work.planId}`}>
            Xem kế hoạch
          </Link>
        </Button>
      </div>
    </div>
  )
}
