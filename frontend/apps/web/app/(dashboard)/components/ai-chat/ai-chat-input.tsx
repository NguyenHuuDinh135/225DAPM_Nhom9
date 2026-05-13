"use client"

import { useState, useCallback } from "react"
import { Send } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

interface AiChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
}

export function AiChatInput({ onSend, isLoading }: AiChatInputProps) {
  const [value, setValue] = useState("")

  const handleSubmit = useCallback(() => {
    if (!value.trim() || isLoading) return
    onSend(value.trim())
    setValue("")
  }, [value, isLoading, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  return (
    <div className="flex items-center gap-2 p-3 border-t bg-background/95 backdrop-blur-sm">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập câu hỏi..."
        disabled={isLoading}
        className="flex-1 h-10 rounded-xl border-border/50 focus-visible:ring-blue-500/30 text-sm"
      />
      <Button
        size="icon"
        onClick={handleSubmit}
        disabled={!value.trim() || isLoading}
        className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 shrink-0"
      >
        <Send className="size-4" />
      </Button>
    </div>
  )
}
