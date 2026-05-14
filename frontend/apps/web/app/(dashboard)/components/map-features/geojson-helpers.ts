import { type TreeMapDto, CONDITION_WEIGHTS } from "./types";

interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number];
}

interface GeoJSONFeature {
  type: "Feature";
  geometry: GeoJSONPoint;
  properties: { id: number; weight: number; condition: string };
}

export interface TreeGeoJSON {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export function treesToGeoJSON(trees: TreeMapDto[]): TreeGeoJSON {
  return {
    type: "FeatureCollection",
    features: trees
      .filter((t) => t.latitude != null && t.longitude != null)
      .map((t) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [t.longitude!, t.latitude!] as [number, number],
        },
        properties: {
          id: t.id,
          weight: CONDITION_WEIGHTS[t.condition ?? "Tốt"] ?? 0.2,
          condition: t.condition ?? "Tốt",
        },
      })),
  };
}
