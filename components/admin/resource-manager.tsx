"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { adminRequest } from "@/lib/admin.service";
import type { AdminResource } from "@/lib/admin/types";
import { getVisibleFields } from "@/lib/admin/types";
import {
  formatValue,
  getInputType,
  isBlank,
  parseValue,
  toLabel,
  type FormState,
} from "@/lib/admin/field-utils";
import { useReferenceResolver } from "@/hooks/useReferenceResolver";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type ResourceManagerProps = { config: AdminResource };

export function ResourceManager({ config }: ResourceManagerProps) {
  const createFields = config.fields;
  const updateFields = config.updateFields ?? config.fields;
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [referenceRefreshKey, setReferenceRefreshKey] = useState(0);

  const emptyForm = useMemo(() => {
    return createFields.reduce<FormState>((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {});
  }, [createFields]);

  const [formState, setFormState] = useState<FormState>(emptyForm);
  const activeFields = editingItem ? updateFields : createFields;

  useEffect(() => {
    setFormState(emptyForm);
  }, [emptyForm]);

  const buildIdPath = useCallback(
    (item: Record<string, unknown>) => {
      const values = config.idFields.map((field) => item[field]);
      if (values.some((value) => value === undefined || value === null)) {
        return null;
      }
      return values.map((value) => String(value)).join("/");
    },
    [config.idFields],
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminRequest<Record<string, unknown>[]>(
        config.endpoint,
        { method: "GET" },
      );
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch", error);
      toast.error(`Erreur de chargement: ${config.title}`);
    } finally {
      setLoading(false);
    }
  }, [config.endpoint, config.title]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const resetForm = () => {
    setEditingItem(null);
    setFormState(emptyForm);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (item: Record<string, unknown>) => {
    setEditingItem(item);
    const nextState = updateFields.reduce<FormState>((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {});
    updateFields.forEach((field) => {
      nextState[field.key] = formatValue(item[field.key], field.type);
    });
    setFormState(nextState);
  };

  const buildPayload = (excludeKeys: string[] = []) => {
    return activeFields.reduce<Record<string, unknown>>((acc, field) => {
      if (excludeKeys.includes(field.key)) {
        return acc;
      }
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

    const missingRequired = activeFields.filter(
      (field) => field.required && isBlank(formState[field.key]),
    );

    if (missingRequired.length > 0) {
      toast.error("Merci de renseigner les champs requis.");
      return;
    }

    const isEditing = Boolean(editingItem);
    const payload = buildPayload(isEditing ? config.idFields : []);

    if (isEditing && Object.keys(payload).length === 0) {
      toast.error("Aucune modification detectee.");
      return;
    }

    setSaving(true);
    try {
      if (isEditing && editingItem) {
        const idPath = buildIdPath(editingItem);
        if (!idPath) {
          toast.error("Identifiant manquant pour la mise a jour.");
          setSaving(false);
          return;
        }
        await adminRequest(`${config.endpoint}/${idPath}`, {
          method: "PATCH",
          body: payload,
        });
        toast.success(`${config.title} mis a jour.`);
      } else {
        await adminRequest(config.endpoint, {
          method: "POST",
          body: payload,
        });
        toast.success(`${config.title} cree.`);
      }
      resetForm();
      await fetchItems();
    } catch (error) {
      console.error("Save error", error);
      toast.error(`Erreur lors de la sauvegarde: ${config.title}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    const idPath = buildIdPath(deleteTarget);
    if (!idPath) {
      toast.error("Identifiant manquant pour la suppression.");
      setDeleteTarget(null);
      setSaving(false);
      return;
    }

    setSaving(true);
    try {
      await adminRequest(`${config.endpoint}/${idPath}`, {
        method: "DELETE",
      });
      toast.success(`${config.title} supprime.`);
      setDeleteTarget(null);
      await fetchItems();
    } catch (error) {
      console.error("Delete error", error);
      toast.error(`Erreur lors de la suppression: ${config.title}`);
    } finally {
      setSaving(false);
    }
  };

  const canCreate = config.supportsCreate !== false;
  const canUpdate = config.supportsUpdate !== false;
  const canDelete = config.supportsDelete !== false;
  const actionCount = (canUpdate ? 1 : 0) + (canDelete ? 1 : 0);

  // Get visible fields (filters out hidden fields)
  const displayFields = useMemo(
    () => getVisibleFields(config.readFields),
    [config.readFields],
  );

  // Use the reference resolver hook
  const { getDisplayValue } = useReferenceResolver({
    fields: config.fields,
    readFields: displayFields,
    cacheKey: config.key,
    refreshKey: referenceRefreshKey,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
          {config.description ? (
            <CardDescription>{config.description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {editingItem ? "Mode edition" : "Nouvelle entree"}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setReferenceRefreshKey((prev) => prev + 1);
                void fetchItems();
              }}
              disabled={loading}
            >
              Rafraichir
            </Button>
          </div>

          {canCreate ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                {activeFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={`${config.key}-${field.key}`}>
                      {field.label}
                      {field.required ? " *" : ""}
                    </Label>
                    {field.reference ? (
                      <ReferenceSelect
                        id={`${config.key}-${field.key}`}
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
                        id={`${config.key}-${field.key}`}
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
                  {editingItem ? "Mettre a jour" : "Creer"}
                </Button>
                {editingItem ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Annuler
                  </Button>
                ) : null}
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste</CardTitle>
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
                {actionCount > 0 ? <TableHead>Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={displayFields.length + actionCount}
                    className="text-center text-sm text-muted-foreground"
                  >
                    Aucun enregistrement disponible.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => {
                  const idPath = buildIdPath(item);
                  return (
                    <TableRow key={idPath ?? index}>
                      {displayFields.map((field) => (
                        <TableCell key={`${field}-${index}`}>
                          {getDisplayValue(item, field)}
                        </TableCell>
                      ))}
                      {actionCount > 0 ? (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {canUpdate ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                Modifier
                              </Button>
                            ) : null}
                            {canDelete ? (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteTarget(item)}
                              >
                                Supprimer
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. Voulez-vous continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={saving}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
