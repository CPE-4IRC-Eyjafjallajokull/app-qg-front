"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { adminRequest } from "@/lib/admin.service";
import { getAdminPath, getAdminResourceByKey } from "@/lib/admin/registry";
import { getVisibleFields } from "@/lib/admin/types";
import {
  getInputType,
  isBlank,
  parseValue,
  toLabel,
  type FormState,
} from "@/lib/admin/field-utils";
import { useReferenceResolver } from "@/hooks/useReferenceResolver";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReferenceSelect } from "@/components/admin/reference-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { formatErrorMessage } from "@/lib/error-message";

type VehicleRecord = Record<string, unknown>;

const vehiclesResource = getAdminResourceByKey("vehicles");

export function VehiclesList() {
  const createFields = useMemo(() => vehiclesResource?.fields ?? [], []);
  const readFields = useMemo(() => vehiclesResource?.readFields ?? [], []);
  const endpoint = vehiclesResource?.endpoint ?? "";
  const basePath = vehiclesResource ? getAdminPath(vehiclesResource) : "/admin";

  const [items, setItems] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [referenceRefreshKey, setReferenceRefreshKey] = useState(0);

  // Get visible fields (filters out hidden fields)
  const displayFields = useMemo(
    () => getVisibleFields(readFields),
    [readFields],
  );

  // Use the reference resolver hook
  const { getDisplayValue } = useReferenceResolver({
    fields: createFields,
    readFields: displayFields,
    cacheKey: "vehicles-list",
    refreshKey: referenceRefreshKey,
  });

  const emptyForm = useMemo(() => {
    return createFields.reduce<FormState>((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {});
  }, [createFields]);

  const [formState, setFormState] = useState<FormState>(emptyForm);

  useEffect(() => {
    setFormState(emptyForm);
  }, [emptyForm]);

  const fetchVehicles = useCallback(async () => {
    if (!endpoint) {
      return;
    }
    setLoading(true);
    try {
      const data = await adminRequest<VehicleRecord[]>(endpoint, {
        method: "GET",
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch vehicles", error);
      toast.error(
        formatErrorMessage("Erreur lors du chargement des vehicules.", error),
      );
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void fetchVehicles();
  }, [fetchVehicles]);

  const handleInputChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = () => {
    return createFields.reduce<Record<string, unknown>>((acc, field) => {
      const raw = formState[field.key] ?? "";
      if (isBlank(raw)) {
        return acc;
      }
      const parsed = parseValue(raw, field.type);
      if (parsed === undefined) {
        return acc;
      }
      acc[field.key] = parsed;
      return acc;
    }, {});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!endpoint) {
      toast.error("Configuration vehicule manquante.");
      return;
    }

    const missingRequired = createFields.filter(
      (field) => field.required && isBlank(formState[field.key]),
    );

    if (missingRequired.length > 0) {
      toast.error("Merci de renseigner les champs requis.");
      return;
    }

    const payload = buildPayload();
    if (Object.keys(payload).length === 0) {
      toast.error("Aucune donnee a envoyer.");
      return;
    }

    setSaving(true);
    try {
      await adminRequest(endpoint, {
        method: "POST",
        body: payload,
      });
      toast.success("Vehicule cree.");
      setFormState(emptyForm);
      await fetchVehicles();
    } catch (error) {
      console.error("Create vehicle error", error);
      toast.error(
        formatErrorMessage("Erreur lors de la creation du vehicule.", error),
      );
    } finally {
      setSaving(false);
    }
  };

  if (!vehiclesResource) {
    return (
      <div className="text-sm text-muted-foreground">
        Configuration vehicules indisponible.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{vehiclesResource.title}</CardTitle>
          {vehiclesResource.description ? (
            <CardDescription>{vehiclesResource.description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Nouvelle entree vehicule
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setReferenceRefreshKey((prev) => prev + 1);
                void fetchVehicles();
              }}
              disabled={loading}
            >
              Rafraichir
            </Button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              {createFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`vehicles-${field.key}`}>
                    {field.label}
                    {field.required ? " *" : ""}
                  </Label>
                  {field.reference ? (
                    <ReferenceSelect
                      id={`vehicles-${field.key}`}
                      fieldKey={field.key}
                      reference={field.reference}
                      value={formState[field.key] ?? ""}
                      placeholder={field.placeholder}
                      disabled={saving}
                      refreshKey={referenceRefreshKey}
                      onChange={(value) => handleInputChange(field.key, value)}
                    />
                  ) : field.type === "boolean" ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`vehicles-${field.key}`}
                        checked={formState[field.key] === "true"}
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            field.key,
                            checked ? "true" : "false",
                          )
                        }
                        disabled={saving}
                      />
                      <Label
                        htmlFor={`vehicles-${field.key}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {formState[field.key] === "true" ? "Oui" : "Non"}
                      </Label>
                    </div>
                  ) : (
                    <Input
                      id={`vehicles-${field.key}`}
                      type={getInputType(field.type)}
                      placeholder={
                        field.placeholder ??
                        (field.type === "datetime"
                          ? "YYYY-MM-DDTHH:MM"
                          : field.type === "date"
                            ? "YYYY-MM-DD"
                            : undefined)
                      }
                      value={formState[field.key] ?? ""}
                      onChange={(event) =>
                        handleInputChange(field.key, event.target.value)
                      }
                      disabled={saving}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={saving}>
                Creer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des vehicules</CardTitle>
          <CardDescription>
            {loading ? "Chargement..." : `${items.length} enregistrements`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {displayFields.map((field) => (
                  <TableHead key={field}>{toLabel(field)}</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={displayFields.length + 1}
                    className="text-center text-sm text-muted-foreground"
                  >
                    Aucun vehicule disponible.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => {
                  const vehicleId = item.vehicle_id as string | undefined;
                  return (
                    <TableRow key={vehicleId ?? index}>
                      {displayFields.map((field) => (
                        <TableCell key={`${field}-${index}`}>
                          {getDisplayValue(item, field)}
                        </TableCell>
                      ))}
                      <TableCell>
                        {vehicleId ? (
                          <Button asChild size="sm" variant="outline">
                            <Link href={`${basePath}/${vehicleId}`}>
                              Details
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            Details
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
