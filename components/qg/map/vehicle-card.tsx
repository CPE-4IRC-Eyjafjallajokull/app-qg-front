import {
  Clock,
  Users,
  Warehouse,
  Navigation,
  Radio,
  Timer,
} from "lucide-react";
import type { Vehicle } from "@/types/qg";
import { cn } from "@/lib/utils";
import { getVehicleImagePath } from "@/lib/vehicles/images";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const vehicleStatusConfig: Record<
  Vehicle["status"],
  {
    label: string;
    markerClassName: string;
    dotColor: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    headerClassName: string;
    pulse: boolean;
  }
> = {
  available: {
    label: "Disponible",
    markerClassName:
      "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/40 shadow-lg ring-2 ring-emerald-300/50",
    dotColor: "bg-emerald-400",
    bgColor: "bg-emerald-500/20",
    textColor: "text-emerald-300",
    borderColor: "border-emerald-500/30",
    headerClassName: "bg-gradient-to-r from-emerald-600 to-emerald-500",
    pulse: false,
  },
  engaged: {
    label: "Engage",
    markerClassName:
      "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-500/40 shadow-lg ring-2 ring-blue-300/50",
    dotColor: "bg-blue-400",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-300",
    borderColor: "border-blue-500/30",
    headerClassName: "bg-gradient-to-r from-blue-600 to-blue-500",
    pulse: true,
  },
  out_of_service: {
    label: "Hors service",
    markerClassName:
      "bg-gradient-to-br from-red-400 to-red-600 text-white shadow-red-500/40 shadow-lg ring-2 ring-red-300/50",
    dotColor: "bg-red-400",
    bgColor: "bg-red-500/20",
    textColor: "text-red-300",
    borderColor: "border-red-500/30",
    headerClassName: "bg-gradient-to-r from-red-600 to-red-500",
    pulse: false,
  },
  unavailable: {
    label: "Indisponible",
    markerClassName:
      "bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-slate-500/40 shadow-lg ring-2 ring-slate-300/50",
    dotColor: "bg-white/40",
    bgColor: "bg-white/10",
    textColor: "text-white/50",
    borderColor: "border-white/20",
    headerClassName: "bg-gradient-to-r from-slate-600 to-slate-500",
    pulse: false,
  },
  returning: {
    label: "Retour",
    markerClassName:
      "bg-gradient-to-br from-violet-400 to-violet-600 text-white shadow-violet-500/40 shadow-lg ring-2 ring-violet-300/50",
    dotColor: "bg-violet-400",
    bgColor: "bg-violet-500/20",
    textColor: "text-violet-300",
    borderColor: "border-violet-500/30",
    headerClassName: "bg-gradient-to-r from-violet-600 to-violet-500",
    pulse: false,
  },
  on_intervention: {
    label: "Intervention",
    markerClassName:
      "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-500/40 shadow-lg ring-2 ring-orange-300/50",
    dotColor: "bg-orange-400",
    bgColor: "bg-orange-500/20",
    textColor: "text-orange-300",
    borderColor: "border-orange-500/30",
    headerClassName: "bg-gradient-to-r from-orange-500 to-orange-400",
    pulse: true,
  },
  transport: {
    label: "Transport",
    markerClassName:
      "bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-sky-500/40 shadow-lg ring-2 ring-sky-300/50",
    dotColor: "bg-sky-400",
    bgColor: "bg-sky-500/20",
    textColor: "text-sky-300",
    borderColor: "border-sky-500/30",
    headerClassName: "bg-gradient-to-r from-sky-600 to-sky-500",
    pulse: true,
  },
};

const formatVehicleTime = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

type VehicleCardProps = {
  vehicle: Vehicle;
  className?: string;
  estimatedArrivalSeconds?: number | null;
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }
  return `${minutes} min ${remainingSeconds}s`;
};

export function VehicleCard({
  vehicle,
  className,
  estimatedArrivalSeconds,
}: VehicleCardProps) {
  const config = vehicleStatusConfig[vehicle.status];

  return (
    <div className={cn("w-72 overflow-hidden", className)}>
      {/* Header avec gradient */}
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 text-white",
          config.headerClassName,
        )}
      >
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/20 shadow-inner">
          <Image
            src={getVehicleImagePath(vehicle.type)}
            alt={vehicle.type}
            width={32}
            height={32}
            className="object-cover drop-shadow"
          />
          {config.pulse && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-white shadow-lg" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-white/70" />
            <p className="truncate text-sm font-semibold">{vehicle.callSign}</p>
          </div>
          <p className="truncate text-xs text-white/70">{vehicle.type}</p>
        </div>
      </div>

      {/* Contenu */}
      <div className="space-y-3 p-3">
        {/* Badge statut */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 text-[10px]",
              config.bgColor,
              config.textColor,
              config.borderColor,
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                config.dotColor,
                config.pulse && "animate-pulse",
              )}
            />
            {config.label}
          </Badge>
        </div>

        {/* ETA - Temps d'arrivée estimé */}
        {estimatedArrivalSeconds != null && estimatedArrivalSeconds > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2">
            <Timer className="h-4 w-4 shrink-0 text-blue-400" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-blue-300/70">
                Arrivée estimée
              </span>
              <span className="text-sm font-medium text-blue-300">
                {formatDuration(estimatedArrivalSeconds)}
              </span>
            </div>
          </div>
        )}

        {/* Metadonnees */}
        <div className="space-y-2 border-t border-white/10 pt-3 text-[11px] text-white/50">
          {vehicle.crew > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 shrink-0 text-white/40" />
              <span>Equipage : {vehicle.crew} personnes</span>
            </div>
          )}
          {vehicle.station && (
            <div className="flex items-center gap-2">
              <Warehouse className="h-3.5 w-3.5 shrink-0 text-white/40" />
              <span className="truncate">{vehicle.station}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Navigation className="h-3.5 w-3.5 shrink-0 text-white/40" />
            <span>
              {vehicle.location.lat.toFixed(4)},{" "}
              {vehicle.location.lng.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-white/40" />
            <span>Mis a jour a {formatVehicleTime(vehicle.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
