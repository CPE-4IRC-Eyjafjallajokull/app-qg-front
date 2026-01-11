import type { Incident, IncidentSeverity, IncidentStatus } from "@/types/qg";
import { fetchWithAuth } from "@/lib/auth-redirect";
import { getErrorMessage, parseResponseBody } from "@/lib/api-response";
import { adminRequest } from "@/lib/admin.service";

export type IncidentPhaseType = {
  phase_type_id: string;
  code: string;
  label?: string | null;
  default_criticity?: number;
  phase_category_id?: string;
};

export type IncidentDeclarationLocation = {
  address: string;
  zipcode: string;
  city: string;
  latitude: number;
  longitude: number;
};

export type IncidentDeclarationPayload = {
  location: IncidentDeclarationLocation;
  phase: {
    phase_type_id: string;
    priority?: number | null;
  };
  description?: string | null;
  created_by_operator_id?: string | null;
  incident_started_at?: string | null;
};

export type ApiIncidentRead = {
  incident_id: string;
  created_at: string;
  updated_at: string;
  address?: string | null;
  zipcode?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  ended_at?: string | null;
  phases: ApiIncidentPhaseRead[];
};

export type ApiIncidentPhaseRead = {
  incident_phase_id: string;
  phase_type: {
    code: string;
    label?: string | null;
  };
  priority: number;
  started_at: string;
  ended_at?: string | null;
  vehicle_assignments: ApiIncidentVehicleAssignmentRead[];
};

export type ApiIncidentVehicleAssignmentRead = {
  vehicle_assignment_id: string;
  vehicle_id: string;
  incident_phase_id: string;
  assigned_at: string;
  assigned_by_operator_id?: string | null;
  validated_at?: string | null;
  validated_by_operator_id?: string | null;
  unassigned_at?: string | null;
};

export async function fetchIncidentPhaseTypes(): Promise<IncidentPhaseType[]> {
  return adminRequest<IncidentPhaseType[]>("incidents/phase/types", {
    method: "GET",
  });
}

export async function fetchIncidents(): Promise<Incident[]> {
  const response = await fetchWithAuth("/api/incidents", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }

  if (!Array.isArray(parsedBody.json)) {
    return [];
  }

  return parsedBody.json
    .map((item) => mapIncidentToUi(item as ApiIncidentRead))
    .filter((item): item is Incident => Boolean(item));
}

export async function declareIncident(
  payload: IncidentDeclarationPayload,
): Promise<unknown> {
  const response = await fetchWithAuth("/api/incidents/new", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
    cache: "no-store",
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }

  return parsedBody.json;
}

export function mapIncidentToUi(incident: ApiIncidentRead): Incident | null {
  const latitude =
    typeof incident.latitude === "number"
      ? incident.latitude
      : Number.parseFloat(String(incident.latitude ?? ""));
  const longitude =
    typeof incident.longitude === "number"
      ? incident.longitude
      : Number.parseFloat(String(incident.longitude ?? ""));

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  const title =
    incident.address?.trim() || incident.city?.trim() || "Incident déclaré";

  // calculate severity based on priority of the first phase (piority 0 is highest, 1 is medium, 2 is low and more than 2 is very low)
  const severity: IncidentSeverity =
    incident.phases.length > 0
      ? (["critical", "high", "medium", "low"] as const)[
          Math.min(incident.phases[0].priority, 3)
        ]
      : "low";

  const allPhasesEnded = incident.phases.every((phase) =>
    Boolean(phase.ended_at),
  );
  const hasAssignedVehicles = incident.phases.some(
    (phase) => phase.vehicle_assignments.length > 0,
  );

  const incidentStatus: IncidentStatus = allPhasesEnded
    ? "resolved"
    : hasAssignedVehicles
      ? "assigned"
      : "new";

  return {
    id: incident.incident_id,
    title,
    description: incident.description ?? "",
    severity: severity,
    status: incidentStatus,
    location: {
      lat: latitude,
      lng: longitude,
    },
    reportedAt: incident.created_at,
    phases: incident.phases.map((phase) => phase.phase_type.code),
  };
}
