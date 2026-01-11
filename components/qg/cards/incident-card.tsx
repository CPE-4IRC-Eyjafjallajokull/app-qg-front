"use client";

import type { Incident } from "@/types/qg";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertTriangle,
  ChevronDown,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatErrorMessage } from "@/lib/error-message";
import { requestAssignmentProposal } from "@/lib/assignment-proposals/service";

const severityConfig: Record<
  Incident["severity"],
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  critical: {
    label: "Critique",
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-500",
  },
  high: {
    label: "Elevee",
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
  },
  medium: {
    label: "Moyenne",
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
  },
  low: {
    label: "Faible",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
  },
};

const statusConfig: Record<
  Incident["status"],
  { label: string; className: string }
> = {
  new: {
    label: "Nouveau",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  assigned: {
    label: "Assigne",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  resolved: {
    label: "Resolu",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
};

const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

export function IncidentCard({
  incident,
  onFocus,
}: {
  incident: Incident;
  onFocus?: (incident: Incident) => void;
}) {
  const [isRequesting, setIsRequesting] = useState(false);
  const severity = severityConfig[incident.severity];
  const status = statusConfig[incident.status];
  const isActionDisabled = isRequesting || incident.status === "resolved";

  const handleRequestAssignment = async () => {
    if (!incident.id) {
      return;
    }
    setIsRequesting(true);
    try {
      await requestAssignmentProposal(incident.id);
      toast.success("Proposition d'affectation demandee.");
    } catch (error) {
      toast.error(
        formatErrorMessage(
          "Erreur lors de la demande de proposition d'affectation.",
          error,
        ),
      );
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Collapsible defaultOpen={incident.status === "new"}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10",
          severity.border,
        )}
      >
        <CollapsibleTrigger className="flex w-full items-center gap-2.5 p-2.5 text-left">
          <div
            className={cn(
              "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              severity.bg,
            )}
          >
            <AlertTriangle className={cn("h-4 w-4", severity.text)} />
            {incident.status === "new" && incident.severity === "critical" && (
              <span
                className={cn(
                  "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full",
                  severity.dot,
                )}
              />
            )}
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">
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
              <span className="text-[10px] text-white/40">
                {formatDate(incident.reportedAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/40 hover:bg-white/10 hover:text-white"
              title="Centrer sur l'incident"
              aria-label="Centrer sur l'incident"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onFocus?.(incident);
              }}
            >
              <LocateFixed className="h-3.5 w-3.5" />
            </Button>
            <ChevronDown className="h-4 w-4 shrink-0 text-white/30 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-2.5 border-t border-white/10 px-2.5 pb-2.5 pt-2.5">
            {incident.description && (
              <p className="text-xs leading-relaxed text-white/60">
                {incident.description}
              </p>
            )}

            {incident.phases.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {incident.phases.map((phase, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-white/10 bg-white/5 px-1.5 py-0 text-[10px] text-white/50"
                  >
                    {phase}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge
                variant="outline"
                className={cn("px-1.5 py-0.5 text-[10px]", status.className)}
              >
                {status.label}
              </Badge>
              <span className="flex items-center gap-1 text-[10px] text-white/30">
                <MapPin className="h-2.5 w-2.5" />
                <span className="truncate">
                  {incident.location.lat.toFixed(3)},{" "}
                  {incident.location.lng.toFixed(3)}
                </span>
              </span>
              <div className="ml-auto">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isActionDisabled}
                  className={cn(
                    "h-7 gap-1.5 border-primary/30 bg-primary/10 px-2 text-[10px] font-semibold text-white/80",
                    "hover:border-primary/40 hover:bg-primary/20 hover:text-white",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleRequestAssignment();
                  }}
                >
                  {isRequesting ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Proposer
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
