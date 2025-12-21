"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { adminNavigation, getAdminPath } from "@/lib/admin/registry";
import type { AdminCategory, AdminResource } from "@/lib/admin/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  activeResource?: AdminResource;
  activeCategory?: AdminCategory;
};

export function AdminSidebar({
  activeResource,
  activeCategory,
}: AdminSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        adminNavigation.map((section) => [section.category.key, true]),
      ),
  );
  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/"
                onClick={handleNavigate}
                className="flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="font-semibold">QG Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-1 pb-3">
        {adminNavigation.map((section) => {
          const Icon = section.category.icon;
          const isOpen = openSections[section.category.key] !== false;
          const sectionId = `admin-sidebar-${section.category.key}`;
          return (
            <SidebarGroup key={section.category.key}>
              <SidebarGroupLabel asChild>
                <button
                  type="button"
                  onClick={() => toggleSection(section.category.key)}
                  aria-expanded={isOpen}
                  aria-controls={sectionId}
                  className={cn(
                    "w-full justify-between gap-2 hover:bg-sidebar-accent/60",
                    !isOpen && "text-sidebar-foreground/70",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                    {section.category.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen ? "rotate-0" : "-rotate-90",
                    )}
                  />
                </button>
              </SidebarGroupLabel>
              <SidebarGroupContent
                id={sectionId}
                hidden={!isOpen}
                className="space-y-3"
              >
                {section.groups.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <p className="px-2 text-[11px] font-semibold uppercase text-muted-foreground">
                      {group.label}
                    </p>
                    <SidebarMenu>
                      {group.items.map((resource) => {
                        const ResourceIcon = resource.icon;
                        const isActive = activeResource?.key === resource.key;
                        return (
                          <SidebarMenuItem key={resource.key}>
                            <SidebarMenuButton asChild isActive={isActive}>
                              <Link
                                href={getAdminPath(resource)}
                                onClick={handleNavigate}
                                className={cn("flex items-center gap-2")}
                              >
                                {ResourceIcon ? (
                                  <ResourceIcon className="h-4 w-4" />
                                ) : null}
                                <span>{resource.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </div>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60 px-3 py-3 text-xs text-sidebar-foreground/70">
        {activeCategory ? (
          <p>{activeCategory.description ?? activeCategory.label}</p>
        ) : (
          <p>Administration generale.</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
