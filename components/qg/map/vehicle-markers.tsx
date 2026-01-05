import { Clock, MapPin, Truck, Users } from "lucide-react";
import type { Vehicle } from "@/types/qg";
import { MarkerWithPopover } from "@/components/qg/map/marker-with-popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type VehicleMarkersProps = {
  vehicles: Vehicle[];
};

const statusConfig: Record<
  Vehicle["status"],
  { label: string; markerClassName: string; badgeClassName: string }
> = {
  available: {
    label: "Disponible",
    markerClassName: "bg-emerald-600 text-white ring-2 ring-emerald-400/80",
    badgeClassName: "border-emerald-200 bg-emerald-100 text-emerald-900",
  },
  busy: {
    label: "En intervention",
    markerClassName: "bg-slate-900 text-white ring-2 ring-slate-600/80",
    badgeClassName: "border-slate-200 bg-slate-100 text-slate-900",
  },
  maintenance: {
    label: "Maintenance",
    markerClassName: "bg-amber-400 text-white ring-2 ring-amber-300/80",
    badgeClassName: "border-amber-200 bg-amber-100 text-amber-900",
  },
};

const typeLabels: Record<Vehicle["type"], string> = {
  VSAV: "Véhicule de Secours",
  FPT: "Fourgon Pompe-Tonne",
  EPA: "Échelle Pivotante",
  VTU: "Véhicule Tout Usage",
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

export function VehicleMarkers({ vehicles }: VehicleMarkersProps) {
  return (
    <>
      {vehicles.map((vehicle) => {
        const config = statusConfig[vehicle.status];

        return (
          <MarkerWithPopover
            key={vehicle.id}
            latitude={vehicle.location.lat}
            longitude={vehicle.location.lng}
            anchor="center"
            label={vehicle.callSign}
            markerClassName={cn("h-7 w-7", config.markerClassName)}
            icon={<Truck className="h-4 w-4" />}
          >
            <div className="flex items-start gap-3 p-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/70",
                  config.markerClassName,
                )}
              >
                <Truck className="h-4 w-4" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {vehicle.callSign}
                </p>
                <p className="text-xs text-slate-600">
                  {typeLabels[vehicle.type]}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Badge className={cn("text-xs", config.badgeClassName)}>
                    {config.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-slate-50 text-xs text-slate-700"
                  >
                    {vehicle.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                  {vehicle.crew > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {vehicle.crew}
                    </span>
                  )}
                  {vehicle.station && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {vehicle.station}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(vehicle.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </MarkerWithPopover>
        );
      })}
    </>
  );
}
