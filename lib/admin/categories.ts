import { MapPin, Truck } from "lucide-react";
import type { AdminCategory } from "@/lib/admin/types";

export const adminCategories: AdminCategory[] = [
  {
    key: "vehicles",
    label: "Véhicules",
    description: "Gestion des véhicules et consommables.",
    prefix: "/vehicles",
    icon: Truck,
  },
  {
    key: "interest-points",
    label: "Points d'intérêt",
    description: "Gestion des points d'intérêt et leurs ressources.",
    prefix: "/interest-points",
    icon: MapPin,
  },
];
