"use client"

import { useState, useEffect, useCallback } from "react"
import { Sparkles, X, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { apiClient } from "@/lib/api-client"
import { useAiChat } from "./use-ai-chat"
import { AiChatMessages } from "./ai-chat-messages"
import { AiChatInput } from "./ai-chat-input"

const QUICK_PROMPTS = [
  "Cây nào cần bảo trì?",
  "Tổng hợp sự cố hôm nay",
  "Đề xuất kế hoạch tuần tới",
] as const

export function AiChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const { messages, isLoading, sendMessage, clearMessages } = useAiChat()

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

  const handleQuickPrompt = useCallback(
    (index: number) => {
      const prompt = QUICK_PROMPTS[index]
      if (prompt) sendMessage(prompt)
    },
    [sendMessage]
  )

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
        aria-label="Mở trợ lý AI"
      >
        {isOpen ? (
          <X className="size-5" />
        ) : (
          <Sparkles className="size-5" />
        )}
      </button>

      {/* Sliding panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-[400px] max-w-[calc(100vw-1rem)] bg-background border-l shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Trợ lý AI Cây Xanh</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline === true
                      ? "bg-green-400"
                      : isOnline === false
                        ? "bg-red-400"
                        : "bg-yellow-400 animate-pulse"
                  }`}
                />
                <span className="text-xs text-white/80">
                  {isOnline === true
                    ? "Online"
                    : isOnline === false
                      ? "Offline"
                      : "Đang kiểm tra..."}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearMessages}
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                title="Xóa lịch sử"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Offline banner */}
        {isOnline === false && (
          <div className="px-4 py-2.5 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800">
            <p className="text-xs font-medium text-red-700 dark:text-red-400">
              AI đang offline. Một số tính năng có thể không khả dụng.
            </p>
          </div>
        )}

        {/* Messages area */}
        <AiChatMessages messages={messages} isLoading={isLoading} />

        {/* Quick prompts */}
        {messages.length === 0 && !isLoading && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-xs py-1.5 px-3"
                onClick={() => handleQuickPrompt(index)}
              >
                {prompt}
              </Badge>
            ))}
          </div>
        )}

        {/* Input */}
        <AiChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
