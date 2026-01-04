"use client";

import type { ReactNode } from "react";
import Map, {
  NavigationControl,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import type {
  Incident,
  InterestPoint,
  InterestPointKind,
  Vehicle,
} from "@/types/qg";
import {
  LYON_BOUNDS,
  LYON_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  MAP_STYLE_URL,
} from "@/lib/map/config";
import { IncidentMarkers } from "@/components/qg/map/incident-markers";
import { VehicleMarkers } from "@/components/qg/map/vehicle-markers";
import { InterestPointMarkers } from "@/components/qg/map/interest-point-markers";

type MapViewProps = {
  incidents: Incident[];
  vehicles: Vehicle[];
  interestPoints?: InterestPoint[];
  interestPointKinds?: InterestPointKind[];
  onMapClick?: (location: { latitude: number; longitude: number }) => void;
  children?: ReactNode;
};

export default function MapView({
  incidents,
  vehicles,
  interestPoints = [],
  interestPointKinds = [],
  onMapClick,
  children,
}: MapViewProps) {
  const handleMapClick = (event: MapLayerMouseEvent) => {
    const target = event.originalEvent?.target as HTMLElement | null;
    if (target?.closest?.("[data-map-interactive='true']")) {
      return;
    }

    if (!onMapClick) {
      return;
    }

    onMapClick({
      latitude: event.lngLat.lat,
      longitude: event.lngLat.lng,
    });
  };

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
        onClick={handleMapClick}
        style={{ width: "100%", height: "100%" }}
      >
        <InterestPointMarkers
          interestPoints={interestPoints}
          interestPointKinds={interestPointKinds}
        />
        <IncidentMarkers incidents={incidents} />
        <VehicleMarkers vehicles={vehicles} />
        {children}

        <NavigationControl position="bottom-left" showCompass={false} />
      </Map>
    </div>
  );
}
