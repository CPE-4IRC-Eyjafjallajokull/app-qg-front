import { ClipboardCheck } from "lucide-react";
import type { AdminResource } from "@/lib/admin/types";

export const vehicleAssignmentProposalResources: AdminResource[] = [
  {
    key: "vehicle-assignment-proposals",
    title: "Propositions d'affectation",
    description: "Propositions d'affectation vehicule liees aux incidents.",
    endpoint: "",
    category: "assignment-proposals",
    group: "Propositions",
    idFields: ["proposal_id"],
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
      { key: "generated_at", label: "Generee le", type: "datetime" },
      { key: "rejected_at", label: "Refusee le", type: "datetime" },
      { key: "received_at", label: "Recue le", type: "datetime" },
    ],
    updateFields: [
      { key: "generated_at", label: "Generee le", type: "datetime" },
      { key: "rejected_at", label: "Refusee le", type: "datetime" },
      { key: "received_at", label: "Recue le", type: "datetime" },
    ],
    readFields: [
      { key: "proposal_id", hidden: true },
      "incident_id",
      "generated_at",
      "rejected_at",
      "received_at",
    ],
    icon: ClipboardCheck,
  },
];
