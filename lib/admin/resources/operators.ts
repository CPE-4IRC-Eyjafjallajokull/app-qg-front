import { Users } from "lucide-react";
import type { AdminResource } from "@/lib/admin/types";

export const operatorsResources: AdminResource[] = [
  {
    key: "operators",
    title: "Operateurs",
    description: "Gestion des operateurs.",
    endpoint: "",
    category: "operators",
    group: "Operateurs",
    idFields: ["operator_id"],
    fields: [{ key: "email", label: "Email" }],
    readFields: [{ key: "operator_id", hidden: true }, "email"],
    icon: Users,
  },
];
