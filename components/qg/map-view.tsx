"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import Map, {
  type MapRef,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import type {
  Incident,
  InterestPoint,
  InterestPointKind,
  ProposalsByIncident,
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
import { InterestPointMarkers } from "@/components/qg/map/interest-point-markers";
import {
  VehicleLayer,
  VEHICLE_LAYER_ID,
} from "@/components/qg/map/vehicle-layer";

type MapViewProps = {
  incidents: Incident[];
  vehicles: Vehicle[];
  interestPoints?: InterestPoint[];
  interestPointKinds?: InterestPointKind[];
  proposalsByIncident: ProposalsByIncident;
  onProposalStatusChange: (
    proposalId: string,
    update: { validated_at?: string | null; rejected_at?: string | null },
  ) => void;
  focusLocation?: { latitude: number; longitude: number; zoom?: number } | null;
  onMapClick?: (location: { latitude: number; longitude: number }) => void;
  children?: ReactNode;
};

export default function MapView({
  incidents,
  vehicles,
  interestPoints = [],
  interestPointKinds = [],
  proposalsByIncident,
  onProposalStatusChange,
  focusLocation = null,
  onMapClick,
  children,
}: MapViewProps) {
  const mapRef = useRef<MapRef | null>(null);
  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (
        event.features?.some((feature) => feature.layer.id === VEHICLE_LAYER_ID)
      ) {
        return;
      }

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
    },
    [onMapClick],
  );

  useEffect(() => {
    if (!focusLocation) {
      return;
    }

    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance) {
      return;
    }

    const targetZoom = Math.min(
      Math.max(focusLocation.zoom ?? MAP_DEFAULT_ZOOM + 3, MAP_MIN_ZOOM),
      MAP_MAX_ZOOM,
    );

    mapInstance.easeTo({
      center: [focusLocation.longitude, focusLocation.latitude],
      zoom: targetZoom,
      duration: 800,
    });
  }, [focusLocation]);

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
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
        interactiveLayerIds={[VEHICLE_LAYER_ID]}
        style={{ width: "100%", height: "100%" }}
      >
        <InterestPointMarkers
          interestPoints={interestPoints}
          interestPointKinds={interestPointKinds}
        />
        <IncidentMarkers
          incidents={incidents}
          proposalsByIncident={proposalsByIncident}
          onProposalStatusChange={onProposalStatusChange}
        />
        <VehicleLayer vehicles={vehicles} incidents={incidents} />
        {children}
      </Map>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent" />
      </div>
    </div>
  );
}
