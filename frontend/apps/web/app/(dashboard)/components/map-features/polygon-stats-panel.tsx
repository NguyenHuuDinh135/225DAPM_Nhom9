"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import type { TreeMapDto } from "./types";

interface PolygonStatsPanelProps {
  trees: TreeMapDto[];
  onClear: () => void;
}

const CONDITION_COLORS: Record<string, string> = {
  "Tốt": "bg-green-500",
  "Bình thường": "bg-yellow-500",
  "Mới trồng": "bg-blue-400",
  "Cần cắt tỉa": "bg-orange-500",
  "Sâu bệnh": "bg-red-500",
};

const CONDITION_BADGE_VARIANTS: Record<string, string> = {
  "Tốt": "bg-green-100 text-green-800 border-green-200",
  "Bình thường": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Mới trồng": "bg-blue-100 text-blue-800 border-blue-200",
  "Cần cắt tỉa": "bg-orange-100 text-orange-800 border-orange-200",
  "Sâu bệnh": "bg-red-100 text-red-800 border-red-200",
};

export function PolygonStatsPanel({ trees, onClear }: PolygonStatsPanelProps) {
  const conditionBreakdown = trees.reduce<Record<string, number>>(
    (acc, tree) => {
      const condition = tree.condition ?? "Không xác định";
      acc[condition] = (acc[condition] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const speciesBreakdown = trees.reduce<Record<string, number>>(
    (acc, tree) => {
      const species = tree.treeTypeName ?? "Không xác định";
      acc[species] = (acc[species] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const topSpecies = Object.entries(speciesBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const total = trees.length;

  return (
    <Card className="absolute top-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Thống kê vùng chọn</span>
          <span className="text-2xl font-bold text-primary">{total}</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">cây trong vùng</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Condition breakdown bar */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Tình trạng</p>
          {total > 0 && (
            <div className="flex h-3 w-full overflow-hidden rounded-full">
              {Object.entries(conditionBreakdown).map(([condition, count]) => (
                <div
                  key={condition}
                  className={`${CONDITION_COLORS[condition] ?? "bg-gray-400"}`}
                  style={{ width: `${(count / total) * 100}%` }}
                  title={`${condition}: ${count}`}
                />
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(conditionBreakdown).map(([condition, count]) => (
              <Badge
                key={condition}
                variant="outline"
                className={`text-xs ${CONDITION_BADGE_VARIANTS[condition] ?? ""}`}
              >
                {condition}: {count}
              </Badge>
            ))}
          </div>
        </div>

        {/* Species breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Loài cây (top 5)</p>
          <ul className="space-y-1">
            {topSpecies.map(([species, count]) => (
              <li
                key={species}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate max-w-[200px]">{species}</span>
                <Badge variant="secondary" className="text-xs ml-2">
                  {count}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={onClear}
        >
          Xóa vùng
        </Button>
      </CardContent>
    </Card>
  );
}
