"use client"

import { useEffect, useRef } from "react"
import { Bot, User } from "lucide-react"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import type { ChatMessage } from "./use-ai-chat"

interface AiChatMessagesProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export function AiChatMessages({ messages, isLoading }: AiChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Bot className="size-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Xin chào! Tôi là trợ lý AI quản lý cây xanh.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Hãy hỏi tôi về tình trạng cây, kế hoạch bảo trì, hoặc sự cố.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 px-4 py-3">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {isLoading && <LoadingBubble />}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <Bot className="size-4 text-slate-600 dark:text-slate-300" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-slate-100 dark:bg-slate-800 text-foreground rounded-bl-md"
        }`}
      >
        {message.content}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
          <User className="size-4 text-white" />
        </div>
      )}
    </div>
  )
}

function LoadingBubble() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
        <Bot className="size-4 text-slate-600 dark:text-slate-300" />
      </div>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}
