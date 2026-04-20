"use client"

import { useEffect } from "react"
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr"
import { toast } from "@workspace/ui/components/sonner"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export function NotificationListener() {
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/incidents`, {
        accessTokenFactory: () => localStorage.getItem("access_token") ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on("ReceiveIncidentNotification", (message: string, incidentId: number) => {
      toast.warning(message, { description: `Sự cố #${incidentId}` })
    })

    connection.start().catch(() => {/* silent fail if hub unreachable */})

    return () => { connection.stop() }
  }, [])

  return null
}
