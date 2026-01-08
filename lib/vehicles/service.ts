import type { Vehicle } from "@/types/qg";
import { fetchWithAuth } from "@/lib/auth-redirect";
import { getErrorMessage, parseResponseBody } from "@/lib/api-response";

export type ApiVehiclePosition = {
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
};

export type ApiVehicleTypeDetail = {
  vehicle_type_id: string;
  code: string;
  label: string;
};

export type ApiVehicleStatusRef = {
  vehicle_status_id: string;
  label: string;
};

export type ApiVehicleDetail = {
  vehicle_id: string;
  immatriculation: string;
  vehicle_type: ApiVehicleTypeDetail;
  energy?: {
    energy_id: string;
    label: string;
  } | null;
  energy_level?: number | null;
  status?: ApiVehicleStatusRef | null;
  base_interest_point?: {
    interest_point_id: string;
    name?: string | null;
    address?: string | null;
    zipcode?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  current_position?: ApiVehiclePosition | null;
  consumable_stocks: unknown[];
  active_assignment?: {
    vehicle_assignment_id: string;
    incident_phase_id?: string | null;
    assigned_at: string;
    assigned_by_operator_id?: string | null;
  } | null;
};

export type ApiVehiclesListRead = {
  vehicles: ApiVehicleDetail[];
  total: number;
};

export async function fetchVehicles(): Promise<Vehicle[]> {
  const response = await fetchWithAuth("/api/vehicles", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }

  const data = parsedBody.json as ApiVehiclesListRead;

  if (!Array.isArray(data.vehicles)) {
    return [];
  }

  return data.vehicles
    .map((item) => mapVehicleToUi(item))
    .filter((item): item is Vehicle => Boolean(item));
}

const statusLabelMap: Record<string, Vehicle["status"]> = {
  disponible: "available",
  engagé: "engaged",
  "hors service": "out_of_service",
  indisponible: "unavailable",
  retour: "returning",
  "sur intervention": "on_intervention",
  transport: "transport",
};

export function mapStatusLabelToKey(
  label: string | null | undefined,
): Vehicle["status"] {
  if (!label) return "unavailable";
  const normalized = label.toLowerCase().trim();
  return statusLabelMap[normalized] ?? "unavailable";
}

export function mapVehicleToUi(vehicle: ApiVehicleDetail): Vehicle | null {
  // Ne pas afficher les véhicules sans position
  if (
    !vehicle.current_position ||
    vehicle.current_position.latitude == null ||
    vehicle.current_position.longitude == null
  ) {
    return null;
  }

  const latitude = vehicle.current_position.latitude;
  const longitude = vehicle.current_position.longitude;

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  // Mapping du type de véhicule basé sur le code
  const vehicleTypeCode = vehicle.vehicle_type.code.toUpperCase();
  const vehicleType: Vehicle["type"] =
    vehicleTypeCode === "VSAV" ||
    vehicleTypeCode === "FPT" ||
    vehicleTypeCode === "EPA" ||
    vehicleTypeCode === "VTU"
      ? vehicleTypeCode
      : "VTU";

  // Mapping du statut
  const status = mapStatusLabelToKey(vehicle.status?.label);

  return {
    id: vehicle.vehicle_id,
    callSign: vehicle.immatriculation,
    type: vehicleType,
    status,
    location: {
      lat: latitude,
      lng: longitude,
    },
    crew: 0, // À adapter si disponible dans l'API
    updatedAt: vehicle.current_position.timestamp,
    station: vehicle.base_interest_point?.name || undefined,
  };
}
