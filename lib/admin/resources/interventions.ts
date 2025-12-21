import { LifeBuoy } from "lucide-react";
import type { AdminResource } from "@/lib/admin/types";

export const interventionsResources: AdminResource[] = [
  {
    key: "interventions",
    title: "Interventions",
    description: "Suivi des interventions terrain.",
    endpoint: "",
    category: "interventions",
    group: "Interventions",
    idFields: ["intervention_id"],
    fields: [
      {
        key: "incident_id",
        label: "Incident",
        required: true,
        reference: {
          resourceKey: "incidents",
          valueKey: "incident_id",
          labelKey: ["city", "address"],
          placeholder: "Selectionner un incident",
        },
      },
      {
        key: "created_by_operator_id",
        label: "Operateur createur",
        reference: {
          resourceKey: "operators",
          valueKey: "operator_id",
          labelKey: "email",
          placeholder: "Selectionner un operateur",
        },
      },
      {
        key: "validated_by_operator_id",
        label: "Operateur validateur",
        reference: {
          resourceKey: "operators",
          valueKey: "operator_id",
          labelKey: "email",
          placeholder: "Selectionner un operateur",
        },
      },
      {
        key: "validated_at",
        label: "Valide le",
        placeholder: "2025-01-01T12:30:00Z",
      },
      {
        key: "started_at",
        label: "Debut",
        placeholder: "2025-01-01T12:30:00Z",
      },
      {
        key: "ended_at",
        label: "Fin",
        placeholder: "2025-01-01T12:30:00Z",
      },
      { key: "notes", label: "Notes" },
    ],
    readFields: [
      { key: "intervention_id", hidden: true },
      "incident_id",
      "created_by_operator_id",
      "validated_by_operator_id",
      "validated_at",
      "started_at",
      "ended_at",
      "notes",
      "created_at",
    ],
    icon: LifeBuoy,
  },
];
