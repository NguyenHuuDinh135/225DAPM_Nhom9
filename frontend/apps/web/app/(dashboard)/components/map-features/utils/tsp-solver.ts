interface Point {
  lat: number;
  lng: number;
  id: number;
}

function haversineDistance(a: Point, b: Point): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function solveTSP(points: Point[]): Point[] {
  if (points.length <= 2) return [...points];

  const visited = new Set<number>();
  const result: Point[] = [];
  let current = points[0]!;

  visited.add(0);
  result.push(current);

  while (visited.size < points.length) {
    let nearestIdx = -1;
    let nearestDist = Infinity;

    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) continue;
      const dist = haversineDistance(current, points[i]!);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    visited.add(nearestIdx);
    current = points[nearestIdx]!;
    result.push(current);
  }

  return result;
}
