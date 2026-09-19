"use client";

import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { MapPoint } from "./PlacesMap";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type ColoredPoint = MapPoint & { color?: string };

export default function PlacesMapInner({
  points,
  center,
}: {
  points: ColoredPoint[];
  center: [number, number];
}) {
  return (
    <div className="overflow-hidden border border-paper-border">
      <MapContainer
        center={center}
        zoom={points.length === 1 ? 11 : 6}
        scrollWheelZoom={false}
        className="h-80 w-full z-0"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => {
          const color = p.color ?? "#1b5e3b";
          return (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={8}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.75 }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-600">{p.kind}</div>
                  <Link href={p.href} className="text-xs text-green-800 underline">
                    Open record
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <p className="border-t border-paper-border bg-paper px-3 py-2 text-xs text-ink-faint">
        Map is an exploration aid. Equivalent records are always available as lists and pages.
      </p>
    </div>
  );
}
