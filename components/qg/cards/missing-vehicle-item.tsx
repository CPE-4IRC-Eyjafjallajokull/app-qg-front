"use client";

import type { AssignmentProposalMissing } from "@/types/qg";
import type { ResolverType } from "@/lib/resolver.service";
import { AlertTriangle } from "lucide-react";
import { getVehicleImagePath } from "@/lib/vehicles/images";
import Image from "next/image";
import { cn } from "@/lib/utils";

type MissingVehicleItemProps = {
  item: AssignmentProposalMissing;
  resolve: (type: ResolverType, id: string) => Record<string, unknown> | null;
};

export function MissingVehicleItem({ item, resolve }: MissingVehicleItemProps) {
  const vehicleType = resolve("vehicle_type_id", item.vehicle_type_id) as {
    code?: string;
    label?: string;
  } | null;

  const vehicleTypeCode = vehicleType?.code || "VTU";
  const vehicleTypeLabel = vehicleType?.label || "Type inconnu";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 transition-all",
        "bg-orange-500/10 ring-1 ring-orange-500/30",
      )}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-orange-500/20">
        <Image
          src={getVehicleImagePath(vehicleTypeCode)}
          alt={vehicleTypeCode}
          width={14}
          height={14}
          className="object-contain opacity-70"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium text-orange-300 whitespace-normal">
          {vehicleTypeLabel}
        </p>
        <p className="truncate text-[9px] text-orange-400/60">
          {vehicleTypeCode}
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-orange-400">
        <AlertTriangle className="h-3 w-3" />
        <span className="font-medium">
          {item.missing_quantity} manquant{item.missing_quantity > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
