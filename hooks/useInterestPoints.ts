import { useCallback, useEffect, useState } from "react";
import type { InterestPoint, InterestPointKind } from "@/types/qg";
import { fetchInterestPoints } from "@/lib/interest-points/service";
import { fetchInterestPointKinds } from "@/lib/interest-points/kinds/service";

export function useInterestPoints() {
  const [interestPoints, setInterestPoints] = useState<InterestPoint[]>([]);
  const [interestPointKinds, setInterestPointKinds] = useState<
    InterestPointKind[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const [points, kinds] = await Promise.all([
        fetchInterestPoints(signal),
        fetchInterestPointKinds(signal),
      ]);
      setInterestPoints(points);
      setInterestPointKinds(kinds);
      setError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setError(err instanceof Error ? err.message : "Unexpected error");
      setInterestPoints([]);
      setInterestPointKinds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    load(controller.signal);

    return () => controller.abort();
  }, [load]);

  return {
    interestPoints,
    interestPointKinds,
    isLoading,
    error,
    refresh: load,
  };
}
