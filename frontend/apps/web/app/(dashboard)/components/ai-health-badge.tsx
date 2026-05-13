"use client"

import { useState, useEffect, useCallback } from "react"
import { Circle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export function AiHealthBadge() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null)

  const checkHealth = useCallback(async () => {
    try {
      const result = await apiClient.get<boolean>("/api/ai/health")
      setIsOnline(result === true)
    } catch {
      setIsOnline(false)
    }
  }, [])

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [checkHealth])

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border text-xs font-medium">
      <Circle
        className={`size-2.5 fill-current ${
          isOnline === true
            ? "text-green-500"
            : isOnline === false
              ? "text-red-500"
              : "text-yellow-500 animate-pulse"
        }`}
      />
      <span className="text-muted-foreground">
        {isOnline === true
          ? "AI Online"
          : isOnline === false
            ? "AI Offline"
            : "Kiểm tra..."}
      </span>
    </div>
  )
}
