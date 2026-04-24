import { cookies } from "next/headers"
import { WorksClient } from "./components/works-client"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

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

export default async function WorksPage() {
  const works = await fetchWorks()
  return <WorksClient initialWorks={works} />
}
