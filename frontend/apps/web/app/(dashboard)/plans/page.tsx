"use client"

import * as React from "react"
import { Plus, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { toast } from "@workspace/ui/components/sonner"
import { AutoPlanDialog } from "./components/auto-plan-dialog"
import { PlanStats } from "./components/plan-stats"
import { PlanCardGrid } from "./components/plan-card-grid"
import { CreatePlanDialog } from "./components/create-plan-dialog"
import { PlanWorkSheet } from "./components/plan-work-dialogs"

interface PlanDto {
  id: number;
  name: string;
  creatorId: string;
  creatorName: string;
  startDate: string;
  endDate: string;
  status: string;
  workCount?: number;
}

export default function PlansPage() {
  const { user } = useAuth()
  const isAdmin = user && (user.role === ROLES.DoiTruong || user.role === ROLES.GiamDoc);

  const [plans, setPlans] = React.useState<PlanDto[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(8)

  // Dialog states
  const [isAutoDialogOpen, setIsAutoDialogOpen] = React.useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)

  // Detail sheet state
  const [selectedPlan, setSelectedPlan] = React.useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  const loadPlans = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<PlanDto[]>("/api/planning")
      setPlans(data || [])
    } catch {
      toast.error("Lỗi", { description: "Không thể tải danh sách kế hoạch." })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadPlans()
  }, [])

  const handleRowClick = async (plan: PlanDto) => {
    setIsSheetOpen(true)
    setSelectedPlan({ ...plan, loading: true })
    try {
      const detail = await apiClient.get<any>(`/api/planning/${plan.id}`)
      setSelectedPlan(detail)
    } catch {
      toast.error("Lỗi", { description: "Không thể tải chi tiết kế hoạch." })
      setSelectedPlan(plan)
    }
  }

  const handleRefreshPlanDetail = async (plan: PlanDto) => {
    try {
      const detail = await apiClient.get<any>(`/api/planning/${plan.id}`)
      setSelectedPlan(detail)
    } catch {
      // Keep current state
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kế hoạch Chiến lược</h1>
          <p className="text-sm text-slate-500 font-medium italic">Xây dựng lộ trình bảo trì và chăm sóc cây xanh toàn thành phố.</p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAutoDialogOpen(true)}
              className="h-11 px-6 rounded-2xl border-primary/20 text-primary font-bold gap-2 hover:bg-primary/5 transition-all"
            >
              <Sparkles className="size-4" /> AI GỢI Ý
            </Button>
            <Button
              className="h-11 px-6 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold gap-2 transition-all hover:scale-105"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="size-4" /> TẠO MỚI
            </Button>
          </div>
        )}
      </div>

      <PlanStats plans={plans} />

      <PlanCardGrid
        plans={plans}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPlanClick={handleRowClick}
      />

      {/* Detail Sheet with work management */}
      <PlanWorkSheet
        plan={selectedPlan}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onRefresh={handleRefreshPlanDetail}
        onPlansRefresh={loadPlans}
      />

      <AutoPlanDialog
        open={isAutoDialogOpen}
        onOpenChange={setIsAutoDialogOpen}
        onSuccess={loadPlans}
      />

      <CreatePlanDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadPlans}
      />
    </div>
  )
}
