import { useEffect, useState, useMemo, useCallback } from "react";
import type { Vehicle } from "@/types/qg";

const LERP_FACTOR = 0.12;
const POSITION_THRESHOLD = 0.000001;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

type AnimationEntry = {
  current: { lat: number; lng: number };
  target: { lat: number; lng: number };
};

type AnimationState = Map<string, AnimationEntry>;

export function useInterpolatedVehicles(vehicles: Vehicle[]): Vehicle[] {
  const [animState, setAnimState] = useState<AnimationState>(() => new Map());

  const vehicleTargets = useMemo(
    () =>
      new Map(
        vehicles.map((v) => [
          v.id,
          { lat: v.location.lat, lng: v.location.lng },
        ]),
      ),
    [vehicles],
  );

  const animate = useCallback(() => {
    setAnimState((prev) => {
      const next = new Map<string, AnimationEntry>();
      let hasChanges = false;

      for (const [id, target] of vehicleTargets) {
        const entry = prev.get(id);

        if (!entry) {
          next.set(id, {
            current: { lat: target.lat, lng: target.lng },
            target: { lat: target.lat, lng: target.lng },
          });
          hasChanges = true;
          continue;
        }

        const newTarget =
          entry.target.lat !== target.lat || entry.target.lng !== target.lng
            ? { lat: target.lat, lng: target.lng }
            : entry.target;

        const latDiff = newTarget.lat - entry.current.lat;
        const lngDiff = newTarget.lng - entry.current.lng;

        if (
          Math.abs(latDiff) > POSITION_THRESHOLD ||
          Math.abs(lngDiff) > POSITION_THRESHOLD
        ) {
          next.set(id, {
            current: {
              lat: lerp(entry.current.lat, newTarget.lat, LERP_FACTOR),
              lng: lerp(entry.current.lng, newTarget.lng, LERP_FACTOR),
            },
            target: newTarget,
          });
          hasChanges = true;
        } else {
          next.set(id, { current: entry.current, target: newTarget });
        }
      }

      return hasChanges ? next : prev;
    });
  }, [vehicleTargets]);

  useEffect(() => {
    let active = true;
    let rafId: number;

    const loop = () => {
      if (!active) return;
      animate();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
    };
  }, [animate]);

  return useMemo(() => {
    return vehicles.map((vehicle) => {
      const entry = animState.get(vehicle.id);
      if (!entry) return vehicle;

      return {
        ...vehicle,
        location: {
          lat: entry.current.lat,
          lng: entry.current.lng,
        },
      };
    });
  }, [vehicles, animState]);
}
