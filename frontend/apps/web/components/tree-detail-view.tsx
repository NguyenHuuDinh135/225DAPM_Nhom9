import Link from "next/link"
import { ArrowLeft, MapPin, Trees } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { getStatusLabel, type TreeRecord, type TreeSpecies } from "@/lib/trees"

type TreeWithSpecies = TreeRecord & {
  species: TreeSpecies
}

type TreeDetailViewProps = {
  tree: TreeWithSpecies
  speciesTrees: TreeWithSpecies[]
  source: "home" | "category"
  backHref: string
  backLabel: string
}

export function TreeDetailView({
  tree,
  speciesTrees,
  source,
  backHref,
  backLabel,
}: TreeDetailViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-[linear-gradient(135deg,#0f6f2b,rgba(31,135,71,0.92))] p-6 text-white shadow-xl md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-white/85 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
          <Badge className="bg-white/18 text-white hover:bg-white/18">
            {tree.code}
          </Badge>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{tree.species.name}</h1>
            <p className="mt-1 text-sm italic text-white/80">
              {tree.species.scientificName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/90">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {tree.addressLine}, {tree.ward}, {tree.district}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Trees className="h-4 w-4" />
              {getStatusLabel(tree.status)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" className="rounded-full">
            <Link href="/category">Xem theo danh mục</Link>
          </Button>
          <Button asChild className="rounded-full bg-white text-[#0f6f2b] hover:bg-white/90">
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Thông tin chi tiết cây xanh</CardTitle>
            <CardDescription>
              Hồ sơ cơ bản của cây trên hệ thống quản lý cây xanh đô thị.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoItem label="Mã cây" value={tree.code} />
            <InfoItem label="Loại cây" value={tree.species.name} />
            <InfoItem label="Họ thực vật" value={tree.species.family} />
            <InfoItem label="Tuyến đường" value={tree.street} />
            <InfoItem label="Phường" value={tree.ward} />
            <InfoItem label="Quận" value={tree.district} />
            <InfoItem label="Năm trồng" value={String(tree.plantedYear)} />
            <InfoItem label="Chiều cao" value={`${tree.heightMeters} m`} />
            <InfoItem
              label="Đường kính thân"
              value={`${tree.trunkDiameterCm} cm`}
            />
            <InfoItem
              label="Đường kính tán"
              value={`${tree.canopyDiameterM} m`}
            />
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Tình trạng và vị trí</CardTitle>
            <CardDescription>
              Thông tin phục vụ theo dõi chăm sóc và quản lý hiện trường.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm font-medium text-emerald-900">Trạng thái</div>
              <div className="mt-1 text-lg font-semibold text-emerald-950">
                {getStatusLabel(tree.status)}
              </div>
              <p className="mt-2 text-sm leading-6 text-emerald-900/80">
                {tree.healthNote}
              </p>
            </div>
            <InfoBlock
              label="Vị trí chi tiết"
              value={`${tree.addressLine}, ${tree.street}, ${tree.ward}, ${tree.district}`}
            />
            <InfoBlock
              label="Tọa độ"
              value={`${tree.lat.toFixed(5)}, ${tree.lng.toFixed(5)}`}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Đặc tính sinh học</CardTitle>
            <CardDescription>
              Các đặc điểm chính của giống cây đang được quản lý.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tree.species.biology.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-sm"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Mô tả loài và phân bố</CardTitle>
            <CardDescription>
              Tóm tắt về loài cây và phạm vi xuất hiện trong đô thị.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <InfoBlock label="Mô tả" value={tree.species.description} />
            <InfoBlock label="Vùng phân bố" value={tree.species.distribution} />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Phân bố thực tế của loại cây này</CardTitle>
          <CardDescription>
            Bấm vào từng vị trí để chuyển sang hồ sơ của cây tại vị trí đó.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {speciesTrees.map((item) => (
            <Link
              key={item.id}
              href={`/tree-detail/${item.id}?from=${source}`}
              className={`block rounded-2xl border p-4 transition ${
                item.id === tree.id
                  ? "border-[#0f6f2b] bg-emerald-50"
                  : "border-border/60 bg-muted/20 hover:border-[#0f6f2b]/50 hover:bg-emerald-50/40"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-foreground">
                    {item.code} • {item.street}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {item.addressLine}, {item.ward}, {item.district}
                  </div>
                </div>
                <Badge variant="outline">{getStatusLabel(item.status)}</Badge>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <p className="text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  )
}
