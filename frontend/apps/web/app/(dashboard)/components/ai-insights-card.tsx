"use client"

import { useState, useEffect, useCallback } from "react"
import { AlertTriangle, Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Button } from "@workspace/ui/components/button"
import { apiClient } from "@/lib/api-client"

interface Prediction {
  treeId: number
  treeName: string
  reason: string
  urgencyScore: number
  suggestedAction: string
}

type PredictionsResponse = Prediction[]

type AnomaliesResponse = number[]

export function AiInsightsCard() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [anomalyCount, setAnomalyCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const fetchInsights = useCallback(async () => {
    setIsLoading(true)
    setIsOffline(false)

    try {
      const [predictionsData, anomaliesData] = await Promise.all([
        apiClient.get<PredictionsResponse>("/api/ai/predictions"),
        apiClient.get<AnomaliesResponse>("/api/ai/anomalies"),
      ])

      setPredictions(predictionsData ?? [])
      setAnomalyCount(anomaliesData?.length ?? 0)
    } catch {
      setIsOffline(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    )
  }

  if (isOffline) {
    return (
      <Card className="border-dashed opacity-75">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-muted-foreground" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Không có dữ liệu AI. Hệ thống AI hiện đang offline.
          </p>
        </CardContent>
      </Card>
    )
  }

  const displayedPredictions = isExpanded ? predictions : predictions.slice(0, 3)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-blue-600" />
            AI Insights
          </CardTitle>
          {anomalyCount > 0 && (
            <Badge variant="destructive" className="text-xs font-bold px-2 py-0.5">
              <AlertTriangle className="size-3 mr-1" />
              {anomalyCount} bất thường
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {predictions.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Không có dự đoán bảo trì nào hiện tại.
          </p>
        ) : (
          <>
            <div className="space-y-2.5">
              {displayedPredictions.map((prediction) => (
                <PredictionItem key={prediction.treeId} prediction={prediction} />
              ))}
            </div>
            {predictions.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <>
                    Thu gọn <ChevronUp className="size-3 ml-1" />
                  </>
                ) : (
                  <>
                    Xem thêm ({predictions.length - 3}) <ChevronDown className="size-3 ml-1" />
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function PredictionItem({ prediction }: { prediction: Prediction }) {
  const urgencyColor =
    prediction.urgencyScore >= 8
      ? "text-red-600 dark:text-red-400"
      : prediction.urgencyScore >= 5
        ? "text-amber-600 dark:text-amber-400"
        : "text-green-600 dark:text-green-400"

  const urgencyBg =
    prediction.urgencyScore >= 8
      ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
      : prediction.urgencyScore >= 5
        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
        : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"

  return (
    <div className={`rounded-xl border p-3 ${urgencyBg}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{prediction.treeName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{prediction.reason}</p>
          <p className="text-xs font-medium mt-1">{prediction.suggestedAction}</p>
        </div>
        <div className={`text-xs font-bold shrink-0 ${urgencyColor}`}>
          {prediction.urgencyScore}/10
        </div>
      </div>
    </div>
  )
}
