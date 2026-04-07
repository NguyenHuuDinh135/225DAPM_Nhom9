import { notFound } from "next/navigation"

import { TreeDetailView } from "@/components/tree-detail-view"
import { getTreeById, getTreesBySpeciesId } from "@/lib/trees"

export default async function TreeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { id } = await params
  const { from } = await searchParams
  const tree = getTreeById(id)

  if (!tree) {
    notFound()
  }

  const speciesTrees = getTreesBySpeciesId(tree.speciesId)
  const source = from === "category" ? "category" : "home"
  const backHref = source === "category" ? "/category" : "/"
  const backLabel =
    source === "category" ? "Quay lại danh mục cây xanh" : "Quay lại bản đồ cây xanh"

  return (
    <TreeDetailView
      tree={tree}
      speciesTrees={speciesTrees}
      source={source}
      backHref={backHref}
      backLabel={backLabel}
    />
  )
}
