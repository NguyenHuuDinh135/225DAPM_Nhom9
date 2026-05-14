"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Slider } from "@workspace/ui/components/slider"
import type { TreeMapDto } from "./types"

interface MapTimelineSliderProps {
  trees: TreeMapDto[]
  onFilterChange: (visibleIds: Set<number> | null) => void
}

const DAY_MS = 86_400_000

function dateToDays(date: Date): number {
  return Math.floor(date.getTime() / DAY_MS)
}

function daysToDate(days: number): Date {
  return new Date(days * DAY_MS)
}

function formatMonthYear(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${month}/${year}`
}

export function MapTimelineSlider({ trees, onFilterChange }: MapTimelineSliderProps) {
  const [playing, setPlaying] = useState(false)
  const animRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const startValueRef = useRef<number>(0)

  const { minDays, maxDays, treesWithDate, alwaysVisibleIds } = useMemo(() => {
    const today = dateToDays(new Date())
    let earliest = today
    const withDate: Array<{ id: number; days: number }> = []
    const alwaysVisible: number[] = []

    for (const tree of trees) {
      if (tree.recordedDate) {
        const days = dateToDays(new Date(tree.recordedDate))
        withDate.push({ id: tree.id, days })
        if (days < earliest) earliest = days
      } else {
        alwaysVisible.push(tree.id)
      }
    }

    return {
      minDays: earliest,
      maxDays: today,
      treesWithDate: withDate,
      alwaysVisibleIds: alwaysVisible,
    }
  }, [trees])

  const [currentDays, setCurrentDays] = useState(maxDays)

  const computeVisibleIds = useCallback(
    (days: number): Set<number> => {
      const ids = new Set<number>(alwaysVisibleIds)
      for (const t of treesWithDate) {
        if (t.days <= days) ids.add(t.id)
      }
      return ids
    },
    [treesWithDate, alwaysVisibleIds]
  )

  const handleSliderChange = useCallback(
    (value: number[]) => {
      const days = value[0] ?? maxDays
      setCurrentDays(days)
      if (days >= maxDays) {
        onFilterChange(null)
      } else {
        onFilterChange(computeVisibleIds(days))
      }
    },
    [maxDays, computeVisibleIds, onFilterChange]
  )

  const handleReset = useCallback(() => {
    setPlaying(false)
    setCurrentDays(maxDays)
    onFilterChange(null)
  }, [maxDays, onFilterChange])

  useEffect(() => {
    return () => {
      onFilterChange(null)
    }
  }, [onFilterChange])

  useEffect(() => {
    if (!playing) {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current)
      return
    }

    const totalRange = maxDays - minDays
    if (totalRange <= 0) {
      setPlaying(false)
      return
    }

    const duration = 8000
    startTimeRef.current = performance.now()
    startValueRef.current = currentDays

    const remaining = maxDays - startValueRef.current
    const remainingRatio = remaining / totalRange
    const remainingDuration = remainingRatio * duration

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / remainingDuration, 1)
      const days = Math.round(startValueRef.current + progress * remaining)

      setCurrentDays(days)
      if (days >= maxDays) {
        onFilterChange(null)
      } else {
        onFilterChange(computeVisibleIds(days))
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setPlaying(false)
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current)
    }
  }, [playing, minDays, maxDays, currentDays, computeVisibleIds, onFilterChange])

  const visibleCount =
    currentDays >= maxDays ? trees.length : computeVisibleIds(currentDays).size

  if (minDays >= maxDays) return null

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-40 bg-background/90 backdrop-blur-sm rounded-lg border p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <span className="text-xs font-medium tabular-nums whitespace-nowrap min-w-[52px] text-center">
          {formatMonthYear(daysToDate(currentDays))}
        </span>

        <Slider
          className="flex-1"
          min={minDays}
          max={maxDays}
          step={1}
          value={[currentDays]}
          onValueChange={handleSliderChange}
        />

        <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[56px] text-right">
          {visibleCount} / {trees.length} cây
        </span>
      </div>
    </div>
  )
}
