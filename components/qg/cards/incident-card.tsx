"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { AssignmentProposal, Incident } from "@/types/qg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertTriangle,
  ChevronDown,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Plus,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatErrorMessage } from "@/lib/error-message";
import {
  requestAssignmentProposal,
  requestPhaseAssignmentProposal,
  validateAssignmentProposal,
  rejectAssignmentProposal,
} from "@/lib/assignment-proposals/service";
import { useResolver } from "@/components/resolver-provider";
import { IncidentPhaseDialog } from "@/components/qg/cards/incident-phase-dialog";
import { PhaseProposalCard } from "./phase-proposal-card";
import {
  buildPhaseProposalState,
  formatIncidentDate,
  severityConfig,
  statusConfig,
  type PhaseProposalState,
} from "./incident-card-utils";

type IncidentCardProps = {
  incident: Incident;
  proposals: AssignmentProposal[];
  onProposalStatusChange: (
    proposalId: string,
    update: { validated_at?: string | null; rejected_at?: string | null },
  ) => void;
  onFocus?: (incident: Incident) => void;
};

export function IncidentCard({
  incident,
  proposals,
  onProposalStatusChange,
  onFocus,
}: IncidentCardProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const { resolve } = useResolver();

  const severity = severityConfig[incident.severity];
  const status = statusConfig[incident.status];
  const isIncidentResolved = incident.status === "resolved";
  const isActionDisabled = isRequesting || isIncidentResolved;

  // Compute phase proposals from incident.phases and proposals prop
  const phaseProposals = useMemo<PhaseProposalState[]>(
    () => buildPhaseProposalState(incident.phases, proposals),
    [incident.phases, proposals],
  );

  const hasPendingProposals = phaseProposals.some((p) =>
    p.proposalGroups.some(
      (g) => !g.proposal.validated_at && !g.proposal.rejected_at,
    ),
  );

  const handleRequestAssignment = async () => {
    if (!incident.id) {
      return;
    }
    setIsRequesting(true);
    try {
      await requestAssignmentProposal(incident.id);
      toast.success("Proposition d'affectation demandee.");
    } catch (error) {
      toast.error(
        formatErrorMessage(
          "Erreur lors de la demande de proposition d'affectation.",
          error,
        ),
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleValidateProposal = async (proposalId: string) => {
    try {
      await validateAssignmentProposal(proposalId);
      toast.success("Proposition validee.");
      onProposalStatusChange(proposalId, {
        validated_at: new Date().toISOString(),
      });
    } catch (error) {
      toast.error(formatErrorMessage("Erreur lors de la validation.", error));
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await rejectAssignmentProposal(proposalId);
      toast.success("Proposition refusee.");
      onProposalStatusChange(proposalId, {
        rejected_at: new Date().toISOString(),
      });
    } catch (error) {
      toast.error(formatErrorMessage("Erreur lors du refus.", error));
    }
  };

  const handleRegenerateProposal = async (proposalId: string) => {
    try {
      await rejectAssignmentProposal(proposalId);
      onProposalStatusChange(proposalId, {
        rejected_at: new Date().toISOString(),
      });
      await requestAssignmentProposal(incident.id);
      toast.success("Nouvelle proposition demandee.");
    } catch (error) {
      toast.error(formatErrorMessage("Erreur lors de la regeneration.", error));
    }
  };

  const handleRequestPhaseAssignment = async (
    incidentId: string,
    phaseId: string,
  ) => {
    try {
      await requestPhaseAssignmentProposal(incidentId, phaseId);
      toast.success("Demande d'assignation envoyee.");
    } catch (error) {
      toast.error(
        formatErrorMessage("Erreur lors de la demande d'assignation.", error),
      );
    }
  };

  return (
    <Collapsible defaultOpen={incident.status === "new" || hasPendingProposals}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10",
          severity.border,
        )}
      >
        <CollapsibleTrigger asChild>
          <div
            className="flex w-full items-center gap-2.5 p-2.5 text-left"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) {
                return;
              }
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.currentTarget.click();
              }
            }}
          >
            <div
              className={cn(
                "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                severity.bg,
              )}
            >
              <AlertTriangle className={cn("h-4 w-4", severity.text)} />
              {incident.status === "new" &&
                incident.severity === "critical" && (
                  <span
                    className={cn(
                      "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full",
                      severity.dot,
                    )}
                  />
                )}
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white whitespace-normal">
                {incident.title}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-4 px-1.5 text-[9px]",
                    severity.bg,
                    severity.text,
                    severity.border,
                  )}
                >
                  {severity.label}
                </Badge>
                <span className="text-[10px] text-white/40">
                  {formatIncidentDate(incident.reportedAt)}
                </span>
                {hasPendingProposals && (
                  <Badge
                    variant="outline"
                    className="h-4 border-blue-500/30 bg-blue-500/20 px-1.5 text-[9px] text-blue-400"
                  >
                    Propositions
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white/40 hover:bg-white/10 hover:text-white"
                title="Centrer sur l'incident"
                aria-label="Centrer sur l'incident"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onFocus?.(incident);
                }}
              >
                <LocateFixed className="h-3.5 w-3.5" />
              </Button>
              <ChevronDown className="h-4 w-4 shrink-0 text-white/30 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-2.5 border-t border-white/10 px-2.5 pb-2.5 pt-2.5">
            {incident.description && (
              <p className="text-xs leading-relaxed text-white/60">
                {incident.description}
              </p>
            )}

            {/* Phases with proposals */}
            {phaseProposals.length > 0 && (
              <div className="space-y-1.5">
                {phaseProposals.map((phaseState) => (
                  <PhaseProposalCard
                    key={phaseState.phaseId}
                    phaseId={phaseState.phaseId}
                    incidentId={incident.id}
                    proposalGroups={phaseState.proposalGroups}
                    vehicleAssignments={phaseState.vehicleAssignments}
                    phaseEndedAt={phaseState.phaseEndedAt}
                    resolve={resolve}
                    onValidate={handleValidateProposal}
                    onReject={handleRejectProposal}
                    onRegenerate={handleRegenerateProposal}
                    onRequestAssignment={handleRequestPhaseAssignment}
                    isIncidentResolved={isIncidentResolved}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge
                variant="outline"
                className={cn("px-1.5 py-0.5 text-[10px]", status.className)}
              >
                {status.label}
              </Badge>
              <span className="flex items-center gap-1 text-[10px] text-white/30">
                <MapPin className="h-2.5 w-2.5" />
                <span className="truncate">
                  {incident.location.lat.toFixed(3)},{" "}
                  {incident.location.lng.toFixed(3)}
                </span>
              </span>
              <div className="ml-auto flex items-center gap-2">
                <IncidentPhaseDialog
                  incidentId={incident.id}
                  trigger={
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isActionDisabled}
                      className={cn(
                        "h-7 gap-1.5 border-primary/30 bg-primary/10 px-2 text-[10px] font-semibold text-white/80",
                        "hover:border-primary/40 hover:bg-primary/20 hover:text-white",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                      )}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Nouvelle phase
                    </Button>
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isActionDisabled}
                  className={cn(
                    "h-7 gap-1.5 border-primary/30 bg-primary/10 px-2 text-[10px] font-semibold text-white/80",
                    "hover:border-primary/40 hover:bg-primary/20 hover:text-white",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleRequestAssignment();
                  }}
                >
                  {isRequesting ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Proposer
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
