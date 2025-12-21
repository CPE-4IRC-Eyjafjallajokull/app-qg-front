"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { adminRequest } from "@/lib/admin.service";
import { getAdminResourceByKey } from "@/lib/admin/registry";
import {
  displayValue,
  formatValue,
  getInputType,
  isBlank,
  parseValue,
  toLabel,
  type FormState,
} from "@/lib/admin/field-utils";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type VehicleRecord = Record<string, unknown>;
type VehicleConsumableType = {
  vehicle_consumable_type_id: string;
  label: string;
  unit?: string | null;
};

type VehicleConsumableStock = {
  consumable_type_id: string;
  current_quantity?: string | null;
  last_update?: string | null;
};

type VehicleAssignment = Record<string, unknown>;
type VehiclePositionLog = Record<string, unknown>;

const vehiclesResource = getAdminResourceByKey("vehicles");
const assignmentsResource = getAdminResourceByKey("vehicle-assignments");
const positionsResource = getAdminResourceByKey("vehicle-position-logs");
const consumableStockResource = getAdminResourceByKey(
  "vehicle-consumables-stock",
);
const consumableTypesResource = getAdminResourceByKey(
  "vehicle-consumable-types",
);

type VehicleDetailProps = {
  vehicleId: string;
};

export function VehicleDetail({ vehicleId }: VehicleDetailProps) {
  const updateFields = useMemo(
    () => vehiclesResource?.updateFields ?? vehiclesResource?.fields ?? [],
    [],
  );
  const vehicleEndpoint = vehiclesResource?.endpoint ?? "";

  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null);
  const [formState, setFormState] = useState<FormState>({});
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [referenceRefreshKey, setReferenceRefreshKey] = useState(0);

  const [positions, setPositions] = useState<VehiclePositionLog[]>([]);
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([]);
  const [consumables, setConsumables] = useState<VehicleConsumableStock[]>([]);
  const [consumableTypes, setConsumableTypes] = useState<
    VehicleConsumableType[]
  >([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const [newConsumableTypeId, setNewConsumableTypeId] = useState("");
  const [newConsumableQuantity, setNewConsumableQuantity] = useState("");
  const [creatingConsumable, setCreatingConsumable] = useState(false);

  const emptyForm = useMemo(() => {
    return updateFields.reduce<FormState>((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {});
  }, [updateFields]);

  useEffect(() => {
    setFormState(emptyForm);
  }, [emptyForm]);

  const fetchVehicle = useCallback(async () => {
    if (!vehicleEndpoint) {
      return;
    }
    setLoadingVehicle(true);
    try {
      const data = await adminRequest<VehicleRecord>(
        `${vehicleEndpoint}/${vehicleId}`,
        { method: "GET" },
      );
      setVehicle(data);
      const nextState = updateFields.reduce<FormState>((acc, field) => {
        acc[field.key] = formatValue(data[field.key], field.type);
        return acc;
      }, {});
      setFormState(nextState);
    } catch (error) {
      console.error("Failed to fetch vehicle", error);
      toast.error("Erreur lors du chargement du vehicule.");
    } finally {
      setLoadingVehicle(false);
    }
  }, [vehicleEndpoint, vehicleId, updateFields]);

  const fetchRelated = useCallback(async () => {
    if (!vehicleId) {
      return;
    }
    setLoadingRelated(true);
    try {
      const [positionsData, assignmentsData, consumablesData, typesData] =
        await Promise.all([
          adminRequest<VehiclePositionLog[]>(
            positionsResource?.endpoint ?? "vehicles/position-logs",
            { method: "GET", query: { vehicle_id: vehicleId } },
          ),
          adminRequest<VehicleAssignment[]>(
            assignmentsResource?.endpoint ?? "vehicles/assignments",
            { method: "GET", query: { vehicle_id: vehicleId } },
          ),
          adminRequest<VehicleConsumableStock[]>(
            consumableStockResource?.endpoint ?? "vehicles/consumables/stock",
            { method: "GET", query: { vehicle_id: vehicleId } },
          ),
          adminRequest<VehicleConsumableType[]>(
            consumableTypesResource?.endpoint ?? "vehicles/consumables/types",
            { method: "GET" },
          ),
        ]);

      setPositions(Array.isArray(positionsData) ? positionsData : []);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      setConsumables(Array.isArray(consumablesData) ? consumablesData : []);
      setConsumableTypes(Array.isArray(typesData) ? typesData : []);
    } catch (error) {
      console.error("Failed to fetch related data", error);
      toast.error("Erreur lors du chargement des donnees associees.");
    } finally {
      setLoadingRelated(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    void fetchVehicle();
  }, [fetchVehicle]);

  useEffect(() => {
    void fetchRelated();
  }, [fetchRelated]);

  const handleInputChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = () => {
    return updateFields.reduce<Record<string, unknown>>((acc, field) => {
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

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vehicleEndpoint) {
      toast.error("Configuration vehicule manquante.");
      return;
    }

    const payload = buildPayload();
    if (Object.keys(payload).length === 0) {
      toast.error("Aucune modification detectee.");
      return;
    }

    setSaving(true);
    try {
      await adminRequest(`${vehicleEndpoint}/${vehicleId}`, {
        method: "PATCH",
        body: payload,
      });
      toast.success("Vehicule mis a jour.");
      await fetchVehicle();
    } catch (error) {
      console.error("Failed to update vehicle", error);
      toast.error("Erreur lors de la mise a jour.");
    } finally {
      setSaving(false);
    }
  };

  const typeById = useMemo(() => {
    return new Map(
      consumableTypes.map((type) => [type.vehicle_consumable_type_id, type]),
    );
  }, [consumableTypes]);

  const availableConsumableTypes = useMemo(() => {
    const used = new Set(
      consumables.map((item) => String(item.consumable_type_id)),
    );
    return consumableTypes.filter(
      (type) => !used.has(type.vehicle_consumable_type_id),
    );
  }, [consumableTypes, consumables]);

  const handleAddConsumable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newConsumableTypeId) {
      toast.error("Selectionnez un type de consommable.");
      return;
    }

    setCreatingConsumable(true);
    try {
      const payload: Record<string, unknown> = {
        vehicle_id: vehicleId,
        consumable_type_id: newConsumableTypeId,
      };
      if (!isBlank(newConsumableQuantity)) {
        const parsed = parseValue(newConsumableQuantity, "number");
        if (parsed !== undefined) {
          payload.current_quantity = parsed;
        }
      }
      await adminRequest(
        consumableStockResource?.endpoint ?? "vehicles/consumables/stock",
        {
          method: "POST",
          body: payload,
        },
      );
      toast.success("Consommable ajoute.");
      setNewConsumableTypeId("");
      setNewConsumableQuantity("");
      await fetchRelated();
    } catch (error) {
      console.error("Failed to add consumable", error);
      toast.error("Erreur lors de l'ajout du consommable.");
    } finally {
      setCreatingConsumable(false);
    }
  };

  if (!vehiclesResource) {
    return (
      <div className="text-sm text-muted-foreground">
        Configuration vehicule indisponible.
      </div>
    );
  }

  const vehicleLabel = (() => {
    const label = displayValue(vehicle?.immatriculation);
    return label === "-" ? vehicleId : label;
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Vehicule
          </p>
          <h2 className="text-lg font-semibold">{vehicleLabel}</h2>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setReferenceRefreshKey((prev) => prev + 1);
            void fetchVehicle();
            void fetchRelated();
          }}
          disabled={loadingVehicle || loadingRelated}
        >
          Rafraichir
        </Button>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Fiche</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="assignments">Affectations</TabsTrigger>
          <TabsTrigger value="consumables">Consommables</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
              <CardDescription>
                {loadingVehicle ? "Chargement..." : `ID: ${vehicleId}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleUpdate}>
                <div className="grid gap-4 md:grid-cols-2">
                  {updateFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`vehicle-${field.key}`}>
                        {field.label}
                        {field.required ? " *" : ""}
                      </Label>
                      {field.reference ? (
                        <ReferenceSelect
                          id={`vehicle-${field.key}`}
                          fieldKey={field.key}
                          reference={field.reference}
                          value={formState[field.key] ?? ""}
                          placeholder={field.placeholder}
                          disabled={saving}
                          refreshKey={referenceRefreshKey}
                          onChange={(value) =>
                            handleInputChange(field.key, value)
                          }
                        />
                      ) : (
                        <Input
                          id={`vehicle-${field.key}`}
                          type={getInputType(field.type)}
                          placeholder={
                            field.placeholder ??
                            (field.type === "boolean"
                              ? "true / false"
                              : undefined)
                          }
                          value={formState[field.key] ?? ""}
                          onChange={(event) =>
                            handleInputChange(field.key, event.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button type="submit" disabled={saving}>
                    Enregistrer
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Historique des positions</CardTitle>
              <CardDescription>
                {loadingRelated
                  ? "Chargement..."
                  : `${positions.length} enregistrements`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "vehicle_position_id",
                      "latitude",
                      "longitude",
                      "timestamp",
                    ].map((field) => (
                      <TableHead key={field}>{toLabel(field)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-sm text-muted-foreground"
                      >
                        Aucun historique disponible.
                      </TableCell>
                    </TableRow>
                  ) : (
                    positions.map((item, index) => (
                      <TableRow
                        key={
                          (item.vehicle_position_id as string | undefined) ??
                          index
                        }
                      >
                        <TableCell>
                          {displayValue(item.vehicle_position_id)}
                        </TableCell>
                        <TableCell>{displayValue(item.latitude)}</TableCell>
                        <TableCell>{displayValue(item.longitude)}</TableCell>
                        <TableCell>{displayValue(item.timestamp)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Affectations</CardTitle>
              <CardDescription>
                {loadingRelated
                  ? "Chargement..."
                  : `${assignments.length} enregistrements`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "vehicle_assignment_id",
                      "intervention_id",
                      "incident_phase_id",
                      "assigned_at",
                      "unassigned_at",
                    ].map((field) => (
                      <TableHead key={field}>{toLabel(field)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-sm text-muted-foreground"
                      >
                        Aucune affectation disponible.
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignments.map((item, index) => (
                      <TableRow
                        key={
                          (item.vehicle_assignment_id as string | undefined) ??
                          index
                        }
                      >
                        <TableCell>
                          {displayValue(item.vehicle_assignment_id)}
                        </TableCell>
                        <TableCell>
                          {displayValue(item.intervention_id)}
                        </TableCell>
                        <TableCell>
                          {displayValue(item.incident_phase_id)}
                        </TableCell>
                        <TableCell>{displayValue(item.assigned_at)}</TableCell>
                        <TableCell>
                          {displayValue(item.unassigned_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumables">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter un consommable</CardTitle>
                <CardDescription>
                  Selectionnez un type puis indiquez la quantite initiale.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleAddConsumable}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="consumable-type">Type</Label>
                      <Select
                        value={newConsumableTypeId}
                        onValueChange={setNewConsumableTypeId}
                      >
                        <SelectTrigger id="consumable-type" className="w-full">
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableConsumableTypes.map((type) => (
                            <SelectItem
                              key={type.vehicle_consumable_type_id}
                              value={type.vehicle_consumable_type_id}
                            >
                              {type.unit
                                ? `${type.label} (${type.unit})`
                                : type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consumable-quantity">Quantite</Label>
                      <Input
                        id="consumable-quantity"
                        type="number"
                        placeholder="0"
                        value={newConsumableQuantity}
                        onChange={(event) =>
                          setNewConsumableQuantity(event.target.value)
                        }
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={creatingConsumable}>
                    Ajouter
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stocks de consommables</CardTitle>
                <CardDescription>
                  {loadingRelated
                    ? "Chargement..."
                    : `${consumables.length} enregistrements`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantite</TableHead>
                      <TableHead>Derniere maj</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consumables.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-sm text-muted-foreground"
                        >
                          Aucun consommable configure.
                        </TableCell>
                      </TableRow>
                    ) : (
                      consumables.map((item, index) => {
                        const type = typeById.get(
                          String(item.consumable_type_id),
                        );
                        const label = type
                          ? type.unit
                            ? `${type.label} (${type.unit})`
                            : type.label
                          : String(item.consumable_type_id);
                        return (
                          <TableRow key={`${item.consumable_type_id}-${index}`}>
                            <TableCell>{label}</TableCell>
                            <TableCell>
                              {displayValue(item.current_quantity)}
                            </TableCell>
                            <TableCell>
                              {displayValue(item.last_update)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
