"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatResponse {
  response: string
}

interface UseAiChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
}

export function useAiChat(): UseAiChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = { role: "user", content: content.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const history = updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const data = await apiClient.post<ChatResponse>("/api/ai/chat", {
        message: content.trim(),
        history,
      })

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Xin lỗi, tôi không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, isLoading, sendMessage, clearMessages }
}
