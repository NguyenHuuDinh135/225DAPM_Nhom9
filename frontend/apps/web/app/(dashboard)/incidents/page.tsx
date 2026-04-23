import { type Metadata } from "next"
import { cookies } from "next/headers"
import { z } from "zod"
import { DataTable } from "./components/data-table"
import { incidentSchema } from "./data/schema"

export const metadata: Metadata = { title: "Quản lý Sự cố" }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

async function getIncidents() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const res = await fetch(`${BASE_URL}/api/tree-incidents`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: { revalidate: 30 },
  })
  if (!res.ok) return []
  const json = await res.json() as { treeIncidents: unknown[] }
  return z.array(incidentSchema).parse(json.treeIncidents)
}

export default async function IncidentsPage() {
  const incidents = await getIncidents()
  return (
    <div className="flex h-full flex-1 flex-col gap-8 p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Quản lý Sự cố</h2>
        <p className="text-muted-foreground">Theo dõi và xử lý sự cố cây xanh.</p>
      </div>
      <DataTable data={incidents} />
    </div>
  )
}
