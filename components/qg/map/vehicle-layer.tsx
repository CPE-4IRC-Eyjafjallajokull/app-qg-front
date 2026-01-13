import { useCallback, useEffect, useMemo, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";
import type { ExpressionSpecification, MapMouseEvent } from "maplibre-gl";
import type { Incident, Vehicle } from "@/types/qg";
import { VehiclePopup } from "@/components/qg/map/vehicle-popup";
import { useInterpolatedVehicles } from "@/hooks/useInterpolatedVehicles";
import { RouteLayer } from "@/components/qg/map/route-layer";

export const VEHICLE_SOURCE_ID = "vehicles-source";
export const VEHICLE_LAYER_ID = "vehicles-layer";

type RouteGeometry = {
  type: "LineString";
  coordinates: number[][];
};

type VehicleAssignmentResponse = {
  incident_phase_id?: string;
  vehicle_id?: string;
};

type RouteResponse = {
  distance_m: number;
  duration_s: number;
  geometry: RouteGeometry;
};

type VehicleLayerProps = {
  vehicles: Vehicle[];
  incidents: Incident[];
};

const vehicleColorExpression: ExpressionSpecification = [
  "match",
  ["get", "status"],
  "available",
  "#059669", // emerald-600
  "engaged",
  "#2563eb", // blue-600
  "out_of_service",
  "#dc2626", // red-600
  "unavailable",
  "#64748b", // slate-500
  "returning",
  "#7c3aed", // violet-600
  "on_intervention",
  "#f97316", // orange-500
  "transport",
  "#0284c7", // sky-600
  "#64748b", // default: slate-500
];

const vehicleStrokeExpression: ExpressionSpecification = [
  "match",
  ["get", "status"],
  "available",
  "#34d399", // emerald-400
  "engaged",
  "#60a5fa", // blue-400
  "out_of_service",
  "#f87171", // red-400
  "unavailable",
  "#94a3b8", // slate-400
  "returning",
  "#a78bfa", // violet-400
  "on_intervention",
  "#fb923c", // orange-400
  "transport",
  "#38bdf8", // sky-400
  "#94a3b8", // default: slate-400
];

export function VehicleLayer({ vehicles, incidents }: VehicleLayerProps) {
  const { current: map } = useMap();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(
    null,
  );
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const interpolatedVehicles = useInterpolatedVehicles(vehicles);

  const vehiclesById = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );

  const findIncidentForVehicle = useCallback(
    (vehicleId: string): Incident | null => {
      for (const incident of incidents) {
        for (const phase of incident.phases) {
          const assignment = phase.vehicleAssignments.find(
            (a) => a.vehicleId === vehicleId && !a.unassignedAt,
          );
          if (assignment) {
            return incident;
          }
        }
      }
      return null;
    },
    [incidents],
  );

  const fetchRoute = useCallback(
    async (vehicle: Vehicle, destination: { lat: number; lng: number }) => {
      try {
        const response = await fetch("/api/geo/route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: {
              latitude: vehicle.location.lat,
              longitude: vehicle.location.lng,
            },
            to: {
              latitude: destination.lat,
              longitude: destination.lng,
            },
            snap_start: false,
          }),
        });
        if (!response.ok) {
          console.error("Failed to fetch route:", response.statusText);
          return;
        }

        const data: RouteResponse = await response.json();
        if (data.geometry?.coordinates?.length >= 2) {
          setRouteGeometry(data.geometry);
          setRouteDuration(data.duration_s);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    },
    [],
  );

  const fetchAssignmentAndRoute = useCallback(
    async (vehicle: Vehicle) => {
      try {
        const response = await fetch(
          `/api/vehicles/${encodeURIComponent(vehicle.callSign)}/assignment`,
        );
        if (!response.ok) {
          console.error("Failed to fetch assignment:", response.statusText);
          return;
        }

        const assignment: VehicleAssignmentResponse = await response.json();
        if (!assignment.incident_phase_id) {
          return;
        }

        // Find the incident containing this phase
        for (const incident of incidents) {
          const phase = incident.phases.find(
            (p) => p.id === assignment.incident_phase_id,
          );
          if (phase) {
            await fetchRoute(vehicle, incident.location);
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
      }
    },
    [incidents, fetchRoute],
  );

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: interpolatedVehicles.map((vehicle) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [vehicle.location.lng, vehicle.location.lat],
        },
        properties: {
          id: vehicle.id,
          status: vehicle.status,
        },
      })),
    }),
    [interpolatedVehicles],
  );

  const fetchRouteForVehicle = useCallback(
    (vehicle: Vehicle) => {
      if (vehicle.status !== "engaged") {
        return;
      }

      // Try to find the incident in local data first
      const incident = findIncidentForVehicle(vehicle.id);
      if (incident) {
        fetchRoute(vehicle, incident.location);
      } else {
        // Fallback to API call to get assignment
        fetchAssignmentAndRoute(vehicle);
      }
    },
    [findIncidentForVehicle, fetchRoute, fetchAssignmentAndRoute],
  );

  useEffect(() => {
    const mapInstance = map?.getMap();
    if (!mapInstance) {
      return;
    }
    const handleClick = (event: MapMouseEvent) => {
      const features = mapInstance.queryRenderedFeatures(event.point, {
        layers: [VEHICLE_LAYER_ID],
      });
      const id = features[0]?.properties?.id;
      const nextSelectedId =
        typeof id === "string" && id.length > 0 ? id : null;
      setSelectedId(nextSelectedId);
      setRouteGeometry(null);
      setRouteDuration(null);
      if (nextSelectedId) {
        const vehicle = vehiclesById.get(nextSelectedId);
        if (vehicle) {
          fetchRouteForVehicle(vehicle);
        }
      }
    };

    mapInstance.on("click", handleClick);
    return () => {
      mapInstance.off("click", handleClick);
    };
  }, [map, vehiclesById, fetchRouteForVehicle]);

  const selectedVehicle =
    selectedId && vehiclesById.has(selectedId)
      ? vehiclesById.get(selectedId)
      : null;

  const handleClose = useCallback(() => {
    setSelectedId(null);
    setRouteGeometry(null);
    setRouteDuration(null);
  }, []);

  const visibleRouteGeometry =
    selectedVehicle?.status === "engaged" ? routeGeometry : null;

  return (
    <>
      <Source id={VEHICLE_SOURCE_ID} type="geojson" data={geojson}>
        <Layer
          id={VEHICLE_LAYER_ID}
          type="circle"
          paint={{
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              9,
              4,
              12,
              6,
              16,
              8,
            ],
            "circle-color": vehicleColorExpression,
            "circle-stroke-color": vehicleStrokeExpression,
            "circle-stroke-width": 2,
            "circle-opacity": 0.95,
          }}
        />
      </Source>
      <RouteLayer geometry={visibleRouteGeometry} beforeId={VEHICLE_LAYER_ID} />
      {selectedVehicle && (
        <VehiclePopup
          vehicle={selectedVehicle}
          onClose={handleClose}
          estimatedArrivalSeconds={
            selectedVehicle.status === "engaged" ? routeDuration : null
          }
        />
      )}
    </>
  );
}
