import { reverseGeocode } from "@/lib/geocoding/service";
import {
  mapIncidentToUi,
  type ApiIncidentRead,
  type IncidentDeclarationLocation,
} from "@/lib/incidents/service";
import type { Incident } from "@/types/qg";

export const toUiIncident = (value: unknown): Incident | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  if ("id" in value && "location" in value) {
    return value as Incident;
  }

  if ("incident_id" in value) {
    return mapIncidentToUi(value as ApiIncidentRead);
  }

  return null;
};

const DEFAULT_CITY = "Lyon";
const DEFAULT_ZIPCODE = "69000";
const DEFAULT_ADDRESS = "Position map";

const resolveCity = (address?: {
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
}): string => {
  return (
    address?.city ||
    address?.town ||
    address?.village ||
    address?.suburb ||
    DEFAULT_CITY
  );
};

export const resolveIncidentLocation = async (
  latitude: number,
  longitude: number,
): Promise<IncidentDeclarationLocation> => {
  try {
    const result = await reverseGeocode({ latitude, longitude });
    const address = result?.address;
    const street = [address?.house_number, address?.road]
      .filter(Boolean)
      .join(" ")
      .trim();
    const displayName = result?.display_name ?? "";

    return {
      address: street || displayName || DEFAULT_ADDRESS,
      city: resolveCity(address),
      zipcode: address?.postcode || DEFAULT_ZIPCODE,
      latitude,
      longitude,
    };
  } catch {
    return {
      address: DEFAULT_ADDRESS,
      city: DEFAULT_CITY,
      zipcode: DEFAULT_ZIPCODE,
      latitude,
      longitude,
    };
  }
};
