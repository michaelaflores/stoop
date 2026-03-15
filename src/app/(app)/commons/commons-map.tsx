"use client";

import { memo } from "react";
import dynamic from "next/dynamic";

const NeighborhoodMap = dynamic(
  () =>
    import("@/components/map/neighborhood-map").then(
      (mod) => mod.NeighborhoodMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="card flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-[#e8e0d5] to-[#d5cdc2] md:h-56">
        <div className="flex flex-col items-center gap-2 text-muted">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <span className="text-xs font-medium">Loading map</span>
        </div>
      </div>
    ),
  }
);

interface MapData {
  boundary: GeoJSON.Geometry | null;
  center: [number, number] | null;
  listings: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    point: [number, number];
  }>;
}

interface CommonsMapProps {
  mapData: unknown;
  neighborhoodName: string;
}

export const CommonsMap = memo(function CommonsMap({ mapData, neighborhoodName }: CommonsMapProps) {
  return (
    <NeighborhoodMap
      mapData={mapData as MapData | null}
      neighborhoodName={neighborhoodName}
    />
  );
});
