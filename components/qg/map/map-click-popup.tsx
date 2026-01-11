"use client";

import { useMemo, useState } from "react";
import { Popup } from "react-map-gl/maplibre";
import { AlertTriangle, Crosshair, X, Navigation } from "lucide-react";
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
    phaseTypes.length > 0 ? phaseTypes[0].phase_type_id : "",
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
      maxWidth="280px"
      onClose={onClose}
      className="qg-map-popup"
    >
      <div
        className="relative w-68"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Fleche indicatrice */}
        <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-white/10 bg-black/85" />

        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/85 shadow-2xl backdrop-blur-2xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-lg">
                <Crosshair className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Point carte</p>
                <div className="flex items-center gap-1 text-[10px] text-white/50">
                  <Navigation className="h-2.5 w-2.5" />
                  <span>
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fermer"
              className="h-7 w-7 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Contenu */}
          <div className="space-y-3 p-3">
            {/* Section declaration incident */}
            <div className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                Declarer un incident
              </p>
              <div className="grid gap-2">
                <Select
                  value={phaseTypeId}
                  onValueChange={setPhaseTypeId}
                  disabled={isDeclaringIncident || isLoadingPhaseTypes}
                >
                  <SelectTrigger className="h-8 w-full border-white/10 bg-white/5 text-xs text-white hover:bg-white/10 focus:ring-white/20">
                    <SelectValue
                      placeholder={
                        isLoadingPhaseTypes ? "Chargement..." : "Type de phase"
                      }
                      aria-label={phaseTypeLabel || "Type de phase"}
                    />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    className="border-white/10 bg-black/90 backdrop-blur-xl"
                  >
                    {phaseTypes.map((phase) => (
                      <SelectItem
                        key={phase.phase_type_id}
                        value={phase.phase_type_id}
                        className="text-white focus:bg-white/10 focus:text-white"
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
                  className="h-8 border-white/10 bg-white/5 text-xs text-white placeholder:text-white/30 hover:bg-white/10 focus:ring-white/20"
                  disabled={isDeclaringIncident}
                />
              </div>
              <Button
                size="sm"
                onClick={handleDeclareIncident}
                disabled={
                  isDeclaringIncident || isLoadingPhaseTypes || !phaseTypeId
                }
                className="h-8 w-full justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-xs text-white shadow-lg shadow-red-500/25 hover:from-red-500 hover:to-red-400"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {isDeclaringIncident
                  ? "Declaration..."
                  : "Declarer un incident"}
              </Button>
            </div>

            {/* Separateur */}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[9px] text-white/30">ou</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Section point d'interet */}
            <InterestPointQuickCreate
              latitude={latitude}
              longitude={longitude}
              interestPointKinds={interestPointKinds}
              onCreate={onCreateInterestPoint}
              isSubmitting={isCreatingInterestPoint}
            />
          </div>
        </div>
      </div>
    </Popup>
  );
}
