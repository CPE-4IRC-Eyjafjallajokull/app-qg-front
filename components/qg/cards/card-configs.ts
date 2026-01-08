import type { Incident, Vehicle } from "@/types/qg";

export const severityConfig: Record<
  Incident["severity"],
  { label: string; bg: string; text: string; border: string }
> = {
  critical: {
    label: "Critique",
    bg: "bg-red-600",
    text: "text-white",
    border: "border-red-500",
  },
  high: {
    label: "Élevée",
    bg: "bg-amber-500",
    text: "text-white",
    border: "border-amber-500",
  },
  medium: {
    label: "Moyenne",
    bg: "bg-orange-400",
    text: "text-white",
    border: "border-orange-400",
  },
  low: {
    label: "Faible",
    bg: "bg-emerald-500",
    text: "text-white",
    border: "border-emerald-500",
  },
};

export const statusConfig: Record<
  Incident["status"],
  { label: string; className: string }
> = {
  new: {
    label: "Nouveau",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  assigned: {
    label: "Assigné",
    className: "bg-sky-100 text-sky-700 border-sky-200",
  },
  resolved: {
    label: "Résolu",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

export const vehicleStatusConfig: Record<
  Vehicle["status"],
  { label: string; className: string }
> = {
  available: {
    label: "Disponible",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  engaged: {
    label: "Engagé",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  out_of_service: {
    label: "Hors service",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  unavailable: {
    label: "Indisponible",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  returning: {
    label: "Retour",
    className: "bg-violet-100 text-violet-700 border-violet-200",
  },
  on_intervention: {
    label: "Sur intervention",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  transport: {
    label: "Transport",
    className: "bg-sky-100 text-sky-700 border-sky-200",
  },
};

export const vehicleTypeLabels: Record<string, string> = {
  VSAV: "Véhicule de Secours",
  FPT: "Fourgon Pompe Tonne",
  EPA: "Échelle Pivotante",
  VTU: "Véhicule Tout Usage",
};

export const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/Paris",
  });
