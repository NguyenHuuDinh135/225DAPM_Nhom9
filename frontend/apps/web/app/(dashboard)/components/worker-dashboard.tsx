"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { 
  CheckCircle2, Clock, MapPin, Camera, ClipboardCheck, 
  AlertTriangle, TreePine, Navigation, ChevronRight, Loader2,
  CalendarDays, User, Activity
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@workspace/ui/components/skeleton"

interface Task {
  id: number;
  workTypeName: string;
  treeName: string;
  location: string;
  status: string;
  endDate?: string;
}

export function WorkerDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const loadTasks = async () => {
    // Guard: không load nếu chưa có user id
    if (!user?.id) return

    setLoading(true)
    try {
      const res = await apiClient.get<any>("/api/work-items")
      const allWorks = res?.workItems || []

      // Lọc công việc được gán cho nhân viên hiện tại
      const myTasks = allWorks
        .filter((w: any) =>
          Array.isArray(w.assignedUsers) &&
          w.assignedUsers.some((au: any) => au.userId === user.id)
        )
        .map((w: any) => ({
          id: w.id,
          workTypeName: w.workTypeName,
          treeName: w.treeLocations?.[0]?.treeName || `Cây #${w.treeLocations?.[0]?.treeId || "?"}`,
          location: w.treeLocations?.[0]?.latitude != null
            ? `Lat: ${w.treeLocations[0].latitude.toFixed(4)}, Lng: ${w.treeLocations[0].longitude.toFixed(4)}`
            : "Chưa có vị trí",
          status: w.statusName,
          endDate: w.endDate
        }))

      setTasks(myTasks)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) loadTasks()
  }, [user?.id])

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-5xl mx-auto w-full min-h-screen bg-background">
      {/* Header Section */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <CalendarDays className="size-4" />
            <span className="text-xs uppercase tracking-[0.2em]">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Chào buổi sáng, <span className="text-primary">{user?.name?.split(' ').pop()}</span></h1>
          <p className="text-muted-foreground font-medium">Bạn có {tasks.length} nhiệm vụ cần hoàn thành hôm nay.</p>
        </div>
        <div className="hidden sm:flex size-16 rounded-3xl bg-primary/10 border border-primary/20 items-center justify-center relative shadow-inner">
            <Activity className="size-8 text-primary animate-pulse" />
            <div className="absolute -top-2 -right-2 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-black shadow-lg ring-4 ring-background">
                {tasks.length}
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">Danh sách nhiệm vụ</h2>
            {tasks.length > 0 && <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 uppercase tracking-tighter">Ưu tiên cao</span>}
        </div>

        {loading ? (
            <div className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />)}
            </div>
        ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-[3rem] border border-dashed border-muted-foreground/20">
                <div className="size-20 rounded-full bg-background flex items-center justify-center mb-4 shadow-xl">
                    <CheckCircle2 className="size-10 text-green-500" />
                </div>
                <h3 className="text-xl font-black">Tuyệt vời!</h3>
                <p className="text-muted-foreground font-medium mt-1 text-center max-w-xs">Bạn đã hoàn thành mọi nhiệm vụ được giao. Hãy nghỉ ngơi hoặc báo cáo sự cố nếu thấy bất thường.</p>
            </div>
        ) : (
            <div className="grid gap-5">
                {tasks.map((task) => (
                <Card key={task.id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-xl hover:bg-card transition-all duration-500 hover:-translate-y-1">
                    <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                        {/* Status Accent */}
                        <div className="w-full md:w-2 bg-blue-600 group-hover:bg-primary transition-colors h-2 md:h-auto" />
                        
                        <div className="flex-1 p-6 md:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="space-y-3 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-4 py-1 font-bold text-[10px] uppercase tracking-wider">
                                            {task.workTypeName}
                                        </Badge>
                                        {task.status === 'New' && (
                                            <Badge className="rounded-full bg-orange-500 text-white border-none px-4 py-1 font-black text-[10px] uppercase tracking-wider animate-pulse">
                                                Mới
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="rounded-full border-muted-foreground/20 text-muted-foreground px-4 py-1 font-bold text-[10px] uppercase tracking-wider">
                                            Hạn: {task.endDate ? new Date(task.endDate).toLocaleDateString('vi-VN') : 'Trong ngày'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{task.treeName}</h3>
                                        <div className="flex items-center text-sm font-bold text-muted-foreground/80">
                                            <MapPin className="mr-2 size-4 text-primary" /> {task.location}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex w-full md:w-auto gap-3">
                                    <Button asChild className="flex-1 md:w-48 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-xl shadow-primary/20 transition-all active:scale-95">
                                        <Link href={task.id ? `/works/${task.id}/progress` : "#"}>
                                            Tiếp nhận <ChevronRight className="ml-2 size-5" />
                                        </Link>
                                    </Button>
                                    <Button variant="secondary" size="icon" className="size-14 rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground shrink-0 transition-all">
                                        <Navigation className="size-6" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
        )}
      </div>

      {/* Quick Tools Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">Công cụ hỗ trợ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/report-incident" className="block group">
                <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-orange-500/5 hover:bg-orange-500/10 transition-all cursor-pointer group-hover:scale-[1.02] active:scale-95 duration-300">
                    <div className="flex items-center gap-5">
                        <div className="size-16 rounded-[1.5rem] bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 group-hover:rotate-6 transition-transform">
                            <AlertTriangle className="size-8" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-lg font-black text-orange-950/80">Báo sự cố</span>
                            <p className="text-xs font-medium text-orange-900/40 uppercase tracking-widest">Phát hiện bất thường</p>
                        </div>
                    </div>
                </Card>
            </Link>

            <Link href="/replacements" className="block group">
                <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-green-500/5 hover:bg-green-500/10 transition-all cursor-pointer group-hover:scale-[1.02] active:scale-95 duration-300">
                    <div className="flex items-center gap-5">
                        <div className="size-16 rounded-[1.5rem] bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/40 group-hover:-rotate-6 transition-transform">
                            <TreePine className="size-8" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-lg font-black text-green-950/80">Trồng cây mới</span>
                            <p className="text-xs font-medium text-green-900/40 uppercase tracking-widest">Mở rộng diện tích</p>
                        </div>
                    </div>
                </Card>
            </Link>
        </div>
      </div>
    </div>
  )
}
