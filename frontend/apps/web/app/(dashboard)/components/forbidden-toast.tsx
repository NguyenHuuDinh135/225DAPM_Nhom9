"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "@workspace/ui/components/sonner"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"

export function ForbiddenToast() {
  const params = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (params.get("forbidden") === "1") {
      toast.error("Bạn không có quyền truy cập trang này")

      let target = "/nhanvien"
      if (user?.role === ROLES.GiamDoc) target = "/giamdoc"
      else if (user?.role === ROLES.DoiTruong) target = "/doitruong"

      router.replace(target)
    }
  }, [params, router, user])

  return null
}
