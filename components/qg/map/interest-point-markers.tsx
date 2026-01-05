import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  FireExtinguisher,
  HeartPulse,
  Hospital,
  MapPin,
  Shield,
  Wrench,
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
};

const normalizeLabel = (value?: string) =>
  value
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") ?? "";

const getKindPresentation = (label?: string): KindPresentation => {
  const normalized = normalizeLabel(label);

  if (normalized.includes("maintenance") || normalized.includes("vehicule")) {
    return {
      label: label ?? "Centre maintenance",
      Icon: Wrench,
      markerClassName: "bg-amber-50 text-amber-900 ring-2 ring-amber-400/80",
      badgeClassName: "border-amber-200 bg-amber-100 text-amber-900",
    };
  }

  if (normalized.includes("secours")) {
    return {
      label: label ?? "Centre secours",
      Icon: FireExtinguisher,
      markerClassName: "bg-red-50 text-red-900 ring-2 ring-red-500/80",
      badgeClassName: "border-red-200 bg-red-100 text-red-900",
    };
  }

  if (normalized.includes("clinique")) {
    return {
      label: label ?? "Clinique",
      Icon: HeartPulse,
      markerClassName: "bg-rose-50 text-rose-900 ring-2 ring-rose-400/70",
      badgeClassName: "border-rose-200 bg-rose-100 text-rose-900",
    };
  }

  if (normalized.includes("commissariat") || normalized.includes("police")) {
    return {
      label: label ?? "Commissariat",
      Icon: Shield,
      markerClassName: "bg-blue-50 text-blue-900 ring-2 ring-blue-500/70",
      badgeClassName: "border-blue-200 bg-blue-100 text-blue-900",
    };
  }

  if (normalized.includes("hopital")) {
    return {
      label: label ?? "Hopital",
      Icon: Hospital,
      markerClassName:
        "bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400/70",
      badgeClassName: "border-emerald-200 bg-emerald-100 text-emerald-900",
    };
  }

  return {
    label: label ?? "Point d'interet",
    Icon: MapPin,
    markerClassName: "bg-white/95 text-slate-900 ring-2 ring-sky-500/70",
    badgeClassName: "border-sky-200 bg-sky-100 text-sky-900",
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
            markerClassName={cn("h-7 w-7", presentation.markerClassName)}
            icon={<presentation.Icon className="h-4 w-4" />}
          >
            <div className="flex items-start gap-3 p-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/70",
                  presentation.markerClassName,
                )}
              >
                <presentation.Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {point.name}
                </p>
                <p className="text-xs text-slate-600">{point.address}</p>
                <p className="text-xs text-slate-600">
                  {point.zipcode} {point.city}
                </p>
                <Badge
                  className={cn("mt-1 text-xs", presentation.badgeClassName)}
                >
                  {presentation.label}
                </Badge>
              </div>
            </div>
          </MarkerWithPopover>
        );
      })}
    </>
  );
}
