import { fetchWithAuth } from "@/lib/auth-redirect";
import { getErrorMessage, parseResponseBody } from "@/lib/api-response";

export type VehicleAssignmentCreatePayload = {
  vehicle_id: string;
  incident_phase_id: string;
};

export async function assignVehicleToIncident(
  payload: VehicleAssignmentCreatePayload,
): Promise<unknown> {
  const response = await fetchWithAuth("/api/vehicles/assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const errorMessage =
      getErrorMessage(response, parsedBody) ||
      "Failed to assign vehicle to incident phase.";
    throw new Error(errorMessage);
  }

  return parsedBody.json;
}
