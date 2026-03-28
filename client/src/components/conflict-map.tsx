/**
 * conflict-map.tsx
 * Interactive MapLibre GL map rendering conflict events with severity-coded markers.
 * Uses OpenStreetMap raster tiles with desaturated dark styling for COP aesthetic.
 * Markers are color-coded by severity (critical=red, major=orange, moderate=yellow, minor=gray)
 * and sized proportionally. Click any marker for a detailed popup with event info and source.
 *
 * Author: Austin Wesley
 */
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Event } from "@shared/schema";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  major: "#f97316",
  moderate: "#eab308",
  minor: "#6b7280",
};

const CATEGORY_ICONS: Record<string, string> = {
  airstrike: "✈",
  missile: "🚀",
  drone: "🎯",
  ground: "⚔",
  naval: "⚓",
  diplomatic: "🏛",
  humanitarian: "🏥",
  cyber: "💻",
};

interface ConflictMapProps {
  events: Event[];
}

export function ConflictMap({ events }: ConflictMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
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
              "raster-saturation": -0.7,
              "raster-brightness-max": 0.35,
              "raster-contrast": 0.2,
            },
          },
        ],
      },
      center: [51.389, 32.0],
      zoom: 4.5,
      minZoom: 3,
      maxZoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => setMapLoaded(true));

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when events change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    events.forEach((event) => {
      if (!event.lat || !event.lng) return;

      const color = SEVERITY_COLORS[event.severity] || "#6b7280";
      const size = event.severity === "critical" ? 14 : event.severity === "major" ? 11 : 8;

      // Create custom marker element
      const el = document.createElement("div");
      el.style.cssText = `
        width: ${size * 2}px;
        height: ${size * 2}px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.3);
        cursor: pointer;
        box-shadow: 0 0 ${size}px ${color}80;
      `;

      const popupContent = `
        <div style="max-width: 280px;">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px; color: hsl(210, 15%, 90%);">
            ${event.title}
          </div>
          <div style="font-size: 11px; color: hsl(210, 10%, 55%); margin-bottom: 6px;">
            ${new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })} · ${event.location}
          </div>
          <div style="display: flex; gap: 4px; margin-bottom: 6px;">
            <span style="background: ${color}30; color: ${color}; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 500; text-transform: uppercase;">${event.severity}</span>
            <span style="background: hsl(220,12%,18%); color: hsl(210,10%,70%); padding: 1px 6px; border-radius: 4px; font-size: 10px;">${event.category}</span>
            <span style="background: hsl(220,12%,18%); color: hsl(210,10%,70%); padding: 1px 6px; border-radius: 4px; font-size: 10px;">${event.actor}</span>
          </div>
          <div style="font-size: 12px; line-height: 1.5; color: hsl(210, 15%, 80%);">
            ${event.description.length > 200 ? event.description.slice(0, 200) + "..." : event.description}
          </div>
          <div style="font-size: 10px; color: hsl(210,10%,50%); margin-top: 6px;">
            Source: ${event.source}
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 15,
        closeButton: true,
        maxWidth: "300px",
      }).setHTML(popupContent);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([event.lng!, event.lat!])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [events, mapLoaded]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" data-testid="map-container" />
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs" data-testid="map-legend">
        <div className="font-semibold text-foreground mb-2">Severity</div>
        <div className="flex flex-col gap-1.5">
          {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
            <div key={sev} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: color, boxShadow: `0 0 6px ${color}60` }} />
              <span className="capitalize text-muted-foreground">{sev}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Event count overlay */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
        <span className="text-xs text-muted-foreground">{events.length} events on map</span>
      </div>
    </div>
  );
}