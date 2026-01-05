import type { ReactNode } from "react";
import { Marker } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type MarkerWithPopoverProps = {
  latitude: number;
  longitude: number;
  anchor?: "center" | "bottom";
  markerClassName?: string;
  icon: ReactNode;
  label: string;
  children: ReactNode;
};

export function MarkerWithPopover({
  latitude,
  longitude,
  anchor = "bottom",
  markerClassName,
  icon,
  label,
  children,
}: MarkerWithPopoverProps) {
  return (
    <Marker latitude={latitude} longitude={longitude} anchor={anchor}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "h-8 w-8 rounded-full border border-white/70 shadow-md transition hover:shadow-lg focus-visible:ring-2 focus-visible:ring-sky-500/60",
              markerClassName,
            )}
            data-map-interactive="true"
            aria-label={label}
          >
            {icon}
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="center" className="w-64 p-0">
          {children}
        </PopoverContent>
      </Popover>
    </Marker>
  );
}
