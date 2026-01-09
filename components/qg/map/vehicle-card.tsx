import { Clock, MapPin, Users } from "lucide-react";
import type { Vehicle } from "@/types/qg";
import { cn } from "@/lib/utils";
import { getVehicleImagePath } from "@/lib/vehicles/images";
import Image from "next/image";

export const vehicleStatusConfig: Record<
  Vehicle["status"],
  {
    label: string;
    markerClassName: string;
    dotColor: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  available: {
    label: "Disponible",
    markerClassName: "bg-emerald-600 text-white ring-2 ring-emerald-400/80",
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  engaged: {
    label: "Engagé",
    markerClassName: "bg-blue-600 text-white ring-2 ring-blue-400/80",
    dotColor: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  out_of_service: {
    label: "Hors service",
    markerClassName: "bg-red-600 text-white ring-2 ring-red-400/80",
    dotColor: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
  unavailable: {
    label: "Indisponible",
    markerClassName: "bg-slate-500 text-white ring-2 ring-slate-400/80",
    dotColor: "bg-slate-400",
    bgColor: "bg-slate-50",
    textColor: "text-slate-600",
    borderColor: "border-slate-200",
  },
  returning: {
    label: "Retour",
    markerClassName: "bg-violet-600 text-white ring-2 ring-violet-400/80",
    dotColor: "bg-violet-500",
    bgColor: "bg-violet-50",
    textColor: "text-violet-700",
    borderColor: "border-violet-200",
  },
  on_intervention: {
    label: "Sur intervention",
    markerClassName: "bg-orange-500 text-white ring-2 ring-orange-400/80",
    dotColor: "bg-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
  },
  transport: {
    label: "Transport",
    markerClassName: "bg-sky-600 text-white ring-2 ring-sky-400/80",
    dotColor: "bg-sky-500",
    bgColor: "bg-sky-50",
    textColor: "text-sky-700",
    borderColor: "border-sky-200",
  },
};

export const vehicleTypeLabels: Record<Vehicle["type"], string> = {
  VSAV: "Véhicule de Secours",
  FPT: "Fourgon Pompe-Tonne",
  EPA: "Échelle Pivotante",
  VTU: "Véhicule Tout Usage",
  BEA: "Bateau Échelle Autopompe",
  CCF: "Camion Citerne Feux de Forêt",
  CCGC: "Camion Citerne Grande Capacité",
  FPTSR: "Fourgon Pompe Tonne Secours Routier",
  PC_Mobile: "Poste de Commandement Mobile",
  VAR: "Véhicule d'Assistance Respiratoire",
  VIRT: "Véhicule d'Intervention Robotisé Téléopéré",
  VLCG: "Véhicule de Liaison et de Commandement de Groupe",
  VLM: "Véhicule Léger Médicalisé",
  VLR: "Véhicule Léger de Reconnaissance",
  VPI: "Véhicule de Premier Intervention",
  VSR: "Véhicule de Secours Routier",
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
};

export function VehicleCard({ vehicle, className }: VehicleCardProps) {
  const config = vehicleStatusConfig[vehicle.status];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-white p-3 shadow-sm",
        config.borderColor,
        className,
      )}
    >
      {/* Status indicator bar */}
      <div
        className={cn("absolute inset-y-0 left-0 w-1", config.dotColor)}
        aria-hidden="true"
      />

      <div className="flex gap-3 pl-2">
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            config.bgColor,
          )}
        >
          <Image
            src={getVehicleImagePath(vehicle.type)}
            alt={vehicle.type}
            width={24}
            height={24}
            className="object-contain"
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {vehicle.callSign}
              </p>
              <p className="text-xs text-slate-500">{vehicle.type}</p>
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
                config.bgColor,
                config.textColor,
              )}
            >
              <span
                className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)}
              />
              {config.label}
            </span>
          </div>

          {/* Type label */}
          <p className="mt-1 truncate text-xs text-slate-600">
            {vehicleTypeLabels[vehicle.type]}
          </p>

          {/* Metadata */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            {vehicle.crew > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {vehicle.crew} pers.
              </span>
            )}
            {vehicle.station && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="max-w-[100px] truncate">
                  {vehicle.station}
                </span>
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatVehicleTime(vehicle.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
