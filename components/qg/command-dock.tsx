"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Crosshair,
  Layers,
  Radio,
  Settings,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const notify = (label: string) => () => {
  toast(`${label} : commande envoyee`);
};

const actions = [
  {
    id: "new-incident",
    label: "Declarer un incident",
    icon: Zap,
    onClick: notify("Declaration incident"),
    variant: "emergency" as const,
  },
  {
    id: "assign",
    label: "Affecter des moyens",
    icon: Radio,
    onClick: notify("Affectation"),
  },
  {
    id: "layers",
    label: "Calques de carte",
    icon: Layers,
    onClick: notify("Calques"),
  },
  {
    id: "recenter",
    label: "Centrer sur Lyon",
    icon: Crosshair,
    onClick: notify("Recentre carte"),
  },
  {
    id: "admin",
    label: "Administration",
    icon: Settings,
    href: "/admin",
  },
];

export function CommandDock() {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-black/70 px-2 py-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="mr-1 flex h-8 items-center border-r border-white/10 pr-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Actions
        </span>
      </div>

      {actions.map((action, index) => {
        const Icon = action.icon;
        const isEmergency = action.variant === "emergency";

        return (
          <div key={action.id} className="flex items-center">
            {index > 0 && index === actions.length - 1 && (
              <div className="mx-1 h-6 w-px bg-white/10" />
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  {action.href ? (
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-9 w-9 rounded-xl text-white/60 transition-all hover:bg-white/10 hover:text-white",
                      )}
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
                      className={cn(
                        "h-9 w-9 rounded-xl transition-all",
                        isEmergency
                          ? "bg-primary/20 text-primary hover:bg-primary/30 hover:text-primary"
                          : "text-white/60 hover:bg-white/10 hover:text-white",
                      )}
                      aria-label={action.label}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent
                sideOffset={12}
                className="border-white/10 bg-black/90 text-white backdrop-blur-xl"
              >
                {action.label}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}
