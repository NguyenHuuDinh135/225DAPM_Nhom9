"use client"

import { useEffect } from "react"
import { HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr"
import { toast } from "@workspace/ui/components/sonner"

const BASE_URL = "http://localhost:5000"

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
<<<<<<< HEAD
        accessTokenFactory: () => {
          // Check local storage for token (standard key in this project is auth-storage or similar, 
          // but based on previous code it uses access_token)
          const token = localStorage.getItem("access_token") || localStorage.getItem("auth_token");
          return token || "";
        }
=======
        accessTokenFactory: () => token,
>>>>>>> main
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Error)
      .build()

    connection.on("ReceiveIncidentNotification", (message: string, incidentId: number) => {
      toast.warning(message, { description: `Sự cố #${incidentId}` })
    })

<<<<<<< HEAD
    connection.on("ReceiveNotification", (title: string, message: string, type: string) => {
      if (type === "success") toast.success(title, { description: message })
      else if (type === "warning") toast.warning(title, { description: message })
      else toast.info(title, { description: message })
    })

    let isMounted = true
    let startPromise: Promise<void> | null = null

    const startConnection = async () => {
      if (connection.state !== "Disconnected") return;

      try {
        startPromise = connection.start()
        await startPromise
        console.log("SignalR Connected.")
      } catch (err) {
        if (isMounted) {
          console.warn("SignalR connection error, retrying in 5s...", err)
          setTimeout(startConnection, 5000)
        }
      }
    }

    startConnection()

    return () => {
      isMounted = false
      
      const stopConnection = async () => {
        if (startPromise) {
            try { await startPromise; } catch (e) { /* ignore start errors during stop */ }
        }
        if (connection.state !== "Disconnected" && connection.state !== "Disconnecting") {
            try {
                await connection.stop()
                console.log("SignalR Disconnected.")
            } catch (err) {
                console.error("SignalR Stop Error:", err)
            }
        }
      }
      
      stopConnection()
    }

=======
    connection.start().catch((err) => {
      console.warn("SignalR connection failed:", err)
    })

    return () => { 
      connection.stop().catch(() => {/* ignore */})
    }
>>>>>>> main
  }, [])
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
