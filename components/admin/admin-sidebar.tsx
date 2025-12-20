"use client";

import { adminNavigation } from "@/lib/admin/registry";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type AdminSidebarProps = {
  activeKey: string;
  onSelect: (key: string) => void;
};

export function AdminSidebar({ activeKey, onSelect }: AdminSidebarProps) {
  const { setOpen } = useSidebar();

  const handleSelect = (key: string) => {
    onSelect(key);
    setOpen(false);
  };

  return (
    <>
      {adminNavigation.map((section) => {
        const Icon = section.category.icon;
        return (
          <SidebarGroup key={section.category.key}>
            <SidebarGroupLabel className="flex items-center gap-2">
              {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
              {section.category.label}
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-3">
              {section.groups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <p className="px-2 text-[11px] font-semibold uppercase text-muted-foreground">
                    {group.label}
                  </p>
                  <SidebarMenu>
                    {group.items.map((resource) => {
                      const ResourceIcon = resource.icon;
                      return (
                        <SidebarMenuItem key={resource.key}>
                          <SidebarMenuButton
                            isActive={activeKey === resource.key}
                            type="button"
                            onClick={() => handleSelect(resource.key)}
                          >
                            {ResourceIcon ? (
                              <ResourceIcon className="h-4 w-4" />
                            ) : null}
                            <span>{resource.title}</span>
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
    </>
  );
}
