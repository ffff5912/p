export interface OverpassNode {
  type: "node" | "way" | "relation";
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassNode[];
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

export async function fetchNearbyPOIs(
  lat: number,
  lng: number,
  radiusMeters: number = 1000
): Promise<OverpassNode[]> {
  const query = `
[out:json][timeout:25];
(
  node["shop"](around:${radiusMeters},${lat},${lng});
  node["amenity"~"restaurant|cafe|fast_food|convenience|bar|pub"](around:${radiusMeters},${lat},${lng});
  node["brand"](around:${radiusMeters},${lat},${lng});
  way["shop"](around:${radiusMeters},${lat},${lng});
  way["amenity"~"restaurant|cafe|fast_food|convenience"](around:${radiusMeters},${lat},${lng});
);
out center body;
`;

  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`);
      }

      const data: OverpassResponse = await response.json();

      return data.elements.filter((el) => {
        if (el.type === "way" || el.type === "relation") {
          const center = (
            el as unknown as { center?: { lat: number; lon: number } }
          ).center;
          if (center) {
            el.lat = center.lat;
            el.lon = center.lon;
          }
        }
        return el.lat != null && el.lon != null && el.tags?.name;
      });
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.warn(`Overpass endpoint ${endpoint} failed:`, lastError.message);
    }
  }

  throw lastError || new Error("All Overpass endpoints failed");
}
