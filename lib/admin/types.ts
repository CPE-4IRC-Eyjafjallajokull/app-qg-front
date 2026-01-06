import type { ComponentType } from "react";

export type FieldType = "text" | "number" | "integer" | "boolean" | "date" | "datetime";

export type FieldReference = {
  resourceKey?: string;
  endpoint?: string;
  valueKey?: string;
  labelKey?: string | string[];
  placeholder?: string;
  query?: Record<string, string | number | boolean | null | undefined>;
};

export type FieldConfig = {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  reference?: FieldReference;
};

export type ReadFieldConfig = {
  key: string;
  hidden?: boolean;
};

export type AdminCategory = {
  key: string;
  label: string;
  description?: string;
  prefix?: string;
  icon?: ComponentType<{ className?: string }>;
};

export type AdminResource = {
  key: string;
  title: string;
  description?: string;
  endpoint: string;
  path?: string;
  category: string;
  group?: string;
  idFields: string[];
  fields: FieldConfig[];
  updateFields?: FieldConfig[];
  readFields: (string | ReadFieldConfig)[];
  supportsCreate?: boolean;
  supportsUpdate?: boolean;
  supportsDelete?: boolean;
  icon?: ComponentType<{ className?: string }>;
};

/** Get visible fields from readFields (filters out hidden fields) */
export function getVisibleFields(
  readFields: (string | ReadFieldConfig)[],
): string[] {
  return readFields
    .filter((f) => typeof f === "string" || !f.hidden)
    .map((f) => (typeof f === "string" ? f : f.key));
}

export type AdminCategoryGroup = {
  label: string;
  items: AdminResource[];
};

export type AdminCategorySection = {
  category: AdminCategory;
  groups: AdminCategoryGroup[];
};
