"use client";

import type { Incident, Vehicle } from "@/types/qg";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveEvents } from "@/components/live-events-provider";

type SidePanelProps = {
  incidents: Incident[];
  vehicles: Vehicle[];
};

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });

const incidentSeverityTone: Record<Incident["severity"], string> = {
  critical: "bg-red-600 text-white",
  high: "bg-amber-500 text-white",
  medium: "bg-orange-400 text-white",
  low: "bg-emerald-500 text-white",
};

const incidentStatusTone: Record<Incident["status"], string> = {
  new: "border-red-200 text-red-700",
  assigned: "border-sky-200 text-sky-700",
  resolved: "border-emerald-200 text-emerald-700",
};

const vehicleStatusTone: Record<Vehicle["status"], string> = {
  available: "border-emerald-200 text-emerald-700",
  busy: "border-slate-300 text-slate-700",
  maintenance: "border-amber-200 text-amber-700",
};

const incidentStatusLabel: Record<Incident["status"], string> = {
  new: "Nouveau",
  assigned: "Assigne",
  resolved: "Cloture",
};

const vehicleStatusLabel: Record<Vehicle["status"], string> = {
  available: "Disponible",
  busy: "En mission",
  maintenance: "Maintenance",
};

export function SidePanel({ incidents, vehicles }: SidePanelProps) {
  const { isConnected } = useLiveEvents();
  const activeIncidents = incidents.filter((incident) =>
    ["new", "assigned"].includes(incident.status),
  );
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "available",
  );

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white/85 backdrop-blur-md shadow-sm">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Flux operationnel
            </p>
            <h2 className="text-base font-semibold text-slate-900">
              Notifications QG
            </h2>
          </div>
          <Badge
            className={cn(
              "transition-none",
              isConnected
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 text-slate-700",
            )}
          >
            {isConnected ? "Live" : "Hors ligne"}
          </Badge>
        </div>

        <Tabs
          defaultValue="incidents"
          className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 pt-3"
        >
          <TabsList className="grid w-full grid-cols-2 rounded-lg border border-slate-200/70 bg-slate-100 p-1">
            <TabsTrigger value="incidents" className="transition-none">
              Incidents ({activeIncidents.length})
            </TabsTrigger>
            <TabsTrigger value="fleet" className="transition-none">
              Flotte ({availableVehicles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="min-h-0 flex-1">
            <ScrollArea className="h-full pr-3">
              <div className="space-y-3 px-2 pb-2 pt-1">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-slate-700" />
                          <p className="text-sm font-semibold text-slate-900">
                            {incident.title}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          {incident.description}
                        </p>
                      </div>
                      <Badge
                        className={incidentSeverityTone[incident.severity]}
                      >
                        {incident.severity.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                      <span>
                        {incident.id}
                        {incident.sector ? ` • ${incident.sector}` : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "border",
                            incidentStatusTone[incident.status],
                          )}
                        >
                          {incidentStatusLabel[incident.status]}
                        </Badge>
                        <span>{formatTime(incident.reportedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="fleet" className="min-h-0 flex-1">
            <ScrollArea className="h-full pr-3">
              <div className="space-y-3 px-2 pb-2 pt-1">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-slate-700" />
                          <p className="text-sm font-semibold text-slate-900">
                            {vehicle.callSign}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          {vehicle.type} · Equipage {vehicle.crew}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border",
                          vehicleStatusTone[vehicle.status],
                        )}
                      >
                        {vehicleStatusLabel[vehicle.status]}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                      <span>
                        {vehicle.station ? `${vehicle.station} • ` : ""}
                        {vehicle.id}
                      </span>
                      <span>{formatTime(vehicle.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
