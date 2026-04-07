export type WorkStatus = "New" | "InProgress" | "Completed" | "Cancelled"

export interface WorkUser {
  id: number
  userId: string
  userName: string
  role: string
  status: string
}

export interface WorkProgress {
  id: number
  updaterId: string
  updaterName: string
  percentage: number
  note: string
  updatedDate: string
}

export interface Work {
  id: number
  workTypeId: number
  workTypeName: string
  planId: number
  planName: string
  creatorId: string
  creatorName: string
  startDate: string
  endDate: string
  status: WorkStatus
  workUsers: WorkUser[]
  workProgresses: WorkProgress[]
}

export const mockWorks: Work[] = [
  {
    id: 1,
    workTypeId: 1,
    workTypeName: "Cắt tỉa",
    planId: 1,
    planName: "Kế hoạch Q1 2025",
    creatorId: "user-1",
    creatorName: "Nguyễn Văn A",
    startDate: "2025-01-10",
    endDate: "2025-01-20",
    status: "InProgress",
    workUsers: [
      { id: 1, userId: "user-2", userName: "Trần Văn B", role: "Thực hiện", status: "Active" },
      { id: 2, userId: "user-3", userName: "Lê Thị C", role: "Giám sát", status: "Active" },
    ],
    workProgresses: [
      { id: 1, updaterId: "user-2", updaterName: "Trần Văn B", percentage: 30, note: "Đã hoàn thành khu vực A", updatedDate: "2025-01-12" },
      { id: 2, updaterId: "user-2", updaterName: "Trần Văn B", percentage: 60, note: "Đang xử lý khu vực B", updatedDate: "2025-01-15" },
    ],
  },
  {
    id: 2,
    workTypeId: 2,
    workTypeName: "Bón phân",
    planId: 1,
    planName: "Kế hoạch Q1 2025",
    creatorId: "user-1",
    creatorName: "Nguyễn Văn A",
    startDate: "2025-01-15",
    endDate: "2025-01-25",
    status: "New",
    workUsers: [],
    workProgresses: [],
  },
  {
    id: 3,
    workTypeId: 3,
    workTypeName: "Thay thế cây",
    planId: 2,
    planName: "Kế hoạch Q2 2025",
    creatorId: "user-1",
    creatorName: "Nguyễn Văn A",
    startDate: "2025-04-01",
    endDate: "2025-04-15",
    status: "Completed",
    workUsers: [
      { id: 3, userId: "user-4", userName: "Phạm Văn D", role: "Thực hiện", status: "Active" },
    ],
    workProgresses: [
      { id: 3, updaterId: "user-4", updaterName: "Phạm Văn D", percentage: 100, note: "Hoàn thành toàn bộ", updatedDate: "2025-04-14" },
    ],
  },
]

export const mockUsers = [
  { id: "user-2", name: "Trần Văn B" },
  { id: "user-3", name: "Lê Thị C" },
  { id: "user-4", name: "Phạm Văn D" },
  { id: "user-5", name: "Hoàng Thị E" },
  { id: "user-6", name: "Vũ Văn F" },
]

export const statusConfig: Record<WorkStatus, { label: string; className: string }> = {
  New: { label: "Mới", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  InProgress: { label: "Đang thực hiện", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  Completed: { label: "Hoàn thành", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  Cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
}
