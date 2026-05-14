"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMap } from "@workspace/ui/components/ui/map";
import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";
import { Button } from "@workspace/ui/components/button";
import { PolygonStatsPanel } from "./polygon-stats-panel";
import type { TreeMapDto } from "./types";
import type { MapMouseEvent } from "maplibre-gl";

interface FeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Point" | "LineString" | "Polygon"; coordinates: unknown };
    properties: Record<string, unknown>;
  }>;
}

interface MapPolygonDrawProps {
  trees: TreeMapDto[];
  active: boolean;
  onClose: () => void;
}

const SOURCE_VERTICES = "polygon-vertices";
const SOURCE_LINE = "polygon-line";
const SOURCE_FILL = "polygon-fill";
const LAYER_VERTICES = "polygon-vertices-layer";
const LAYER_LINE = "polygon-line-layer";
const LAYER_FILL = "polygon-fill-layer";

export function MapPolygonDraw({ trees, active, onClose }: MapPolygonDrawProps) {
  const { map, isDestroyed } = useMap();
  const [vertices, setVertices] = useState<[number, number][]>([]);
  const [closed, setClosed] = useState(false);
  const [treesInPolygon, setTreesInPolygon] = useState<TreeMapDto[]>([]);
  const verticesRef = useRef<[number, number][]>([]);

  // Keep ref in sync with state for use inside map event handlers
  verticesRef.current = vertices;

  const cleanupLayers = useCallback(() => {
    if (!map || isDestroyed.current) return;
    try {
      if (map.getLayer(LAYER_FILL)) map.removeLayer(LAYER_FILL);
      if (map.getLayer(LAYER_LINE)) map.removeLayer(LAYER_LINE);
      if (map.getLayer(LAYER_VERTICES)) map.removeLayer(LAYER_VERTICES);
      if (map.getSource(SOURCE_FILL)) map.removeSource(SOURCE_FILL);
      if (map.getSource(SOURCE_LINE)) map.removeSource(SOURCE_LINE);
      if (map.getSource(SOURCE_VERTICES)) map.removeSource(SOURCE_VERTICES);
    } catch {
      // Map may have been destroyed already, ignore cleanup errors
    }
  }, [map, isDestroyed]);

  const resetState = useCallback(() => {
    setVertices([]);
    setClosed(false);
    setTreesInPolygon([]);
    cleanupLayers();
  }, [cleanupLayers]);

  const updateSources = useCallback(
    (pts: [number, number][]) => {
      if (!map) return;

      // Vertices as points
      const verticesGeoJSON: FeatureCollection = {
        type: "FeatureCollection",
        features: pts.map((coord) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: coord },
          properties: {},
        })),
      };

      // Line connecting vertices
      const lineGeoJSON: FeatureCollection = {
        type: "FeatureCollection",
        features:
          pts.length >= 2
            ? [
                {
                  type: "Feature",
                  geometry: { type: "LineString", coordinates: pts },
                  properties: {},
                },
              ]
            : [],
      };

      const verticesSource = map.getSource(SOURCE_VERTICES);
      if (verticesSource && "setData" in verticesSource) {
        (verticesSource as unknown as { setData: (d: unknown) => void }).setData(verticesGeoJSON);
      } else {
        map.addSource(SOURCE_VERTICES, { type: "geojson", data: verticesGeoJSON as unknown as GeoJSON.GeoJSON });
        map.addLayer({
          id: LAYER_VERTICES,
          type: "circle",
          source: SOURCE_VERTICES,
          paint: {
            "circle-radius": 6,
            "circle-color": "#3b82f6",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      }

      const lineSource = map.getSource(SOURCE_LINE);
      if (lineSource && "setData" in lineSource) {
        (lineSource as unknown as { setData: (d: unknown) => void }).setData(lineGeoJSON);
      } else {
        map.addSource(SOURCE_LINE, { type: "geojson", data: lineGeoJSON as unknown as GeoJSON.GeoJSON });
        map.addLayer({
          id: LAYER_LINE,
          type: "line",
          source: SOURCE_LINE,
          paint: {
            "line-color": "#3b82f6",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        });
      }
    },
    [map]
  );

  const closePolygon = useCallback(
    (pts: [number, number][]) => {
      if (!map || pts.length < 3) return;

      setClosed(true);

      // Add fill layer
      const ring = [...pts, pts[0]!];
      const fillGeoJSON: FeatureCollection = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [ring] },
            properties: {},
          },
        ],
      };

      map.addSource(SOURCE_FILL, { type: "geojson", data: fillGeoJSON as unknown as GeoJSON.GeoJSON });
      map.addLayer(
        {
          id: LAYER_FILL,
          type: "fill",
          source: SOURCE_FILL,
          paint: {
            "fill-color": "rgba(59, 130, 246, 0.15)",
            "fill-outline-color": "#3b82f6",
          },
        },
        LAYER_LINE // insert below the line layer
      );

      // Compute trees inside polygon
      const turfPoly = polygon([ring]);
      const inside = trees.filter((tree) => {
        if (tree.latitude == null || tree.longitude == null) return false;
        const pt = point([tree.longitude, tree.latitude]);
        return booleanPointInPolygon(pt, turfPoly);
      });
      setTreesInPolygon(inside);
    },
    [map, trees]
  );

  // Map click handler
  useEffect(() => {
    if (!map || !active || closed) return;

    const handleClick = (e: MapMouseEvent) => {
      const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const currentVertices = verticesRef.current;

      // Check proximity to first vertex to close polygon
      if (currentVertices.length >= 3) {
        const firstVertex = currentVertices[0]!;
        const firstPoint = map.project(firstVertex);
        const clickPoint = map.project(lngLat);
        const distance = Math.sqrt(
          (firstPoint.x - clickPoint.x) ** 2 +
            (firstPoint.y - clickPoint.y) ** 2
        );
        if (distance < 20) {
          closePolygon(currentVertices);
          return;
        }
      }

      const newVertices: [number, number][] = [...currentVertices, lngLat];
      setVertices(newVertices);
      updateSources(newVertices);
    };

    map.on("click", handleClick);
    map.getCanvas().style.cursor = "crosshair";

    return () => {
      map.off("click", handleClick);
      map.getCanvas().style.cursor = "";
    };
  }, [map, active, closed, closePolygon, updateSources]);

  // Clean up on deactivation or unmount
  useEffect(() => {
    if (!active) {
      resetState();
    }
    return () => {
      resetState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const handleComplete = () => {
    if (vertices.length >= 3) {
      closePolygon(vertices);
    }
  };

  const handleClear = () => {
    resetState();
    onClose();
  };

  if (!active && !closed) return null;

  return (
    <>
      {/* Floating complete button */}
      {active && !closed && vertices.length >= 3 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button onClick={handleComplete} size="sm" className="shadow-lg">
            Hoàn thành
          </Button>
        </div>
      )}

      {/* Stats panel when polygon is closed */}
      {closed && treesInPolygon.length >= 0 && (
        <PolygonStatsPanel trees={treesInPolygon} onClear={handleClear} />
      )}
    </>
  );
}
