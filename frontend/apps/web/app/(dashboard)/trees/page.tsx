import { type Metadata } from "next"
import { cookies } from "next/headers"
import { z } from "zod"
import { DataTable } from "./components/data-table"
import { treeSchema } from "./data/schema"

export const metadata: Metadata = { title: "Quản lý Cây xanh" }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

async function getTrees() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const res = await fetch(`${BASE_URL}/api/trees`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  })
  if (!res.ok) return []
  return z.array(treeSchema).parse(await res.json())
}

export default async function TreesPage() {
  const trees = await getTrees()
  return (
    <div className="flex h-full flex-1 flex-col gap-8 p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Quản lý Cây xanh</h2>
        <p className="text-muted-foreground">Danh sách cây xanh đô thị.</p>
      </div>
      <DataTable data={trees} />
    </div>
  )
}
