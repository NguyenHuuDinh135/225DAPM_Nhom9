"use client"

import { Button } from "@workspace/ui/components/button"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-5xl">⚠️</p>
      <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
      <p className="text-sm text-muted-foreground max-w-sm">{error.message || "Lỗi không xác định. Vui lòng thử lại."}</p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  )
}
