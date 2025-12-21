"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { adminNavigation, adminResources } from "@/lib/admin/registry";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ResourceManager } from "@/components/admin/resource-manager";
import type { AdminCategory } from "@/lib/admin/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const initialResourceKey = adminNavigation[0]?.groups[0]?.items[0]?.key ?? "";

const resourceByKey = new Map(
  adminResources.map((resource) => [resource.key, resource]),
);

const categoryByResourceKey = new Map<string, AdminCategory>();
adminNavigation.forEach((section) => {
  section.groups.forEach((group) => {
    group.items.forEach((item) => {
      categoryByResourceKey.set(item.key, section.category);
    });
  });
});

export function AdminPanel() {
  const [activeKey] = useState(initialResourceKey);
  const activeResource = resourceByKey.get(activeKey) ?? adminResources[0];
  const activeCategory = activeResource
    ? categoryByResourceKey.get(activeResource.key)
    : undefined;

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="font-semibold">QG Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <AdminSidebar
              activeResource={activeResource}
              activeCategory={activeCategory}
            />
          </SidebarContent>
          <SidebarFooter>
            {activeCategory ? (
              <p>{activeCategory.description ?? activeCategory.label}</p>
            ) : (
              <p>Administration generale.</p>
            )}
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-muted/30">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {activeCategory
                  ? `Administration / ${activeCategory.label}`
                  : "Administration"}
              </p>
              <h1 className="text-base font-semibold">
                {activeResource?.title ?? "Administration"}
              </h1>
            </div>
          </header>

          <div className="flex-1 space-y-6 px-4 py-6 md:px-8">
            {activeResource ? (
              <ResourceManager
                key={activeResource.key}
                config={activeResource}
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                Aucune ressource configuree.
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
