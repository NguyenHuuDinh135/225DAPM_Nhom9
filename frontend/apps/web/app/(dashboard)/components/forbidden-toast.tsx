"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "@workspace/ui/components/sonner"

export function ForbiddenToast() {
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (params.get("forbidden") === "1") {
      toast.error("Bạn không có quyền truy cập trang này")
      // Remove the query param without re-render
      router.replace("/dashboard")
    }
  }, [params, router])

  return null
}
