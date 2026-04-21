"use client"

import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { toast } from "@workspace/ui/components/sonner"
import { PlusIcon } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Ward { id: number; name: string }
interface Street { id: number; name: string | null; wardId: number }
interface Location { id: number; streetId: number; houseNumber: number | null; latitude: number | null; longitude: number | null; description: string | null }
interface LocationsVm { locations: Location[] }

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [streets, setStreets] = useState<Street[]>([])
  const [filteredStreets, setFilteredStreets] = useState<Street[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ wardId: "", streetId: "", houseNumber: "", latitude: "", longitude: "", description: "" })
  const [loading, setLoading] = useState(false)

  function loadLocations() {
    apiClient.get<LocationsVm>("/api/locations").then((r) => setLocations(r.locations)).catch(() => {})
  }

  useEffect(() => {
    loadLocations()
    apiClient.get<Ward[]>("/api/lookups/wards").then(setWards).catch(() => {})
    apiClient.get<Street[]>("/api/lookups/streets").then((s) => setStreets(s)).catch(() => {})
  }, [])

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    if (field === "wardId") {
      setFilteredStreets(streets.filter((s) => s.wardId === Number(value)))
      setForm((f) => ({ ...f, wardId: value, streetId: "" }))
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.streetId) { toast.error("Vui lòng chọn tuyến đường"); return }
    setLoading(true)
    try {
      await apiClient.post("/api/locations", {
        streetId: Number(form.streetId),
        houseNumber: form.houseNumber ? Number(form.houseNumber) : null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        description: form.description || null,
      })
      toast.success("Thêm vị trí thành công")
      setOpen(false)
      loadLocations()
    } catch {
      toast.error("Thêm vị trí thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý vị trí</h1>
          <p className="text-sm text-muted-foreground">Danh sách vị trí cây xanh theo tuyến đường</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><PlusIcon className="mr-1 size-4" />Thêm vị trí</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Số nhà</TableHead>
              <TableHead>Tọa độ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Chưa có vị trí nào.</TableCell></TableRow>
            ) : locations.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-mono">#{l.id}</TableCell>
                <TableCell>{l.description ?? "—"}</TableCell>
                <TableCell>{l.houseNumber ?? "—"}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {l.latitude != null ? `${l.latitude}, ${l.longitude}` : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle>Thêm vị trí mới</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Phường/Xã</Label>
              <Select value={form.wardId} onValueChange={(v) => set("wardId", v)}>
                <SelectTrigger><SelectValue placeholder="Chọn phường..." /></SelectTrigger>
                <SelectContent>{wards.map((w) => <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Tuyến đường <span className="text-destructive">*</span></Label>
              <Select value={form.streetId} onValueChange={(v) => set("streetId", v)} disabled={!form.wardId}>
                <SelectTrigger><SelectValue placeholder="Chọn đường..." /></SelectTrigger>
                <SelectContent>{filteredStreets.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="houseNumber">Số nhà</Label>
                <Input id="houseNumber" type="number" value={form.houseNumber} onChange={(e) => set("houseNumber", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Mô tả</Label>
                <Input id="description" value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lat">Vĩ độ</Label>
                <Input id="lat" type="number" step="any" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lon">Kinh độ</Label>
                <Input id="lon" type="number" step="any" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Thêm"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
