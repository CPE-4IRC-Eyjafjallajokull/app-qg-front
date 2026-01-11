"use client";

import { useState } from "react";
import type { AssignmentProposal, Incident, Vehicle } from "@/types/qg";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
            title={isConnected ? "Connecte" : "Hors ligne"}
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
              title={`${availableVehicles.length} vehicule(s) disponible(s)`}
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
              Centre de Commande
            </h2>
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isConnected ? "animate-pulse bg-emerald-500" : "bg-white/30",
                )}
              />
              <span className="text-[10px] font-medium text-white/50">
                {isConnected ? "Flux temps reel actif" : "Hors ligne"}
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

        <TabsContent value="incidents" className="mt-2 min-h-0 flex-1 px-2">
          <ScrollArea className="h-full">
            <div className="space-y-1.5 pb-2 pr-2">
              {incidents.length === 0 ? (
                <EmptyState
                  icon={<Zap className="h-8 w-8" />}
                  title="Aucun incident"
                  description="Aucun incident signale pour le moment"
                />
              ) : (
                incidents.map((incident) => (
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

        <TabsContent value="fleet" className="mt-2 min-h-0 flex-1 px-2">
          <ScrollArea className="h-full">
            <div className="space-y-1.5 pb-2 pr-2">
              {vehicles.length === 0 ? (
                <EmptyState
                  icon={<Truck className="h-8 w-8" />}
                  title="Aucun vehicule"
                  description="Aucun vehicule disponible"
                />
              ) : (
                vehicles.map((vehicle) => (
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

        <TabsContent value="assignments" className="mt-2 min-h-0 flex-1 px-2">
          <ScrollArea className="h-full">
            <div className="space-y-1.5 pb-2 pr-2">
              {assignments.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-8 w-8" />}
                  title="Aucune affectation"
                  description="Aucune proposition en attente"
                />
              ) : (
                assignments.map((assignment) => (
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

type MiniCounterProps = {
  count: number;
  variant: "emergency" | "warning" | "success" | "info" | "muted";
  icon: React.ReactNode;
  title: string;
};

function MiniCounter({ count, variant, icon, title }: MiniCounterProps) {
  const styles = {
    emergency: "bg-red-500/20 text-red-400 border-red-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    muted: "bg-white/10 text-white/50 border-white/10",
  };

  return (
    <div
      className={cn(
        "flex h-9 w-9 flex-col items-center justify-center rounded-lg border",
        styles[variant],
      )}
      title={title}
    >
      {icon}
      <span className="mt-0.5 text-[10px] font-bold leading-none">{count}</span>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: number;
  subLabel: string;
  variant: "emergency" | "warning" | "success" | "info" | "muted";
  icon: React.ReactNode;
};

function MetricCard({
  label,
  value,
  subLabel,
  variant,
  icon,
}: MetricCardProps) {
  const styles = {
    emergency: "border-red-500/20 bg-red-500/10",
    warning: "border-amber-500/20 bg-amber-500/10",
    success: "border-emerald-500/20 bg-emerald-500/10",
    info: "border-blue-500/20 bg-blue-500/10",
    muted: "border-white/10 bg-white/5",
  };

  const textStyles = {
    emergency: "text-red-400",
    warning: "text-amber-400",
    success: "text-emerald-400",
    info: "text-blue-400",
    muted: "text-white/50",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border p-2",
        styles[variant],
      )}
    >
      <div className={cn("mb-1", textStyles[variant])}>{icon}</div>
      <span
        className={cn("text-xl font-bold leading-none", textStyles[variant])}
      >
        {value}
      </span>
      <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-white/40">
        {label}
      </span>
      <span className="text-[8px] text-white/30">{subLabel}</span>
    </div>
  );
}

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 text-white/20">{icon}</div>
      <p className="text-sm font-medium text-white/50">{title}</p>
      <p className="text-xs text-white/30">{description}</p>
    </div>
  );
}
