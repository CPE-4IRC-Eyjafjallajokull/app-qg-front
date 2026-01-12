"use client";

import type {
  AssignmentProposal,
  AssignmentProposalItem,
  Incident,
} from "@/types/qg";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatErrorMessage } from "@/lib/error-message";
import {
  requestAssignmentProposal,
  validateAssignmentProposal,
  rejectAssignmentProposal,
  fetchAssignmentProposals,
} from "@/lib/assignment-proposals/service";
import { useLiveEvents } from "@/components/live-events-provider";
import { useResolver } from "@/components/resolver-provider";
import { PhaseProposalCard } from "./phase-proposal-card";

const severityConfig: Record<
  Incident["severity"],
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  critical: {
    label: "Critique",
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-500",
  },
  high: {
    label: "Elevee",
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
  },
  medium: {
    label: "Moyenne",
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
  },
  low: {
    label: "Faible",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
  },
};

const statusConfig: Record<
  Incident["status"],
  { label: string; className: string }
> = {
  new: {
    label: "Nouveau",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  assigned: {
    label: "Assigne",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  resolved: {
    label: "Resolu",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
};

const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

type PhaseProposalState = {
  phaseId: string;
  phaseCode: string;
  proposal: AssignmentProposal | null;
  proposalItems: AssignmentProposalItem[];
};

export function IncidentCard({
  incident,
  onFocus,
}: {
  incident: Incident;
  onFocus?: (incident: Incident) => void;
}) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [phaseProposals, setPhaseProposals] = useState<PhaseProposalState[]>(
    () =>
      incident.phases.map((phase) => ({
        phaseId: phase.id,
        phaseCode: phase.code,
        proposal: null,
        proposalItems: [],
      })
      ));

  console.log(`Phase proposals state:`, phaseProposals);

  const { onEvent } = useLiveEvents();
  const { resolve } = useResolver();

  const severity = severityConfig[incident.severity];
  const status = statusConfig[incident.status];
  const isIncidentResolved = incident.status === "resolved";
  const isActionDisabled = isRequesting || isIncidentResolved;

  // Fetch existing proposals for this incident on mount
  useEffect(() => {
    const loadProposals = async () => {
      try {
        const proposals = await fetchAssignmentProposals();
        const incidentProposals = proposals.filter(
          (p) => p.incident_id === incident.id,
        );

        if (incidentProposals.length > 0) {
          updatePhaseProposalsFromAssignments(incidentProposals);
        }
      } catch {
        // Silently fail - proposals will load via SSE
      }
    };

    loadProposals();
  }, [incident.id]);

  // Listen for new assignment proposals via SSE
  useEffect(() => {
    const unsubscribe = onEvent("vehicle_assignment_proposal", (event) => {
      const data = event.data as {
        proposal_id: string;
        incident_id: string;
        generated_at: string;
        proposals: AssignmentProposalItem[];
        missing_by_vehicle_type: Record<string, number>;
      };

      if (data.incident_id !== incident.id) {
        return;
      }

      const newProposal: AssignmentProposal = {
        proposal_id: data.proposal_id,
        incident_id: data.incident_id,
        generated_at: data.generated_at,
        proposals: data.proposals,
        missing_by_vehicle_type: data.missing_by_vehicle_type,
        validated_at: null,
        rejected_at: null,
      };

      updatePhaseProposalsFromAssignments([newProposal]);
    });

    return unsubscribe;
  }, [incident.id, onEvent]);

  const updatePhaseProposalsFromAssignments = useCallback(
    (proposals: AssignmentProposal[]) => {
      setPhaseProposals((prev) => {
        const updated = [...prev];

        for (const proposal of proposals) {
          // Group proposal items by phase
          const itemsByPhase = new Map<string, AssignmentProposalItem[]>();

          for (const item of proposal.proposals) {
            const existing = itemsByPhase.get(item.incident_phase_id) || [];
            existing.push(item);
            itemsByPhase.set(item.incident_phase_id, existing);
          }

          // Update each phase with its proposals
          for (const [phaseId, items] of itemsByPhase) {
            const phaseIndex = updated.findIndex((p) => p.phaseId === phaseId);
            if (phaseIndex !== -1) {
              // Sort items by score (highest first)
              const sortedItems = [...items].sort((a, b) => b.score - a.score);
              updated[phaseIndex] = {
                ...updated[phaseIndex],
                proposal,
                proposalItems: sortedItems,
              };
            }
          }
        }

        return updated;
      });
    },
    [],
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

      // Update local state
      setPhaseProposals((prev) =>
        prev.map((p) =>
          p.proposal?.proposal_id === proposalId
            ? {
              ...p,
              proposal: {
                ...p.proposal,
                validated_at: new Date().toISOString(),
              },
            }
            : p,
        ),
      );
    } catch (error) {
      toast.error(formatErrorMessage("Erreur lors de la validation.", error));
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await rejectAssignmentProposal(proposalId);
      toast.success("Proposition refusee.");

      // Update local state
      setPhaseProposals((prev) =>
        prev.map((p) =>
          p.proposal?.proposal_id === proposalId
            ? {
              ...p,
              proposal: {
                ...p.proposal,
                rejected_at: new Date().toISOString(),
              },
            }
            : p,
        ),
      );
    } catch (error) {
      toast.error(formatErrorMessage("Erreur lors du refus.", error));
    }
  };

  const handleRegenerateProposal = async (proposalId: string) => {
    try {
      // First reject the current proposal
      await rejectAssignmentProposal(proposalId);

      // Clear the proposal from local state
      setPhaseProposals((prev) =>
        prev.map((p) =>
          p.proposal?.proposal_id === proposalId
            ? { ...p, proposal: null, proposalItems: [] }
            : p,
        ),
      );

      // Request a new proposal
      await requestAssignmentProposal(incident.id);
      toast.success("Nouvelle proposition demandee.");
    } catch (error) {
      toast.error(formatErrorMessage("Erreur lors de la regeneration.", error));
    }
  };

  const hasPendingProposals = phaseProposals.some(
    (p) => p.proposal && !p.proposal.validated_at && !p.proposal.rejected_at,
  );

  return (
    <Collapsible defaultOpen={incident.status === "new" || hasPendingProposals}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10",
          severity.border,
        )}
      >
        <CollapsibleTrigger className="flex w-full items-center gap-2.5 p-2.5 text-left">
          <div
            className={cn(
              "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              severity.bg,
            )}
          >
            <AlertTriangle className={cn("h-4 w-4", severity.text)} />
            {incident.status === "new" && incident.severity === "critical" && (
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
                {formatDate(incident.reportedAt)}
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
                    proposal={phaseState.proposal}
                    proposalItems={phaseState.proposalItems}
                    resolve={resolve}
                    onValidate={handleValidateProposal}
                    onReject={handleRejectProposal}
                    onRegenerate={handleRegenerateProposal}
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
              <div className="ml-auto">
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
