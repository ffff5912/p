"use client";

import { useState, useEffect, useCallback } from "react";

interface GeolocationState {
  lat: number;
  lng: number;
  isDemo: boolean;
  status: string;
}

const DEMO_LOCATION = { lat: 35.6536, lng: 139.9018 };

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationState | null>(null);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation({
        ...DEMO_LOCATION,
        isDemo: true,
        status: "デモ: 浦安",
      });
      return;
    }

    setLocation((prev) =>
      prev ? { ...prev, status: "取得中..." } : null
    );

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isDemo: false,
          status: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        });
      },
      () => {
        setLocation({
          ...DEMO_LOCATION,
          isDemo: true,
          status: "デモ: 浦安",
        });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  return { location, locate };
}
