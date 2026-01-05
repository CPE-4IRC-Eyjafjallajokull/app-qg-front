"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CommandDock } from "@/components/qg/command-dock";
import MapView from "@/components/qg/map-view";
import { MapClickPopup } from "@/components/qg/map/map-click-popup";
import { SidePanel } from "@/components/qg/side-panel";
import { TopBar } from "@/components/qg/top-bar";
import { useInterestPoints } from "@/hooks/useInterestPoints";
import type { InterestPointCreatePayload } from "@/types/qg";
import { createInterestPoint } from "@/lib/interest-points/service";
import { toast } from "sonner";
import { formatErrorMessage } from "@/lib/error-message";
import type { Incident, Vehicle } from "@/types/qg";
import { useLiveEventList } from "@/hooks/useLiveEvent";
import type { SSEEvent } from "@/lib/sse/types";
import { reverseGeocode } from "@/lib/geocoding/service";
import {
  declareIncident,
  fetchIncidents,
  fetchIncidentPhaseTypes,
  mapIncidentToUi,
  type ApiIncidentRead,
  type IncidentPhaseType,
  type IncidentDeclarationLocation,
} from "@/lib/incidents/service";
import {
  fetchVehicles,
  mapVehicleToUi,
  type ApiVehicleDetail,
  type VehiclePositionUpdate,
} from "@/lib/vehicles/service";

export function HomeScreen() {
  const { interestPoints, interestPointKinds, refresh } = useInterestPoints();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mapClickLocation, setMapClickLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isCreatingInterestPoint, setIsCreatingInterestPoint] = useState(false);
  const [isDeclaringIncident, setIsDeclaringIncident] = useState(false);
  const [phaseTypes, setPhaseTypes] = useState<IncidentPhaseType[]>([]);
  const [isLoadingPhaseTypes, setIsLoadingPhaseTypes] = useState(false);

  const incidentEvents = useMemo(
    () => [
      "new_incident",
      "incident_update",
      "incident_ack",
      "vehicle_assignment_proposal",
      "incident",
      "incidents",
      "incidents_snapshot",
    ],
    [],
  );
  const vehicleEvents = useMemo(
    () => [
      "vehicle_update",
      "vehicle_position",
      "vehicle_position_update",
      "vehicle",
      "vehicles",
      "vehicles_snapshot",
    ],
    [],
  );

  const handleIncidentEvent = useCallback((event: SSEEvent) => {
    if (event.event === "vehicle_assignment_proposal") {
      const envelope = event.data;
      if (envelope && typeof envelope === "object" && "payload" in envelope) {
        const payload = (envelope as Record<string, unknown>).payload as
          | Record<string, unknown>
          | undefined;
        const proposals = Array.isArray(payload?.proposals)
          ? payload?.proposals
          : [];
        const missing =
          payload?.missing_by_vehicle_type &&
          typeof payload.missing_by_vehicle_type === "object"
            ? Object.keys(
                payload.missing_by_vehicle_type as Record<string, unknown>,
              )
            : [];
        const proposalCount = proposals.length;
        const missingCount = missing.length;
        toast.success(
          `Proposition d'affectation reçue (${proposalCount} véhicule${proposalCount > 1 ? "s" : ""}, ${missingCount} type${missingCount > 1 ? "s" : ""} manquant${missingCount > 1 ? "s" : ""}).`,
        );
        return;
      }
      toast.success("Proposition d'affectation reçue.");
      return;
    }
    const payload = event.data;
    if (!payload) {
      return;
    }

    if (Array.isArray(payload)) {
      const mapped = payload
        .map((item) => toUiIncident(item))
        .filter((item): item is Incident => Boolean(item))
        .filter(isActiveIncident);
      setIncidents(mapped);
      return;
    }

    if (typeof payload === "object") {
      const data = payload as Record<string, unknown>;
      if (Array.isArray(data.incidents)) {
        const mapped = data.incidents
          .map((item) => toUiIncident(item))
          .filter((item): item is Incident => Boolean(item))
          .filter(isActiveIncident);
        setIncidents(mapped);
        return;
      }

      if (data.incident) {
        const incident = toUiIncident(data.incident);
        if (incident) {
          setIncidents((prev) => mergeIncident(prev, incident));
        }
        return;
      }

      if (data.data && typeof data.data === "object") {
        const nested = data.data as Record<string, unknown>;
        if (nested.incident) {
          const incident = toUiIncident(nested.incident);
          if (incident) {
            setIncidents((prev) => mergeIncident(prev, incident));
          }
          return;
        }
      }

      const incident = toUiIncident(data);
      if (!incident) {
        return;
      }

      setIncidents((prev) => mergeIncident(prev, incident));
    }
  }, []);

  const handleVehicleEvent = useCallback((event: SSEEvent) => {
    const payload = event.data;
    if (!payload || typeof payload !== "object") {
      return;
    }

    const data = payload as Record<string, unknown>;

    // Gestion de vehicle_position_update
    if (event.event === "vehicle_position_update") {
      const update = data as VehiclePositionUpdate;
      if (update.immatriculation && update.position) {
        setVehicles((prev) =>
          prev.map((vehicle) => {
            if (vehicle.callSign === update.immatriculation) {
              return {
                ...vehicle,
                location: {
                  lat: update.position.lat,
                  lng: update.position.lon,
                },
                updatedAt: update.timestamp,
              };
            }
            return vehicle;
          }),
        );
      }
      return;
    }

    // Gestion des snapshots de véhicules
    if (Array.isArray(data.vehicles)) {
      const mapped = data.vehicles
        .map((item) => mapVehicleToUi(item as ApiVehicleDetail))
        .filter((item): item is Vehicle => Boolean(item));
      setVehicles(mapped);
      return;
    }

    // Gestion d'une mise à jour de véhicule unique
    setVehicles((prev) => upsertById(prev, data as Vehicle, getVehicleId));
  }, []);

  useLiveEventList(incidentEvents, handleIncidentEvent);
  useLiveEventList(vehicleEvents, handleVehicleEvent);

  useEffect(() => {
    let isActive = true;
    const loadIncidents = async () => {
      try {
        const data = await fetchIncidents();
        if (isActive) {
          setIncidents(data.filter(isActiveIncident));
        }
      } catch (error) {
        if (isActive) {
          toast.error(
            formatErrorMessage(
              "Erreur lors du chargement des incidents.",
              error,
            ),
          );
        }
      }
    };

    loadIncidents();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const loadVehicles = async () => {
      try {
        const data = await fetchVehicles();
        if (isActive) {
          setVehicles(data);
        }
      } catch (error) {
        if (isActive) {
          toast.error(
            formatErrorMessage(
              "Erreur lors du chargement des véhicules.",
              error,
            ),
          );
        }
      }
    };

    loadVehicles();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!mapClickLocation) {
      return;
    }

    let isActive = true;
    const loadPhaseTypes = async () => {
      try {
        setIsLoadingPhaseTypes(true);
        const data = await fetchIncidentPhaseTypes();
        if (isActive) {
          setPhaseTypes(data);
        }
      } catch (error) {
        if (isActive) {
          toast.error(
            formatErrorMessage(
              "Erreur lors du chargement des types de phase.",
              error,
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingPhaseTypes(false);
        }
      }
    };

    loadPhaseTypes();
    return () => {
      isActive = false;
    };
  }, [mapClickLocation]);

  const handleMapClick = useCallback(
    (location: { latitude: number; longitude: number }) => {
      setMapClickLocation(location);
    },
    [],
  );

  const handleClosePopup = useCallback(() => {
    setMapClickLocation(null);
  }, []);

  const handleDeclareIncident = useCallback(
    async (payload: { phaseTypeId: string; priority: number | null }) => {
      if (!mapClickLocation || isDeclaringIncident) {
        return;
      }

      try {
        setIsDeclaringIncident(true);
        if (!payload.phaseTypeId) {
          throw new Error("Aucun type de phase disponible.");
        }

        const location = await resolveIncidentLocation(
          mapClickLocation.latitude,
          mapClickLocation.longitude,
        );

        await declareIncident({
          location,
          phase: {
            phase_type_id: payload.phaseTypeId,
            priority: payload.priority,
          },
          incident_started_at: new Date().toISOString(),
        });

        toast.success("Incident declare.");
        setMapClickLocation(null);
      } catch (error) {
        toast.error(
          formatErrorMessage(
            "Erreur lors de la declaration de l'incident.",
            error,
          ),
        );
      } finally {
        setIsDeclaringIncident(false);
      }
    },
    [isDeclaringIncident, mapClickLocation],
  );

  const handleCreateInterestPoint = useCallback(
    async (payload: InterestPointCreatePayload) => {
      try {
        setIsCreatingInterestPoint(true);
        await createInterestPoint(payload);
        toast.success("Point d'intérêt créé.");
        await refresh();
        setMapClickLocation(null);
      } catch (error) {
        toast.error(
          formatErrorMessage(
            "Erreur lors de la création du point d'intérêt.",
            error,
          ),
        );
      } finally {
        setIsCreatingInterestPoint(false);
      }
    },
    [refresh],
  );

  return (
    <div className="relative h-screen w-screen bg-slate-950">
      <MapView
        incidents={incidents}
        vehicles={vehicles}
        interestPoints={interestPoints}
        interestPointKinds={interestPointKinds}
        onMapClick={handleMapClick}
      >
        {mapClickLocation ? (
          <MapClickPopup
            latitude={mapClickLocation.latitude}
            longitude={mapClickLocation.longitude}
            onClose={handleClosePopup}
            onDeclareIncident={handleDeclareIncident}
            isDeclaringIncident={isDeclaringIncident}
            onCreateInterestPoint={handleCreateInterestPoint}
            interestPointKinds={interestPointKinds}
            phaseTypes={phaseTypes}
            isLoadingPhaseTypes={isLoadingPhaseTypes}
            isCreatingInterestPoint={isCreatingInterestPoint}
          />
        ) : null}
      </MapView>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.12),transparent_35%)]" />

        <div className="absolute inset-x-4 top-4 z-20 sm:inset-x-6 sm:top-6">
          <div className="pointer-events-auto">
            <TopBar incidents={incidents} vehicles={vehicles} />
          </div>
        </div>

        <div className="absolute inset-x-4 bottom-24 top-[5.5rem] z-20 sm:bottom-6 sm:right-6 sm:left-auto sm:top-28 sm:w-80 lg:w-96">
          <div className="pointer-events-auto h-full">
            <SidePanel incidents={incidents} vehicles={vehicles} />
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2">
          <div className="pointer-events-auto">
            <CommandDock />
          </div>
        </div>
      </div>
    </div>
  );
}

const getIncidentId = (
  incident: Partial<Incident> & { incident_id?: string },
) => incident.id ?? incident.incident_id ?? "";

const getVehicleId = (vehicle: Partial<Vehicle> & { vehicle_id?: string }) =>
  vehicle.id ?? vehicle.vehicle_id ?? "";

const upsertById = <T extends object>(
  items: T[],
  item: T,
  getId: (value: T) => string,
) => {
  const id = getId(item);
  if (!id) {
    return items;
  }
  const index = items.findIndex((value) => getId(value) === id);
  if (index === -1) {
    return [...items, item];
  }
  const next = [...items];
  next[index] = { ...next[index], ...item };
  return next;
};

const toUiIncident = (value: unknown): Incident | null => {
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

const isActiveIncident = (incident: Incident) => incident.status !== "resolved";

const mergeIncident = (items: Incident[], incident: Incident) => {
  if (!isActiveIncident(incident)) {
    return items.filter((item) => item.id !== incident.id);
  }
  return upsertById(items, incident, getIncidentId);
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

const resolveIncidentLocation = async (
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
