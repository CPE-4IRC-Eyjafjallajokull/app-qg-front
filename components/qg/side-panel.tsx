"use client";

import { useState } from "react";
import type { AssignmentProposal, Incident, Vehicle } from "@/types/qg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
};

export function SidePanel({
  incidents,
  vehicles,
  assignments,
  onValidateAssignment,
  onRejectAssignment,
}: SidePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isConnected } = useLiveEvents();
  const { resolve } = useResolver();

  const activeIncidents = incidents.filter((incident) =>
    ["new", "assigned"].includes(incident.status),
  );
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "available",
  );

  // Version repliée
  if (isCollapsed) {
    return (
      <div className="flex h-full w-14 flex-col items-center rounded-2xl border border-slate-200/80 bg-white/90 py-3 shadow-sm backdrop-blur-md transition-all duration-300">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsCollapsed(false)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="mt-4 flex flex-col items-center gap-3">
          {/* Indicateur Live */}
          <div
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              isConnected ? "animate-pulse bg-emerald-500" : "bg-slate-300",
            )}
            title={isConnected ? "Connecté" : "Hors ligne"}
          />

          {/* Compteurs */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-xs font-semibold text-red-700"
              title={`${activeIncidents.length} incident(s) actif(s)`}
            >
              {activeIncidents.length}
            </div>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700"
              title={`${availableVehicles.length} véhicule(s) disponible(s)`}
            >
              {availableVehicles.length}
            </div>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-semibold text-blue-700"
              title={`${assignments.length} Assignment(s)`}
            >
              {assignments.length}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-80 flex-col rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md transition-all duration-300 lg:w-96">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
            Flux opérationnel
          </p>
          <h2 className="text-base font-semibold text-slate-900">
            Centre de commande
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "gap-1.5 transition-colors",
              isConnected
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 text-slate-600",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isConnected ? "animate-pulse bg-emerald-300" : "bg-slate-400",
              )}
            />
            {isConnected ? "Live" : "Hors ligne"}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="incidents"
        className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2"
      >
        <TabsList className="grid w-full grid-cols-3 rounded-lg border border-slate-200/70 bg-slate-100/80 p-1">
          <TabsTrigger
            value="incidents"
            className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Incidents ({activeIncidents.length})
          </TabsTrigger>
          <TabsTrigger
            value="fleet"
            className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Flotte ({availableVehicles.length})
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Affect. ({assignments.length})
          </TabsTrigger>
        </TabsList>

        {/* Incidents */}
        <TabsContent value="incidents" className="mt-2 min-h-0 flex-1">
          <ScrollArea className="h-full pr-1">
            <div className="space-y-1.5 pb-1">
              {incidents.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  Aucun incident signalé
                </p>
              ) : (
                incidents.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Flotte */}
        <TabsContent value="fleet" className="mt-2 min-h-0 flex-1">
          <ScrollArea className="h-full pr-1">
            <div className="space-y-1.5 pb-1">
              {vehicles.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  Aucun véhicule disponible
                </p>
              ) : (
                vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Assignments */}
        <TabsContent value="assignments" className="mt-2 min-h-0 flex-1">
          <ScrollArea className="h-full pr-1">
            <div className="space-y-1.5 pb-1">
              {assignments.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  Aucune Assignment en attente
                </p>
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
