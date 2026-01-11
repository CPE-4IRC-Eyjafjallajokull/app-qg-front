"use client";

import { useState } from "react";
import type {
  AssignmentProposal,
  Incident,
  IncidentSeverity,
  Vehicle,
  VehicleStatus,
  VehicleType,
} from "@/types/qg";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Radio,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveEvents } from "@/components/live-events-provider";
import { useResolver } from "@/components/resolver-provider";
import { IncidentCard } from "./cards/incident-card";
import { VehicleCard } from "./cards/vehicle-card";
import { AssignmentCard } from "./cards/assignment-card";
import { EmptyState } from "./side-panel/empty-state";
import { FiltersPanel } from "./side-panel/filters-panel";
import { MetricCard } from "./side-panel/metric-card";
import { MiniCounter } from "./side-panel/mini-counter";

type SidePanelProps = {
  incidents: Incident[];
  vehicles: Vehicle[];
  assignments: AssignmentProposal[];
  onValidateAssignment?: (assignmentId: string) => void;
  onRejectAssignment?: (assignmentId: string) => void;
  onFocusIncident?: (incident: Incident) => void;
  onFocusVehicle?: (vehicle: Vehicle) => void;
};

export function SidePanel({
  incidents,
  vehicles,
  assignments,
  onValidateAssignment,
  onRejectAssignment,
  onFocusIncident,
  onFocusVehicle,
}: SidePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [incidentQuery, setIncidentQuery] = useState("");
  const [incidentSeverity, setIncidentSeverity] = useState<
    IncidentSeverity | "all"
  >("all");
  const [incidentAssignment, setIncidentAssignment] = useState<
    "all" | "assigned" | "unassigned"
  >("all");
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [vehicleAvailability, setVehicleAvailability] = useState<
    VehicleStatus | "all"
  >("all");
  const [vehicleType, setVehicleType] = useState<VehicleType | "all">("all");
  const [assignmentStatus, setAssignmentStatus] = useState<
    "all" | "pending" | "validated" | "rejected"
  >("all");
  const { isConnected } = useLiveEvents();
  const { resolve } = useResolver();

  const activeIncidents = incidents.filter((incident) =>
    ["new", "assigned"].includes(incident.status),
  );
  const criticalIncidents = activeIncidents.filter(
    (i) => i.severity === "critical",
  );
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "available",
  );
  const engagedVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.status === "engaged" || vehicle.status === "on_intervention",
  );

  const normalizedIncidentQuery = incidentQuery.trim().toLowerCase();
  const filteredIncidents = incidents.filter((incident) => {
    if (incidentSeverity !== "all" && incident.severity !== incidentSeverity) {
      return false;
    }
    if (incidentAssignment === "assigned" && incident.status !== "assigned") {
      return false;
    }
    if (incidentAssignment === "unassigned" && incident.status !== "new") {
      return false;
    }
    if (!normalizedIncidentQuery) {
      return true;
    }
    return (
      incident.title.toLowerCase().includes(normalizedIncidentQuery) ||
      incident.description.toLowerCase().includes(normalizedIncidentQuery) ||
      incident.id.toLowerCase().includes(normalizedIncidentQuery)
    );
  });
  const isIncidentFiltered =
    normalizedIncidentQuery ||
    incidentSeverity !== "all" ||
    incidentAssignment !== "all";

  const normalizedVehicleQuery = vehicleQuery.trim().toLowerCase();
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (
      vehicleAvailability !== "all" &&
      vehicle.status !== vehicleAvailability
    ) {
      return false;
    }
    if (vehicleType !== "all" && vehicle.type !== vehicleType) {
      return false;
    }
    if (!normalizedVehicleQuery) {
      return true;
    }
    return (
      vehicle.callSign.toLowerCase().includes(normalizedVehicleQuery) ||
      vehicle.id.toLowerCase().includes(normalizedVehicleQuery) ||
      (vehicle.station ?? "").toLowerCase().includes(normalizedVehicleQuery)
    );
  });
  const isVehicleFiltered =
    normalizedVehicleQuery ||
    vehicleAvailability !== "all" ||
    vehicleType !== "all";

  const filteredAssignments = assignments.filter((assignment) => {
    if (assignmentStatus === "validated" && !assignment.validated_at) {
      return false;
    }
    if (assignmentStatus === "rejected" && !assignment.rejected_at) {
      return false;
    }
    if (
      assignmentStatus === "pending" &&
      (assignment.validated_at || assignment.rejected_at)
    ) {
      return false;
    }

    return (
      assignment.proposal_id.toLowerCase() ||
      assignment.incident_id.toLowerCase()
    );
  });
  const isAssignmentFiltered = assignmentStatus !== "all";

  if (isCollapsed) {
    return (
      <div className="flex h-full flex-col items-center rounded-2xl border border-white/10 bg-black/60 py-4 backdrop-blur-xl transition-all duration-300 w-14">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/60 hover:bg-white/10 hover:text-white"
          onClick={() => setIsCollapsed(false)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="mt-6 flex flex-col items-center gap-4">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "animate-pulse bg-emerald-500" : "bg-white/30",
            )}
            title={isConnected ? "Connecté" : "Hors ligne"}
          />

          <div className="flex flex-col items-center gap-3">
            <MiniCounter
              count={activeIncidents.length}
              variant={criticalIncidents.length > 0 ? "emergency" : "warning"}
              icon={<Zap className="h-3.5 w-3.5" />}
              title={`${activeIncidents.length} incident(s) actif(s)`}
            />
            <MiniCounter
              count={availableVehicles.length}
              variant="success"
              icon={<Truck className="h-3.5 w-3.5" />}
              title={`${availableVehicles.length} véhicule(s) disponible(s)`}
            />
            <MiniCounter
              count={assignments.length}
              variant={assignments.length > 0 ? "info" : "muted"}
              icon={<Users className="h-3.5 w-3.5" />}
              title={`${assignments.length} affectation(s)`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-80 flex-col rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl transition-all duration-300 lg:w-[340px]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <Radio className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Tableau de bord
            </h2>
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isConnected ? "animate-pulse bg-emerald-500" : "bg-white/30",
                )}
              />
              <span className="text-[10px] font-medium text-white/50">
                {isConnected ? "Flux temps réel actif" : "Hors ligne"}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/50 hover:bg-white/10 hover:text-white"
          onClick={() => setIsCollapsed(true)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-white/10 p-3">
        <MetricCard
          label="Incidents"
          value={activeIncidents.length}
          subLabel={
            criticalIncidents.length > 0
              ? `${criticalIncidents.length} critique${criticalIncidents.length > 1 ? "s" : ""}`
              : "actifs"
          }
          variant={
            criticalIncidents.length > 0
              ? "emergency"
              : activeIncidents.length > 0
                ? "warning"
                : "muted"
          }
          icon={<Zap className="h-3.5 w-3.5" />}
        />
        <MetricCard
          label="Disponibles"
          value={availableVehicles.length}
          subLabel={`/ ${vehicles.length} total`}
          variant={availableVehicles.length > 0 ? "success" : "warning"}
          icon={<Truck className="h-3.5 w-3.5" />}
        />
        <MetricCard
          label="Engages"
          value={engagedVehicles.length}
          subLabel="sur intervention"
          variant={engagedVehicles.length > 0 ? "info" : "muted"}
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
        />
      </div>

      <Tabs defaultValue="incidents" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-3 mt-2 grid w-auto grid-cols-3 rounded-lg border border-white/10 bg-white/5 p-1">
          <TabsTrigger
            value="incidents"
            className="text-[11px] text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            Incidents
          </TabsTrigger>
          <TabsTrigger
            value="fleet"
            className="text-[11px] text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            Flotte
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            className="relative text-[11px] text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            Affect.
            {assignments.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {assignments.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="incidents"
          className="flex min-h-0 flex-1 flex-col px-2"
        >
          <FiltersPanel
            query={incidentQuery}
            onQueryChange={setIncidentQuery}
            placeholder="Rechercher un incident..."
          >
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={incidentSeverity}
                onValueChange={(value) =>
                  setIncidentSeverity(value as IncidentSeverity | "all")
                }
              >
                <SelectTrigger className="h-8 border-white/10 bg-white/10 text-xs text-white hover:bg-white/15">
                  <SelectValue placeholder="Criticite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes criticités</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Faible</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={incidentAssignment}
                onValueChange={(value) =>
                  setIncidentAssignment(
                    value as "all" | "assigned" | "unassigned",
                  )
                }
              >
                <SelectTrigger className="h-8 border-white/10 bg-white/10 text-xs text-white hover:bg-white/15">
                  <SelectValue placeholder="Affectation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="assigned">Assigné</SelectItem>
                  <SelectItem value="unassigned">Non assigné</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FiltersPanel>
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-1.5 pb-2 pr-2">
              {filteredIncidents.length === 0 ? (
                <EmptyState
                  icon={<Zap className="h-8 w-8" />}
                  title={
                    isIncidentFiltered ? "Aucun resultat" : "Aucun incident"
                  }
                  description={
                    isIncidentFiltered
                      ? "Ajustez vos filtres pour elargir la recherche"
                      : "Aucun incident signale pour le moment"
                  }
                />
              ) : (
                filteredIncidents.map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onFocus={onFocusIncident}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="fleet"
          className="flex min-h-0 flex-1 flex-col px-2"
        >
          <FiltersPanel
            query={vehicleQuery}
            onQueryChange={setVehicleQuery}
            placeholder="Rechercher un vehicule..."
          >
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={vehicleAvailability}
                onValueChange={(value) =>
                  setVehicleAvailability(value as VehicleStatus | "all")
                }
              >
                <SelectTrigger className="h-8 border-white/10 bg-white/10 text-xs text-white hover:bg-white/15">
                  <SelectValue placeholder="Disponibilite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="engaged">Engagé</SelectItem>
                  <SelectItem value="on_intervention">Intervention</SelectItem>
                  <SelectItem value="returning">Retour</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="unavailable">Indisponible</SelectItem>
                  <SelectItem value="out_of_service">Hors service</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={vehicleType}
                onValueChange={(value) =>
                  setVehicleType(value as VehicleType | "all")
                }
              >
                <SelectTrigger className="h-8 border-white/10 bg-white/10 text-xs text-white hover:bg-white/15">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="VSAV">VSAV</SelectItem>
                  <SelectItem value="FPT">FPT</SelectItem>
                  <SelectItem value="EPA">EPA</SelectItem>
                  <SelectItem value="VTU">VTU</SelectItem>
                  <SelectItem value="BEA">BEA</SelectItem>
                  <SelectItem value="CCF">CCF</SelectItem>
                  <SelectItem value="CCGC">CCGC</SelectItem>
                  <SelectItem value="FPTSR">FPTSR</SelectItem>
                  <SelectItem value="PC_Mobile">PC Mobile</SelectItem>
                  <SelectItem value="VAR">VAR</SelectItem>
                  <SelectItem value="VIRT">VIRT</SelectItem>
                  <SelectItem value="VLCG">VLCG</SelectItem>
                  <SelectItem value="VLM">VLM</SelectItem>
                  <SelectItem value="VLR">VLR</SelectItem>
                  <SelectItem value="VPI">VPI</SelectItem>
                  <SelectItem value="VSR">VSR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FiltersPanel>
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-1.5 pb-2 pr-2">
              {filteredVehicles.length === 0 ? (
                <EmptyState
                  icon={<Truck className="h-8 w-8" />}
                  title={
                    isVehicleFiltered ? "Aucun resultat" : "Aucun vehicule"
                  }
                  description={
                    isVehicleFiltered
                      ? "Ajustez vos filtres pour elargir la recherche"
                      : "Aucun vehicule disponible"
                  }
                />
              ) : (
                filteredVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onFocus={onFocusVehicle}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="assignments"
          className="flex min-h-0 flex-1 flex-col px-2"
        >
          <FiltersPanel>
            <Select
              value={assignmentStatus}
              onValueChange={(value) =>
                setAssignmentStatus(
                  value as "all" | "pending" | "validated" | "rejected",
                )
              }
            >
              <SelectTrigger className="h-8 border-white/10 bg-white/10 text-xs text-white hover:bg-white/15">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="validated">Validées</SelectItem>
                <SelectItem value="rejected">Rejetées</SelectItem>
              </SelectContent>
            </Select>
          </FiltersPanel>
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-1.5 pb-2 pr-2">
              {filteredAssignments.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-8 w-8" />}
                  title={
                    isAssignmentFiltered
                      ? "Aucun resultat"
                      : "Aucune affectation"
                  }
                  description={
                    isAssignmentFiltered
                      ? "Ajustez vos filtres pour elargir la recherche"
                      : "Aucune proposition en attente"
                  }
                />
              ) : (
                filteredAssignments.map((assignment) => (
                  <AssignmentCard
                    key={`${assignment.proposal_id}-${assignment.generated_at}`}
                    assignment={assignment}
                    resolve={resolve}
                    onValidate={onValidateAssignment}
                    onReject={onRejectAssignment}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
