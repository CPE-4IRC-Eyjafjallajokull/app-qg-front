"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  Crosshair,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const notify = (label: string) => () => {
  toast(`${label} : commande envoyee`);
};

const actions = [
  {
    id: "new-incident",
    label: "Nouveau signalement",
    icon: AlertTriangle,
    onClick: notify("Nouveau signalement"),
  },
  {
    id: "assign",
    label: "Affecter un moyen",
    icon: Users,
    onClick: notify("Affectation"),
  },
  {
    id: "recenter",
    label: "Centrer sur Lyon",
    icon: Crosshair,
    onClick: notify("Recentre carte"),
  },
  {
    id: "sse",
    label: "Flux SSE",
    icon: Radio,
    href: "/demo",
  },
  {
    id: "admin",
    label: "Administration",
    icon: ShieldCheck,
    href: "/admin",
  },
];

export function CommandDock() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-md px-3 py-2 shadow-sm">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                {action.href ? (
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="rounded-full transition-none"
                  >
                    <Link href={action.href} aria-label={action.label}>
                      <Icon className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={action.onClick}
                    className="rounded-full transition-none"
                    aria-label={action.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>{action.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
