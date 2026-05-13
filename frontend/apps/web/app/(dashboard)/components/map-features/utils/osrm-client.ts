export interface RouteResult {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

export async function getRoute(
  waypoints: [number, number][]
): Promise<RouteResult | null> {
  if (waypoints.length < 2) return null;

  const coords = waypoints.map(([lng, lat]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.code !== "Ok" || !data.routes?.length) return null;

    const route = data.routes[0];
    return {
      coordinates: route.geometry.coordinates as [number, number][],
      distance: route.distance,
      duration: route.duration,
    };
  } catch {
    return null;
  }
}
