"use client";

import type { Vehicle } from "@/types/qg";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Clock, Truck, Users, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  vehicleStatusConfig,
  vehicleTypeLabels,
  formatTime,
} from "./card-configs";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const status = vehicleStatusConfig[vehicle.status];

  return (
    <Collapsible>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Header */}
        <CollapsibleTrigger className="flex w-full items-center gap-2 p-2.5 text-left">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <Truck className="h-3.5 w-3.5 text-slate-600" />
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-slate-900">
                {vehicle.callSign}
              </p>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 px-1.5 py-0 text-[9px]",
                  status.className,
                )}
              >
                {status.label}
              </Badge>
              <span className="truncate">
                {vehicleTypeLabels[vehicle.type] || vehicle.type}
              </span>
            </div>
          </div>

          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
        </CollapsibleTrigger>

        {/* Contenu dépliable */}
        <CollapsibleContent>
          <div className="space-y-1.5 border-t border-slate-100 px-2.5 pb-2.5 pt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
              <Users className="h-3 w-3 text-slate-400" />
              <span>Équipage : {vehicle.crew} pers.</span>
            </div>
            {vehicle.station && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <Warehouse className="h-3 w-3 text-slate-400" />
                <span className="truncate">{vehicle.station}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <Clock className="h-3 w-3" />
              <span>Mis à jour {formatTime(vehicle.updatedAt)}</span>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
