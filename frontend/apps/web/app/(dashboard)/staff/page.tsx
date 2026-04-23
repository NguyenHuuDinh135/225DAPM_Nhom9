import { type Metadata } from "next"
import { cookies } from "next/headers"
import { StaffClient } from "./components/staff-client"

export const metadata: Metadata = { title: "Quản lý Nhân viên" }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export interface EmployeeDto {
  id: string
  userName?: string
  email?: string
  fullName?: string
  status: number
  role?: string
}

async function getEmployees(): Promise<EmployeeDto[]> {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const res = await fetch(`${BASE_URL}/api/employees`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  })
  if (!res.ok) return []
  const data = await res.json() as { employees: EmployeeDto[] }
  return data.employees
}

export default async function StaffPage() {
  const employees = await getEmployees()
  return (
    <div className="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Quản lý Nhân viên</h2>
        <p className="text-muted-foreground">Danh sách nhân viên và phân quyền hệ thống.</p>
      </div>
      <StaffClient employees={employees} />
    </div>
  )
}
