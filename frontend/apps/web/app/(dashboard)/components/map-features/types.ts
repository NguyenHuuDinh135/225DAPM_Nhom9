export interface TreeMapDto {
  id: number;
  name: string | null;
  condition: string | null;
  treeTypeName: string | null;
  treeTypeId: number;
  latitude: number | null;
  longitude: number | null;
  address?: string;
  mainImageUrl?: string;
  recordedDate?: string;
}

export type MapMode = "view" | "add-tree" | "relocate" | "draw-polygon" | "select-route";

export const CONDITION_WEIGHTS: Record<string, number> = {
  "Sâu bệnh": 1.0,
  "Cần cắt tỉa": 0.7,
  "Bình thường": 0.4,
  "Mới trồng": 0.3,
  "Tốt": 0.2,
};
