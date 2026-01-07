import { serverEnv } from "@/lib/env.server";

export const VALID_RESOLVER_TYPES = [
  "incident_phase_id",
  "phase_type_id",
  "vehicle_id",
  "vehicle_type_id",
  "incident_id",
] as const;

export type ResolverType = (typeof VALID_RESOLVER_TYPES)[number];

type ResolverConfig = {
  endpoint: string;
  idKey: string;
};

const RESOLVER_CONFIGS: Record<ResolverType, ResolverConfig> = {
  incident_phase_id: {
    endpoint: "incidents/phases",
    idKey: "incident_phase_id",
  },
  phase_type_id: {
    endpoint: "incidents/phase/types",
    idKey: "phase_type_id",
  },
  vehicle_id: {
    endpoint: "vehicles",
    idKey: "vehicle_id",
  },
  vehicle_type_id: {
    endpoint: "vehicles/types",
    idKey: "vehicle_type_id",
  },
  incident_id: {
    endpoint: "incidents",
    idKey: "incident_id",
  },
};

export async function resolveIds(
  type: ResolverType,
  ids: string[],
  accessToken: string,
): Promise<Record<string, Record<string, unknown>>> {
  if (ids.length === 0) {
    return {};
  }

  const config = RESOLVER_CONFIGS[type];
  if (!config) {
    throw new Error(`Type de résolveur inconnu: ${type}`);
  }

  const targetUrl = new URL(`${serverEnv.API_URL}/${config.endpoint}`);

  const response = await fetch(targetUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erreur lors de la résolution: ${response.status} ${text}`);
  }

  const items = await response.json();
  const itemsArray = Array.isArray(items) ? items : [];

  const result: Record<string, Record<string, unknown>> = {};
  const uniqueIds = new Set(ids);

  itemsArray.forEach((item: unknown) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const data = item as Record<string, unknown>;
    const id = data[config.idKey];

    if (id !== null && id !== undefined && uniqueIds.has(String(id))) {
      result[String(id)] = data;
    }
  });

  return result;
}
