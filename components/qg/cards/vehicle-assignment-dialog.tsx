"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Vehicle } from "@/types/qg";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatErrorMessage } from "@/lib/error-message";
import {
  fetchIncidentAssignmentOptions,
  type IncidentAssignmentOption,
} from "@/lib/incidents/service";
import { assignVehicleToIncident } from "@/lib/vehicle-assignments/service";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type VehicleAssignmentDialogProps = {
  vehicle: Vehicle;
  trigger?: ReactNode;
};

const formatIncidentDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

export function VehicleAssignmentDialog({
  vehicle,
  trigger,
}: VehicleAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [incidentId, setIncidentId] = useState("");
  const [incidentPhaseId, setIncidentPhaseId] = useState("");
  const [incidents, setIncidents] = useState<IncidentAssignmentOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isActive = true;

    setIsLoading(true);
    setHasError(false);

    fetchIncidentAssignmentOptions()
      .then((data) => {
        if (!isActive) {
          return;
        }
        setIncidents(data);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }
        setHasError(true);
        toast.error(
          formatErrorMessage("Erreur lors du chargement des incidents.", error),
        );
      })
      .finally(() => {
        if (!isActive) {
          return;
        }
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [open]);

  const incidentOptions = useMemo<ComboboxOption[]>(
    () =>
      incidents.map((incident) => ({
        value: incident.incident_id,
        label: incident.title,
        description: [
          incident.address,
          formatIncidentDate(incident.created_at),
          `${incident.phases.length} phase(s)`,
        ]
          .filter((part) => Boolean(part && part.length > 0))
          .join(" · "),
      })),
    [incidents],
  );

  const selectedIncident = useMemo(
    () => incidents.find((incident) => incident.incident_id === incidentId),
    [incidents, incidentId],
  );

  const phaseOptions = useMemo<ComboboxOption[]>(() => {
    if (!selectedIncident) {
      return [];
    }
    return selectedIncident.phases.map((phase) => ({
      value: phase.incident_phase_id,
      label: phase.label,
      description: phase.code,
    }));
  }, [selectedIncident]);

  useEffect(() => {
    if (!incidentId) {
      setIncidentPhaseId("");
      return;
    }
    if (!phaseOptions.some((phase) => phase.value === incidentPhaseId)) {
      setIncidentPhaseId("");
    }
  }, [incidentId, incidentPhaseId, phaseOptions]);

  const handleSubmit = async () => {
    if (!incidentPhaseId || !vehicle.id) {
      return;
    }
    setIsSubmitting(true);
    try {
      await assignVehicleToIncident({
        vehicle_id: vehicle.id,
        incident_phase_id: incidentPhaseId,
      });
      toast.success("Vehicule assigne.");
      setOpen(false);
      setIncidentId("");
      setIncidentPhaseId("");
    } catch (error) {
      toast.error(
        formatErrorMessage("Erreur lors de l'affectation du vehicule.", error),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = !incidentId || !incidentPhaseId || isSubmitting;

  const incidentStatusLabel = hasError
    ? "Erreur de chargement"
    : isLoading
      ? "Chargement..."
      : undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setIncidentId("");
          setIncidentPhaseId("");
          setHasError(false);
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn(
              "h-7 gap-1.5 border-primary/30 bg-primary/10 px-2 text-[10px] font-semibold text-white/80",
              "hover:border-primary/40 hover:bg-primary/20 hover:text-white",
            )}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            Assigner
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner le vehicule</DialogTitle>
          <DialogDescription>
            Selectionner un incident et la phase a prendre en charge.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`incident-${vehicle.id}`}>Incident</Label>
            <Combobox
              id={`incident-${vehicle.id}`}
              value={incidentId}
              options={incidentOptions}
              onValueChange={setIncidentId}
              placeholder={incidentStatusLabel ?? "Selectionner un incident"}
              searchPlaceholder="Rechercher un incident..."
              emptyLabel={incidentStatusLabel ?? "Aucun incident trouve"}
              disabled={hasError}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`incident-phase-${vehicle.id}`}>Phase</Label>
            <Combobox
              id={`incident-phase-${vehicle.id}`}
              value={incidentPhaseId}
              options={phaseOptions}
              onValueChange={setIncidentPhaseId}
              placeholder={
                incidentId ? "Selectionner une phase" : "Choisir un incident"
              }
              searchPlaceholder="Rechercher une phase..."
              emptyLabel={
                incidentId ? "Aucune phase disponible" : "Choisir un incident"
              }
              disabled={!incidentId}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Annuler
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              "Assigner"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
