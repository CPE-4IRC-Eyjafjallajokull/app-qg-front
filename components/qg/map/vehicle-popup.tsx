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
        {/* Fleche indicatrice */}
        <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-white/10 bg-black/85" />

        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/85 shadow-2xl backdrop-blur-2xl">
          {/* Header minimaliste */}
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
              Véhicule
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fermer"
              className="h-6 w-6 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Carte véhicule */}
          <VehicleCard vehicle={vehicle} />
        </div>
      </div>
    </Popup>
  );
}
