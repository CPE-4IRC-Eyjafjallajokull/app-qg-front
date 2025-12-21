"use client";

import Link from "next/link";
import { ChevronDown, Home, ShieldCheck } from "lucide-react";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

type AdminSidebarProps = {
  activeResource?: AdminResource;
  activeCategory?: AdminCategory;
};

export function AdminSidebar({
  activeResource,
  activeCategory,
}: AdminSidebarProps) {
  const { isMobile, setOpenMobile, state } = useSidebar();

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Header with branding */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Link href="/admin" onClick={handleNavigate}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">QG Admin</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Administration
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="mx-0 w-full" />

      {/* Quick Access */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Accès rapide</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Tableau de bord">
                  <Link href="/admin" onClick={handleNavigate}>
                    <Home className="size-4" />
                    <span>Tableau de bord</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-0 w-full" />

        {/* Navigation Sections */}
        <SidebarGroup>
          <SidebarGroupLabel>Gestion</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavigation.map((section) => {
                const CategoryIcon = section.category.icon;
                const isCategoryActive =
                  activeCategory?.key === section.category.key;

                return (
                  <Collapsible
                    key={section.category.key}
                    defaultOpen={isCategoryActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={section.category.label}
                          isActive={isCategoryActive}
                        >
                          {CategoryIcon && <CategoryIcon className="size-4" />}
                          <span className="font-medium">
                            {section.category.label}
                          </span>
                          <ChevronDown className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.groups.map((group) => (
                            <li key={group.label} className="space-y-1">
                              {section.groups.length > 1 && (
                                <div className="px-2 py-1.5">
                                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                    {group.label}
                                  </span>
                                </div>
                              )}
                              <ul className="space-y-1">
                                {group.items.map((resource) => {
                                  const ResourceIcon = resource.icon;
                                  const isActive =
                                    activeResource?.key === resource.key;

                                  return (
                                    <SidebarMenuSubItem key={resource.key}>
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={isActive}
                                      >
                                        <Link
                                          href={getAdminPath(resource)}
                                          onClick={handleNavigate}
                                        >
                                          {ResourceIcon && (
                                            <ResourceIcon className="size-3.5" />
                                          )}
                                          <span>{resource.title}</span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  );
                                })}
                              </ul>
                            </li>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/" onClick={handleNavigate}>
                  <Home className="size-4" />
                  <span>Retour au site</span>
                </Link>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {activeCategory && state === "expanded" && (
          <div className="px-2 py-1 text-xs text-muted-foreground">
            {activeCategory.description ?? activeCategory.label}
          </div>
        )}
      </SidebarFooter>

      {/* Rail for collapsed state */}
      <SidebarRail />
    </Sidebar>
  );
}
