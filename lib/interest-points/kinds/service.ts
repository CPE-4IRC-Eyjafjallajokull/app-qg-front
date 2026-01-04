import type { InterestPointKind } from "@/types/qg";
import { fetchWithAuth } from "@/lib/auth-redirect";
import { getErrorMessage, parseResponseBody } from "@/lib/api-response";

export async function fetchInterestPointKinds(
  signal?: AbortSignal,
): Promise<InterestPointKind[]> {
  const response = await fetchWithAuth("/api/interest-points/kinds", {
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

  return parsedBody.json as InterestPointKind[];
}
