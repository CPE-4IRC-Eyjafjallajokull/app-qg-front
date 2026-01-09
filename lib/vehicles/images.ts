import type { VehicleType } from "@/types/qg";

const getFormattedType = (vehicleType: VehicleType | string): string => {
  return vehicleType.replace(/\s+/g, "_").toUpperCase();
};

/**
 * Retourne le chemin de l'image PNG associée au type de véhicule
 * @param vehicleType - Le type de véhicule (VSAV, FPT, EPA, VTU, etc.)
 * @returns Le chemin de l'image dans le dossier public/vehicles
 */
export function getVehicleImagePath(vehicleType: VehicleType | string): string {
  return `/vehicles/vehicle_${getFormattedType(vehicleType)}.png`;
}

/**
 * Retourne le chemin de l'image PNG vue de dessus associée au type de véhicule
 * @param vehicleType - Le type de véhicule (VSAV, FPT, EPA, VTU, etc.)
 * @returns Le chemin de l'image vue de dessus dans le dossier public/vehicles
 */
export function getVehicleImagePathTopView(
  vehicleType: VehicleType | string,
): string {
  return `/vehicles/vehicle_${getFormattedType(vehicleType)}_vue_dessus.png`;
}
