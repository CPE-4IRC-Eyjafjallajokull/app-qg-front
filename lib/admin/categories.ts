import { Truck } from "lucide-react";
import type { AdminCategory } from "@/lib/admin/types";

export const adminCategories: AdminCategory[] = [
  {
    key: "vehicles",
    label: "Vehicules",
    description: "Gestion des vehicules et consommables.",
    prefix: "/vehicles",
    icon: Truck,
  },
];
