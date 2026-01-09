"use client";

import type { Incident } from "@/types/qg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AlertTriangle, ChevronDown, LocateFixed, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { severityConfig, statusConfig, formatDate } from "./card-configs";

export function IncidentCard({
  incident,
  onFocus,
}: {
  incident: Incident;
  onFocus?: (incident: Incident) => void;
}) {
  const severity = severityConfig[incident.severity];
  const status = statusConfig[incident.status];

  return (
    <Collapsible defaultOpen={incident.status === "new"}>
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md",
          severity.border,
        )}
      >
        {/* Header - toujours visible */}
        <CollapsibleTrigger className="flex w-full items-center gap-2 p-2.5 text-left">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              severity.bg,
              severity.text,
            )}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-slate-900">
                {incident.title}
              </p>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Badge
                className={cn(
                  "shrink-0 px-1.5 py-0 text-[9px]",
                  severity.bg,
                  severity.text,
                )}
              >
                {severity.label}
              </Badge>
              <span className="truncate">
                {formatDate(incident.reportedAt)}
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-500 hover:text-slate-700"
              title="Zoomer sur l'incident"
              aria-label="Zoomer sur l'incident"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onFocus?.(incident);
              }}
            >
              <LocateFixed className="h-3.5 w-3.5" />
            </Button>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
          </div>
        </CollapsibleTrigger>

        {/* Contenu dépliable */}
        <CollapsibleContent>
          <div className="space-y-2 border-t border-slate-100 px-2.5 pb-2.5 pt-2">
            {/* Description */}
            {incident.description && (
              <p className="text-xs leading-relaxed text-slate-600">
                {incident.description}
              </p>
            )}

            {/* Phases */}
            {incident.phases.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {incident.phases.map((phase, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600"
                  >
                    {phase}
                  </Badge>
                ))}
              </div>
            )}

            {/* Footer avec statut */}
            <div className="flex items-center justify-between pt-1">
              <Badge
                variant="outline"
                className={cn("px-1.5 py-0.5 text-[10px]", status.className)}
              >
                {status.label}
              </Badge>
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <MapPin className="h-2.5 w-2.5" />
                <span className="truncate">
                  {incident.location.lat.toFixed(3)},{" "}
                  {incident.location.lng.toFixed(3)}
                </span>
              </span>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
