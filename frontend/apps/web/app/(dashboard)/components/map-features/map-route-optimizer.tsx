"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MapMouseEvent } from "maplibre-gl";
import { useMap, MapRoute, MapMarker, MarkerContent } from "@workspace/ui/components/ui/map";
import { toast } from "@workspace/ui/components/sonner";
import { solveTSP } from "./utils/tsp-solver";
import { getRoute, type RouteResult } from "./utils/osrm-client";
import { RoutePanel } from "./route-panel";
import type { TreeMapDto } from "./types";

interface MapRouteOptimizerProps {
  trees: TreeMapDto[];
  active: boolean;
  onClose: () => void;
}

export function MapRouteOptimizer({
  trees,
  active,
  onClose,
}: MapRouteOptimizerProps) {
  const { map } = useMap();
  const [selectedTrees, setSelectedTrees] = useState<TreeMapDto[]>([]);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(
    null
  );
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const clickHandlerRef = useRef<((e: MapMouseEvent) => void) | null>(
    null
  );

  const findNearestTree = useCallback(
    (lngLat: { lng: number; lat: number }): TreeMapDto | null => {
      if (!map) return null;

      const clickPoint = map.project([lngLat.lng, lngLat.lat]);
      let nearest: TreeMapDto | null = null;
      let minDist = Infinity;

      for (const tree of trees) {
        if (tree.latitude == null || tree.longitude == null) continue;
        const treePoint = map.project([tree.longitude, tree.latitude]);
        const dx = clickPoint.x - treePoint.x;
        const dy = clickPoint.y - treePoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 50 && dist < minDist) {
          minDist = dist;
          nearest = tree;
        }
      }

      return nearest;
    },
    [map, trees]
  );

  useEffect(() => {
    if (!map || !active) return;

    const handler = (e: MapMouseEvent) => {
      const tree = findNearestTree(e.lngLat);
      if (!tree) return;

      setSelectedTrees((prev) => {
        const exists = prev.find((t) => t.id === tree.id);
        if (exists) {
          return prev.filter((t) => t.id !== tree.id);
        }
        return [...prev, tree];
      });
    };

    clickHandlerRef.current = handler;
    map.on("click", handler);

    return () => {
      if (clickHandlerRef.current) {
        map.off("click", clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
    };
  }, [map, active, findNearestTree]);

  useEffect(() => {
    if (!active) {
      setSelectedTrees([]);
      setRouteCoords(null);
      setDistance(null);
      setDuration(null);
      setLoading(false);
    }
  }, [active]);

  const handleOptimize = useCallback(async () => {
    if (selectedTrees.length < 2) return;

    setLoading(true);

    const points = selectedTrees.map((t) => ({
      lat: t.latitude!,
      lng: t.longitude!,
      id: t.id,
    }));

    const ordered = solveTSP(points);
    const waypoints: [number, number][] = ordered.map((p) => [p.lng, p.lat]);

    const result: RouteResult | null = await getRoute(waypoints);

    if (result) {
      setRouteCoords(result.coordinates);
      setDistance(result.distance);
      setDuration(result.duration);
    } else {
      setRouteCoords(waypoints);
      const totalDist = waypoints.reduce((sum, curr, i) => {
        if (i === 0) return 0;
        const prev = waypoints[i - 1]!;
        const dx = curr[0] - prev[0];
        const dy = curr[1] - prev[1];
        return sum + Math.sqrt(dx * dx + dy * dy) * 111000;
      }, 0);
      setDistance(totalDist);
      setDuration(null);
      toast.warning("Không thể tải tuyến đường từ OSRM. Hiển thị đường thẳng.");
    }

    const reordered = ordered.map(
      (p) => selectedTrees.find((t) => t.id === p.id)!
    );
    setSelectedTrees(reordered);
    setLoading(false);
  }, [selectedTrees]);

  const handleClear = useCallback(() => {
    setSelectedTrees([]);
    setRouteCoords(null);
    setDistance(null);
    setDuration(null);
  }, []);

  if (!active) return null;

  return (
    <>
      {selectedTrees.map((tree, idx) => (
        <MapMarker
          key={`route-marker-${tree.id}`}
          longitude={tree.longitude!}
          latitude={tree.latitude!}
        >
          <MarkerContent>
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md border-2 border-white">
              {idx + 1}
            </div>
          </MarkerContent>
        </MapMarker>
      ))}

      {routeCoords && (
        <MapRoute coordinates={routeCoords} color="#2563eb" width={4} />
      )}

      <RoutePanel
        trees={selectedTrees}
        distance={distance}
        duration={duration}
        onClear={handleClear}
        onOptimize={handleOptimize}
        loading={loading}
      />
    </>
  );
}
