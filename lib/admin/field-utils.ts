import type { FieldType } from "@/lib/admin/types";

export type FormState = Record<string, string>;

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
  return "text";
};
