"use client";

import { useEffect, useRef } from "react";
import { useMap } from "@workspace/ui/components/ui/map";
import { treesToGeoJSON } from "./geojson-helpers";
import { type TreeMapDto } from "./types";

const SOURCE_ID = "heatmap-trees";
const LAYER_ID = "tree-heatmap";

interface MapHeatmapLayerProps {
  trees: TreeMapDto[];
  visible: boolean;
}

export function MapHeatmapLayer({ trees, visible }: MapHeatmapLayerProps) {
  const { map, isLoaded } = useMap();
  const addedRef = useRef(false);

  useEffect(() => {
    if (!map || !isLoaded) return;

    if (visible) {
      const data = treesToGeoJSON(trees);

      if (addedRef.current) {
        const source = map.getSource(SOURCE_ID);
        if (source && "setData" in source) {
          (source as unknown as { setData: (d: unknown) => void }).setData(data);
        }
        return;
      }

      map.addSource(SOURCE_ID, { type: "geojson", data });
      map.addLayer({
        id: LAYER_ID,
        type: "heatmap",
        source: SOURCE_ID,
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 1, 1],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 14, 3],
          // transparent -> green -> yellow -> orange -> red
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.2, "rgb(34,197,94)",
            0.4, "rgb(234,179,8)",
            0.6, "rgb(249,115,22)",
            1, "rgb(239,68,68)",
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 8, 16, 25],
          "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 15, 0.6],
        },
      });
      addedRef.current = true;
    } else {
      removeLayer(map);
      addedRef.current = false;
    }
  }, [map, isLoaded, visible, trees]);

  useEffect(() => {
    return () => {
      if (map) {
        removeLayer(map);
        addedRef.current = false;
      }
    };
  }, [map]);

  return null;
}

function removeLayer(map: { getLayer: (id: string) => unknown; removeLayer: (id: string) => void; getSource: (id: string) => unknown; removeSource: (id: string) => void } | null | undefined): void {
  if (!map) return;
  try {
    if (map.getLayer(LAYER_ID)) {
      map.removeLayer(LAYER_ID);
    }
    if (map.getSource(SOURCE_ID)) {
      map.removeSource(SOURCE_ID);
    }
  } catch {
    // Map may have been destroyed already, ignore cleanup errors
  }
}
