import { Clock, MapPin, Truck, Users } from "lucide-react";
import type { Vehicle } from "@/types/qg";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const vehicleStatusConfig: Record<
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

export const vehicleTypeLabels: Record<Vehicle["type"], string> = {
  VSAV: "Vehicule de Secours",
  FPT: "Fourgon Pompe-Tonne",
  EPA: "Echelle Pivotante",
  VTU: "Vehicule Tout Usage",
};

const formatVehicleDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

type VehicleCardProps = {
  vehicle: Vehicle;
  className?: string;
};

export function VehicleCard({ vehicle, className }: VehicleCardProps) {
  const config = vehicleStatusConfig[vehicle.status];

  return (
    <div className={cn("flex items-start gap-3 p-3", className)}>
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
          {vehicleTypeLabels[vehicle.type]}
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
            {formatVehicleDate(vehicle.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
