"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  AssignmentProposal,
  AssignmentProposalItem,
  AssignmentProposalMissing,
  Incident,
  VehicleAssignment,
} from "@/types/qg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Flame,
  AlertCircle,
  Info,
  Sparkles,
  LoaderCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatErrorMessage } from "@/lib/error-message";
import {
  requestAssignmentProposal,
  requestPhaseAssignmentProposal,
  validateAssignmentProposal,
  rejectAssignmentProposal,
  fetchAssignmentProposals,
} from "@/lib/assignment-proposals/service";
import { useLiveEvents } from "@/components/live-events-provider";
import { useResolver } from "@/components/resolver-provider";
import { PhaseProposalCard } from "@/components/qg/cards/phase-proposal-card";

const severityConfig: Record<
  Incident["severity"],
  {
    label: string;
    badgeClassName: string;
    headerClassName: string;
    icon: typeof AlertTriangle;
  }
> = {
  critical: {
    label: "Critique",
    badgeClassName: "bg-red-500/20 text-red-300 border-red-500/30",
    headerClassName: "bg-gradient-to-r from-red-600 to-red-500",
    icon: Flame,
  },
  high: {
    label: "Élevée",
    badgeClassName: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    headerClassName: "bg-gradient-to-r from-amber-500 to-amber-400",
    icon: AlertTriangle,
  },
  medium: {
    label: "Moyenne",
    badgeClassName: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    headerClassName: "bg-gradient-to-r from-blue-500 to-blue-400",
    icon: AlertCircle,
  },
  low: {
    label: "Faible",
    badgeClassName: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    headerClassName: "bg-gradient-to-r from-emerald-500 to-emerald-400",
    icon: Info,
  },
};

const statusConfig: Record<
  Incident["status"],
  { label: string; className: string; dot: string }
> = {
  new: {
    label: "Nouveau",
    className: "bg-red-500/20 text-red-300 border-red-500/30",
    dot: "bg-red-400",
  },
  assigned: {
    label: "Assigné",
    className: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    dot: "bg-sky-400",
  },
  resolved: {
    label: "Résolu",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
};

const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
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
  vehicleAssignments: VehicleAssignment[];
};

type IncidentMarkerPopoverContentProps = {
  incident: Incident;
};

export function IncidentMarkerPopoverContent({
  incident,
}: IncidentMarkerPopoverContentProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [phaseProposals, setPhaseProposals] = useState<PhaseProposalState[]>(
    () =>
      incident.phases.map((phase) => ({
        phaseId: phase.id,
        phaseCode: phase.code,
        proposal: null,
        proposalItems: [],
        vehicleAssignments: phase.vehicleAssignments ?? [],
      })),
  );

  const { onEvent } = useLiveEvents();
  const { resolve } = useResolver();

  const config = severityConfig[incident.severity];
  const status = statusConfig[incident.status];
  const IconComponent = config.icon;
  const isIncidentResolved = incident.status === "resolved";
  const isActionDisabled = isRequesting || isIncidentResolved;

  // Listen for vehicle assignments via SSE
  useEffect(() => {
    const unsubscribe = onEvent("vehicle_assignment", (event) => {
      const data = event.data as {
        incident_id: string;
        vehicle_assignment_id: string;
        vehicle_id: string;
        incident_phase_id: string;
        assigned_at: string;
        assigned_by_operator_id?: string | null;
        validated_at?: string | null;
        validated_by_operator_id?: string | null;
        unassigned_at?: string | null;
      };

      if (data.incident_id !== incident.id) {
        return;
      }

      const newAssignment: VehicleAssignment = {
        id: data.vehicle_assignment_id,
        vehicleId: data.vehicle_id,
        phaseId: data.incident_phase_id,
        assignedAt: data.assigned_at,
        validatedAt: data.validated_at ?? null,
        unassignedAt: data.unassigned_at ?? null,
      };

      setPhaseProposals((prev) => {
        return prev.map((phase) => {
          if (phase.phaseId !== data.incident_phase_id) {
            return phase;
          }

          // Check if assignment already exists (update) or is new (add)
          const existingIndex = phase.vehicleAssignments.findIndex(
            (a) => a.id === newAssignment.id,
          );

          if (existingIndex !== -1) {
            // Update existing assignment
            const updatedAssignments = [...phase.vehicleAssignments];
            updatedAssignments[existingIndex] = newAssignment;
            return { ...phase, vehicleAssignments: updatedAssignments };
          } else {
            // Add new assignment
            return {
              ...phase,
              vehicleAssignments: [...phase.vehicleAssignments, newAssignment],
            };
          }
        });
      });
    });

    return unsubscribe;
  }, [incident.id, onEvent]);

  const updatePhaseProposalsFromAssignments = useCallback(
    (proposals: AssignmentProposal[]) => {
      setPhaseProposals((prev) => {
        const updated = [...prev];

        for (const proposal of proposals) {
          const itemsByPhase = new Map<string, AssignmentProposalItem[]>();

          for (const item of proposal.vehicles_to_send) {
            const existing = itemsByPhase.get(item.incident_phase_id) || [];
            existing.push(item);
            itemsByPhase.set(item.incident_phase_id, existing);
          }

          for (const [phaseId, items] of itemsByPhase) {
            const phaseIndex = updated.findIndex((p) => p.phaseId === phaseId);
            if (phaseIndex !== -1) {
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
  }, [incident.id, updatePhaseProposalsFromAssignments]);

  // Listen for new assignment proposals via SSE
  useEffect(() => {
    const unsubscribe = onEvent("assignment_proposal", (event) => {
      const data = event.data as {
        proposal_id: string;
        incident_id: string;
        generated_at: string;
        vehicles_to_send: AssignmentProposalItem[];
        missing: AssignmentProposalMissing[];
      };

      if (data.incident_id !== incident.id) {
        return;
      }

      const newProposal: AssignmentProposal = {
        proposal_id: data.proposal_id,
        incident_id: data.incident_id,
        generated_at: data.generated_at,
        vehicles_to_send: data.vehicles_to_send,
        missing: data.missing,
        validated_at: null,
        rejected_at: null,
      };

      updatePhaseProposalsFromAssignments([newProposal]);
    });

    return unsubscribe;
  }, [incident.id, onEvent, updatePhaseProposalsFromAssignments]);

  const handleRequestAssignment = async () => {
    if (!incident.id) {
      return;
    }
    setIsRequesting(true);
    try {
      await requestAssignmentProposal(incident.id);
      toast.success("Proposition d'affectation demandée.");
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
      toast.success("Proposition validée.");

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
      toast.success("Proposition refusée.");

      setPhaseProposals((prev) =>
        prev.map((p) =>
          p.proposal?.proposal_id === proposalId
            ? { ...p, proposal: null, proposalItems: [] }
            : p,
        ),
      );
    } catch (error) {
      toast.error(formatErrorMessage("Erreur lors du refus.", error));
    }
  };

  const handleRegenerateProposal = async (proposalId: string) => {
    try {
      await rejectAssignmentProposal(proposalId);

      setPhaseProposals((prev) =>
        prev.map((p) =>
          p.proposal?.proposal_id === proposalId
            ? { ...p, proposal: null, proposalItems: [] }
            : p,
        ),
      );

      await requestAssignmentProposal(incident.id);
      toast.success("Nouvelle proposition demandée.");
    } catch (error) {
      toast.error(formatErrorMessage("Erreur lors de la régénération.", error));
    }
  };

  const handleRequestPhaseAssignment = async (
    incidentId: string,
    phaseId: string,
  ) => {
    try {
      await requestPhaseAssignmentProposal(incidentId, phaseId);
      toast.success("Demande d'assignation envoyée.");
    } catch (error) {
      toast.error(
        formatErrorMessage("Erreur lors de la demande d'assignation.", error),
      );
    }
  };

  return (
    <div className="w-80 overflow-hidden">
      {/* Header avec gradient */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-3 py-2.5 text-white",
          config.headerClassName,
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
          <IconComponent className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{incident.title}</p>
          <p className="text-xs text-white/70">ID: {incident.id.slice(0, 8)}</p>
        </div>
      </div>

      {/* Contenu */}
      <div className="space-y-3 p-3">
        {/* Badges statut et severite */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn("gap-1.5 text-[10px]", config.badgeClassName)}
          >
            <IconComponent className="h-3 w-3" />
            {config.label}
          </Badge>
          <Badge
            variant="outline"
            className={cn("gap-1.5 text-[10px]", status.className)}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.label}
          </Badge>
        </div>

        {/* Description */}
        {incident.description && (
          <p className="text-sm leading-relaxed text-white/70">
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
                proposal={phaseState.proposal}
                proposalItems={phaseState.proposalItems}
                vehicleAssignments={phaseState.vehicleAssignments}
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

        {/* Metadonnees */}
        <div className="space-y-2 border-t border-white/10 pt-3 text-[11px] text-white/50">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-white/40" />
            <span>Signalé le {formatDate(incident.reportedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-white/40" />
            <span>
              {incident.location.lat.toFixed(4)},{" "}
              {incident.location.lng.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isActionDisabled}
            className={cn(
              "h-7 gap-1.5 border-primary/30 bg-primary/10 px-2.5 text-[10px] font-semibold text-white/80",
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
            Proposer affectation
          </Button>
        </div>
      </div>
    </div>
  );
}
