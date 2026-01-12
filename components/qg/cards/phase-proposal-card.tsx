"use client";

import { useState } from "react";
import type { AssignmentProposal, AssignmentProposalItem } from "@/types/qg";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VehicleProposalItem } from "./vehicle-proposal-item";

type PhaseProposalCardProps = {
  phaseId: string;
  proposal: AssignmentProposal | null;
  proposalItems: AssignmentProposalItem[];
  resolve: (type: ResolverType, id: string) => Record<string, unknown> | null;
  onValidate?: (proposalId: string) => Promise<void>;
  onReject?: (proposalId: string) => Promise<void>;
  onRegenerate?: (proposalId: string) => Promise<void>;
  isIncidentResolved?: boolean;
};

export function PhaseProposalCard({
  phaseId,
  proposal,
  proposalItems,
  resolve,
  onValidate,
  onReject,
  onRegenerate,
  isIncidentResolved = false,
}: PhaseProposalCardProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const incidentPhase = resolve("incident_phase_id", phaseId) as {
    phase_type?: {
      code?: string;
      label?: string;
    };
  } | null;

  const phaseLabel = incidentPhase?.phase_type?.label || "Phase inconnue";
  const phaseCode = incidentPhase?.phase_type?.code || "";

  const hasProposals = proposalItems.length > 0;
  const isPending = proposal && !proposal.validated_at && !proposal.rejected_at;
  const isValidated = proposal?.validated_at;
  const isRejected = proposal?.rejected_at;

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

  const getBorderColor = () => {
    if (isValidated) return "border-emerald-500/30";
    if (isRejected) return "border-red-500/30";
    if (hasProposals) return "border-blue-500/30";
    return "border-white/10";
  };

  const getStatusBadge = () => {
    if (isValidated) {
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/20 text-[9px] text-emerald-400"
        >
          Valide
        </Badge>
      );
    }
    if (isRejected) {
      return (
        <Badge
          variant="outline"
          className="border-red-500/30 bg-red-500/20 text-[9px] text-red-400"
        >
          Refuse
        </Badge>
      );
    }
    if (hasProposals) {
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/20 text-[9px] text-blue-400"
        >
          {proposalItems.length} vehicule{proposalItems.length > 1 ? "s" : ""}
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
    <Collapsible defaultOpen={hasProposals && !!isPending}>
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
              hasProposals ? "bg-blue-500/20" : "bg-white/10",
            )}
          >
            <Layers
              className={cn(
                "h-3.5 w-3.5",
                hasProposals ? "text-blue-400" : "text-white/40",
              )}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">
              {phaseLabel}
            </p>
            {phaseCode && (
              <p className="truncate text-[10px] text-white/40">{phaseCode}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {getStatusBadge()}
            {hasProposals && (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/30 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
            )}
          </div>
        </CollapsibleTrigger>

        {hasProposals && (
          <CollapsibleContent>
            <div className="space-y-2 border-t border-white/10 p-2">
              <div className="space-y-1.5">
                {proposalItems.map((item, idx) => (
                  <VehicleProposalItem
                    key={`${item.vehicle_id}-${idx}`}
                    proposal={item}
                    index={idx}
                    resolve={resolve}
                    isSelected={idx === 0 && !!isPending}
                  />
                ))}
              </div>

              {isPending && !isIncidentResolved && (
                <div className="flex gap-1.5 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "flex-1 gap-1 border-red-500/30 bg-red-500/10 px-2 text-red-400",
                      "hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-300",
                      "h-7",
                    )}
                    disabled={isRejecting || isValidating || isRegenerating}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject();
                    }}
                  >
                    {isRejecting ? (
                      <LoaderCircle className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span className="text-[10px] font-medium">Refuser</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "gap-1 border-amber-500/30 bg-amber-500/10 px-2 text-amber-400",
                      "hover:border-amber-500/50 hover:bg-amber-500/20 hover:text-amber-300",
                      "h-7",
                    )}
                    disabled={isRejecting || isValidating || isRegenerating}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenerate();
                    }}
                  >
                    {isRegenerating ? (
                      <LoaderCircle className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    className={cn(
                      "flex-1 gap-1 bg-emerald-600 px-2 text-white",
                      "hover:bg-emerald-500",
                      "h-7",
                    )}
                    disabled={isRejecting || isValidating || isRegenerating}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleValidate();
                    }}
                  >
                    {isValidating ? (
                      <LoaderCircle className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    <span className="text-[10px] font-medium">Valider</span>
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}
