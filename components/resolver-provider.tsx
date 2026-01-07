"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ResolverType } from "@/lib/resolver.service";

type ResolvedData = Record<string, unknown>;
type Cache = Record<ResolverType, Record<string, ResolvedData>>;

type ResolverContextValue = {
  resolve: (type: ResolverType, id: string) => ResolvedData | null;
  isLoading: (type: ResolverType, id: string) => boolean;
};

const ResolverContext = createContext<ResolverContextValue | null>(null);

export function ResolverProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Cache>({} as Cache);
  const loadingRef = useRef<Set<string>>(new Set());
  const fetchedRef = useRef<Set<string>>(new Set());

  const resolve = useCallback(
    (type: ResolverType, id: string): ResolvedData | null => {
      if (!id) return null;

      const cacheKey = `${type}:${id}`;

      // Déjà en cache ?
      if (cache[type]?.[id]) {
        return cache[type][id];
      }

      // Déjà en train de charger ou déjà fetché ?
      if (
        loadingRef.current.has(cacheKey) ||
        fetchedRef.current.has(cacheKey)
      ) {
        return null;
      }

      // Lancer le fetch
      loadingRef.current.add(cacheKey);

      fetch(
        `/api/resolve?type=${encodeURIComponent(type)}&ids=${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          credentials: "include",
        },
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data[id]) {
            setCache((prev) => ({
              ...prev,
              [type]: {
                ...prev[type],
                [id]: data[id],
              },
            }));
          }
          fetchedRef.current.add(cacheKey);
        })
        .catch(() => {
          fetchedRef.current.add(cacheKey);
        })
        .finally(() => {
          loadingRef.current.delete(cacheKey);
        });

      return null;
    },
    [cache],
  );

  const isLoading = useCallback((type: ResolverType, id: string): boolean => {
    return loadingRef.current.has(`${type}:${id}`);
  }, []);

  return (
    <ResolverContext.Provider value={{ resolve, isLoading }}>
      {children}
    </ResolverContext.Provider>
  );
}

export function useResolver() {
  const ctx = useContext(ResolverContext);
  if (!ctx) {
    throw new Error("useResolver must be used within a ResolverProvider");
  }
  return ctx;
}
