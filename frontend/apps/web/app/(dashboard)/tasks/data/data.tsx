import { CheckCircle, Circle, Clock, Timer, XCircle } from "lucide-react"

export const statuses = [
  { value: "New", label: "Mới", icon: Circle },
  { value: "InProgress", label: "Đang thực hiện", icon: Timer },
  { value: "WaitingForApproval", label: "Chờ duyệt", icon: Clock },
  { value: "Completed", label: "Hoàn thành", icon: CheckCircle },
  { value: "Cancelled", label: "Đã hủy", icon: XCircle },
]
