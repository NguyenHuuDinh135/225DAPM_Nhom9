"use client"

import * as React from "react"
import { FileText, Plus, Sparkles } from "lucide-react"
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
  id: number
  name: string
  creatorId: string
  creatorName: string
  startDate: string
  endDate: string
  status: string
  workCount?: number
}

export default function PlansPage() {
  const { user } = useAuth()
  const isCaptain = user?.role === ROLES.DoiTruong
  const isDirector = user?.role === ROLES.GiamDoc

  const [plans, setPlans] = React.useState<PlanDto[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(8)
  const [isExportingPdf, setIsExportingPdf] = React.useState(false)

  // Dialog states
  const [isAutoDialogOpen, setIsAutoDialogOpen] = React.useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)

  // Detail sheet state
  const [selectedPlan, setSelectedPlan] = React.useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  const loadPlans = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<PlanDto[]>("/api/Planning")
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
      const detail = await apiClient.get<any>(`/api/Planning/${plan.id}`)
      setSelectedPlan(detail)
    } catch {
      toast.error("Lỗi", { description: "Không thể tải chi tiết kế hoạch." })
      setSelectedPlan(plan)
    }
  }

  const handleRefreshPlanDetail = async (plan: PlanDto) => {
    try {
      const detail = await apiClient.get<any>(`/api/Planning/${plan.id}`)
      setSelectedPlan(detail)
    } catch {
      // Keep current state
    }
  }

  const handleExportPdf = () => {
    setIsExportingPdf(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      params.append("autoPrint", "1")

      const url = `/plans-report?${params.toString()}`
      window.open(url, "_blank", "noopener,noreferrer")
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Kế hoạch Chiến lược
          </h1>
          <p className="text-sm font-medium text-slate-500 italic">
            Xây dựng lộ trình bảo trì và chăm sóc cây xanh toàn thành phố.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDirector && (
            <Button
              variant="outline"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="h-11 gap-2 rounded-2xl border-slate-700 px-6 font-bold text-slate-700 hover:bg-slate-100"
            >
              <FileText className="size-4" />
              {isExportingPdf ? "ĐANG XUẤT..." : "XUẤT PDF"}
            </Button>
          )}

          {isCaptain && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsAutoDialogOpen(true)}
                className="h-11 gap-2 rounded-2xl border-primary/20 px-6 font-bold text-primary transition-all hover:bg-primary/5"
              >
                <Sparkles className="size-4" /> AI GỢI Ý
              </Button>
              <Button
                className="h-11 gap-2 rounded-2xl bg-primary px-6 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="size-4" /> TẠO MỚI
              </Button>
            </>
          )}
        </div>
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
