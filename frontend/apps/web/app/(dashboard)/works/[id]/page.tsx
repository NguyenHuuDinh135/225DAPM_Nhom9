import { type Metadata } from "next"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, CalendarIcon, UserIcon, ClipboardListIcon, ImageIcon, CheckCircle2Icon } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"

export const metadata: Metadata = { title: "Chi tiết công việc" }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

interface WorkProgress {
  id: number
  updaterId: string
  percentage: number | null
  note: string | null
  updatedDate: string | null
  images: string[]
}

interface WorkUser {
  userId: string
  role: string | null
  status: string | null
}

interface WorkDetail {
  id: number
  treeId: number
  content: string | null
  status: string | null
}

interface WorkItemDetail {
  id: number
  workTypeName: string | null
  planName: string | null
  creatorId: string
  startDate: string | null
  endDate: string | null
  status: string
  rejectionFeedback: string | null
  progresses: WorkProgress[]
  users: WorkUser[]
  details: WorkDetail[]
}

const STATUS_LABEL: Record<string, string> = {
  New: "Mới",
  InProgress: "Đang thực hiện",
  WaitingForApproval: "Chờ duyệt",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  New: "secondary",
  InProgress: "default",
  WaitingForApproval: "outline",
  Completed: "default",
  Cancelled: "destructive",
}

async function fetchWorkDetail(id: string): Promise<WorkItemDetail | null> {
  const token = (await cookies()).get("access_token")?.value
  const res = await fetch(`${BASE_URL}/api/work-items/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  })
  if (!res.ok) return null
  return res.json()
}

export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const work = await fetchWorkDetail(id)
  if (!work) notFound()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link 
            href="/works" 
            className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="size-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold">Công việc #{work.id}</h1>
              <Badge variant={STATUS_VARIANT[work.status] ?? "outline"} className="text-sm">
                {STATUS_LABEL[work.status] ?? work.status}
              </Badge>
            </div>
            <p className="text-base text-muted-foreground mt-1">
              {work.workTypeName ?? "Không rõ loại công việc"}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 sm:flex-shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/works/${work.id}/assign`}>
              <UserIcon className="size-4 mr-2" />
              Phân công
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/works/${work.id}/progress`}>
              <CheckCircle2Icon className="size-4 mr-2" />
              Báo cáo
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardListIcon className="size-5 text-primary" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Kế hoạch</p>
                  <p className="text-sm font-semibold">{work.planName ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Loại công việc</p>
                  <p className="text-sm font-semibold">{work.workTypeName ?? "—"}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <CalendarIcon className="size-4" />
                  Thời gian thực hiện
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {work.startDate ? new Date(work.startDate).toLocaleDateString("vi-VN") : "—"}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">
                    {work.endDate ? new Date(work.endDate).toLocaleDateString("vi-VN") : "—"}
                  </span>
                </div>
              </div>

              {work.rejectionFeedback && (
                <div className="pt-3 border-t space-y-1">
                  <p className="text-sm font-medium text-destructive">Lý do từ chối</p>
                  <p className="text-sm text-muted-foreground bg-destructive/5 p-3 rounded-md">
                    {work.rejectionFeedback}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress History */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2Icon className="size-5 text-primary" />
                  Lịch sử tiến độ
                </CardTitle>
                <Badge variant="secondary">{work.progresses.length}</Badge>
              </div>
              <CardDescription>Các báo cáo tiến độ đã được cập nhật</CardDescription>
            </CardHeader>
            <CardContent>
              {work.progresses.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2Icon className="size-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Chưa có báo cáo tiến độ nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {work.progresses.map((progress, idx) => (
                    <div 
                      key={progress.id} 
                      className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {progress.percentage !== null ? `${progress.percentage}%` : "—"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Cập nhật #{work.progresses.length - idx}</p>
                            <p className="text-xs text-muted-foreground">
                              {progress.updatedDate
                                ? new Date(progress.updatedDate).toLocaleString("vi-VN")
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {progress.note && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                          {progress.note}
                        </p>
                      )}
                      {progress.images.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ImageIcon className="size-4" />
                          <span>{progress.images.length} hình ảnh đính kèm</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Details (Trees) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Chi tiết công việc</CardTitle>
                <Badge variant="secondary">{work.details.length}</Badge>
              </div>
              <CardDescription>Danh sách cây được phân công trong công việc này</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {work.details.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <ClipboardListIcon className="size-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Chưa có chi tiết công việc nào</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Mã cây</TableHead>
                        <TableHead>Nội dung</TableHead>
                        <TableHead className="w-[120px]">Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {work.details.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-mono text-sm">#{detail.treeId}</TableCell>
                          <TableCell className="text-sm">
                            {detail.content ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {detail.status ?? "—"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Assigned Users */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserIcon className="size-5 text-primary" />
                  Nhân viên
                </CardTitle>
                <Badge variant="secondary">{work.users.length}</Badge>
              </div>
              <CardDescription>Được phân công thực hiện</CardDescription>
            </CardHeader>
            <CardContent>
              {work.users.length === 0 ? (
                <div className="text-center py-8">
                  <UserIcon className="size-10 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Chưa có nhân viên</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {work.users.map((user, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="size-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.userId}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.role && (
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          )}
                          {user.status && (
                            <Badge variant="secondary" className="text-xs">
                              {user.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
