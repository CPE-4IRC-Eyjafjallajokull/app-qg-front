import { adminCategories } from "@/lib/admin/categories";
import type {
  AdminCategoryGroup,
  AdminCategorySection,
  AdminResource,
} from "@/lib/admin/types";
import { casualtiesResources } from "@/lib/admin/resources/casualties";
import { incidentsResources } from "@/lib/admin/resources/incidents";
import { interestPointsResources } from "@/lib/admin/resources/interest-points";
import { operatorsResources } from "@/lib/admin/resources/operators";
import { vehicleAssignmentProposalResources } from "@/lib/admin/resources/vehicle-assignment-proposals";
import { vehiclesResources } from "@/lib/admin/resources/vehicles";

const normalizeSegment = (value?: string) =>
  value ? value.replace(/^\/+|\/+$/g, "") : "";

const joinSegments = (...segments: Array<string | undefined>) =>
  segments
    .map((segment) => normalizeSegment(segment))
    .filter(Boolean)
    .join("/");

const categoryByKey = new Map(
  adminCategories.map((category) => [category.key, category]),
);

const withCategoryPrefix = (resource: AdminResource): AdminResource => {
  const category = categoryByKey.get(resource.category);
  const prefix = normalizeSegment(category?.prefix);
  const endpoint = normalizeSegment(resource.endpoint);
  const combined = joinSegments(prefix, endpoint);

  return {
    ...resource,
    endpoint: combined,
  };
};

const withAdminPath = (resource: AdminResource): AdminResource => {
  const path = normalizeSegment(resource.path ?? resource.endpoint);

  return {
    ...resource,
    path,
  };
};

export const adminResources: AdminResource[] = [
  ...incidentsResources.map(withCategoryPrefix).map(withAdminPath),
  ...casualtiesResources.map(withCategoryPrefix).map(withAdminPath),
  ...vehiclesResources.map(withCategoryPrefix).map(withAdminPath),
  ...interestPointsResources.map(withCategoryPrefix).map(withAdminPath),
  ...operatorsResources.map(withCategoryPrefix).map(withAdminPath),
  ...vehicleAssignmentProposalResources
    .map(withCategoryPrefix)
    .map(withAdminPath),
];

const adminResourceByKey = new Map(
  adminResources.map((resource) => [resource.key, resource]),
);

const adminCategoryByResourceKey = new Map(
  adminResources.map((resource) => [
    resource.key,
    categoryByKey.get(resource.category),
  ]),
);

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

const ADMIN_BASE_SEGMENT = "admin";

export const getAdminPath = (resource: AdminResource) => {
  const path = normalizeSegment(resource.path ?? resource.endpoint);
  const combined = joinSegments(ADMIN_BASE_SEGMENT, path);
  return `/${combined}`;
};

const stripAdminPrefix = (pathname: string) => {
  const normalized = normalizeSegment(pathname);
  const parts = normalized.split("/").filter(Boolean);
  if (parts[0] === ADMIN_BASE_SEGMENT) {
    return parts.slice(1).join("/");
  }
  return normalized;
};

export const getAdminResourceByKey = (key: string) =>
  adminResourceByKey.get(key);

export const getAdminCategoryByResourceKey = (key: string) =>
  adminCategoryByResourceKey.get(key);

export const matchAdminResource = (
  pathname: string | null | undefined,
): AdminResource | undefined => {
  if (!pathname) {
    return undefined;
  }
  const target = stripAdminPrefix(pathname);
  if (!target) {
    return undefined;
  }

  let match: AdminResource | undefined;
  adminResources.forEach((resource) => {
    const resourcePath = normalizeSegment(resource.path ?? resource.endpoint);
    if (!resourcePath) {
      return;
    }
    if (target === resourcePath || target.startsWith(`${resourcePath}/`)) {
      const matchPath = match
        ? normalizeSegment(match.path ?? match.endpoint)
        : "";
      if (!match || resourcePath.length > matchPath.length) {
        match = resource;
      }
    }
  });

  return match;
};

export const getAdminResourceByPath = (
  pathname: string | null | undefined,
): AdminResource | undefined => {
  if (!pathname) {
    return undefined;
  }
  const target = stripAdminPrefix(pathname);
  if (!target) {
    return undefined;
  }

  return adminResources.find((resource) => {
    const resourcePath = normalizeSegment(resource.path ?? resource.endpoint);
    return resourcePath === target;
  });
};
