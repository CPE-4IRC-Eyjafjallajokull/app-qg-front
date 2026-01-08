import { useEffect, useMemo, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";
import type { ExpressionSpecification, MapMouseEvent } from "maplibre-gl";
import type { Vehicle } from "@/types/qg";
import { VehiclePopup } from "@/components/qg/map/vehicle-popup";

export const VEHICLE_SOURCE_ID = "vehicles-source";
export const VEHICLE_LAYER_ID = "vehicles-layer";

type VehicleLayerProps = {
  vehicles: Vehicle[];
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

export function VehicleLayer({ vehicles }: VehicleLayerProps) {
  const { current: map } = useMap();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const vehiclesById = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: vehicles.map((vehicle) => ({
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
    [vehicles],
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
      if (typeof id === "string" && id.length > 0) {
        setSelectedId(id);
        return;
      }
      setSelectedId(null);
    };

    mapInstance.on("click", handleClick);
    return () => {
      mapInstance.off("click", handleClick);
    };
  }, [map]);

  const selectedVehicle =
    selectedId && vehiclesById.has(selectedId)
      ? vehiclesById.get(selectedId)
      : null;

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
      {selectedVehicle && (
        <VehiclePopup
          vehicle={selectedVehicle}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
