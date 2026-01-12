"use client";

import type { AssignmentProposalItem } from "@/types/qg";
import type { ResolverType } from "@/lib/resolver.service";
import { Badge } from "@/components/ui/badge";
import { Fuel, Route, Clock } from "lucide-react";
import { getVehicleImagePath } from "@/lib/vehicles/images";
import Image from "next/image";

type VehicleProposalItemProps = {
  proposal: AssignmentProposalItem;
  index: number;
  resolve: (type: ResolverType, id: string) => Record<string, unknown> | null;
  isSelected?: boolean;
};

export function VehicleProposalItem({
  proposal,
  index,
  resolve,
  isSelected = false,
}: VehicleProposalItemProps) {
  const vehicle = resolve("vehicle_id", proposal.vehicle_id) as {
    immatriculation?: string;
    vehicle_type?: { code?: string; label?: string };
  } | null;

  const vehicleLabel =
    vehicle?.immatriculation ||
    vehicle?.vehicle_type?.code ||
    `Vehicule ${index + 1}`;

  const vehicleType =
    vehicle?.vehicle_type?.label || vehicle?.vehicle_type?.code || "";

  const vehicleTypeCode = vehicle?.vehicle_type?.code || "VTU";

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-white/5 transition-all ${
        isSelected
          ? "border-emerald-500/50 bg-emerald-500/10"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <div className="space-y-1.5 p-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
              <Image
                src={getVehicleImagePath(vehicleTypeCode)}
                alt={vehicleTypeCode}
                width={18}
                height={18}
                className="object-contain"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-medium text-white">
                {vehicleLabel}
              </span>
              {vehicleType && (
                <span className="truncate text-[10px] text-white/40 break-words whitespace-normal">
                  {vehicleType}
                </span>
              )}
            </div>
          </div>

          <Badge
            variant="outline"
            className="shrink-0 border-emerald-500/30 bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400"
          >
            {proposal.score.toFixed(2)}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <div className="flex flex-1 items-center gap-1 rounded-md bg-white/5 px-1.5 py-1 text-white/60">
            <Route className="h-3 w-3 shrink-0 text-blue-400" />
            <span className="truncate font-medium">
              {proposal.distance_km.toFixed(1)} km
            </span>
          </div>
          <div className="flex flex-1 items-center gap-1 rounded-md bg-white/5 px-1.5 py-1 text-white/60">
            <Clock className="h-3 w-3 shrink-0 text-purple-400" />
            <span className="truncate font-medium">
              {proposal.estimated_time_min.toFixed(0)} min
            </span>
          </div>
          <div className="flex flex-1 items-center gap-1 rounded-md bg-white/5 px-1.5 py-1 text-white/60">
            <Fuel className="h-3 w-3 shrink-0 text-amber-400" />
            <span className="truncate font-medium">
              {(proposal.energy_level * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
