"use client"

import { useEffect, useState, useMemo } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  MapPin, ChevronRight, Navigation, Search, X,
  Circle, Timer, Clock, CheckCircle2,
  ClipboardList, AlertTriangle, CalendarDays, Filter,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkStatus = "New" | "InProgress" | "WaitingForApproval" | "Completed"

interface Task {
  id: number
  workTypeName: string | null
  planName: string | null
  treeName: string
  location: string
  lat: number | null
  lng: number | null
  status: WorkStatus
  statusName: string
  startDate: string | null
  endDate: string | null
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<WorkStatus, {
  label: string
  icon: React.ElementType
  badge: string
  accent: string
}> = {
  New: {
    label: "Mới",
    icon: Circle,
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    accent: "bg-blue-500",
  },
  InProgress: {
    label: "Đang thực hiện",
    icon: Timer,
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    accent: "bg-amber-500",
  },
  WaitingForApproval: {
    label: "Chờ duyệt",
    icon: Clock,
    badge: "bg-purple-50 text-purple-700 border-purple-100",
    accent: "bg-purple-500",
  },
  Completed: {
    label: "Hoàn thành",
    icon: CheckCircle2,
    badge: "bg-green-50 text-green-700 border-green-100",
    accent: "bg-green-500",
  },
}

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as WorkStatus[]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDeadlineInfo(endDate: string | null): { label: string; color: string } {
  if (!endDate) return { label: "Không có hạn", color: "text-muted-foreground" }
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { label: `Quá hạn ${Math.abs(diff)} ngày`, color: "text-red-600 font-bold" }
  if (diff === 0) return { label: "Hết hạn hôm nay", color: "text-red-500 font-bold" }
  if (diff <= 3) return { label: `Còn ${diff} ngày`, color: "text-orange-500 font-semibold" }
  return {
    label: new Date(endDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
    color: "text-muted-foreground",
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TaskSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-36 w-full rounded-[2rem]" />
      ))}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-[3rem] border border-dashed border-muted-foreground/20">
      <div className="size-20 rounded-full bg-background flex items-center justify-center mb-4 shadow-xl">
        {filtered
          ? <Filter className="size-10 text-muted-foreground/40" />
          : <CheckCircle2 className="size-10 text-green-500" />}
      </div>
      <h3 className="text-xl font-black text-foreground">
        {filtered ? "Không tìm thấy kết quả" : "Không có công việc"}
      </h3>
      <p className="text-muted-foreground font-medium mt-1 text-center max-w-xs text-sm">
        {filtered
          ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
          : "Bạn chưa được giao công việc nào trong mục này."}
      </p>
    </div>
  )
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task }: { task: Task }) {
  const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.New
  const StatusIcon = cfg.icon
  const deadline = getDeadlineInfo(task.endDate)
  const isDone = task.status === "Completed"
  const isWaiting = task.status === "WaitingForApproval"

  return (
    <Card className="group overflow-hidden rounded-[2rem] border-none shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl hover:bg-card transition-all duration-300 hover:-translate-y-0.5">
      <CardContent className="p-0">
        <div className="flex">
          {/* Accent bar */}
          <div className={cn("w-1.5 shrink-0 rounded-l-[2rem]", cfg.accent)} />

          <div className="flex-1 p-5 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              {/* Left info */}
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn("rounded-full border px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider", cfg.badge)}>
                    <StatusIcon className="size-3 mr-1.5" />
                    {cfg.label}
                  </Badge>
                  {task.workTypeName && (
                    <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-600 border-none px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider">
                      {task.workTypeName}
                    </Badge>
                  )}
                  {task.planName && (
                    <Badge variant="outline" className="rounded-full border-muted-foreground/20 text-muted-foreground px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider hidden sm:inline-flex">
                      {task.planName}
                    </Badge>
                  )}
                </div>

                <h3 className={cn(
                  "text-xl font-black tracking-tight transition-colors",
                  isDone
                    ? "text-muted-foreground line-through decoration-muted-foreground/40"
                    : "text-foreground group-hover:text-primary"
                )}>
                  {task.treeName}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    {task.location}
                  </span>
                  <span className={cn("flex items-center gap-1.5 text-xs", deadline.color)}>
                    <CalendarDays className="size-3.5 shrink-0" />
                    {deadline.label}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex w-full md:w-auto gap-2 shrink-0">
                {isDone ? (
                  <Button variant="ghost" asChild className="h-10 rounded-xl text-muted-foreground hover:text-foreground text-xs font-bold">
                    <Link href={`/works/${task.id}/progress`}>
                      Xem chi tiết <ChevronRight className="ml-1 size-3.5" />
                    </Link>
                  </Button>
                ) : isWaiting ? (
                  <Button variant="outline" asChild className="flex-1 md:w-44 h-12 rounded-2xl border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-black text-sm transition-all">
                    <Link href={`/works/${task.id}/progress`}>
                      <Clock className="mr-2 size-4" /> Xem tiến độ
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild className="flex-1 md:w-40 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm">
                      <Link href={`/works/${task.id}/progress`}>
                        Tiếp nhận <ChevronRight className="ml-1.5 size-4" />
                      </Link>
                    </Button>
                    {task.lat != null && task.lng != null && (
                      <Button variant="secondary" size="icon" className="size-12 rounded-2xl bg-muted/60 hover:bg-muted text-muted-foreground shrink-0 transition-all" asChild>
                        <Link href={`/map?lat=${task.lat}&lng=${task.lng}`}>
                          <Navigation className="size-5" />
                        </Link>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NhanVienTasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeStatus, setActiveStatus] = useState<WorkStatus | "All">("All")

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    apiClient
      .get<any>("/api/work-items")
      .then((res) => {
        const allWorks: any[] = res?.workItems ?? []
        // Mỗi work item có thể có nhiều cây → flatten thành nhiều task card
        const mine: Task[] = []
        allWorks
          .filter((w) =>
            Array.isArray(w.assignedUsers) &&
            w.assignedUsers.some((au: any) => au.userId === user.id)
          )
          .filter((w) => w.status !== "Cancelled")
          .forEach((w) => {
            const trees: any[] = w.treeLocations ?? []
            if (trees.length === 0) {
              // Không có cây nào → vẫn hiện 1 card
              mine.push({
                id: w.id,
                workTypeName: w.workTypeName ?? null,
                planName: w.planName ?? null,
                treeName: "Chưa có cây",
                location: "Chưa có vị trí",
                lat: null,
                lng: null,
                status: w.status as WorkStatus,
                statusName: w.statusName,
                startDate: w.startDate ?? null,
                endDate: w.endDate ?? null,
              })
            } else {
              // Mỗi cây → 1 card riêng
              trees.forEach((tree) => {
                mine.push({
                  id: w.id,
                  workTypeName: w.workTypeName ?? null,
                  planName: w.planName ?? null,
                  treeName: tree.treeName || `Cây #${tree.treeId ?? "?"}`,
                  location:
                    tree.latitude != null
                      ? `Lat: ${(tree.latitude as number).toFixed(4)}, Lng: ${(tree.longitude as number).toFixed(4)}`
                      : "Chưa có vị trí",
                  lat: tree.latitude ?? null,
                  lng: tree.longitude ?? null,
                  status: w.status as WorkStatus,
                  statusName: w.statusName,
                  startDate: w.startDate ?? null,
                  endDate: w.endDate ?? null,
                })
              })
            }
          })
        setTasks(mine)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.id])

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: tasks.length }
    for (const s of ALL_STATUSES) map[s] = tasks.filter((t) => t.status === s).length
    return map
  }, [tasks])

  const filtered = useMemo(() => {
    let list = tasks
    if (activeStatus !== "All") list = list.filter((t) => t.status === activeStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.treeName.toLowerCase().includes(q) ||
          (t.workTypeName ?? "").toLowerCase().includes(q) ||
          (t.planName ?? "").toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      const da = a.endDate ? new Date(a.endDate).getTime() : Infinity
      const db = b.endDate ? new Date(b.endDate).getTime() : Infinity
      return da - db
    })
  }, [tasks, activeStatus, search])

  const tabs: { key: WorkStatus | "All"; label: string }[] = [
    { key: "All", label: "Tất cả" },
    { key: "New", label: "Mới" },
    { key: "InProgress", label: "Đang làm" },
    { key: "WaitingForApproval", label: "Chờ duyệt" },
    { key: "Completed", label: "Hoàn thành" },
  ]

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-5xl mx-auto w-full min-h-screen bg-background">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <ClipboardList className="size-4" />
            <span className="text-xs uppercase tracking-[0.2em]">Quản lý công việc</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Danh sách nhiệm vụ</h1>
          <p className="text-muted-foreground font-medium text-sm">
            Tổng cộng <span className="text-foreground font-bold">{tasks.length}</span> công việc được giao
          </p>
        </div>

        {/* Stats pills */}
        <div className="flex gap-2 flex-wrap">
          {(["New", "InProgress", "WaitingForApproval"] as WorkStatus[]).map((s) => {
            const cfg = STATUS_CONFIG[s]
            const count = counts[s] ?? 0
            if (count === 0) return null
            return (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                  cfg.badge,
                  activeStatus === s && "ring-2 ring-offset-1 ring-current"
                )}
              >
                <cfg.icon className="size-3" />
                {cfg.label}: {count}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm theo tên cây, loại công việc, kế hoạch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 pr-10 h-12 rounded-2xl border-muted-foreground/10 bg-muted/30 focus:bg-background transition-all text-sm font-medium"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map(({ key, label }) => {
          const count = counts[key] ?? 0
          const isActive = activeStatus === key
          const cfg = key !== "All" ? STATUS_CONFIG[key as WorkStatus] : null
          return (
            <button
              key={key}
              onClick={() => setActiveStatus(key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                  : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
              )}
            >
              {cfg && <cfg.icon className="size-3" />}
              {label}
              <span className={cn(
                "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black",
                isActive ? "bg-white/20 text-white" : "bg-muted-foreground/10 text-muted-foreground"
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Task List */}
      {loading ? (
        <TaskSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState filtered={search.trim() !== "" || activeStatus !== "All"} />
      ) : (
        <div className="grid gap-4">
          {filtered.map((task, idx) => (
            <TaskCard key={`${task.id}-${task.treeName}-${idx}`} task={task} />
          ))}
        </div>
      )}

      {/* Quick action */}
      {!loading && (
        <div className="pt-2">
          <Link
            href="/report-incident"
            className="flex items-center gap-4 p-5 rounded-[2rem] bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 transition-all group"
          >
            <div className="size-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:rotate-6 transition-transform shrink-0">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <p className="text-sm font-black text-orange-950/80">Phát hiện bất thường?</p>
              <p className="text-xs font-medium text-orange-900/50 mt-0.5">Báo cáo sự cố ngay để được xử lý kịp thời</p>
            </div>
            <ChevronRight className="ml-auto size-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  )
}
