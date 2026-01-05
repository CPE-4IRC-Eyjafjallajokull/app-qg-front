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
            <div className="flex items-start gap-3 p-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/70",
                  config.markerClassName,
                )}
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {incident.title}
                </p>
                {incident.description && (
                  <p className="line-clamp-2 text-xs text-slate-600">
                    {incident.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
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
                <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(incident.reportedAt)}
                  </span>
                  {incident.sector && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {incident.sector}
                    </span>
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
