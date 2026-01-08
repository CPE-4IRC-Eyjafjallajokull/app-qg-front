import { Popup } from "react-map-gl/maplibre";
import { X } from "lucide-react";
import type { Vehicle } from "@/types/qg";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/qg/map/vehicle-card";

type VehiclePopupProps = {
  vehicle: Vehicle;
  onClose: () => void;
};

export function VehiclePopup({ vehicle, onClose }: VehiclePopupProps) {
  return (
    <Popup
      latitude={vehicle.location.lat}
      longitude={vehicle.location.lng}
      anchor="top"
      offset={14}
      closeButton={false}
      closeOnClick={false}
      maxWidth="320px"
      onClose={onClose}
      className="qg-map-popup"
    >
      <div
        className="relative w-72"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-slate-200/80 bg-white/95 shadow-sm" />
        <div className="relative rounded-2xl border border-slate-200/80 bg-white/95 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between px-3 py-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
              Véhicule
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fermer"
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <VehicleCard vehicle={vehicle} className="pt-2" />
        </div>
      </div>
    </Popup>
  );
}
