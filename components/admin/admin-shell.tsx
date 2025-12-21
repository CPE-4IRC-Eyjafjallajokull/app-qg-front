"use client";

import { usePathname } from "next/navigation";
import {
  getAdminCategoryByResourceKey,
  matchAdminResource,
} from "@/lib/admin/registry";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const activeResource = matchAdminResource(pathname);
  const activeCategory = activeResource
    ? getAdminCategoryByResourceKey(activeResource.key)
    : undefined;

  return (
    <SidebarProvider defaultOpen className="bg-muted/40">
      <AdminSidebar
        activeResource={activeResource}
        activeCategory={activeCategory}
      />
      <SidebarInset className="bg-muted/30">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
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

        <div className="flex-1 space-y-6 px-4 py-6 md:px-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
