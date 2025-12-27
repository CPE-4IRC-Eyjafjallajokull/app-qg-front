"use client";

import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import type { Incident, Vehicle } from "@/types/qg";
import {
  LYON_BOUNDS,
  LYON_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  MAP_STYLE_URL,
} from "@/lib/map/config";
import { AlertTriangle, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

type MapViewProps = {
  incidents: Incident[];
  vehicles: Vehicle[];
};

const incidentTone: Record<Incident["severity"], string> = {
  critical: "bg-red-600 text-white",
  high: "bg-amber-500 text-white",
  medium: "bg-orange-400 text-white",
  low: "bg-emerald-500 text-white",
};

const vehicleTone: Record<Vehicle["status"], string> = {
  available: "bg-emerald-600 text-white",
  busy: "bg-slate-900 text-white",
  maintenance: "bg-slate-400 text-white",
};

export default function MapView({ incidents, vehicles }: MapViewProps) {
  return (
    <div className="h-full w-full">
      <Map
        mapLib={maplibregl}
        mapStyle={MAP_STYLE_URL}
        initialViewState={{
          latitude: LYON_CENTER.lat,
          longitude: LYON_CENTER.lng,
          zoom: MAP_DEFAULT_ZOOM,
        }}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        maxBounds={LYON_BOUNDS}
        dragRotate={false}
        touchPitch={false}
        attributionControl
        style={{ width: "100%", height: "100%" }}
      >
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            latitude={incident.location.lat}
            longitude={incident.location.lng}
            anchor="bottom"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border border-white/70 shadow-lg",
                incidentTone[incident.severity],
              )}
              aria-label={incident.title}
              title={incident.title}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
          </Marker>
        ))}

        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            latitude={vehicle.location.lat}
            longitude={vehicle.location.lng}
            anchor="center"
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border border-white/70 shadow-md",
                vehicleTone[vehicle.status],
              )}
              aria-label={vehicle.callSign}
              title={vehicle.callSign}
            >
              <Truck className="h-4 w-4" />
            </div>
          </Marker>
        ))}

        <NavigationControl position="bottom-left" showCompass={false} />
      </Map>
    </div>
  );
}
