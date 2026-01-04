import type { InterestPoint, InterestPointCreatePayload } from "@/types/qg";
import { fetchWithAuth } from "@/lib/auth-redirect";
import { getErrorMessage, parseResponseBody } from "@/lib/api-response";
import { adminRequest } from "@/lib/admin.service";

export async function fetchInterestPoints(
  signal?: AbortSignal,
): Promise<InterestPoint[]> {
  const response = await fetchWithAuth("/api/interest-points", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal,
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }

  if (!Array.isArray(parsedBody.json)) {
    return [];
  }

  return parsedBody.json as InterestPoint[];
}

export async function createInterestPoint(
  payload: InterestPointCreatePayload,
): Promise<InterestPoint> {
  return adminRequest<InterestPoint>("interest-points", {
    method: "POST",
    body: payload,
  });
}
