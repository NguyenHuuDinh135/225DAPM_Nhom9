import { cookies } from "next/headers"
import { WorksClient } from "./components/works-client"

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
  const res = await fetch(`${BASE_URL}/api/work-items`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: { revalidate: 0 },
  })
  if (!res.ok) return []
  const json = await res.json() as { workItems: WorkItem[] }
  return json.workItems ?? []
}

export default async function WorksPage() {
  const works = await fetchWorks()
  return <WorksClient initialWorks={works} />
}
