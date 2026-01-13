import type {
  AssignmentProposal,
  AssignmentProposalItem,
  AssignmentProposalMissing,
  Incident,
  VehicleAssignment,
} from "@/types/qg";

/**
 * Represents a single proposal's items for a specific phase.
 * A proposal can span multiple phases, so we group items by proposal first.
 */
export type ProposalGroup = {
  proposal: AssignmentProposal;
  items: AssignmentProposalItem[];
  missing: AssignmentProposalMissing[];
};

/**
 * State for a phase, containing all proposals that affect this phase.
 * Each proposal is kept separate to allow individual accept/reject actions.
 */
export type PhaseProposalState = {
  phaseId: string;
  phaseCode: string;
  phaseEndedAt?: string | null;
  /** All proposals affecting this phase, grouped by proposal_id */
  proposalGroups: ProposalGroup[];
  vehicleAssignments: VehicleAssignment[];
};

/**
 * Returns the first 8 characters of a proposal ID for display.
 */
export const getShortProposalId = (proposalId: string): string => {
  return proposalId.slice(0, 8);
};

export const severityConfig: Record<
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
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
  },
  low: {
    label: "Faible",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
  },
};

export const statusConfig: Record<
  Incident["status"],
  { label: string; className: string }
> = {
  new: {
    label: "Nouveau",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  assigned: {
    label: "Assigné",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  resolved: {
    label: "Résolu",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
};

export const formatIncidentDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

export const buildPhaseProposalState = (
  phases: Incident["phases"],
  proposals: AssignmentProposal[],
): PhaseProposalState[] => {
  // Sort phases by startedAt date
  const sortedPhases = [...phases]
    .map((phase, index) => ({
      phase,
      index,
      startedAt: phase.startedAt
        ? Date.parse(phase.startedAt)
        : Number.POSITIVE_INFINITY,
    }))
    .sort((a, b) =>
      a.startedAt === b.startedAt
        ? a.index - b.index
        : a.startedAt - b.startedAt,
    )
    .map(({ phase }) => phase);

  // Build a map: phaseId -> proposalId -> { items, missing }
  // This ensures each proposal is kept separate within each phase
  const phaseProposalMap = new Map<
    string,
    Map<
      string,
      { items: AssignmentProposalItem[]; missing: AssignmentProposalMissing[] }
    >
  >();

  // Index proposals by their ID for quick lookup
  const proposalById = new Map<string, AssignmentProposal>();
  for (const proposal of proposals) {
    proposalById.set(proposal.proposal_id, proposal);
  }

  for (const proposal of proposals) {
    // Group vehicles_to_send by phase, keeping track of proposal
    for (const item of proposal.vehicles_to_send) {
      const phaseId = item.incident_phase_id;
      if (!phaseProposalMap.has(phaseId)) {
        phaseProposalMap.set(phaseId, new Map());
      }
      const proposalsForPhase = phaseProposalMap.get(phaseId)!;
      if (!proposalsForPhase.has(proposal.proposal_id)) {
        proposalsForPhase.set(proposal.proposal_id, { items: [], missing: [] });
      }
      proposalsForPhase.get(proposal.proposal_id)!.items.push(item);
    }

    // Group missing by phase, keeping track of proposal
    for (const missingItem of proposal.missing) {
      const phaseId = missingItem.incident_phase_id;
      if (!phaseProposalMap.has(phaseId)) {
        phaseProposalMap.set(phaseId, new Map());
      }
      const proposalsForPhase = phaseProposalMap.get(phaseId)!;
      if (!proposalsForPhase.has(proposal.proposal_id)) {
        proposalsForPhase.set(proposal.proposal_id, { items: [], missing: [] });
      }
      proposalsForPhase.get(proposal.proposal_id)!.missing.push(missingItem);
    }
  }

  return sortedPhases.map((phase) => {
    const proposalsForPhase = phaseProposalMap.get(phase.id);
    const proposalGroups: ProposalGroup[] = [];

    if (proposalsForPhase) {
      for (const [proposalId, data] of proposalsForPhase) {
        const proposal = proposalById.get(proposalId);
        if (proposal) {
          // Sort items by score descending
          const sortedItems = [...data.items].sort((a, b) => b.score - a.score);
          proposalGroups.push({
            proposal,
            items: sortedItems,
            missing: data.missing,
          });
        }
      }
      // Sort proposal groups: pending first, then by generated_at descending
      proposalGroups.sort((a, b) => {
        const aIsPending = !a.proposal.validated_at && !a.proposal.rejected_at;
        const bIsPending = !b.proposal.validated_at && !b.proposal.rejected_at;
        if (aIsPending !== bIsPending) {
          return aIsPending ? -1 : 1;
        }
        return (
          new Date(b.proposal.generated_at).getTime() -
          new Date(a.proposal.generated_at).getTime()
        );
      });
    }

    return {
      phaseId: phase.id,
      phaseCode: phase.code,
      phaseEndedAt: phase.endedAt ?? null,
      proposalGroups,
      vehicleAssignments: phase.vehicleAssignments ?? [],
    };
  });
};
