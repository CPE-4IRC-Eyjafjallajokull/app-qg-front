"use client";

import { useState } from "react";
import type {
  AssignmentProposal,
  AssignmentProposalItem,
  VehicleAssignment,
} from "@/types/qg";
import type { ResolverType } from "@/lib/resolver.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

type PhaseProposalCardProps = {
  phaseId: string;
  incidentId: string;
  proposal: AssignmentProposal | null;
  proposalItems: AssignmentProposalItem[];
  vehicleAssignments: VehicleAssignment[];
  phaseEndedAt?: string | null;
  resolve: (type: ResolverType, id: string) => Record<string, unknown> | null;
  onValidate?: (proposalId: string) => Promise<void>;
  onReject?: (proposalId: string) => Promise<void>;
  onRegenerate?: (proposalId: string) => Promise<void>;
  onRequestAssignment?: (incidentId: string, phaseId: string) => Promise<void>;
  isIncidentResolved?: boolean;
};

export function PhaseProposalCard({
  phaseId,
  incidentId,
  proposal,
  proposalItems,
  vehicleAssignments,
  phaseEndedAt,
  resolve,
  onValidate,
  onReject,
  onRegenerate,
  onRequestAssignment,
  isIncidentResolved = false,
}: PhaseProposalCardProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
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
  const hasAssignments = activeAssignments.length > 0;
  const hasProposals = proposalItems.length > 0;
  const hasContent = hasAssignments || hasProposals;
  const isPending = proposal && !proposal.validated_at && !proposal.rejected_at;
  const isValidated = proposal?.validated_at;
  const isRejected = proposal?.rejected_at;
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
            Fini
          </Badge>
        </div>
      </div>
    );
  }

  const handleValidate = async () => {
    if (!proposal || !onValidate || isValidating) return;
    setIsValidating(true);
    try {
      await onValidate(proposal.proposal_id);
    } finally {
      setIsValidating(false);
    }
  };

  const handleReject = async () => {
    if (!proposal || !onReject || isRejecting) return;
    setIsRejecting(true);
    try {
      await onReject(proposal.proposal_id);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleRegenerate = async () => {
    if (!proposal || !onRegenerate || isRegenerating) return;
    setIsRegenerating(true);
    try {
      await onRegenerate(proposal.proposal_id);
    } finally {
      setIsRegenerating(false);
    }
  };

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
    if (isValidated) return "border-emerald-500/30";
    if (isRejected) return "border-red-500/30";
    if (hasProposals) return "border-blue-500/30";
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
    if (hasProposals) {
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/20 text-[9px] text-blue-400"
        >
          {proposalItems.length} véhicule{proposalItems.length > 1 ? "s" : ""}
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
    <Collapsible defaultOpen={hasContent || (hasProposals && !!isPending)}>
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
                : hasProposals
                  ? "bg-blue-500/20"
                  : "bg-white/10",
            )}
          >
            <Layers
              className={cn(
                "h-3.5 w-3.5",
                hasAssignments
                  ? "text-emerald-400"
                  : hasProposals
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
              {/* Affectations actives */}
              {hasAssignments && (
                <div className="space-y-1">
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

              {/* Propositions en attente */}
              {hasProposals && (
                <div className="space-y-1">
                  {proposalItems.map((proposalItem, idx) => (
                    <VehicleItemCompact
                      key={`${proposalItem.vehicle_id}-${idx}`}
                      item={{ type: "proposal", data: proposalItem }}
                      index={idx}
                      resolve={resolve}
                    />
                  ))}
                </div>
              )}

              {isPending && !isIncidentResolved && (
                <div className="flex gap-1 pt-1">
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
                    title="Regenerer"
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
