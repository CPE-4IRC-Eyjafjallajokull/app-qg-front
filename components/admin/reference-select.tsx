"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { adminRequest } from "@/lib/admin.service";
import { getAdminResourceByKey } from "@/lib/admin/registry";
import type { FieldReference } from "@/lib/admin/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReferenceOption = {
  value: string;
  label: string;
};

const normalizeEndpoint = (endpoint: string) =>
  endpoint.replace(/^\/+/, "").replace(/\/+$/, "");

const resolveEndpoint = (reference: FieldReference) => {
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

const pickLabel = (
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

type ReferenceSelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  reference: FieldReference;
  fieldKey: string;
  placeholder?: string;
  disabled?: boolean;
  refreshKey?: number;
};

export function ReferenceSelect({
  id,
  value,
  onChange,
  reference,
  fieldKey,
  placeholder,
  disabled,
  refreshKey = 0,
}: ReferenceSelectProps) {
  const valueKey = reference.valueKey ?? fieldKey;
  const endpoint = resolveEndpoint(reference);
  const swrKey = endpoint
    ? [
        "reference-options",
        endpoint,
        valueKey,
        reference.labelKey,
        reference.query,
        refreshKey,
      ]
    : null;

  const { data, isLoading, error } = useSWR(
    swrKey,
    () =>
      adminRequest<Record<string, unknown>[]>(endpoint, {
        method: "GET",
        query: reference.query,
      }),
    { revalidateOnFocus: false },
  );

  const options = useMemo(() => {
    if (!endpoint) {
      return [];
    }
    return (Array.isArray(data) ? data : [])
      .map((item) => {
        const rawValue = item[valueKey];
        if (rawValue === null || rawValue === undefined || rawValue === "") {
          return null;
        }
        const label = pickLabel(item, reference, valueKey);
        return {
          value: String(rawValue),
          label: label || String(rawValue),
        };
      })
      .filter((option): option is ReferenceOption => Boolean(option))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data, endpoint, reference, valueKey]);

  const displayOptions = useMemo(() => {
    if (!value) {
      return options;
    }
    const exists = options.some((option) => option.value === value);
    if (exists) {
      return options;
    }
    return [{ value, label: value }, ...options];
  }, [options, value]);

  const displayPlaceholder =
    reference.placeholder ?? placeholder ?? "Selectionner";

  const hasError = !endpoint || Boolean(error);
  const placeholderLabel = hasError
    ? "Erreur de chargement"
    : isLoading
      ? "Chargement..."
      : displayPlaceholder;

  const normalizedValue = value || undefined;
  const isDisabled = disabled || !endpoint;

  return (
    <Select
      value={normalizedValue}
      onValueChange={(nextValue) => onChange(nextValue)}
      disabled={isDisabled}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholderLabel} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="__loading" disabled>
            Chargement...
          </SelectItem>
        ) : hasError ? (
          <SelectItem value="__error" disabled>
            Erreur de chargement
          </SelectItem>
        ) : displayOptions.length === 0 ? (
          <SelectItem value="__empty" disabled>
            Aucun resultat
          </SelectItem>
        ) : (
          displayOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
