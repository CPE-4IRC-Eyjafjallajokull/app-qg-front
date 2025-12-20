import { adminCategories } from "@/lib/admin/categories";
import type {
  AdminCategoryGroup,
  AdminCategorySection,
  AdminResource,
} from "@/lib/admin/types";
import { vehiclesResources } from "@/lib/admin/resources/vehicles";

const normalizeSegment = (value?: string) =>
  value ? value.replace(/^\/+|\/+$/g, "") : "";

const categoryByKey = new Map(
  adminCategories.map((category) => [category.key, category]),
);

const withCategoryPrefix = (resource: AdminResource): AdminResource => {
  const category = categoryByKey.get(resource.category);
  const prefix = normalizeSegment(category?.prefix);
  const endpoint = normalizeSegment(resource.endpoint);
  const combined = [prefix, endpoint].filter(Boolean).join("/");

  return {
    ...resource,
    endpoint: combined,
  };
};

export const adminResources: AdminResource[] = [
  ...vehiclesResources.map(withCategoryPrefix),
];

const groupResources = (resources: AdminResource[]): AdminCategoryGroup[] => {
  const groupMap = new Map<string, AdminCategoryGroup>();
  const groups: AdminCategoryGroup[] = [];

  resources.forEach((resource) => {
    const label = resource.group ?? "Ressources";
    const existing = groupMap.get(label);
    if (existing) {
      existing.items.push(resource);
      return;
    }
    const nextGroup: AdminCategoryGroup = { label, items: [resource] };
    groupMap.set(label, nextGroup);
    groups.push(nextGroup);
  });

  return groups;
};

export const adminNavigation: AdminCategorySection[] = adminCategories
  .map((category) => {
    const items = adminResources.filter(
      (resource) => resource.category === category.key,
    );
    return {
      category,
      groups: groupResources(items),
    };
  })
  .filter((section) => section.groups.length > 0);
