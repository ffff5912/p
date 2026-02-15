import { StoreReward } from "./types";
import storeRewardsData from "@/data/store-rewards.json";

export function findStoreRewards(
  storeName: string
): { storeName: string; rewards: StoreReward[] } | null {
  for (const [key, rewards] of Object.entries(storeRewardsData)) {
    if (storeName.includes(key)) {
      return { storeName: key, rewards: rewards as StoreReward[] };
    }
  }
  return null;
}

export function getRateClass(rate: number): string {
  if (rate >= 5) return "rate-hot";
  if (rate >= 3) return "rate-warm";
  if (rate >= 1.5) return "rate-normal";
  return "rate-cool";
}

export function getCategoryStyle(cat: string) {
  const styles: Record<string, { bg: string; color: string; icon: string }> = {
    "コンビニ": { bg: "#E8F0FE", color: "#1A73E8", icon: "🏪" },
    "飲食店": { bg: "#FCE8E6", color: "#EA4335", icon: "🍽️" },
    "カフェ": { bg: "#FEF7E0", color: "#E37400", icon: "☕" },
    "ショッピング": { bg: "#F3E8FD", color: "#9334E6", icon: "🛍️" },
  };
  return styles[cat] || { bg: "#F1F3F4", color: "#5F6368", icon: "📍" };
}

export function formatDistance(m: number): string {
  return m >= 1000 ? (m / 1000).toFixed(1) + "km" : m + "m";
}

export function getRankClass(i: number): string {
  if (i === 0) return "rank-1";
  if (i === 1) return "rank-2";
  if (i === 2) return "rank-3";
  return "rank-other";
}
