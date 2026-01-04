import { Truck } from "lucide-react";
import type { Vehicle } from "@/types/qg";
import { MapMarker } from "@/components/qg/map/map-marker";
import { cn } from "@/lib/utils";

type VehicleMarkersProps = {
  vehicles: Vehicle[];
};

const vehicleTone: Record<Vehicle["status"], string> = {
  available: "bg-emerald-600 text-white",
  busy: "bg-slate-900 text-white",
  maintenance: "bg-slate-400 text-white",
};

export function VehicleMarkers({ vehicles }: VehicleMarkersProps) {
  return (
    <>
      {vehicles.map((vehicle) => (
        <MapMarker
          key={vehicle.id}
          latitude={vehicle.location.lat}
          longitude={vehicle.location.lng}
          anchor="center"
          label={vehicle.callSign}
          className={cn("h-7 w-7 shadow-md", vehicleTone[vehicle.status])}
          icon={<Truck className="h-4 w-4" />}
        />
      ))}
    </>
  );
}
