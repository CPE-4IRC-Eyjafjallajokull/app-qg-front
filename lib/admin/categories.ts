import {
  AlertTriangle,
  ClipboardList,
  HeartPulse,
  MapPin,
  Truck,
  Users,
} from "lucide-react";
import type { AdminCategory } from "@/lib/admin/types";

export const adminCategories: AdminCategory[] = [
  {
    key: "incidents",
    label: "Incidents",
    description: "Gestion des incidents et phases.",
    prefix: "/incidents",
    icon: AlertTriangle,
  },
  {
    key: "casualties",
    label: "Victimes",
    description: "Gestion des victimes et transports.",
    prefix: "/casualties",
    icon: HeartPulse,
  },
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
  {
    key: "operators",
    label: "Operateurs",
    description: "Gestion des operateurs.",
    prefix: "/operators",
    icon: Users,
  },
  {
    key: "assignment-proposals",
    label: "Moteur de décision",
    description: "Propositions et details d'affectation.",
    prefix: "/vehicle-assignment-proposals",
    icon: ClipboardList,
  },
];
