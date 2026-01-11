"use client";

import type { Vehicle } from "@/types/qg";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Clock,
  LocateFixed,
  Users,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getVehicleImagePath } from "@/lib/vehicles/images";
import Image from "next/image";

const vehicleStatusConfig: Record<
  Vehicle["status"],
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  available: {
    label: "Disponible",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  engaged: {
    label: "Engage",
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
  },
  out_of_service: {
    label: "Hors service",
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-500",
  },
  unavailable: {
    label: "Indisponible",
    bg: "bg-white/10",
    text: "text-white/50",
    border: "border-white/20",
    dot: "bg-white/40",
  },
  returning: {
    label: "Retour",
    bg: "bg-violet-500/20",
    text: "text-violet-400",
    border: "border-violet-500/30",
    dot: "bg-violet-500",
  },
  on_intervention: {
    label: "Intervention",
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
  },
  transport: {
    label: "Transport",
    bg: "bg-sky-500/20",
    text: "text-sky-400",
    border: "border-sky-500/30",
    dot: "bg-sky-500",
  },
};

const formatTime = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

export function VehicleCard({
  vehicle,
  onFocus,
}: {
  vehicle: Vehicle;
  onFocus?: (vehicle: Vehicle) => void;
}) {
  const status = vehicleStatusConfig[vehicle.status];

  return (
    <Collapsible>
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10",
          status.border,
        )}
      >
        <CollapsibleTrigger className="flex w-full items-center gap-2.5 p-2.5 text-left">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg",
              status.bg,
            )}
          >
            <Image
              src={getVehicleImagePath(vehicle.type)}
              alt={vehicle.type}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">
              {vehicle.callSign}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "h-4 gap-1 px-1.5 text-[9px]",
                  status.bg,
                  status.text,
                  status.border,
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                {status.label}
              </Badge>
              <span className="truncate text-[10px] text-white/40">
                {vehicle.type}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div
              role="button"
              tabIndex={0}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:bg-white/10 hover:text-white"
              title="Centrer sur le véhicule"
              aria-label="Centrer sur le véhicule"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onFocus?.(vehicle);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onFocus?.(vehicle);
                }
              }}
            >
              <LocateFixed className="h-3.5 w-3.5" />
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-white/30 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-1.5 border-t border-white/10 px-2.5 pb-2.5 pt-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-white/50">
              <Users className="h-3 w-3 text-white/30" />
              <span>Equipage : {vehicle.crew} pers.</span>
            </div>
            {vehicle.station && (
              <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                <Warehouse className="h-3 w-3 text-white/30" />
                <span className="truncate">{vehicle.station}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-white/30">
              <Clock className="h-3 w-3" />
              <span>Mis a jour {formatTime(vehicle.updatedAt)}</span>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
