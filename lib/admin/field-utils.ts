import type { FieldReference, FieldType } from "@/lib/admin/types";

export type FormState = Record<string, string>;

/**
 * Access a nested property using dot notation (e.g., "phase_type.label")
 */
export const getNestedValue = (
  obj: Record<string, unknown>,
  path: string,
): unknown => {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
};

/**
 * Pick a label from a reference item based on the reference configuration
 */
export const pickReferenceLabel = (
  item: Record<string, unknown>,
  reference: FieldReference,
  valueKey: string,
): string => {
  const explicit = reference.labelKey;
  if (Array.isArray(explicit)) {
    const parts = explicit
      .map((key) => getNestedValue(item, key))
      .filter((value) => value !== null && value !== undefined && value !== "")
      .map((value) => String(value));
    if (parts.length > 0) {
      return parts.join(" - ");
    }
  } else if (explicit) {
    const value = getNestedValue(item, explicit);
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

export const toLabel = (value: string) =>
  value
    .split("_")
    .map((segment) =>
      segment ? `${segment[0].toUpperCase()}${segment.slice(1)}` : "",
    )
    .join(" ");

export const isBlank = (value: string | undefined) =>
  value === undefined || value.trim() === "";

export const parseValue = (raw: string, type: FieldType = "text") => {
  if (raw.trim().toLowerCase() === "null") {
    return null;
  }

  if (type === "boolean") {
    const normalized = raw.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return true;
    }
    if (normalized === "false" || normalized === "0") {
      return false;
    }
    return undefined;
  }

  if (type === "integer") {
    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  if (type === "number") {
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      return raw;
    }
    return parsed;
  }

  return raw;
};

export const formatValue = (value: unknown, type: FieldType = "text") => {
  if (value === null || value === undefined) {
    return "";
  }
  if (type === "boolean") {
    return value ? "true" : "false";
  }
  if (type === "datetime" && typeof value === "string") {
    // Convert ISO 8601 to datetime-local format (remove timezone)
    return value.replace(/Z$/, "").replace(/\+\d{2}:\d{2}$/, "");
  }
  return String(value);
};

export const displayValue = (value: unknown, type?: FieldType) => {
  const formatted = formatValue(value, type);
  return formatted === "" ? "-" : formatted;
};

export const getInputType = (type: FieldType = "text") => {
  if (type === "number" || type === "integer") {
    return "number";
  }
  if (type === "date") {
    return "date";
  }
  if (type === "datetime") {
    return "datetime-local";
  }
  return "text";
};
