import { type Metadata } from "next"
import { cookies } from "next/headers"
import { z } from "zod"
import { DataTable } from "./components/data-table"
import { planSchema } from "./data/schema"

export const metadata: Metadata = { title: "Quản lý Kế hoạch" }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

async function getPlans() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const res = await fetch(`${BASE_URL}/api/planning`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: { revalidate: 30 },
  })
  if (!res.ok) return []
  return z.array(planSchema).parse(await res.json())
}

export default async function PlansPage() {
  const plans = await getPlans()
  return (
    <div className="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Quản lý Kế hoạch</h2>
        <p className="text-muted-foreground">Tạo và theo dõi kế hoạch công việc.</p>
      </div>
      <DataTable data={plans} />
    </div>
  )
}
