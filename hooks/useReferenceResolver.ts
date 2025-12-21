"use client";

import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { adminRequest } from "@/lib/admin.service";
import { getAdminResourceByKey } from "@/lib/admin/registry";
import type { FieldConfig, FieldReference } from "@/lib/admin/types";
import { displayValue } from "@/lib/admin/field-utils";

const normalizeEndpoint = (endpoint: string) =>
  endpoint.replace(/^\/+/, "").replace(/\/+$/, "");

const resolveReferenceEndpoint = (reference: FieldReference) => {
  if (reference.resourceKey) {
    const resource = getAdminResourceByKey(reference.resourceKey);
    if (resource?.endpoint) {
      return normalizeEndpoint(resource.endpoint);
    }
  }
  if (!reference.endpoint) {
    return "";
  }
  return normalizeEndpoint(reference.endpoint);
};

const pickReferenceLabel = (
  item: Record<string, unknown>,
  reference: FieldReference,
  valueKey: string,
) => {
  const explicit = reference.labelKey;
  if (Array.isArray(explicit)) {
    const parts = explicit
      .map((key) => item[key])
      .filter((value) => value !== null && value !== undefined && value !== "")
      .map((value) => String(value));
    if (parts.length > 0) {
      return parts.join(" - ");
    }
  } else if (explicit) {
    const value = item[explicit];
    if (value !== null && value !== undefined && value !== "") {
      return String(value);
    }
  }

  const fallbacks = ["label", "name", "title", "code", valueKey];
  for (const key of fallbacks) {
    const value = item[key];
    if (value !== null && value !== undefined && value !== "") {
      return String(value);
    }
  }

  return "";
};

type UseReferenceResolverOptions = {
  /** All field configurations (used to find references) */
  fields: FieldConfig[];
  /** The field keys that need reference resolution */
  readFields: string[];
  /** A unique key for cache invalidation */
  cacheKey?: string;
  /** Refresh key to force refetch */
  refreshKey?: number;
};

type ReferenceResolverResult = {
  /** Function to get display value for a field (resolves references) */
  getDisplayValue: (item: Record<string, unknown>, fieldKey: string) => string;
  /** Whether reference data is loading */
  isLoading: boolean;
  /** Map of fieldKey -> (id -> label) for direct access */
  referenceDataMap: Map<string, Map<string, string>> | undefined;
};

/**
 * Hook to resolve reference fields to their display labels.
 * Automatically fetches reference data and provides a function to get display values.
 */
export function useReferenceResolver({
  fields,
  readFields,
  cacheKey = "default",
  refreshKey = 0,
}: UseReferenceResolverOptions): ReferenceResolverResult {
  // Build a map of field keys to their reference configurations
  const fieldReferenceMap = useMemo(() => {
    const map = new Map<string, FieldReference>();
    fields.forEach((field) => {
      if (field.reference) {
        map.set(field.key, field.reference);
      }
    });
    return map;
  }, [fields]);

  // Get all fields with references in readFields
  const fieldsWithReferences = useMemo(() => {
    return readFields
      .filter((fieldKey) => fieldReferenceMap.has(fieldKey))
      .map((fieldKey) => ({
        fieldKey,
        reference: fieldReferenceMap.get(fieldKey)!,
        endpoint: resolveReferenceEndpoint(fieldReferenceMap.get(fieldKey)!),
      }))
      .filter(({ endpoint }) => endpoint !== "");
  }, [readFields, fieldReferenceMap]);

  // Fetch all reference data
  const { data: referenceDataMap, isLoading } = useSWR(
    fieldsWithReferences.length > 0
      ? [
          "reference-resolver",
          cacheKey,
          refreshKey,
          ...fieldsWithReferences.map((f) => `${f.fieldKey}:${f.endpoint}`),
        ]
      : null,
    async () => {
      const results = await Promise.all(
        fieldsWithReferences.map(async ({ endpoint, reference, fieldKey }) => {
          try {
            const data = await adminRequest<Record<string, unknown>[]>(
              endpoint,
              {
                method: "GET",
                query: reference.query,
              },
            );
            return {
              data: Array.isArray(data) ? data : [],
              reference,
              fieldKey,
            };
          } catch {
            return { data: [], reference, fieldKey };
          }
        }),
      );

      const map = new Map<string, Map<string, string>>();
      results.forEach(({ data, reference, fieldKey }) => {
        const valueKey = reference.valueKey ?? fieldKey;
        const labelMap = new Map<string, string>();
        data.forEach((item) => {
          const rawValue = item[valueKey];
          if (rawValue !== null && rawValue !== undefined && rawValue !== "") {
            const label = pickReferenceLabel(item, reference, valueKey);
            labelMap.set(String(rawValue), label || String(rawValue));
          }
        });
        map.set(fieldKey, labelMap);
      });
      return map;
    },
    { revalidateOnFocus: false },
  );

  // Function to get display value for a field (resolves references)
  const getDisplayValue = useCallback(
    (item: Record<string, unknown>, fieldKey: string): string => {
      const rawValue = item[fieldKey];
      if (rawValue === null || rawValue === undefined || rawValue === "") {
        return displayValue(rawValue);
      }

      const reference = fieldReferenceMap.get(fieldKey);
      if (reference && referenceDataMap) {
        const labelMap = referenceDataMap.get(fieldKey);
        if (labelMap) {
          const label = labelMap.get(String(rawValue));
          if (label) {
            return label;
          }
        }
      }

      return displayValue(rawValue);
    },
    [fieldReferenceMap, referenceDataMap],
  );

  return {
    getDisplayValue,
    isLoading,
    referenceDataMap,
  };
}
