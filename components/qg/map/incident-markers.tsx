import {
  AlertTriangle,
  Clock,
  MapPin,
  Flame,
  AlertCircle,
  Info,
  Layers,
} from "lucide-react";
import type { Incident } from "@/types/qg";
import { MarkerWithPopover } from "@/components/qg/map/marker-with-popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type IncidentMarkersProps = {
  incidents: Incident[];
};

const severityConfig: Record<
  Incident["severity"],
  {
    label: string;
    markerClassName: string;
    badgeClassName: string;
    headerClassName: string;
    icon: typeof AlertTriangle;
    pulse: boolean;
  }
> = {
  critical: {
    label: "Critique",
    markerClassName:
      "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-500/50 shadow-lg ring-2 ring-red-400/60",
    badgeClassName: "bg-red-500/20 text-red-300 border-red-500/30",
    headerClassName: "bg-gradient-to-r from-red-600 to-red-500",
    icon: Flame,
    pulse: true,
  },
  high: {
    label: "Élevée",
    markerClassName:
      "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/40 shadow-lg ring-2 ring-amber-300/60",
    badgeClassName: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    headerClassName: "bg-gradient-to-r from-amber-500 to-amber-400",
    icon: AlertTriangle,
    pulse: true,
  },
  medium: {
    label: "Moyenne",
    markerClassName:
      "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/40 shadow-lg ring-2 ring-blue-400/50",
    badgeClassName: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    headerClassName: "bg-gradient-to-r from-blue-500 to-blue-400",
    icon: AlertCircle,
    pulse: false,
  },
  low: {
    label: "Faible",
    markerClassName:
      "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/40 shadow-lg ring-2 ring-emerald-300/50",
    badgeClassName: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    headerClassName: "bg-gradient-to-r from-emerald-500 to-emerald-400",
    icon: Info,
    pulse: false,
  },
};

const statusConfig: Record<
  Incident["status"],
  { label: string; className: string; dot: string }
> = {
  new: {
    label: "Nouveau",
    className: "bg-red-500/20 text-red-300 border-red-500/30",
    dot: "bg-red-400",
  },
  assigned: {
    label: "Assigné",
    className: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    dot: "bg-sky-400",
  },
  resolved: {
    label: "Résolu",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
};

const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

export function IncidentMarkers({ incidents }: IncidentMarkersProps) {
  return (
    <>
      {incidents.map((incident) => {
        const config = severityConfig[incident.severity];
        const status = statusConfig[incident.status];
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
            <div className="w-72 overflow-hidden">
              {/* Header avec gradient */}
              <div
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 text-white",
                  config.headerClassName,
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {incident.title}
                  </p>
                  <p className="text-xs text-white/70">
                    ID: {incident.id.slice(0, 8)}
                  </p>
                </div>
              </div>

              {/* Contenu */}
              <div className="space-y-3 p-3">
                {/* Badges statut et severite */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("gap-1.5 text-[10px]", config.badgeClassName)}
                  >
                    <IconComponent className="h-3 w-3" />
                    {config.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("gap-1.5 text-[10px]", status.className)}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", status.dot)}
                    />
                    {status.label}
                  </Badge>
                </div>

                {/* Description */}
                {incident.description && (
                  <p className="text-sm leading-relaxed text-white/70">
                    {incident.description}
                  </p>
                )}

                {/* Metadonnees */}
                <div className="space-y-2 border-t border-white/10 pt-3 text-[11px] text-white/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-white/40" />
                    <span>Signale le {formatDate(incident.reportedAt)}</span>
                  </div>
                  {incident.phases.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
                      <span>
                        {incident.phases.length} phase
                        {incident.phases.length > 1 ? "s" : ""} :{" "}
                        {incident.phases.join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-white/40" />
                    <span>
                      {incident.location.lat.toFixed(4)},{" "}
                      {incident.location.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </MarkerWithPopover>
        );
      })}
    </>
  );
}
