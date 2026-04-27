import { ReportIncidentForm } from "./report-incident-form"

type ReportIncidentPageProps = {
  searchParams?: {
    treeId?: string
  }
}

export default function ReportIncidentPage({ searchParams }: ReportIncidentPageProps) {
  const treeIdParam = searchParams?.treeId ?? ""

  return <ReportIncidentForm treeIdParam={treeIdParam} />
}
