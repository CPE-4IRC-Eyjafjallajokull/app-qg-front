"use client";

import type { AssignmentProposal } from "@/types/qg";
import type { ResolverType } from "@/lib/resolver.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Check, ChevronDown, Fuel, Route, X, LoaderCircle } from "lucide-react";
import { formatTime } from "./card-configs";
import { getVehicleImagePath } from "@/lib/vehicles/images";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";

type AssignmentCardProps = {
  assignment: AssignmentProposal;
  resolve: (type: ResolverType, id: string) => Record<string, unknown> | null;
  onValidate?: (assignmentId: string) => void | Promise<void>;
  onReject?: (assignmentId: string) => void;
};

export function AssignmentCard({
  assignment,
  resolve,
  onValidate,
  onReject,
}: AssignmentCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const incident = resolve("incident_id", assignment.incident_id) as {
    address?: string;
    city?: string;
    zipcode?: string;
    title?: string;
  } | null;

  const handleValidate = async (assignmentId: string) => {
    if (!onValidate) {
      return;
    }
    setIsLoading(true);
    try {
      await onValidate(assignmentId);
    } finally {
      setIsLoading(false);
    }
  };

  const incidentLabel = incident
    ? `${incident.address || ""}, ${incident.zipcode || ""} ${incident.city || ""}`.trim()
    : "Incident";

  return (
    <Collapsible defaultOpen>
      <div className="overflow-hidden rounded-xl border border-blue-500/30 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10">
        {/* Header */}
        <CollapsibleTrigger className="flex w-full items-center gap-2.5 p-2.5 text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
            <Route className="h-4 w-4 text-blue-400" />
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">
              {incidentLabel || "Assignment"}
            </p>
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
              <Badge
                variant="outline"
                className="h-4 shrink-0 gap-1 border-blue-500/30 bg-blue-500/20 px-1.5 text-[9px] text-blue-400"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {assignment.proposals.length} prop.
              </Badge>
              <span className="truncate text-[10px] text-white/40">
                {formatTime(assignment.generated_at)}
              </span>
            </div>
          </div>

          <ChevronDown className="h-4 w-4 shrink-0 text-white/30 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-2.5 border-t border-white/10 p-2.5">
            <div className="space-y-2.5">
              {(() => {
                // Grouper les propositions par phase
                const proposalsByPhase = assignment.proposals.reduce(
                  (acc, proposal, idx) => {
                    const incidentPhase = resolve(
                      "incident_phase_id",
                      proposal.incident_phase_id,
                    ) as {
                      phase_type: {
                        code?: string;
                        label?: string;
                      };
                    } | null;

                    const phaseLabel =
                      incidentPhase?.phase_type.label || "Phase inconnue";

                    if (!acc[phaseLabel]) {
                      acc[phaseLabel] = [];
                    }

                    acc[phaseLabel].push({ proposal, idx });
                    return acc;
                  },
                  {} as Record<
                    string,
                    Array<{
                      proposal: (typeof assignment.proposals)[0];
                      idx: number;
                    }>
                  >,
                );

                return Object.entries(proposalsByPhase).map(
                  ([phaseLabel, proposals]) => (
                    <div key={phaseLabel} className="space-y-2">
                      {/* En-tête de phase */}
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
                        <Badge
                          variant="outline"
                          className="shrink-0 border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400"
                        >
                          {phaseLabel} ({proposals.length})
                        </Badge>
                        <div className="h-px flex-1 bg-gradient-to-l from-blue-500/30 to-transparent" />
                      </div>

                      {/* Véhicules de cette phase */}
                      <div className="space-y-1.5">
                        {proposals.map(({ proposal, idx }) => {
                          const vehicle = resolve(
                            "vehicle_id",
                            proposal.vehicle_id,
                          ) as {
                            immatriculation?: string;
                            vehicle_type?: { code?: string; label?: string };
                          } | null;

                          const vehicleLabel =
                            vehicle?.immatriculation ||
                            vehicle?.vehicle_type?.code ||
                            `Véhicule ${idx + 1}`;

                          const vehicleType =
                            vehicle?.vehicle_type?.label ||
                            vehicle?.vehicle_type?.code ||
                            "";

                          const vehicleTypeCode =
                            vehicle?.vehicle_type?.code || "VTU";

                          return (
                            <div
                              key={`${proposal.vehicle_id}-${idx}`}
                              className="overflow-hidden rounded-lg border border-white/10 bg-white/5"
                            >
                              <div className="space-y-1.5 p-2">
                                {/* Header avec véhicule et score */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
                                      <Image
                                        src={getVehicleImagePath(
                                          vehicleTypeCode,
                                        )}
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

                                {/* Métriques */}
                                <div className="flex items-center gap-2 text-[11px]">
                                  <div className="flex flex-1 items-center gap-1 rounded-md bg-white/5 px-1.5 py-1 text-white/60">
                                    <Route className="h-3 w-3 shrink-0 text-blue-400" />
                                    <span className="truncate font-medium">
                                      {proposal.distance_km.toFixed(1)} km
                                    </span>
                                  </div>
                                  <div className="flex flex-1 items-center gap-1 rounded-md bg-white/5 px-1.5 py-1 text-white/60">
                                    <Fuel className="h-3 w-3 shrink-0 text-amber-400" />
                                    <span className="truncate font-medium">
                                      {(proposal.energy_level * 100).toFixed(0)}
                                      %
                                    </span>
                                  </div>
                                </div>

                                {/* Justification */}
                                {proposal.rationale && (
                                  <div className="rounded-md bg-white/5 p-1.5">
                                    <p className="text-[10px] leading-relaxed text-white/50">
                                      {proposal.rationale}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ),
                );
              })()}
            </div>

            {/* Actions globales */}
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "flex-1 gap-1.5 border-red-500/30 bg-red-500/10 text-red-400",
                  "hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-300",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onReject?.(assignment.proposal_id);
                }}
              >
                <X className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Refuser</span>
              </Button>
              <Button
                size="sm"
                className={cn(
                  "flex-1 gap-1.5 bg-emerald-600 text-white",
                  "hover:bg-emerald-500",
                )}
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleValidate(assignment.proposal_id);
                }}
              >
                {isLoading ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span className="text-xs font-medium">Valider</span>
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
