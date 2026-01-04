import { AlertTriangle } from "lucide-react";
import type { Incident } from "@/types/qg";
import { MapMarker } from "@/components/qg/map/map-marker";
import { cn } from "@/lib/utils";

type IncidentMarkersProps = {
  incidents: Incident[];
};

const incidentTone: Record<Incident["severity"], string> = {
  critical: "bg-red-600 text-white",
  high: "bg-amber-500 text-white",
  medium: "bg-orange-400 text-white",
  low: "bg-emerald-500 text-white",
};

export function IncidentMarkers({ incidents }: IncidentMarkersProps) {
  return (
    <>
      {incidents.map((incident) => (
        <MapMarker
          key={incident.id}
          latitude={incident.location.lat}
          longitude={incident.location.lng}
          anchor="bottom"
          label={incident.title}
          className={cn("h-8 w-8 shadow-lg", incidentTone[incident.severity])}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      ))}
    </>
  );
}
