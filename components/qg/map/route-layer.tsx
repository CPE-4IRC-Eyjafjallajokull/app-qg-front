import { useMemo } from "react";
import { Layer, Source } from "react-map-gl/maplibre";

export const ROUTE_SOURCE_ID = "vehicle-route-source";
export const ROUTE_LAYER_ID = "vehicle-route-layer";
export const ROUTE_CASING_LAYER_ID = "vehicle-route-casing-layer";

type RouteGeometry = {
  type: "LineString";
  coordinates: number[][];
};

type RouteLayerProps = {
  geometry: RouteGeometry | null;
  beforeId?: string;
};

export function RouteLayer({ geometry, beforeId }: RouteLayerProps) {
  const geojson = useMemo(() => {
    if (!geometry || geometry.coordinates.length < 2) {
      return null;
    }

    return {
      type: "Feature" as const,
      geometry,
      properties: {},
    };
  }, [geometry]);

  if (!geojson) {
    return null;
  }

  return (
    <Source id={ROUTE_SOURCE_ID} type="geojson" data={geojson} lineMetrics>
      {/* Soft glow for depth */}
      <Layer
        id={`${ROUTE_LAYER_ID}-glow`}
        type="line"
        beforeId={beforeId}
        paint={{
          "line-color": "#60a5fa",
          "line-width": ["interpolate", ["linear"], ["zoom"], 9, 10, 14, 16],
          "line-opacity": 0.35,
          "line-blur": 6,
        }}
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
      />
      {/* Route casing (border effect) */}
      <Layer
        id={ROUTE_CASING_LAYER_ID}
        type="line"
        beforeId={beforeId}
        paint={{
          "line-color": "#0f172a",
          "line-width": ["interpolate", ["linear"], ["zoom"], 9, 6, 14, 10],
          "line-opacity": 0.85,
        }}
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
      />
      {/* Main route line */}
      <Layer
        id={ROUTE_LAYER_ID}
        type="line"
        beforeId={beforeId}
        paint={{
          "line-gradient": [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            "#7dd3fc",
            0.5,
            "#60a5fa",
            1,
            "#2563eb",
          ],
          "line-width": ["interpolate", ["linear"], ["zoom"], 9, 4, 14, 7],
          "line-opacity": 0.95,
        }}
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
      />
    </Source>
  );
}
