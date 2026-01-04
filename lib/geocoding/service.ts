import { fetchWithAuth } from "@/lib/auth-redirect";
import { getErrorMessage, parseResponseBody } from "@/lib/api-response";

export type ReverseGeocodeAddress = {
  house_number?: string;
  road?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  state?: string;
  country?: string;
};

export type ReverseGeocodeResult = {
  address?: ReverseGeocodeAddress;
  display_name?: string;
  lat?: number | string;
  lon?: number | string;
};

export type ReverseGeocodeOptions = {
  latitude: number;
  longitude: number;
  signal?: AbortSignal;
};

export async function reverseGeocode({
  latitude,
  longitude,
  signal,
}: ReverseGeocodeOptions): Promise<ReverseGeocodeResult | null> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
  });
  const requestUrl = `/api/geocode/reverse?${params}`;

  const fetchOnce = async () =>
    fetchWithAuth(requestUrl, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
    });

  let response = await fetchOnce();
  if (response.status === 429) {
    const retryAfter = response.headers.get("retry-after");
    const delayMs = retryAfter ? Number.parseFloat(retryAfter) * 1000 : 0;
    if (!Number.isNaN(delayMs) && delayMs > 0) {
      if (signal?.aborted) {
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      if (signal?.aborted) {
        return null;
      }
      response = await fetchOnce();
    }
  }

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }

  if (
    parsedBody.json &&
    typeof parsedBody.json === "object" &&
    "ok" in parsedBody.json
  ) {
    const payload = parsedBody.json as {
      ok?: boolean;
      data?: ReverseGeocodeResult;
      error?: string;
    };
    if (!payload.ok) {
      throw new Error(payload.error || "Reverse geocode failed");
    }
    return payload.data ?? null;
  }

  return parsedBody.json as ReverseGeocodeResult | null;
}
