import type {
  AssignmentProposal,
  AssignmentProposalItem,
  Incident,
  VehicleAssignment,
} from "@/types/qg";

export type PhaseProposalState = {
  phaseId: string;
  phaseCode: string;
  phaseEndedAt?: string | null;
  proposal: AssignmentProposal | null;
  proposalItems: AssignmentProposalItem[];
  vehicleAssignments: VehicleAssignment[];
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
    label: "Assigne",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  resolved: {
    label: "Resolu",
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

  const proposalsByPhase = new Map<
    string,
    { proposal: AssignmentProposal; items: AssignmentProposalItem[] }
  >();

  for (const proposal of proposals) {
    for (const item of proposal.vehicles_to_send) {
      const existing = proposalsByPhase.get(item.incident_phase_id);
      if (existing) {
        existing.items.push(item);
      } else {
        proposalsByPhase.set(item.incident_phase_id, {
          proposal,
          items: [item],
        });
      }
    }
  }

  return sortedPhases.map((phase) => {
    const proposalData = proposalsByPhase.get(phase.id);
    const sortedItems = proposalData
      ? [...proposalData.items].sort((a, b) => b.score - a.score)
      : [];

    return {
      phaseId: phase.id,
      phaseCode: phase.code,
      phaseEndedAt: phase.endedAt ?? null,
      proposal: proposalData?.proposal ?? null,
      proposalItems: sortedItems,
      vehicleAssignments: phase.vehicleAssignments ?? [],
    };
  });
};
