"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Store } from "@/lib/types";
import { fetchNearbyPOIs } from "@/lib/overpass";
import { convertPOIsToStores } from "@/lib/matching";

interface CacheEntry {
  stores: Store[];
  timestamp: number;
  lat: number;
  lng: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_DISTANCE_THRESHOLD = 200; // meters

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useNearbyStores(lat: number | null, lng: number | null) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<CacheEntry | null>(null);

  const fetchStores = useCallback(async () => {
    if (lat == null || lng == null) return;

    // Check cache
    const cache = cacheRef.current;
    if (cache) {
      const age = Date.now() - cache.timestamp;
      const dist = haversine(cache.lat, cache.lng, lat, lng);
      if (age < CACHE_TTL && dist < CACHE_DISTANCE_THRESHOLD) {
        setStores(cache.stores);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const pois = await fetchNearbyPOIs(lat, lng, 1000);
      const converted = convertPOIsToStores(pois, lat, lng);
      converted.sort((a, b) => a.distance - b.distance);

      cacheRef.current = {
        stores: converted,
        timestamp: Date.now(),
        lat,
        lng,
      };

      setStores(converted);

      if (converted.length === 0) {
        setError("周辺に店舗が見つかりませんでした。範囲を広げて再検索してみてください。");
      }
    } catch (e) {
      console.error("Overpass API failed:", e);
      setError("店舗データの取得に失敗しました。通信状況を確認してリロードしてください。");
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { stores, loading, error, refetch: fetchStores };
}
