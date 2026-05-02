import { Suspense } from "react"
import { cookies } from "next/headers"
import { WorksClient } from "./components/works-client"
import { Skeleton } from "@workspace/ui/components/skeleton"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export type WorkStatus = "New" | "InProgress" | "WaitingForApproval" | "Completed" | "Cancelled"

export interface WorkItem {
  id: number
  workTypeId: number
  workTypeName: string | null
  planId: number
  planName: string | null
  creatorId: string
  startDate: string | null
  endDate: string | null
  status: WorkStatus
  statusName: string
}

async function fetchWorks(): Promise<WorkItem[]> {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  
  console.log("🔍 Fetching works from:", `${BASE_URL}/api/work-items`)
  console.log("🔑 Token exists:", !!token)
  
  const res = await fetch(`${BASE_URL}/api/work-items`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: { revalidate: 0 },
  })
  
  console.log("📡 Response status:", res.status)
  
  if (!res.ok) {
    console.error("❌ Failed to fetch works:", res.status, res.statusText)
    return []
  }
  
  const json = await res.json() as { workItems: WorkItem[] }
  console.log("📦 Response data:", json)
  console.log("📊 Works count:", json.workItems?.length ?? 0)
  
  return json.workItems ?? []
}

function WorksTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[280px]" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="rounded-md border p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

async function WorksContent() {
  const works = await fetchWorks()
  return <WorksClient initialWorks={works} />
}

export default function WorksPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 max-w-7xl mx-auto w-full">
      <Suspense fallback={<WorksTableSkeleton />}>
        <WorksContent />
      </Suspense>
    </div>
  )
}
