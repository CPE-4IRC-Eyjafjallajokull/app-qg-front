import type { ComponentType } from "react";

export type FieldType = "text" | "number" | "integer" | "boolean";

export type FieldConfig = {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
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
  category: string;
  group?: string;
  idFields: string[];
  fields: FieldConfig[];
  updateFields?: FieldConfig[];
  readFields: string[];
  supportsCreate?: boolean;
  supportsUpdate?: boolean;
  supportsDelete?: boolean;
  icon?: ComponentType<{ className?: string }>;
};

export type AdminCategoryGroup = {
  label: string;
  items: AdminResource[];
};

export type AdminCategorySection = {
  category: AdminCategory;
  groups: AdminCategoryGroup[];
};
