"use client"

import * as React from "react"
import { TreePineIcon, PlusIcon, SearchIcon, FilterIcon, ChevronRightIcon, Trash2, Edit2, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@workspace/ui/components/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Label } from "@workspace/ui/components/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@workspace/ui/components/select"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { apiClient } from "@/lib/api-client"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"
import { LocationPicker } from "./components/location-picker"

interface TreeDto {
  id: number;
  name: string | null;
  treeTypeId: number;
  treeTypeName: string | null;
  condition: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export default function TreesPage() {
  const { user } = useAuth()
  const isAdmin = user && (user.role === ROLES.DoiTruong || user.role === ROLES.GiamDoc);
  
  const [trees, setTrees] = React.useState<TreeDto[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [pagination, setPagination] = React.useState({
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  
  // State for Add/Edit Dialog
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingTree, setEditingTree] = React.useState<TreeDto | null>(null)
  const [formData, setFormData] = React.useState({
    name: "",
    treeTypeId: 1,
    condition: "Bình thường",
    latitude: 16.047,
    longitude: 108.206
  })

  const loadTrees = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: pageSize.toString(),
        searchTerm: search
      })
      const data = await apiClient.get<any>(`/api/trees?${queryParams.toString()}`)
      
      console.log("Trees API Response:", data)

      // Linh hoạt xử lý cả PaginatedList và mảng thường
      const items = data?.items || (Array.isArray(data) ? data : [])
      const totalCount = data?.totalCount || items.length
      const totalPages = data?.totalPages || Math.ceil(totalCount / pageSize)

      setTrees(items)
      setPagination({
        totalPages: totalPages,
        totalCount: totalCount,
        hasNextPage: data?.hasNextPage ?? (page < totalPages),
        hasPreviousPage: data?.hasPreviousPage ?? (page > 1)
      })
    } catch (err) {
      console.error("Load trees error:", err)
      setTrees([])
      toast.error("Lỗi kết nối", { 
        description: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra Backend đang chạy tại cổng 5000." 
      })
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      loadTrees()
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Load when page changes
  React.useEffect(() => {
    loadTrees()
  }, [page])

  const handleOpenAdd = () => {
    setEditingTree(null)
    setFormData({
      name: "",
      treeTypeId: 1,
      condition: "Bình thường",
      latitude: 16.047,
      longitude: 108.206
    })
    setIsDialogOpen(true)
  }

  const [treeToDelete, setTreeToDelete] = React.useState<number | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleOpenEdit = (tree: TreeDto) => {
    setEditingTree(tree)
    setFormData({
      name: tree.name ?? "",
      treeTypeId: tree.treeTypeId,
      condition: tree.condition ?? "Bình thường",
      latitude: tree.latitude ?? 16.047,
      longitude: tree.longitude ?? 108.206
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setTreeToDelete(id)
  }

  const confirmDelete = async () => {
    if (treeToDelete === null) return
    setIsDeleting(true)
    try {
      await apiClient.delete(`/api/trees/${treeToDelete}`)
      toast.success("Đã xóa", { description: "Cây xanh đã được loại bỏ khỏi hệ thống." })
      loadTrees()
      setTreeToDelete(null)
    } catch (err: any) {
      toast.error("Lỗi xóa", { 
        description: err.message || "Không thể xóa cây xanh này. Có thể cây đang có dữ liệu liên quan." 
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingTree) {
        await apiClient.put(`/api/trees/${editingTree.id}`, {
          ...formData,
          id: editingTree.id
        })
        toast.success("Thành công", { description: "Đã cập nhật thông tin cây xanh." })
      } else {
        await apiClient.post("/api/trees", formData)
        toast.success("Thành công", { description: "Đã thêm cây xanh mới vào hệ thống." })
      }
      setIsDialogOpen(false)
      loadTrees()
    } catch (err: any) {
      toast.error("Lỗi", { description: err.message || "Không thể lưu thông tin cây xanh." })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Hệ thống Cây xanh</h1>
          <p className="text-sm text-slate-500 font-medium italic">Quản lý tài sản xanh và theo dõi hiện trạng sinh trưởng.</p>
        </div>
        
        {isAdmin && (
          <Button 
            onClick={handleOpenAdd}
            className="bg-green-600 hover:bg-green-700 h-11 px-6 rounded-2xl shadow-lg shadow-green-600/20 font-bold gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <PlusIcon className="size-5" /> THÊM CÂY MỚI
          </Button>
        )}
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-600/30">
                <TreePineIcon className="size-4" />
            </div>
            <h3 className="text-sm font-black uppercase text-slate-600 tracking-widest">Danh mục ({pagination.totalCount})</h3>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <Input 
                className="pl-9 bg-slate-100/50 border-none h-10 rounded-xl focus-visible:ring-green-500" 
                placeholder="Tìm mã số, tên hoặc loài cây..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 rounded-xl hover:bg-slate-50">
              <FilterIcon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Cây xanh</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Thông tin loại</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Vị trí</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Tình trạng</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="size-10 animate-spin text-green-600" />
                        <p className="text-xs font-bold text-slate-400 animate-pulse">ĐANG TẢI DỮ LIỆU...</p>
                    </div>
                  </td>
                </tr>
              ) : (trees && trees.length > 0) ? (
                trees.map(tree => (
                  <tr key={tree.id} className="hover:bg-green-50/30 transition-all cursor-pointer group">
                    <td className="px-6 py-5" onClick={() => window.location.href = `/trees/${tree.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-white shadow-sm border border-slate-100 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                          <TreePineIcon className="size-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 tracking-tight group-hover:text-green-700">#{tree.id} • {tree.name || "Cây chưa đặt tên"}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mã tài sản: TREE-{tree.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700">{tree.treeTypeName || "Chưa phân loại"}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Loài bản địa</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="text-[11px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {tree.latitude?.toFixed(4)}, {tree.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-black px-2.5 py-1 rounded-full border-none shadow-sm",
                        tree.condition === "Tốt" || tree.condition === "Bình thường" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-amber-100 text-amber-700 animate-pulse"
                      )}>
                        {tree.condition?.toUpperCase() || "KHÔNG RÕ"}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isAdmin && (
                          <>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="size-9 rounded-xl text-blue-600 hover:bg-blue-50"
                                onClick={(e) => { e.stopPropagation(); handleOpenEdit(tree); }}
                            >
                              <Edit2 className="size-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="size-9 rounded-xl text-red-600 hover:bg-red-50"
                                onClick={(e) => { e.stopPropagation(); handleDelete(tree.id); }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="size-9 rounded-xl text-slate-400" asChild>
                          <Link href={`/trees/${tree.id}`}>
                            <ChevronRightIcon className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                        <TreePineIcon className="size-16" />
                        <p className="font-black text-xl italic uppercase tracking-tighter">Không có dữ liệu</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400">
              Hiển thị <span className="text-slate-700">{trees.length}</span> trên <span className="text-slate-700">{pagination.totalCount}</span> cây xanh
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-xl"
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "ghost"}
                    className={cn(
                        "size-9 rounded-xl font-bold text-xs",
                        page === p ? "bg-green-600 shadow-lg shadow-green-600/20" : "text-slate-400"
                    )}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-xl"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-green-600 p-8 text-white relative">
            <TreePineIcon className="absolute top-6 right-8 size-16 opacity-10 rotate-12" />
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                {editingTree ? "Cập nhật thông tin" : "Thêm cây xanh mới"}
              </DialogTitle>
              <DialogDescription className="text-green-100 font-medium">
                Cung cấp dữ liệu chính xác để hệ thống quản lý và dự báo sinh trưởng tốt hơn.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[80vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-xs font-black uppercase text-slate-400 px-1">Tên cây (Tùy chọn)</Label>
                  <Input 
                    id="name" 
                    placeholder="Ví dụ: Cây Sưa 01" 
                    className="rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-green-500 h-12"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs font-black uppercase text-slate-400 px-1">Loại cây</Label>
                  <Select 
                    value={formData.treeTypeId.toString()} 
                    onValueChange={(val) => setFormData({...formData, treeTypeId: parseInt(val)})}
                  >
                    <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-12">
                      <SelectValue placeholder="Chọn loại cây" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      <SelectItem value="1">Cây bóng mát</SelectItem>
                      <SelectItem value="2">Cây cảnh/Hoa</SelectItem>
                      <SelectItem value="3">Cây cổ thụ</SelectItem>
                      <SelectItem value="4">Cây ăn quả</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs font-black uppercase text-slate-400 px-1">Tình trạng</Label>
                  <Select 
                    value={formData.condition} 
                    onValueChange={(val) => setFormData({...formData, condition: val})}
                  >
                    <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-12">
                      <SelectValue placeholder="Tình trạng" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      <SelectItem value="Bình thường">Bình thường</SelectItem>
                      <SelectItem value="Tốt">Phát triển tốt</SelectItem>
                      <SelectItem value="Yếu">Yếu/Sâu bệnh</SelectItem>
                      <SelectItem value="Cần thay thế">Cần thay thế</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-black uppercase text-slate-400 px-1">Vĩ độ</Label>
                    <Input 
                      type="number" 
                      className="rounded-2xl border-slate-100 bg-slate-50 h-10 font-mono text-[11px]"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-black uppercase text-slate-400 px-1">Kinh độ</Label>
                    <Input 
                      type="number" 
                      className="rounded-2xl border-slate-100 bg-slate-50 h-10 font-mono text-[11px]"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-slate-400 px-1">Chọn vị trí trên bản đồ</Label>
                <LocationPicker 
                  latitude={formData.latitude} 
                  longitude={formData.longitude} 
                  onChange={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})}
                />
              </div>
            </div>

            <DialogFooter className="gap-3 sm:justify-between pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setIsDialogOpen(false)}
                className="rounded-2xl h-12 px-6 font-bold text-slate-400"
              >
                HỦY BỎ
              </Button>
              <Button 
                onClick={handleSubmit}
                className="rounded-2xl h-12 px-8 bg-green-600 hover:bg-green-700 font-bold shadow-lg shadow-green-600/30 min-w-[140px]"
              >
                {editingTree ? "CẬP NHẬT" : "LƯU DỮ LIỆU"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={treeToDelete !== null} onOpenChange={(open) => !open && setTreeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa cây xanh</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cây xanh này không? (Lưu ý: Không thể xóa nếu cây có lịch sử bảo trì hoặc sự cố liên quan). Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
