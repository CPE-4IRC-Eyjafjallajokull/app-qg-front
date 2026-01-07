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
import { Check, ChevronDown, Fuel, Route, Truck, X } from "lucide-react";
import { formatTime } from "./card-configs";

type AssignmentCardProps = {
  assignment: AssignmentProposal;
  resolve: (type: ResolverType, id: string) => Record<string, unknown> | null;
  onValidate?: (assignmentId: string) => void;
  onReject?: (assignmentId: string) => void;
};

export function AssignmentCard({
  assignment,
  resolve,
  onValidate,
  onReject,
}: AssignmentCardProps) {
  const incident = resolve("incident_id", assignment.incident_id) as {
    address?: string;
    city?: string;
    zipcode?: string;
    title?: string;
  } | null;

  const incidentLabel = incident
    ? `${incident.address || ""}, ${incident.zipcode || ""} ${incident.city || ""}`.trim()
    : "Incident";

  return (
    <Collapsible defaultOpen>
      <div className="overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Header */}
        <CollapsibleTrigger className="flex w-full items-center gap-2 p-2.5 text-left">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <Route className="h-3.5 w-3.5 text-blue-600" />
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-slate-900 text-wrap">
              {incidentLabel || "Assignment"}
            </p>
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-slate-500">
              <Badge className="shrink-0 bg-blue-600 px-1.5 py-0 text-[9px] text-white">
                {assignment.proposals.length} prop.
              </Badge>
              <span className="truncate">
                {formatTime(assignment.generated_at)}
              </span>
            </div>
          </div>

          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
        </CollapsibleTrigger>

        {/* Contenu dépliable - Propositions */}
        <CollapsibleContent>
          <div className="space-y-2 border-t border-slate-100 p-2.5">
            {/* Propositions groupées par phase */}
            <div className="space-y-2">
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
                    <div key={phaseLabel} className="space-y-1.5">
                      {/* En-tête de phase */}
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent" />
                        <Badge
                          variant="outline"
                          className="shrink-0 border-blue-300 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
                        >
                          {phaseLabel} ({proposals.length})
                        </Badge>
                        <div className="h-px flex-1 bg-gradient-to-l from-blue-200 to-transparent" />
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

                          return (
                            <div
                              key={`${proposal.vehicle_id}-${idx}`}
                              className="overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50/50 to-slate-50/50 shadow-sm"
                            >
                              <div className="space-y-1.5 p-2">
                                {/* Header avec véhicule et score */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-100">
                                      <Truck className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                      <span className="truncate text-xs font-semibold text-slate-900">
                                        {vehicleLabel}
                                      </span>
                                      {vehicleType && (
                                        <span className="truncate text-[10px] text-slate-500">
                                          {vehicleType}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <Badge
                                    variant="outline"
                                    className="shrink-0 border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
                                  >
                                    {proposal.score.toFixed(2)}
                                  </Badge>
                                </div>

                                {/* Métriques */}
                                <div className="flex items-center gap-2 text-[11px]">
                                  <div className="flex flex-1 items-center gap-1 rounded-md bg-white/60 px-1.5 py-1 text-slate-600">
                                    <Route className="h-3 w-3 shrink-0 text-blue-500" />
                                    <span className="truncate font-medium">
                                      {proposal.distance_km.toFixed(1)} km
                                    </span>
                                  </div>
                                  <div className="flex flex-1 items-center gap-1 rounded-md bg-white/60 px-1.5 py-1 text-slate-600">
                                    <Fuel className="h-3 w-3 shrink-0 text-amber-500" />
                                    <span className="truncate font-medium">
                                      {(proposal.energy_level * 100).toFixed(0)}
                                      %
                                    </span>
                                  </div>
                                </div>

                                {/* Justification */}
                                {proposal.rationale && (
                                  <div className="rounded-md bg-white/60 p-1.5">
                                    <p className="text-[10px] leading-relaxed text-slate-600">
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
                className="flex-1 gap-1.5 border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject?.(assignment.proposal_id);
                }}
              >
                <X className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  Refuser l&apos;assignment
                </span>
              </Button>
              <Button
                size="sm"
                className="flex-1 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onValidate?.(assignment.proposal_id);
                }}
              >
                <Check className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  Valider l&apos;assignment
                </span>
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
