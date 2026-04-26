"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { forbiddenSpecies, limitedSpecies, searchByKeyword } from "@/lib/trees"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

type TabType = "chung-loai" | "cam-trong" | "han-che"
interface TreeType { id: number; name: string; group: string | null }

export default function CategoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>("chung-loai")
  const [searchQuery, setSearchQuery] = useState("")
  const [treeTypes, setTreeTypes] = useState<TreeType[]>([])

  useEffect(() => {
    fetch(`${BASE_URL}/api/lookups/tree-types`)
      .then((r) => r.ok ? r.json() : [])
      .then(setTreeTypes)
      .catch(() => {})
  }, [])

  const filteredTreeTypes = useMemo(
    () => treeTypes.filter((t) =>
      !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.group ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [treeTypes, searchQuery]
  )
  const filteredForbidden = useMemo(() => searchByKeyword(forbiddenSpecies, searchQuery), [searchQuery])
  const filteredLimited = useMemo(() => searchByKeyword(limitedSpecies, searchQuery), [searchQuery])

  const tabTitle = { "chung-loai": "Chủng loại cây xanh", "cam-trong": "Cây cấm trồng", "han-che": "Cây hạn chế trồng" }[activeTab]

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#f8fafc] pb-10">
      <div className="w-full border-b border-border/50 bg-transparent py-4">
        <div className="container mx-auto flex justify-center gap-2 md:gap-6">
          {(["chung-loai", "cam-trong", "han-che"] as TabType[]).map((tab) => (
            <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {{ "chung-loai": "Chủng loại cây xanh", "cam-trong": "Cây cấm trồng", "han-che": "Cây hạn chế trồng" }[tab]}
            </TabButton>
          ))}
        </div>
      </div>

      <div className="container mx-auto mt-6 px-4">
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <div className="flex flex-col items-center justify-between gap-4 border-b p-4 md:flex-row">
            <h2 className="text-xl font-bold text-[#007B22]">{tabTitle}</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Nhập vào từ khóa..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} className="h-10 bg-muted/20 pl-9" />
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "chung-loai" ? (
              <Table>
                <TableHeader className="bg-[#c6f6d5] text-[#166534]">
                  <TableRow className="hover:bg-[#c6f6d5]">
                    <TableHead className="w-16 text-center">STT</TableHead>
                    <TableHead className="min-w-[200px]">Tên loại cây</TableHead>
                    <TableHead className="min-w-[150px]">Nhóm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTreeTypes.map((t, i) => (
                    <TableRow key={t.id} className="align-top">
                      <TableCell className="text-center">{i + 1}</TableCell>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.group ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader className="bg-[#c6f6d5] text-[#166534]">
                  <TableRow className="hover:bg-[#c6f6d5]">
                    <TableHead className="w-16 text-center">STT</TableHead>
                    <TableHead className="min-w-[150px]">Tên loại cây</TableHead>
                    <TableHead className="min-w-[250px]">Tên khoa học</TableHead>
                    <TableHead className="min-w-[200px]">Họ thực vật</TableHead>
                    <TableHead className="min-w-[350px]">Mô tả</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(activeTab === "cam-trong" ? filteredForbidden : filteredLimited).map((row, i) => (
                    <TableRow key={row.id} className="align-top">
                      <TableCell className="text-center">{i + 1}</TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="whitespace-normal italic">{row.scientific}</TableCell>
                      <TableCell>{row.family}</TableCell>
                      <TableCell className="whitespace-normal">{row.desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button variant="ghost" onClick={onClick}
      className={`rounded-md px-6 py-2 transition-all ${active ? "bg-[#007B22] text-white hover:bg-[#006400] hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
      {children}
    </Button>
  )
}
