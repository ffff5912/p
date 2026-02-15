"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Store } from "@/lib/types";
import { findStoreRewards, getCategoryStyle } from "@/lib/utils";
import paymentMethodsData from "@/data/payment-methods.json";

interface MapProps {
  lat: number;
  lng: number;
  stores: Store[];
  onStoreClick: (index: number) => void;
}

export default function Map({ lat, lng, stores, onStoreClick }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const initMap = useCallback(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([lat, lng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // User location marker
    const userIcon = L.divIcon({
      html: '<div style="width:16px;height:16px;background:#1A73E8;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(26,115,232,0.4);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      className: "",
    });
    L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);

    // Accuracy circle
    L.circle([lat, lng], {
      radius: 50,
      color: "#1A73E8",
      fillColor: "#1A73E8",
      fillOpacity: 0.08,
      weight: 1,
      opacity: 0.3,
    }).addTo(map);

    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 100);
  }, [lat, lng]);

  const addMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    stores.forEach((store, idx) => {
      const catStyle = getCategoryStyle(store.category);
      const result = findStoreRewards(store.name);
      const bestRate = result
        ? Math.max(...result.rewards.map((r) => r.rate))
        : 0;
      const rateColor =
        bestRate >= 5
          ? "#EA4335"
          : bestRate >= 3
            ? "#FA7B17"
            : bestRate >= 1.5
              ? "#1A73E8"
              : "#9AA0A6";

      const markerIcon = L.divIcon({
        html: `<div style="
          background: white;
          border-radius: 8px;
          padding: 4px 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          color: ${rateColor};
          border: 1.5px solid ${rateColor}22;
        ">
          <span style="font-size:13px">${catStyle.icon}</span>
          ${bestRate > 0 ? bestRate.toFixed(1) + "%" : ""}
        </div>`,
        iconSize: [0, 0],
        iconAnchor: [30, 15],
        className: "",
      });

      const marker = L.marker([store.lat, store.lng], { icon: markerIcon })
        .addTo(map)
        .on("click", () => onStoreClick(idx));

      if (result) {
        const best = [...result.rewards].sort((a, b) => b.rate - a.rate)[0];
        const pm = (paymentMethodsData as Record<string, { name: string }>)[
          best.method
        ];
        if (pm) {
          marker.bindPopup(
            `<div style="padding:14px 16px">
              <div style="font-size:14px;font-weight:600;color:#202124;font-family:'Noto Sans JP',sans-serif;margin-bottom:6px">${store.name}</div>
              <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#5F6368;font-family:'Noto Sans JP',sans-serif">
                最大還元 <span style="font-family:'DM Mono',monospace;font-weight:600;color:#34A853">${best.rate.toFixed(1)}%</span> — ${pm.name}
              </div>
            </div>`,
            { closeButton: false }
          );
        }
      }

      markersRef.current.push(marker);
    });
  }, [stores, onStoreClick]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  useEffect(() => {
    addMarkers();
  }, [addMarkers]);

  const handleLocate = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 16, { duration: 0.8 });
    }
  };

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full z-[1]" />
      <button
        className="absolute bottom-4 right-4 z-[500] w-11 h-11 bg-white border-none rounded-xl shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-95"
        onClick={handleLocate}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1A73E8"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4m0 12v4m-10-10h4m12 0h4" />
        </svg>
      </button>
    </div>
  );
}
