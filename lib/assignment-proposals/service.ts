import type { AssignmentProposal } from "@/types/qg";
import { fetchWithAuth } from "@/lib/auth-redirect";
import { getErrorMessage, parseResponseBody } from "@/lib/api-response";

export type ApiAssignmentProposalRead = {
  proposal_id: string;
  incident_id: string;
  generated_at: string;
  proposals: {
    incident_phase_id: string;
    vehicle_id: string;
    distance_km: number;
    estimated_time_min: number;
    energy_level: number;
    score: number;
    rationale?: string | null;
  }[];
  missing_by_vehicle_type: Record<string, number>;
  validated_at?: string | null;
  rejected_at?: string | null;
};

export type AssignmentProposalsResponse = {
  assignment_proposals: ApiAssignmentProposalRead[];
  total: number;
};

export async function fetchAssignmentProposals(): Promise<
  AssignmentProposal[]
> {
  const response = await fetchWithAuth("/api/assignment-proposals", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(String(message));
  }

  const data = parsedBody.json as AssignmentProposalsResponse | null;

  if (!data || !Array.isArray(data.assignment_proposals)) {
    return [];
  }

  return data.assignment_proposals
    .map((proposal) => mapAssignmentProposalToUi(proposal))
    .filter(isPendingAssignmentProposal);
}

export async function fetchAssignmentProposal(
  proposalId: string,
): Promise<AssignmentProposal> {
  const response = await fetchWithAuth(
    `/api/assignment-proposals/${proposalId}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(String(message));
  }

  return mapAssignmentProposalToUi(
    parsedBody.json as ApiAssignmentProposalRead,
  );
}

export async function validateAssignmentProposal(
  proposalId: string,
): Promise<void> {
  const response = await fetchWithAuth(
    `/api/assignment-proposals/${proposalId}/validate`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    const errorBody = await parseResponseBody(response);
    const errorMessage =
      getErrorMessage(response, errorBody) ||
      `Failed to validate assignment proposal ${proposalId}`;
    throw new Error(errorMessage);
  }

  return;
}

export async function rejectAssignmentProposal(
  proposalId: string,
): Promise<void> {
  const response = await fetchWithAuth(
    `/api/assignment-proposals/${proposalId}/reject`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    const errorBody = await parseResponseBody(response);
    const errorMessage =
      getErrorMessage(response, errorBody) ||
      `Failed to reject assignment proposal ${proposalId}`;
    throw new Error(errorMessage);
  }

  return;
}

export async function requestAssignmentProposal(
  incidentId: string,
): Promise<void> {
  const response = await fetchWithAuth("/api/assignment-proposals/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ incident_id: incidentId }),
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const errorMessage =
      getErrorMessage(response, parsedBody) ||
      `Failed to request assignment proposal for ${incidentId}`;
    throw new Error(errorMessage);
  }
}

export function mapAssignmentProposalToUi(
  proposal: ApiAssignmentProposalRead,
): AssignmentProposal {
  return {
    proposal_id: proposal.proposal_id,
    incident_id: proposal.incident_id,
    generated_at: proposal.generated_at,
    proposals: Array.isArray(proposal.proposals) ? proposal.proposals : [],
    missing_by_vehicle_type: proposal.missing_by_vehicle_type ?? {},
    validated_at: proposal.validated_at ?? null,
    rejected_at: proposal.rejected_at ?? null,
  };
}

export function isPendingAssignmentProposal(
  proposal: AssignmentProposal,
): boolean {
  return !proposal.validated_at && !proposal.rejected_at;
}
