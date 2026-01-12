"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { useLiveEvent } from "@/hooks/useLiveEvent";
import type { SSEEvent } from "@/lib/sse/types";
import { reverseGeocode } from "@/lib/geocoding/service";
import { LYON_CENTER, MAP_DEFAULT_ZOOM, MAP_MAX_ZOOM } from "@/lib/map/config";
import {
  declareIncident,
  fetchIncidents,
  fetchIncidentPhaseTypes,
  mapIncidentToUi,
  type ApiIncidentRead,
  type IncidentPhaseType,
  type IncidentDeclarationLocation,
} from "@/lib/incidents/service";
import { fetchVehicles, mapStatusLabelToKey } from "@/lib/vehicles/service";

const SSE_FLUSH_MS = 100;
export function HomeScreen() {
  const { interestPoints, interestPointKinds, refresh } = useInterestPoints();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mapClickLocation, setMapClickLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapFocusLocation, setMapFocusLocation] = useState<{
    latitude: number;
    longitude: number;
    zoom?: number;
  } | null>(null);
  const [isCreatingInterestPoint, setIsCreatingInterestPoint] = useState(false);
  const [isDeclaringIncident, setIsDeclaringIncident] = useState(false);
  const [phaseTypes, setPhaseTypes] = useState<IncidentPhaseType[]>([]);
  const [isLoadingPhaseTypes, setIsLoadingPhaseTypes] = useState(false);
  const incidentStoreRef = useRef(new Map<string, Incident>());
  const incidentFlushRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vehicleStoreRef = useRef(new Map<string, Vehicle>());
  const vehicleFlushRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushIncidents = useCallback(() => {
    incidentFlushRef.current = null;
    setIncidents(Array.from(incidentStoreRef.current.values()));
  }, []);

  const scheduleIncidentFlush = useCallback(() => {
    if (incidentFlushRef.current) {
      return;
    }
    incidentFlushRef.current = setTimeout(() => {
      flushIncidents();
    }, SSE_FLUSH_MS);
  }, [flushIncidents]);

  const applyIncidentSnapshot = useCallback(
    (items: Incident[]) => {
      const next = new Map<string, Incident>();
      items.filter(isActiveIncident).forEach((incident) => {
        if (incident.id) {
          next.set(incident.id, incident);
        }
      });
      incidentStoreRef.current = next;
      scheduleIncidentFlush();
    },
    [scheduleIncidentFlush],
  );

  const applyIncidentUpdate = useCallback(
    (incident: Incident) => {
      if (!incident.id) {
        return;
      }
      const store = incidentStoreRef.current;
      if (!isActiveIncident(incident)) {
        if (store.delete(incident.id)) {
          scheduleIncidentFlush();
        }
        return;
      }
      const current = store.get(incident.id);
      store.set(incident.id, current ? { ...current, ...incident } : incident);
      scheduleIncidentFlush();
    },
    [scheduleIncidentFlush],
  );

  const flushVehicles = useCallback(() => {
    vehicleFlushRef.current = null;
    setVehicles(Array.from(vehicleStoreRef.current.values()));
  }, []);

  const scheduleVehicleFlush = useCallback(() => {
    if (vehicleFlushRef.current) {
      return;
    }
    vehicleFlushRef.current = setTimeout(() => {
      flushVehicles();
    }, SSE_FLUSH_MS);
  }, [flushVehicles]);

  const applyVehicleSnapshot = useCallback(
    (items: Vehicle[]) => {
      const next = new Map<string, Vehicle>();
      items.forEach((vehicle) => {
        if (vehicle.id) {
          next.set(vehicle.id, vehicle);
        }
      });
      vehicleStoreRef.current = next;
      scheduleVehicleFlush();
    },
    [scheduleVehicleFlush],
  );

  const findVehicleInStore = useCallback(
    (vehicleId?: string, immatriculation?: string): Vehicle | undefined => {
      const store = vehicleStoreRef.current;
      if (vehicleId) {
        const found = store.get(vehicleId);
        if (found) return found;
      }
      if (immatriculation) {
        return Array.from(store.values()).find(
          (v) => v.callSign === immatriculation,
        );
      }
      return undefined;
    },
    [],
  );

  const applyVehicleUpdate = useCallback(
    (vehicleId: string, updates: Partial<Vehicle>) => {
      const store = vehicleStoreRef.current;
      const current = store.get(vehicleId);
      if (!current) return;
      store.set(vehicleId, { ...current, ...updates });
      scheduleVehicleFlush();
    },
    [scheduleVehicleFlush],
  );

  const applyVehiclePositionUpdate = useCallback(
    (update: {
      vehicle_id?: string;
      vehicle_immatriculation?: string;
      latitude?: number;
      longitude?: number;
      timestamp?: string | null;
    }) => {
      if (update.latitude == null || update.longitude == null) {
        return;
      }
      const lat = Number(update.latitude);
      const lng = Number(update.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return;
      }
      const current = findVehicleInStore(
        update.vehicle_id,
        update.vehicle_immatriculation,
      );
      if (!current) {
        return;
      }
      const updatedAt = update.timestamp || new Date().toISOString();
      if (
        current.location.lat === lat &&
        current.location.lng === lng &&
        current.updatedAt === updatedAt
      ) {
        return;
      }
      applyVehicleUpdate(current.id, {
        location: { lat, lng },
        updatedAt,
      });
    },
    [findVehicleInStore, applyVehicleUpdate],
  );

  const applyVehicleStatusUpdate = useCallback(
    (update: {
      vehicle_id?: string;
      vehicle_immatriculation?: string;
      status_label?: string;
      timestamp?: string | null;
    }) => {
      if (!update.status_label) {
        return;
      }
      const current = findVehicleInStore(
        update.vehicle_id,
        update.vehicle_immatriculation,
      );
      if (!current) {
        return;
      }
      const status = mapStatusLabelToKey(update.status_label);
      const updatedAt = update.timestamp || new Date().toISOString();
      if (current.status === status && current.updatedAt === updatedAt) {
        return;
      }
      applyVehicleUpdate(current.id, {
        status,
        updatedAt,
      });
    },
    [findVehicleInStore, applyVehicleUpdate],
  );

  const handleNewIncident = useCallback(
    (event: SSEEvent) => {
      const payload = event.data;
      if (!payload || typeof payload !== "object") {
        return;
      }
      const data = payload as Record<string, unknown>;
      const incident = toUiIncident(data.incident);
      if (!incident) {
        return;
      }
      applyIncidentUpdate(incident);
    },
    [applyIncidentUpdate],
  );

  const handleVehiclePositionUpdate = useCallback(
    (event: SSEEvent) => {
      const payload = event.data;
      if (!payload || typeof payload !== "object") {
        return;
      }
      applyVehiclePositionUpdate(
        payload as {
          vehicle_id?: string;
          vehicle_immatriculation?: string;
          latitude?: number;
          longitude?: number;
          timestamp?: string | null;
        },
      );
    },
    [applyVehiclePositionUpdate],
  );

  const handleVehicleStatusUpdate = useCallback(
    (event: SSEEvent) => {
      const payload = event.data;
      if (!payload || typeof payload !== "object") {
        return;
      }
      applyVehicleStatusUpdate(
        payload as {
          vehicle_id?: string;
          vehicle_immatriculation?: string;
          status_label?: string;
          timestamp?: string | null;
        },
      );
    },
    [applyVehicleStatusUpdate],
  );

  const handleIncidentStatusUpdate = useCallback(
    (event: SSEEvent) => {
      const payload = event.data;
      if (!payload || typeof payload !== "object") {
        return;
      }
      const data = payload as {
        incident_id?: unknown;
        incident_ended?: unknown;
      };
      if (typeof data.incident_id !== "string") {
        return;
      }
      const current = incidentStoreRef.current.get(data.incident_id);
      if (!current) {
        return;
      }
      const incidentEnded = Boolean(data.incident_ended);
      if (!incidentEnded || current.status === "resolved") {
        return;
      }
      applyIncidentUpdate({ ...current, status: "resolved" });
    },
    [applyIncidentUpdate],
  );

  useLiveEvent("new_incident", handleNewIncident);
  useLiveEvent("vehicle_position_update", handleVehiclePositionUpdate);
  useLiveEvent("vehicle_status_update", handleVehicleStatusUpdate);
  useLiveEvent("incident_status_update", handleIncidentStatusUpdate);

  useEffect(() => {
    return () => {
      if (incidentFlushRef.current) {
        clearTimeout(incidentFlushRef.current);
      }
      if (vehicleFlushRef.current) {
        clearTimeout(vehicleFlushRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const loadIncidents = async () => {
      try {
        const data = await fetchIncidents();
        if (isActive) {
          applyIncidentSnapshot(data);
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
  }, [applyIncidentSnapshot]);

  useEffect(() => {
    let isActive = true;
    const loadVehicles = async () => {
      try {
        const data = await fetchVehicles();
        if (isActive) {
          applyVehicleSnapshot(data);
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
  }, [applyVehicleSnapshot]);

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

        toast.success("Incident déclaré.");
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

  const handleFocusIncident = useCallback((incident: Incident) => {
    setMapFocusLocation({
      latitude: incident.location.lat,
      longitude: incident.location.lng,
      zoom: MAP_MAX_ZOOM - 2,
    });
  }, []);

  const handleFocusVehicle = useCallback((vehicle: Vehicle) => {
    setMapFocusLocation({
      latitude: vehicle.location.lat,
      longitude: vehicle.location.lng,
    });
  }, []);

  const handleRecenterMap = useCallback(() => {
    setMapFocusLocation({
      latitude: LYON_CENTER.lat,
      longitude: LYON_CENTER.lng,
      zoom: MAP_DEFAULT_ZOOM,
    });
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0a0f]">
      <MapView
        incidents={incidents}
        vehicles={vehicles}
        interestPoints={interestPoints}
        interestPointKinds={interestPointKinds}
        onMapClick={handleMapClick}
        focusLocation={mapFocusLocation}
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(220,38,38,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.06),transparent_50%)]" />

        <div className="absolute inset-x-4 top-4 z-20 sm:inset-x-6 sm:top-5">
          <div className="pointer-events-auto">
            <TopBar incidents={incidents} vehicles={vehicles} />
          </div>
        </div>

        <div className="pointer-events-auto absolute bottom-24 right-4 top-20 z-20 sm:bottom-24 sm:right-5 sm:top-[5.5rem]">
          <SidePanel
            incidents={incidents}
            vehicles={vehicles}
            onFocusIncident={handleFocusIncident}
            onFocusVehicle={handleFocusVehicle}
          />
        </div>

        <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 sm:bottom-6">
          <div className="pointer-events-auto">
            <CommandDock onRecenter={handleRecenterMap} />
          </div>
        </div>

        <div className="absolute bottom-5 left-4 z-20 hidden sm:left-5 lg:block">
          <div className="pointer-events-auto">
            <QuickStats />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStats() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateString = now.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex items-end gap-3">
      <div className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur-xl">
        <p className="text-2xl font-bold tabular-nums text-white">
          {timeString}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          {dateString}
        </p>
      </div>
      <div className="flex flex-col gap-1.5 text-[10px] font-medium text-white/30">
        <span>Lyon Metropole</span>
        <span>Secteur operationnel</span>
      </div>
    </div>
  );
}

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
