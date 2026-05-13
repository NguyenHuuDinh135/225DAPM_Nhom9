"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Loader2, Route, Trash2 } from "lucide-react";
import type { TreeMapDto } from "./types";

interface RoutePanelProps {
  trees: TreeMapDto[];
  distance: number | null;
  duration: number | null;
  onClear: () => void;
  onOptimize: () => void;
  loading: boolean;
}

export function RoutePanel({
  trees,
  distance,
  duration,
  onClear,
  onOptimize,
  loading,
}: RoutePanelProps) {
  return (
    <Card className="absolute bottom-20 left-4 w-72 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Route className="h-4 w-4" />
          Tuyến đường ({trees.length} điểm)
        </CardTitle>
        {distance !== null && duration !== null && (
          <CardDescription className="text-xs">
            {(distance / 1000).toFixed(1)} km &middot;{" "}
            {Math.ceil(duration / 60)} phút
          </CardDescription>
        )}
      </CardHeader>

      <div className="px-4 pb-3 max-h-40 overflow-y-auto">
        <ol className="space-y-1">
          {trees.map((tree, idx) => (
            <li
              key={tree.id}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Badge
                variant="secondary"
                className="h-5 w-5 p-0 flex items-center justify-center text-[10px] shrink-0"
              >
                {idx + 1}
              </Badge>
              <span className="truncate">
                {tree.name || tree.treeTypeName || `Cây #${tree.id}`}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <CardFooter className="gap-2 pt-0">
        <Button
          size="sm"
          className="flex-1"
          onClick={onOptimize}
          disabled={loading || trees.length < 2}
        >
          {loading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Đang tính...
            </>
          ) : (
            "Tối ưu hóa"
          )}
        </Button>
        <Button size="sm" variant="outline" onClick={onClear}>
          <Trash2 className="h-3 w-3 mr-1" />
          Xóa tuyến
        </Button>
      </CardFooter>
    </Card>
  );
}
