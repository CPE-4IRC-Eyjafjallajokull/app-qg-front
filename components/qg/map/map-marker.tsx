import type { ReactNode } from "react";
import { Marker } from "react-map-gl/maplibre";
import { cn } from "@/lib/utils";

type MapMarkerProps = {
  latitude: number;
  longitude: number;
  anchor?: "center" | "bottom";
  className?: string;
  label: string;
  title?: string;
  icon: ReactNode;
};

export function MapMarker({
  latitude,
  longitude,
  anchor = "center",
  className,
  label,
  title,
  icon,
}: MapMarkerProps) {
  return (
    <Marker latitude={latitude} longitude={longitude} anchor={anchor}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full border border-white/70",
          className,
        )}
        data-map-interactive="true"
        aria-label={label}
        title={title ?? label}
      >
        {icon}
      </div>
    </Marker>
  );
}
