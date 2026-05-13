"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, InformationCircleIcon, Alert02Icon, MultiplicationSignCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
        ),
        info: (
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4" />
        ),
        warning: (
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />
        ),
        error: (
          <HugeiconsIcon icon={MultiplicationSignCircleIcon} strokeWidth={2} className="size-4" />
        ),
        loading: (
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "0.75rem",
          "--width": "380px",
        } as React.CSSProperties
      }
      toastOptions={{
        duration: 5000,
        classNames: {
          toast: "cn-toast group shadow-xl border-2 !bg-white dark:!bg-zinc-900",
          title: "font-bold text-sm leading-snug",
          description: "text-xs text-muted-foreground mt-0.5",
          actionButton: "bg-primary text-primary-foreground font-bold rounded-xl",
          cancelButton: "bg-muted text-muted-foreground font-bold rounded-xl",
          success: "!border-green-400 !bg-green-50 dark:!bg-green-950",
          error: "!border-red-400 !bg-red-50 dark:!bg-red-950",
          warning: "!border-orange-400 !bg-orange-50 dark:!bg-orange-950",
          info: "!border-blue-400 !bg-blue-50 dark:!bg-blue-950",
          closeButton: "!bg-white dark:!bg-zinc-800 !border-border",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
export { toast } from "sonner"
