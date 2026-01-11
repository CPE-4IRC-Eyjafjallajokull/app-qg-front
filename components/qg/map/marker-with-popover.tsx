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
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

export function MarkerWithPopover({
  latitude,
  longitude,
  anchor = "bottom",
  markerClassName,
  icon,
  label,
  children,
  pulse = false,
  size = "md",
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
              "group relative rounded-full shadow-xl transition-all duration-200",
              "hover:scale-110 hover:shadow-2xl",
              "focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100",
              sizeClasses[size],
              markerClassName,
            )}
            data-map-interactive="true"
            aria-label={label}
          >
            {pulse && (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-inherit opacity-30" />
                <span className="absolute -inset-1 animate-pulse rounded-full bg-inherit opacity-20 blur-sm" />
              </>
            )}
            <span className="relative z-10 drop-shadow-sm">{icon}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={12}
          className="w-auto overflow-hidden rounded-xl border border-white/10 bg-black/85 p-0 shadow-2xl backdrop-blur-2xl"
        >
          {children}
        </PopoverContent>
      </Popover>
    </Marker>
  );
}
