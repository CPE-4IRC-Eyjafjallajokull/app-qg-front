"use client";

import { useMemo, useState } from "react";
import { Popup } from "react-map-gl/maplibre";
import { AlertTriangle, Crosshair, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InterestPointCreatePayload, InterestPointKind } from "@/types/qg";
import { InterestPointQuickCreate } from "@/components/qg/map/interest-point-quick-create";
import type { IncidentPhaseType } from "@/lib/incidents/service";

type MapClickPopupProps = {
  latitude: number;
  longitude: number;
  onClose: () => void;
  onDeclareIncident: (payload: {
    phaseTypeId: string;
    priority: number | null;
  }) => void;
  isDeclaringIncident: boolean;
  onCreateInterestPoint: (payload: InterestPointCreatePayload) => void;
  interestPointKinds: InterestPointKind[];
  phaseTypes: IncidentPhaseType[];
  isLoadingPhaseTypes: boolean;
  isCreatingInterestPoint: boolean;
};

export function MapClickPopup({
  latitude,
  longitude,
  onClose,
  onDeclareIncident,
  isDeclaringIncident,
  onCreateInterestPoint,
  interestPointKinds,
  phaseTypes,
  isLoadingPhaseTypes,
  isCreatingInterestPoint,
}: MapClickPopupProps) {
  const [phaseTypeId, setPhaseTypeId] = useState(() =>
    phaseTypes.length > 0 ? phaseTypes[0].phase_type_id : ""
  );
  const [priority, setPriority] = useState("");

  const phaseTypeLabel = useMemo(() => {
    return (
      phaseTypes.find((phase) => phase.phase_type_id === phaseTypeId)?.label ??
      ""
    );
  }, [phaseTypes, phaseTypeId]);

  const handleDeclareIncident = () => {
    if (!phaseTypeId) {
      return;
    }
    const numericPriority =
      priority.trim().length > 0 ? Number.parseInt(priority, 10) : null;
    onDeclareIncident({
      phaseTypeId,
      priority: Number.isNaN(numericPriority) ? null : numericPriority,
    });
  };

  return (
    <Popup
      latitude={latitude}
      longitude={longitude}
      anchor="top"
      offset={16}
      closeButton={false}
      closeOnClick={false}
      maxWidth="260px"
      onClose={onClose}
      className="qg-map-popup"
    >
      <div
        className="relative w-64"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-slate-200/80 bg-white/95 shadow-sm" />
        <div className="relative space-y-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white">
                <Crosshair className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Point carte
                </p>
                <p className="text-[11px] text-slate-500">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fermer"
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-2 text-xs text-slate-600">
            <Select
              value={phaseTypeId}
              onValueChange={setPhaseTypeId}
              disabled={isDeclaringIncident || isLoadingPhaseTypes}
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue
                  placeholder={
                    isLoadingPhaseTypes ? "Chargement..." : "Type de phase"
                  }
                  aria-label={phaseTypeLabel || "Type de phase"}
                />
              </SelectTrigger>
              <SelectContent align="start">
                {phaseTypes.map((phase) => (
                  <SelectItem
                    key={phase.phase_type_id}
                    value={phase.phase_type_id}
                  >
                    {phase.label || phase.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              placeholder="Priorite (optionnel)"
              inputMode="numeric"
              className="h-8 text-xs"
              disabled={isDeclaringIncident}
            />
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleDeclareIncident}
            disabled={
              isDeclaringIncident || isLoadingPhaseTypes || !phaseTypeId
            }
            className="h-8 w-full justify-center gap-2 text-xs"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {isDeclaringIncident ? "Declaration..." : "Declarer un incident"}
          </Button>

          <div className="h-px w-full bg-slate-200/60" />

          <InterestPointQuickCreate
            latitude={latitude}
            longitude={longitude}
            interestPointKinds={interestPointKinds}
            onCreate={onCreateInterestPoint}
            isSubmitting={isCreatingInterestPoint}
          />
        </div>
      </div>
    </Popup>
  );
}
