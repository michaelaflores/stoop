"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface ListingPin {
  id: string;
  title: string;
  category: string;
  status: string;
  point: [number, number]; // [lng, lat]
}

interface MapData {
  boundary: GeoJSON.Geometry | null;
  center: [number, number] | null;
  listings: ListingPin[];
}

interface NeighborhoodMapProps {
  mapData: MapData | null;
  neighborhoodName: string;
}

// Category to color mapping
const CATEGORY_COLORS: Record<string, string> = {
  tools: "#c2704e",
  kitchen: "#d4956b",
  outdoor: "#7a9e7e",
  recreation: "#6b8fb5",
  household: "#a88b6e",
  electronics: "#7e7a9e",
  skill_handyman: "#c2704e",
  skill_tutoring: "#7a9e7e",
  skill_pet: "#d4956b",
  skill_tech: "#7e7a9e",
  skill_other: "#8a7e72",
};

export function NeighborhoodMap({ mapData, neighborhoodName }: NeighborhoodMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  // Keep a stable ref so the click handler always uses the latest router
  // without it being a useEffect dependency
  const routerRef = useRef(router);
  routerRef.current = router;
  // Snapshot mapData on first render — the map initializes once and never tears down
  const mapDataRef = useRef(mapData);

  useEffect(() => {
    if (!mapContainer.current) return;

    const data = mapDataRef.current;

    // If no map data at all, show fallback
    if (!data || !data.center) {
      setError(true);
      return;
    }

    try {
      const m = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            "osm-tiles": {
              type: "raster",
              tiles: [
                "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            },
          },
          layers: [
            {
              id: "osm-tiles",
              type: "raster",
              source: "osm-tiles",
              minzoom: 0,
              maxzoom: 19,
              paint: {
                "raster-saturation": -0.3,
                "raster-brightness-min": 0.1,
                "raster-contrast": -0.1,
              },
            },
          ],
        },
        center: data.center,
        zoom: 14,
        attributionControl: false,
        maxZoom: 17,
        minZoom: 11,
      });

      m.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      m.on("load", () => {
        // Add neighborhood boundary
        if (data.boundary) {
          m.addSource("neighborhood-boundary", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: data.boundary,
            },
          });

          m.addLayer({
            id: "neighborhood-fill",
            type: "fill",
            source: "neighborhood-boundary",
            paint: {
              "fill-color": "#c2704e",
              "fill-opacity": 0.08,
            },
          });

          m.addLayer({
            id: "neighborhood-border",
            type: "line",
            source: "neighborhood-boundary",
            paint: {
              "line-color": "#c2704e",
              "line-width": 2.5,
              "line-opacity": 0.6,
              "line-dasharray": [4, 2],
            },
          });
        }

        // Add listing pins
        if (data.listings && data.listings.length > 0) {
          const geojson: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: data.listings.map((listing) => ({
              type: "Feature",
              properties: {
                id: listing.id,
                title: listing.title,
                category: listing.category,
                status: listing.status,
                color: CATEGORY_COLORS[listing.category] || "#8a7e72",
              },
              geometry: {
                type: "Point",
                coordinates: listing.point,
              },
            })),
          };

          m.addSource("listings", {
            type: "geojson",
            data: geojson,
          });

          m.addLayer({
            id: "listing-circles",
            type: "circle",
            source: "listings",
            paint: {
              "circle-radius": 7,
              "circle-color": ["get", "color"],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
              "circle-opacity": [
                "case",
                ["==", ["get", "status"], "available"],
                0.9,
                0.4,
              ],
            },
          });

          // Hover cursor
          m.on("mouseenter", "listing-circles", () => {
            m.getCanvas().style.cursor = "pointer";
          });
          m.on("mouseleave", "listing-circles", () => {
            m.getCanvas().style.cursor = "";
          });

          // Click to navigate
          m.on("click", "listing-circles", (e) => {
            const feature = e.features?.[0];
            if (feature?.properties?.id) {
              routerRef.current.push(`/commons/${feature.properties.id}`);
            }
          });

          // Popups on hover
          const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 12,
            className: "stoop-popup",
          });

          m.on("mouseenter", "listing-circles", (e) => {
            const feature = e.features?.[0];
            if (feature && feature.geometry.type === "Point") {
              const coords = feature.geometry.coordinates.slice() as [number, number];
              const title = feature.properties?.title || "";
              const status = feature.properties?.status || "";

              popup
                .setLngLat(coords)
                .setHTML(
                  `<div style="font-family:Satoshi,system-ui,sans-serif;font-size:13px;font-weight:500;color:#2d2319;">${title}</div>` +
                  `<div style="font-size:11px;color:${status === "available" ? "#4a7a4e" : "#c2704e"};margin-top:2px;">${status === "available" ? "Available" : "Borrowed"}</div>`
                )
                .addTo(m);
            }
          });

          m.on("mouseleave", "listing-circles", () => {
            popup.remove();
          });
        }

        setLoaded(true);
      });

      m.on("error", () => {
        setError(true);
      });

      map.current = m;

      return () => {
        m.remove();
      };
    } catch {
      setError(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initialize once — map data is captured via ref, router via ref

  // Fallback when no map data
  if (error || !mapDataRef.current?.center) {
    return (
      <div className="card flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-[#e8e0d5] to-[#d5cdc2] md:h-56">
        <div className="pointer-events-none absolute left-3 top-3 z-10">
          <div className="rounded-lg bg-surface/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
            {neighborhoodName}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-muted">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="text-sm font-medium">Map view</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card relative overflow-hidden">
      <div
        ref={mapContainer}
        className="h-48 w-full md:h-56"
        style={{ minHeight: "192px" }}
      />
      {/* Neighborhood label overlay */}
      <div className="pointer-events-none absolute left-3 top-3 z-10">
        <div className="rounded-lg bg-surface/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
          {neighborhoodName}
        </div>
      </div>
      {/* Loading state */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#e8e0d5] to-[#d5cdc2]">
          <div className="flex flex-col items-center gap-2 text-muted">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <span className="text-xs font-medium">Loading map</span>
          </div>
        </div>
      )}
    </div>
  );
}
