"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { LoaderCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatErrorMessage } from "@/lib/error-message";
import {
  createIncidentPhase,
  fetchIncidentPhaseTypes,
  type IncidentPhaseType,
} from "@/lib/incidents/service";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type IncidentPhaseDialogProps = {
  incidentId: string;
  trigger?: ReactNode;
};

const toDateTimeLocal = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function IncidentPhaseDialog({
  incidentId,
  trigger,
}: IncidentPhaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [phaseTypeId, setPhaseTypeId] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [phaseTypes, setPhaseTypes] = useState<IncidentPhaseType[]>([]);
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
    setStartedAt((current) => current || toDateTimeLocal(new Date()));

    fetchIncidentPhaseTypes()
      .then((data) => {
        if (!isActive) {
          return;
        }
        setPhaseTypes(data);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }
        setHasError(true);
        toast.error(
          formatErrorMessage(
            "Erreur lors du chargement des types de phase.",
            error,
          ),
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

  const phaseTypeOptions = useMemo<ComboboxOption[]>(
    () =>
      phaseTypes.map((type) => ({
        value: type.phase_type_id,
        label: type.label?.trim() || type.code,
        description: type.code,
      })),
    [phaseTypes],
  );

  const handleSubmit = async () => {
    if (!phaseTypeId || !startedAt || !incidentId) {
      return;
    }

    const parsedDate = new Date(startedAt);
    if (Number.isNaN(parsedDate.getTime())) {
      toast.error("Date de debut invalide.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createIncidentPhase(incidentId, {
        phase_type_id: phaseTypeId,
        priority: 0,
        started_at: parsedDate.toISOString(),
      });
      toast.success("Phase creee.");
      setOpen(false);
      setPhaseTypeId("");
      setStartedAt("");
    } catch (error) {
      toast.error(
        formatErrorMessage("Erreur lors de la creation de la phase.", error),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    !phaseTypeId || !startedAt || isSubmitting || hasError;

  const phaseTypeStatusLabel = hasError
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
          setPhaseTypeId("");
          setStartedAt("");
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
          >
            <Plus className="h-3.5 w-3.5" />
            Nouvelle phase
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle phase</DialogTitle>
          <DialogDescription>
            Selectionner le type de phase et l&apos;heure de debut.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`phase-type-${incidentId}`}>Type de phase</Label>
            <Combobox
              id={`phase-type-${incidentId}`}
              value={phaseTypeId}
              options={phaseTypeOptions}
              onValueChange={setPhaseTypeId}
              placeholder={phaseTypeStatusLabel ?? "Selectionner un type"}
              searchPlaceholder="Rechercher un type..."
              emptyLabel={phaseTypeStatusLabel ?? "Aucun type disponible"}
              disabled={hasError || isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`phase-started-at-${incidentId}`}>
              Debut de phase
            </Label>
            <Input
              id={`phase-started-at-${incidentId}`}
              type="datetime-local"
              value={startedAt}
              onChange={(event) => setStartedAt(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Annuler
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="gap-2"
          >
            {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Creer la phase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
