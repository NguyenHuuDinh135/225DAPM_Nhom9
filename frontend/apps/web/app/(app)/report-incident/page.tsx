import { ReportIncidentForm } from "./report-incident-form"

type ReportIncidentPageProps = {
  searchParams?: Promise<{
    treeId?: string
  }>
}

export default async function ReportIncidentPage({ searchParams }: ReportIncidentPageProps) {
  const params = await searchParams
  const treeIdParam = params?.treeId ?? ""

  return <ReportIncidentForm treeIdParam={treeIdParam} />
}
