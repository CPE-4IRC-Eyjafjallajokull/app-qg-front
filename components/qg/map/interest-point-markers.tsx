import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  FireExtinguisher,
  HeartPulse,
  Hospital,
  MapPin,
  Shield,
  Wrench,
  Navigation,
} from "lucide-react";
import type { InterestPoint, InterestPointKind } from "@/types/qg";
import { MarkerWithPopover } from "@/components/qg/map/marker-with-popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type InterestPointMarkersProps = {
  interestPoints: InterestPoint[];
  interestPointKinds: InterestPointKind[];
};

type KindPresentation = {
  label: string;
  Icon: LucideIcon;
  markerClassName: string;
  badgeClassName: string;
  headerClassName: string;
  iconBgClassName: string;
};

const normalizeLabel = (value?: string) =>
  value
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") ?? "";

const getKindPresentation = (label?: string): KindPresentation => {
  const normalized = normalizeLabel(label);

  if (normalized.includes("maintenance") || normalized.includes("véhicule")) {
    return {
      label: label ?? "Centre maintenance",
      Icon: Wrench,
      markerClassName:
        "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 shadow-amber-300/50 shadow-md ring-2 ring-amber-400/40",
      badgeClassName: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      headerClassName: "bg-gradient-to-r from-amber-600 to-amber-500",
      iconBgClassName: "bg-amber-500/20 text-amber-300",
    };
  }

  if (normalized.includes("secours")) {
    return {
      label: label ?? "Centre secours",
      Icon: FireExtinguisher,
      markerClassName:
        "bg-gradient-to-br from-red-100 to-red-200 text-red-800 shadow-red-300/50 shadow-md ring-2 ring-red-400/40",
      badgeClassName: "bg-red-500/20 text-red-300 border-red-500/30",
      headerClassName: "bg-gradient-to-r from-red-600 to-red-500",
      iconBgClassName: "bg-red-500/20 text-red-300",
    };
  }

  if (normalized.includes("clinique")) {
    return {
      label: label ?? "Clinique",
      Icon: HeartPulse,
      markerClassName:
        "bg-gradient-to-br from-rose-100 to-rose-200 text-rose-800 shadow-rose-300/50 shadow-md ring-2 ring-rose-400/40",
      badgeClassName: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      headerClassName: "bg-gradient-to-r from-rose-600 to-rose-500",
      iconBgClassName: "bg-rose-500/20 text-rose-300",
    };
  }

  if (normalized.includes("commissariat") || normalized.includes("police")) {
    return {
      label: label ?? "Commissariat",
      Icon: Shield,
      markerClassName:
        "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 shadow-blue-300/50 shadow-md ring-2 ring-blue-400/40",
      badgeClassName: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      headerClassName: "bg-gradient-to-r from-blue-600 to-blue-500",
      iconBgClassName: "bg-blue-500/20 text-blue-300",
    };
  }

  if (normalized.includes("hopital")) {
    return {
      label: label ?? "Hopital",
      Icon: Hospital,
      markerClassName:
        "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 shadow-emerald-300/50 shadow-md ring-2 ring-emerald-400/40",
      badgeClassName:
        "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      headerClassName: "bg-gradient-to-r from-emerald-600 to-emerald-500",
      iconBgClassName: "bg-emerald-500/20 text-emerald-300",
    };
  }

  return {
    label: label ?? "Point d'interet",
    Icon: MapPin,
    markerClassName:
      "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-slate-300/50 shadow-md ring-2 ring-slate-400/40",
    badgeClassName: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    headerClassName: "bg-gradient-to-r from-slate-600 to-slate-500",
    iconBgClassName: "bg-slate-500/20 text-slate-300",
  };
};

export function InterestPointMarkers({
  interestPoints,
  interestPointKinds,
}: InterestPointMarkersProps) {
  const kindById = useMemo(() => {
    return new Map(
      interestPointKinds.map((kind) => [
        kind.interest_point_kind_id,
        kind.label,
      ]),
    );
  }, [interestPointKinds]);

  return (
    <>
      {interestPoints.map((point) => {
        const kindLabel = kindById.get(point.interest_point_kind_id);
        const presentation = getKindPresentation(kindLabel);

        return (
          <MarkerWithPopover
            key={point.interest_point_id}
            latitude={point.latitude}
            longitude={point.longitude}
            anchor="bottom"
            label={point.name}
            markerClassName={presentation.markerClassName}
            icon={<presentation.Icon className="h-3.5 w-3.5" />}
            size="sm"
          >
            <div className="w-64 overflow-hidden">
              {/* Header avec gradient */}
              <div
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-white",
                  presentation.headerClassName,
                )}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <presentation.Icon className="h-3.5 w-3.5" />
                </div>
                <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {point.name}
                </p>
              </div>

              {/* Contenu */}
              <div className="space-y-2.5 p-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1.5 text-[10px]",
                    presentation.badgeClassName,
                  )}
                >
                  <presentation.Icon className="h-3 w-3" />
                  {presentation.label}
                </Badge>

                <div className="space-y-1.5 text-[11px] text-white/60">
                  <p className="leading-relaxed">{point.address}</p>
                  <p>
                    {point.zipcode} {point.city}
                  </p>
                </div>

                {/* Coordonnees */}
                <div className="flex items-center gap-2 border-t border-white/10 pt-2.5 text-[10px] text-white/40">
                  <Navigation className="h-3 w-3" />
                  <span>
                    {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </MarkerWithPopover>
        );
      })}
    </>
  );
}
