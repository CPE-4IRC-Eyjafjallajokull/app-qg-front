"use client";

import { useState } from "react";
import type {
  VehicleAssignment,
  AssignmentProposalItem,
  AssignmentProposalMissing,
} from "@/types/qg";
import type { ResolverType } from "@/lib/resolver.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  ChevronDown,
  X,
  LoaderCircle,
  RefreshCw,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VehicleItemCompact } from "./vehicle-item-compact";
import { MissingVehicleItem } from "./missing-vehicle-item";
import { type ProposalGroup, getShortProposalId } from "./incident-card-utils";

type PhaseProposalCardProps = {
  phaseId: string;
  incidentId: string;
  proposalGroups: ProposalGroup[];
  vehicleAssignments: VehicleAssignment[];
  phaseEndedAt?: string | null;
  resolve: (type: ResolverType, id: string) => Record<string, unknown> | null;
  onValidate?: (proposalId: string) => Promise<void>;
  onReject?: (proposalId: string) => Promise<void>;
  onRegenerate?: (proposalId: string) => Promise<void>;
  onRequestAssignment?: (incidentId: string, phaseId: string) => Promise<void>;
  isIncidentResolved?: boolean;
};

type ProposalGroupCardProps = {
  group: ProposalGroup;
  resolve: (type: ResolverType, id: string) => Record<string, unknown> | null;
  onValidate?: (proposalId: string) => Promise<void>;
  onReject?: (proposalId: string) => Promise<void>;
  onRegenerate?: (proposalId: string) => Promise<void>;
  isIncidentResolved: boolean;
};

function ProposalGroupCard({
  group,
  resolve,
  onValidate,
  onReject,
  onRegenerate,
  isIncidentResolved,
}: ProposalGroupCardProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const { proposal, items, missing } = group;
  const isPending = !proposal.validated_at && !proposal.rejected_at;
  const isValidated = Boolean(proposal.validated_at);
  const isRejected = Boolean(proposal.rejected_at);
  const shortId = getShortProposalId(proposal.proposal_id);

  const handleValidate = async () => {
    if (!onValidate || isValidating) return;
    setIsValidating(true);
    try {
      await onValidate(proposal.proposal_id);
    } finally {
      setIsValidating(false);
    }
  };

  const handleReject = async () => {
    if (!onReject || isRejecting) return;
    setIsRejecting(true);
    try {
      await onReject(proposal.proposal_id);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleRegenerate = async () => {
    if (!onRegenerate || isRegenerating) return;
    setIsRegenerating(true);
    try {
      await onRegenerate(proposal.proposal_id);
    } finally {
      setIsRegenerating(false);
    }
  };

  const getBorderClass = () => {
    if (isValidated) return "border-emerald-500/40";
    if (isRejected) return "border-red-500/30 opacity-60";
    return "border-blue-500/40";
  };

  const getStatusBadge = () => {
    if (isValidated) {
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/20 text-[9px] text-emerald-400"
        >
          Validé
        </Badge>
      );
    }
    if (isRejected) {
      return (
        <Badge
          variant="outline"
          className="border-red-500/30 bg-red-500/20 text-[9px] text-red-400"
        >
          Refusé
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-blue-500/30 bg-blue-500/20 text-[9px] text-blue-400"
      >
        En attente
      </Badge>
    );
  };

  return (
    <div
      className={cn(
        "rounded-md border bg-white/5 p-2 space-y-2",
        getBorderClass(),
      )}
    >
      {/* Header with proposal ID and status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-white/50">
            #{shortId}
          </code>
          {getStatusBadge()}
        </div>
        {items.length > 0 && (
          <span className="text-[9px] text-white/40">
            {items.length} véhicule{items.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Vehicles in this proposal */}
      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((item: AssignmentProposalItem, idx: number) => (
            <VehicleItemCompact
              key={`${item.vehicle_id}-${idx}`}
              item={{ type: "proposal", data: item }}
              index={idx}
              resolve={resolve}
            />
          ))}
        </div>
      )}

      {/* Missing vehicles in this proposal */}
      {missing.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[9px] font-medium text-orange-400/80 uppercase tracking-wide">
            Manquants
          </p>
          {missing.map((missingItem: AssignmentProposalMissing) => (
            <MissingVehicleItem
              key={`${missingItem.vehicle_type_id}-${missingItem.incident_phase_id}`}
              item={missingItem}
              resolve={resolve}
            />
          ))}
        </div>
      )}

      {/* Action buttons for pending proposals */}
      {isPending && !isIncidentResolved && (
        <div className="flex gap-1 pt-1 border-t border-white/10">
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "border-red-500/30 bg-red-500/10 px-2 text-red-400",
              "hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-300",
              "h-7 w-7",
            )}
            disabled={isRejecting || isValidating || isRegenerating}
            onClick={(e) => {
              e.stopPropagation();
              handleReject();
            }}
            title="Refuser"
          >
            {isRejecting ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className={cn(
              "border-amber-500/30 bg-amber-500/10 px-2 text-amber-400",
              "hover:border-amber-500/50 hover:bg-amber-500/20 hover:text-amber-300",
              "h-7 w-7",
            )}
            disabled={isRejecting || isValidating || isRegenerating}
            onClick={(e) => {
              e.stopPropagation();
              handleRegenerate();
            }}
            title="Régénérer"
          >
            {isRegenerating ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            size="sm"
            className={cn(
              "bg-emerald-600 px-2 text-white",
              "hover:bg-emerald-500",
              "h-7 w-7",
            )}
            disabled={isRejecting || isValidating || isRegenerating}
            onClick={(e) => {
              e.stopPropagation();
              handleValidate();
            }}
            title="Valider"
          >
            {isValidating ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export function PhaseProposalCard({
  phaseId,
  incidentId,
  proposalGroups,
  vehicleAssignments,
  phaseEndedAt,
  resolve,
  onValidate,
  onReject,
  onRegenerate,
  onRequestAssignment,
  isIncidentResolved = false,
}: PhaseProposalCardProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const incidentPhase = resolve("incident_phase_id", phaseId) as {
    phase_type?: {
      code?: string;
      label?: string;
    };
  } | null;

  const phaseLabel = incidentPhase?.phase_type?.label || "Phase inconnue";
  const phaseCode = incidentPhase?.phase_type?.code || "";

  // Filter active assignments (not unassigned)
  const activeAssignments = vehicleAssignments.filter(
    (a) => a.unassignedAt === null || a.unassignedAt === undefined,
  );

  // Compute derived states
  const hasAssignments = activeAssignments.length > 0;
  const hasProposalGroups = proposalGroups.length > 0;
  const pendingProposals = proposalGroups.filter(
    (g) => !g.proposal.validated_at && !g.proposal.rejected_at,
  );
  const hasPendingProposals = pendingProposals.length > 0;
  const totalProposalItems = proposalGroups.reduce(
    (acc, g) => acc + g.items.length + g.missing.length,
    0,
  );
  const hasContent = hasAssignments || hasProposalGroups;
  const totalItems = activeAssignments.length + totalProposalItems;
  const shouldClampContent = totalItems > 6;

  const isPhaseEnded = Boolean(phaseEndedAt);

  if (isPhaseEnded) {
    return (
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5 px-2 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
            <Layers className="h-3.5 w-3.5 text-white/40" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white whitespace-normal">
              {phaseLabel}
            </p>
            {phaseCode && (
              <p className="truncate text-[10px] text-white/40">{phaseCode}</p>
            )}
          </div>
          <Badge
            variant="outline"
            className="border-white/20 bg-white/5 text-[9px] text-white/40"
          >
            Terminé
          </Badge>
        </div>
      </div>
    );
  }

  const handleRequestAssignment = async () => {
    if (!onRequestAssignment || isRequesting) return;
    setIsRequesting(true);
    try {
      await onRequestAssignment(incidentId, phaseId);
    } finally {
      setIsRequesting(false);
    }
  };

  const getBorderColor = () => {
    if (hasAssignments) return "border-emerald-500/30";
    if (hasPendingProposals) return "border-blue-500/30";
    if (hasProposalGroups) return "border-white/20";
    return "border-white/10";
  };

  const getStatusBadge = () => {
    if (hasAssignments) {
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/20 text-[9px] text-emerald-400"
        >
          {activeAssignments.length} affecté
          {activeAssignments.length > 1 ? "s" : ""}
        </Badge>
      );
    }
    if (hasPendingProposals) {
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/20 text-[9px] text-blue-400"
        >
          {pendingProposals.length} proposition
          {pendingProposals.length > 1 ? "s" : ""}
        </Badge>
      );
    }
    if (hasProposalGroups) {
      return (
        <Badge
          variant="outline"
          className="border-white/20 bg-white/5 text-[9px] text-white/40"
        >
          Traité
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-white/20 bg-white/5 text-[9px] text-white/40"
      >
        En attente
      </Badge>
    );
  };

  return (
    <Collapsible defaultOpen={hasContent || hasPendingProposals}>
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-white/5 backdrop-blur-sm transition-all",
          getBorderColor(),
        )}
      >
        <CollapsibleTrigger className="flex w-full items-center gap-2 p-2 text-left">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
              hasAssignments
                ? "bg-emerald-500/20"
                : hasPendingProposals
                  ? "bg-blue-500/20"
                  : "bg-white/10",
            )}
          >
            <Layers
              className={cn(
                "h-3.5 w-3.5",
                hasAssignments
                  ? "text-emerald-400"
                  : hasPendingProposals
                    ? "text-blue-400"
                    : "text-white/40",
              )}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white whitespace-normal">
              {phaseLabel}
            </p>
            {phaseCode && (
              <p className="truncate text-[10px] text-white/40">{phaseCode}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {getStatusBadge()}
            {hasContent && (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/30 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
            )}
          </div>
        </CollapsibleTrigger>

        {hasContent ? (
          <CollapsibleContent>
            <div className="space-y-2 border-t border-white/10 p-2">
              <ScrollArea
                className={cn("pr-2", shouldClampContent ? "h-52" : "h-auto")}
              >
                <div className="space-y-2">
                  {/* Active assignments */}
                  {hasAssignments && (
                    <div className="space-y-1">
                      <p className="text-[9px] font-medium text-emerald-400/80 uppercase tracking-wide">
                        Affectations actives
                      </p>
                      {activeAssignments.map((assignment, idx) => (
                        <VehicleItemCompact
                          key={assignment.id}
                          item={{ type: "assignment", data: assignment }}
                          index={idx}
                          resolve={resolve}
                        />
                      ))}
                    </div>
                  )}

                  {/* Proposal groups - each proposal is displayed separately */}
                  {hasProposalGroups && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-medium text-blue-400/80 uppercase tracking-wide">
                        Propositions
                      </p>
                      {proposalGroups.map((group) => (
                        <ProposalGroupCard
                          key={group.proposal.proposal_id}
                          group={group}
                          resolve={resolve}
                          onValidate={onValidate}
                          onReject={onReject}
                          onRegenerate={onRegenerate}
                          isIncidentResolved={isIncidentResolved}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </CollapsibleContent>
        ) : (
          !isIncidentResolved &&
          onRequestAssignment && (
            <div className="border-t border-white/10 p-2">
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "w-full gap-1.5 border-blue-500/30 bg-blue-500/10 text-blue-400",
                  "hover:border-blue-500/50 hover:bg-blue-500/20 hover:text-blue-300",
                  "h-7",
                )}
                disabled={isRequesting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRequestAssignment();
                }}
              >
                {isRequesting ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span className="text-[10px] font-medium">
                  Demander une affectation
                </span>
              </Button>
            </div>
          )
        )}
      </div>
    </Collapsible>
  );
}
