import { AlertTriangle, Flame, AlertCircle, Info } from "lucide-react";
import type { Incident } from "@/types/qg";
import { MarkerWithPopover } from "@/components/qg/map/marker-with-popover";
import { IncidentMarkerPopoverContent } from "@/components/qg/map/incident-marker-popover-content";

type IncidentMarkersProps = {
  incidents: Incident[];
};

const severityConfig: Record<
  Incident["severity"],
  {
    markerClassName: string;
    icon: typeof AlertTriangle;
    pulse: boolean;
  }
> = {
  critical: {
    markerClassName:
      "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-500/50 shadow-lg ring-2 ring-red-400/60",
    icon: Flame,
    pulse: true,
  },
  high: {
    markerClassName:
      "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/40 shadow-lg ring-2 ring-amber-300/60",
    icon: AlertTriangle,
    pulse: true,
  },
  medium: {
    markerClassName:
      "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/40 shadow-lg ring-2 ring-blue-400/50",
    icon: AlertCircle,
    pulse: false,
  },
  low: {
    markerClassName:
      "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/40 shadow-lg ring-2 ring-emerald-300/50",
    icon: Info,
    pulse: false,
  },
};

export function IncidentMarkers({ incidents }: IncidentMarkersProps) {
  return (
    <>
      {incidents.map((incident) => {
        const config = severityConfig[incident.severity];
        const IconComponent = config.icon;

        return (
          <MarkerWithPopover
            key={incident.id}
            latitude={incident.location.lat}
            longitude={incident.location.lng}
            anchor="bottom"
            label={incident.title}
            markerClassName={config.markerClassName}
            icon={<IconComponent className="h-4 w-4" />}
            pulse={config.pulse}
            size={incident.severity === "critical" ? "lg" : "md"}
          >
            <IncidentMarkerPopoverContent incident={incident} />
          </MarkerWithPopover>
        );
      })}
    </>
  );
}
