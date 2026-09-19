"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const MapInner = dynamic(() => import("./PlacesMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center border border-paper-border bg-paper-card text-sm text-ink-muted">
      Loading map…
    </div>
  ),
});

export type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  href: string;
  kind: string;
  layer?: MapLayerId;
};

export type MapLayerId = "places" | "problems" | "projects" | "reports" | "offices";

const LAYER_META: {
  id: MapLayerId;
  label: string;
  color: string;
}[] = [
  { id: "places", label: "Places", color: "#1b5e3b" },
  { id: "problems", label: "Problems", color: "#b45309" },
  { id: "projects", label: "Projects", color: "#1d4ed8" },
  { id: "reports", label: "Reports", color: "#b91c1c" },
  { id: "offices", label: "Offices", color: "#475569" },
];

export function PlacesMap({
  points,
  center,
  showLayers = false,
}: {
  points: MapPoint[];
  center?: [number, number];
  /** When true, show Places map layer toggles for civic overlays. */
  showLayers?: boolean;
}) {
  const c = useMemo<[number, number]>(() => center ?? [9.082, 8.6753], [center]);
  const available = useMemo(() => {
    const layers = new Set(points.map((p) => p.layer ?? "places"));
    return LAYER_META.filter((l) => layers.has(l.id));
  }, [points]);

  const [enabled, setEnabled] = useState<Record<MapLayerId, boolean>>(() => ({
    places: true,
    problems: true,
    projects: true,
    reports: true,
    offices: true,
  }));

  const visible = useMemo(() => {
    if (!showLayers) return points;
    return points.filter((p) => enabled[p.layer ?? "places"]);
  }, [points, enabled, showLayers]);

  const colored = useMemo(() => {
    if (!showLayers) return visible;
    return visible.map((p) => {
      const layer = p.layer ?? "places";
      const meta = LAYER_META.find((l) => l.id === layer);
      return { ...p, color: meta?.color };
    });
  }, [visible, showLayers]);

  return (
    <div>
      {showLayers && available.length > 1 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {available.map((l) => {
            const on = enabled[l.id];
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setEnabled((prev) => ({ ...prev, [l.id]: !prev[l.id] }))}
                className={`border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
                  on
                    ? "border-transparent text-white"
                    : "border-paper-border bg-paper text-ink-faint"
                }`}
                style={on ? { backgroundColor: l.color } : undefined}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      ) : null}
      <MapInner points={colored} center={c} />
    </div>
  );
}
