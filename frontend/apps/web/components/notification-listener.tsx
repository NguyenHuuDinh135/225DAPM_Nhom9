"use client"

import { useEffect } from "react"
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr"
import { toast } from "@workspace/ui/components/sonner"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export function NotificationListener() {
  // Temporarily disabled - SignalR connection issues
  // TODO: Fix SignalR authentication
  return null
  
  /* eslint-disable @typescript-eslint/no-unused-vars */
  useEffect(() => {
    // Only connect if we have a token (user is logged in)
    const token = localStorage.getItem("access_token")
    if (!token) {
      return
    }

    const connection = new HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/incidents`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on("ReceiveIncidentNotification", (message: string, incidentId: number) => {
      toast.warning(message, { description: `Sự cố #${incidentId}` })
    })

    connection.start().catch((err) => {
      console.warn("SignalR connection failed:", err)
    })

    return () => { 
      connection.stop().catch(() => {/* ignore */})
    }
  }, [])
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
