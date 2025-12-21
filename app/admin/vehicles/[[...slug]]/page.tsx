"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { getAdminResourceByPath } from "@/lib/admin/registry";
import { ResourceManager } from "@/components/admin/resource-manager";
import { VehiclesList } from "@/components/admin/resources/vehicles-list";
import { VehicleDetail } from "@/components/admin/resources/vehicle-detail";

export default function VehiclesRoutePage() {
  const params = useParams<{ slug?: string[] }>();
  const slug = useMemo(() => params?.slug ?? [], [params?.slug]);

  const slugPath = useMemo(() => slug.join("/"), [slug]);
  const resource = useMemo(() => {
    if (!slugPath) {
      return undefined;
    }
    return getAdminResourceByPath(`/admin/vehicles/${slugPath}`);
  }, [slugPath]);

  if (!slugPath) {
    return <VehiclesList />;
  }

  if (resource) {
    return <ResourceManager key={resource.key} config={resource} />;
  }

  if (slug.length === 1) {
    return <VehicleDetail vehicleId={slug[0]} />;
  }

  return (
    <div className="text-sm text-muted-foreground">Ressource introuvable.</div>
  );
}
