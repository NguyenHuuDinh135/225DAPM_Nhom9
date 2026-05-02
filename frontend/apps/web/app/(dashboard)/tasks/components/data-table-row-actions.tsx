"use client"

import { type Row } from "@tanstack/react-table"
import { MoreHorizontal, EyeIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { type WorkItem } from "../data/schema"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

interface DataTableRowActionsProps {
  row: Row<WorkItem>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const router = useRouter()
  const workItem = row.original

  async function handleDelete() {
    if (!confirm(`Xác nhận xóa công việc #${workItem.id}?`)) return
    try {
      await apiClient.delete(`/api/work-items/${workItem.id}`)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete work item:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 data-[state=open]:bg-muted">
          <MoreHorizontal />
          <span className="sr-only">Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem asChild>
          <Link href={`/works/${workItem.id}`} className="flex items-center gap-2">
            <EyeIcon className="size-4" />
            Xem chi tiết
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
          <Trash2Icon className="size-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
