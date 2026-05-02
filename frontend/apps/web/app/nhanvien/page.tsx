"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { WorkerDashboard } from "@/app/(dashboard)/components/worker-dashboard"

export default function WorkerHub() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login")
      } else if (user.role !== ROLES.NhanVien) {
        const target = user.role === ROLES.GiamDoc ? "/giamdoc" : "/doitruong";
        router.replace(target);
      }
    }
  }, [user, isLoading, router])

  if (isLoading || (user && user.role !== ROLES.NhanVien)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    )
  }

  return <WorkerDashboard />
}
