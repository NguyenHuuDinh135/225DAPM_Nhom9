"use client"

import { useState, useCallback, useRef } from "react"
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

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token") ?? null
}

async function streamChat(
  message: string,
  history: ChatMessage[],
  onChunk: (text: string) => void,
  signal: AbortSignal
): Promise<boolean> {
  const token = getToken()
  const response = await fetch("/api/ai/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history }),
    signal,
  })

  if (!response.ok || !response.body) {
    return false
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith("data: ")) continue

      const data = trimmed.slice(6)
      if (data === "[DONE]") return true
      if (data === "[ERROR]") return false

      onChunk(data)
    }
  }

  return true
}

export function useAiChat(): UseAiChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = { role: "user", content: content.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    const history = updatedMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Add a placeholder assistant message for streaming
    const assistantIndex = updatedMessages.length
    setMessages((prev) => [...prev, { role: "assistant", content: "" }])

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      let accumulated = ""

      const success = await streamChat(
        content.trim(),
        history,
        (chunk) => {
          accumulated += chunk
          setMessages((prev) => {
            const updated = [...prev]
            updated[assistantIndex] = { role: "assistant", content: accumulated }
            return updated
          })
        },
        abortController.signal
      )

      if (!success || !accumulated) {
        // Fall back to non-streaming endpoint
        const data = await apiClient.post<ChatResponse>("/api/ai/chat", {
          message: content.trim(),
          history,
        })
        setMessages((prev) => {
          const updated = [...prev]
          updated[assistantIndex] = { role: "assistant", content: data.response }
          return updated
        })
      }
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return
      }

      // Attempt fallback to non-streaming
      try {
        const data = await apiClient.post<ChatResponse>("/api/ai/chat", {
          message: content.trim(),
          history,
        })
        setMessages((prev) => {
          const updated = [...prev]
          updated[assistantIndex] = { role: "assistant", content: data.response }
          return updated
        })
      } catch {
        setMessages((prev) => {
          const updated = [...prev]
          updated[assistantIndex] = {
            role: "assistant",
            content: "Xin loi, toi khong the xu ly yeu cau luc nay. Vui long thu lai sau.",
          }
          return updated
        })
      }
    } finally {
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const clearMessages = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setMessages([])
  }, [])

  return { messages, isLoading, sendMessage, clearMessages }
}
