import { AlertTriangle, Clock, MapPin } from "lucide-react";
import type { Incident } from "@/types/qg";
import { MarkerWithPopover } from "@/components/qg/map/marker-with-popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type IncidentMarkersProps = {
  incidents: Incident[];
};

const severityConfig: Record<
  Incident["severity"],
  { label: string; markerClassName: string; badgeClassName: string }
> = {
  critical: {
    label: "Critique",
    markerClassName: "bg-red-600 text-white ring-2 ring-red-400/80",
    badgeClassName: "border-red-200 bg-red-100 text-red-900",
  },
  high: {
    label: "Élevée",
    markerClassName: "bg-amber-500 text-white ring-2 ring-amber-400/80",
    badgeClassName: "border-amber-200 bg-amber-100 text-amber-900",
  },
  medium: {
    label: "Moyenne",
    markerClassName: "bg-orange-400 text-white ring-2 ring-orange-300/80",
    badgeClassName: "border-orange-200 bg-orange-100 text-orange-900",
  },
  low: {
    label: "Faible",
    markerClassName: "bg-emerald-500 text-white ring-2 ring-emerald-400/80",
    badgeClassName: "border-emerald-200 bg-emerald-100 text-emerald-900",
  },
};

const statusLabels: Record<Incident["status"], string> = {
  new: "Nouveau",
  assigned: "Assigné",
  resolved: "Résolu",
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

        return (
          <MarkerWithPopover
            key={incident.id}
            latitude={incident.location.lat}
            longitude={incident.location.lng}
            anchor="bottom"
            label={incident.title}
            markerClassName={config.markerClassName}
            icon={<AlertTriangle className="h-4 w-4" />}
          >
            <div className="w-72 overflow-hidden rounded-lg">
              {/* Header avec sévérité */}
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2",
                  config.markerClassName,
                )}
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="truncate text-sm font-semibold">
                  {incident.title}
                </span>
              </div>

              {/* Contenu */}
              <div className="space-y-3 bg-white p-3">
                {/* Badges statut et sévérité */}
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", config.badgeClassName)}>
                    {config.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-slate-50 text-xs text-slate-700"
                  >
                    {statusLabels[incident.status]}
                  </Badge>
                </div>

                {/* Description */}
                {incident.description && (
                  <p className="text-sm leading-relaxed text-slate-600">
                    {incident.description}
                  </p>
                )}

                {/* Métadonnées */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>Signalé le {formatDate(incident.reportedAt)}</span>
                  </div>
                  {incident.phases.length > 0 && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>
                        {incident.phases.length} phase
                        {incident.phases.length > 1 ? "s" : ""} :{" "}
                        {incident.phases.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </MarkerWithPopover>
        );
      })}
    </>
  );
}
