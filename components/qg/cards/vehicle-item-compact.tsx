"use client";

import type { AssignmentProposalItem, VehicleAssignment } from "@/types/qg";
import type { ResolverType } from "@/lib/resolver.service";
import { Route, Clock, Fuel, CheckCircle2, Loader2 } from "lucide-react";
import { getVehicleImagePath } from "@/lib/vehicles/images";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type VehicleItemData =
  | { type: "proposal"; data: AssignmentProposalItem }
  | { type: "assignment"; data: VehicleAssignment };

type VehicleItemCompactProps = {
  item: VehicleItemData;
  index: number;
  resolve: (type: ResolverType, id: string) => Record<string, unknown> | null;
  isSelected?: boolean;
};

export function VehicleItemCompact({
  item,
  index,
  resolve,
  isSelected = false,
}: VehicleItemCompactProps) {
  const vehicleId =
    item.type === "proposal" ? item.data.vehicle_id : item.data.vehicleId;

  const vehicle = resolve("vehicle_id", vehicleId) as {
    immatriculation?: string;
    vehicle_type?: { code?: string; label?: string };
  } | null;

  const vehicleImmat = vehicle?.immatriculation || `Véhicule ${index + 1}`;
  const vehicleTypeCode = vehicle?.vehicle_type?.code || "VTU";

  const isAssignment = item.type === "assignment";
  const isValidated = isAssignment && item.data.validatedAt !== null;
  const isUnassigned = isAssignment && item.data.unassignedAt !== null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 transition-all",
        isSelected
          ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
          : isUnassigned
            ? "bg-red-500/5 opacity-50"
            : isValidated
              ? "bg-emerald-500/5 ring-1 ring-emerald-500/20"
              : "bg-white/5 hover:bg-white/10",
      )}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/10">
        <Image
          src={getVehicleImagePath(vehicleTypeCode)}
          alt={vehicleTypeCode}
          width={14}
          height={14}
          className="object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium text-white">
          {vehicleImmat}
        </p>
        {vehicleTypeCode && (
          <p className="truncate text-[9px] text-white/40">{vehicleTypeCode}</p>
        )}
      </div>

      {item.type === "proposal" ? (
        <div className="flex items-center gap-2 text-[10px] text-white/50">
          <span className="flex items-center gap-0.5" title="Distance">
            <Route className="h-3 w-3 text-blue-400" />
            {item.data.distance_km.toFixed(1)}km
          </span>
          <span className="flex items-center gap-0.5" title="Temps estimé">
            <Clock className="h-3 w-3 text-purple-400" />
            {item.data.estimated_time_min.toFixed(0)}min
          </span>
          <span className="flex items-center gap-0.5" title="Niveau énergie">
            <Fuel className="h-3 w-3 text-amber-400" />
            {(item.data.energy_level * 100).toFixed(0)}%
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[10px]">
          {isUnassigned ? (
            <span className="flex items-center gap-1 text-red-400/70">
              Désaffecté
            </span>
          ) : isValidated ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Assigné
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              En cours
            </span>
          )}
        </div>
      )}
    </div>
  );
}
