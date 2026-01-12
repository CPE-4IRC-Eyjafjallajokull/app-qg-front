"use client";

import type { Incident } from "@/types/qg";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AlertTriangle, ChevronDown, Layers, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatIncidentDate,
  severityConfig,
  statusConfig,
} from "./incident-card-utils";

type IncidentClosedCardProps = {
  incident: Incident;
};

export function IncidentClosedCard({ incident }: IncidentClosedCardProps) {
  const severity = severityConfig[incident.severity];
  const status = statusConfig.resolved;
  const endedAtLabel = incident.endedAt
    ? formatIncidentDate(incident.endedAt)
    : formatIncidentDate(incident.reportedAt);

  return (
    <Collapsible defaultOpen={false}>
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-white/5 backdrop-blur-sm transition-all",
          severity.border,
        )}
      >
        <CollapsibleTrigger asChild>
          <div
            className="flex w-full items-center gap-2 p-2 text-left"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) {
                return;
              }
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.currentTarget.click();
              }
            }}
          >
            <div
              className={cn(
                "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                severity.bg,
              )}
            >
              <AlertTriangle className={cn("h-4 w-4", severity.text)} />
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white whitespace-normal">
                {incident.title}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-4 px-1.5 text-[9px]",
                    severity.bg,
                    severity.text,
                    severity.border,
                  )}
                >
                  {severity.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("h-4 px-1.5 text-[9px]", status.className)}
                >
                  {status.label}
                </Badge>
                <span className="text-[10px] text-white/40">
                  {endedAtLabel}
                </span>
              </div>
            </div>

            <ChevronDown className="h-4 w-4 shrink-0 text-white/30 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-2 border-t border-white/10 px-2 pb-2 pt-2">
            {incident.description && (
              <p className="text-xs leading-relaxed text-white/60">
                {incident.description}
              </p>
            )}

            {incident.phases.length > 0 && (
              <div className="space-y-1.5">
                {incident.phases.map((phase) => {
                  const assignmentCount = phase.vehicleAssignments?.length ?? 0;
                  const phaseTitle = phase.label || phase.code;
                  const phaseMeta = phase.endedAt
                    ? `${formatIncidentDate(phase.endedAt)}`
                    : "";

                  return (
                    <div
                      key={phase.id}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
                        <Layers className="h-3.5 w-3.5 text-white/40" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-white whitespace-normal">
                          {phaseTitle}
                        </p>
                        {phaseMeta ? (
                          <p className="truncate text-[10px] text-white/40 whitespace-normal">
                            {phaseMeta}
                          </p>
                        ) : null}
                      </div>
                      {assignmentCount > 0 ? (
                        <Badge
                          variant="outline"
                          className="border-white/20 bg-white/5 text-[9px] text-white/40"
                        >
                          {assignmentCount} véhicule
                          {assignmentCount > 1 ? "s" : ""}
                        </Badge>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            <span className="flex items-center gap-1 text-[10px] text-white/30">
              <MapPin className="h-2.5 w-2.5" />
              <span className="truncate">
                {incident.location.lat.toFixed(3)},{" "}
                {incident.location.lng.toFixed(3)}
              </span>
            </span>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
