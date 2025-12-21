"use client";

import { usePathname } from "next/navigation";
import { getAdminResourceByPath } from "@/lib/admin/registry";
import { ResourceManager } from "@/components/admin/resource-manager";

export default function AdminResourcePage() {
  const pathname = usePathname();
  const resource = getAdminResourceByPath(pathname);

  if (!resource) {
    return (
      <div className="text-sm text-muted-foreground">
        Ressource introuvable.
      </div>
    );
  }

  return <ResourceManager key={resource.key} config={resource} />;
}
