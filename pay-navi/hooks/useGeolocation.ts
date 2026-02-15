"use client";

import { useState, useEffect, useCallback } from "react";

interface GeolocationState {
  lat: number;
  lng: number;
  isDemo: boolean;
  status: string;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationState | null>(null);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(null);
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
      (err) => {
        console.error("Geolocation error:", err.message);
        setLocation(null);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  return { location, locate };
}
