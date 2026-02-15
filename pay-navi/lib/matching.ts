import { Store, StoreReward } from "./types";
import { OverpassNode } from "./overpass";
import storeRewardsData from "@/data/store-rewards.json";

const storeRewards = storeRewardsData as Record<string, StoreReward[]>;

function getCategory(tags: Record<string, string>): string {
  if (tags.shop === "convenience" || tags.amenity === "convenience") return "コンビニ";
  if (tags.amenity === "cafe") return "カフェ";
  if (tags.amenity === "restaurant" || tags.amenity === "fast_food") return "飲食店";
  if (tags.shop) return "ショッピング";
  return "その他";
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function matchStoreRewards(
  storeName: string,
  brand?: string
): { key: string; rewards: StoreReward[] } | null {
  const nameToCheck = brand || storeName;
  for (const [key, rewards] of Object.entries(storeRewards)) {
    if (nameToCheck.includes(key) || key.includes(nameToCheck)) {
      return { key, rewards };
    }
  }
  // Also check the store name itself if brand didn't match
  if (brand && brand !== storeName) {
    for (const [key, rewards] of Object.entries(storeRewards)) {
      if (storeName.includes(key) || key.includes(storeName)) {
        return { key, rewards };
      }
    }
  }
  return null;
}

export function convertPOIsToStores(
  pois: OverpassNode[],
  userLat: number,
  userLng: number
): Store[] {
  return pois.map((poi) => {
    const name = poi.tags.name;
    const distance = Math.round(
      haversineDistance(userLat, userLng, poi.lat, poi.lon)
    );
    const category = getCategory(poi.tags);

    return {
      name,
      distance,
      category,
      lat: poi.lat,
      lng: poi.lon,
    };
  });
}
