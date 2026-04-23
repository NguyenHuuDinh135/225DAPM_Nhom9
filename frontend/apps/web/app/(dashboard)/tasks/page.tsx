import { type Metadata } from "next"
import { cookies } from "next/headers"
import { z } from "zod"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { workItemSchema, type WorkItem } from "./data/schema"

export const metadata: Metadata = { title: "Danh sách công việc" }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

async function getWorkItems(): Promise<WorkItem[]> {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const res = await fetch(`${BASE_URL}/api/work-items`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: { revalidate: 30 },
  })
  if (!res.ok) return []
  const json = await res.json() as { workItems: unknown[] }
  return z.array(workItemSchema).parse(json.workItems)
}

export default async function TaskPage() {
  const tasks = await getWorkItems()
  return (
    <div className="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Danh sách công việc</h2>
        <p className="text-muted-foreground">Quản lý và theo dõi tiến độ công việc.</p>
      </div>
      <DataTable data={tasks} columns={columns} />
    </div>
  )
}
