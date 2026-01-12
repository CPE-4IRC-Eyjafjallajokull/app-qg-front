"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  LogOut,
  Radio,
  Settings,
  Shield,
  Truck,
  Zap,
} from "lucide-react";
import type { Incident, Vehicle } from "@/types/qg";
import { cn } from "@/lib/utils";
import { useLiveEvents } from "@/components/live-events-provider";

type TopBarProps = {
  incidents: Incident[];
  vehicles: Vehicle[];
};

export function TopBar({ incidents, vehicles }: TopBarProps) {
  const { data: session } = useSession();
  const { isConnected } = useLiveEvents();
  const isAuthenticated = Boolean(session?.user);

  const activeIncidents = incidents.filter(
    (incident) => incident.status !== "resolved",
  ).length;
  const criticalIncidents = incidents.filter(
    (incident) =>
      incident.severity === "critical" && incident.status !== "resolved",
  ).length;
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "available",
  ).length;
  const engagedVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.status === "engaged" || vehicle.status === "on_intervention",
  ).length;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 py-2 backdrop-blur-xl px-2 md:pl-2 md:pr-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-black/40",
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-500",
                )}
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white">SDMIS Lyon</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                Centre de Commandement
              </p>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-1.5 md:flex">
          <StatusPill
            icon={<Radio className="h-3.5 w-3.5" />}
            label="Live"
            value={isConnected ? "Connecté" : "Hors ligne"}
            variant={isConnected ? "success" : "muted"}
            pulse={isConnected}
          />
          <StatusPill
            icon={<Zap className="h-3.5 w-3.5" />}
            label="Incidents"
            value={activeIncidents.toString()}
            subValue={
              criticalIncidents > 0
                ? `${criticalIncidents} critiques`
                : undefined
            }
            variant={
              criticalIncidents > 0
                ? "emergency"
                : activeIncidents > 0
                  ? "warning"
                  : "muted"
            }
          />
          <StatusPill
            icon={<Truck className="h-3.5 w-3.5" />}
            label="Vehicules"
            value={`${availableVehicles} dispo`}
            subValue={
              engagedVehicles > 0 ? `${engagedVehicles} engages` : undefined
            }
            variant={availableVehicles > 0 ? "success" : "warning"}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 lg:flex">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-9 border border-white/10 bg-black/40 text-white/70 backdrop-blur-xl hover:bg-white/10 hover:text-white"
          >
            <Link href="/metrics" className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Metrics
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-9 border border-white/10 bg-black/40 text-white/70 backdrop-blur-xl hover:bg-white/10 hover:text-white"
          >
            <Link href="/admin" className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              Administration
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 py-2 backdrop-blur-xl pl-3 pr-2">
          {session?.user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium text-white">
                  {session.user.name ?? "Operateur"}
                </p>
                <p className="text-[10px] text-white/50">
                  {isAuthenticated ? "Connecté" : "Déconnecté"}
                </p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {(session.user.name ?? "O").charAt(0).toUpperCase()}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                aria-label="Deconnexion"
                className="h-8 w-8 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Link href="/auth/signin">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

type StatusPillProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  variant: "success" | "warning" | "emergency" | "muted";
  pulse?: boolean;
};

function StatusPill({
  icon,
  value,
  subValue,
  variant,
  pulse,
}: StatusPillProps) {
  const variantStyles = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    emergency: "border-red-500/30 bg-red-500/10 text-red-400",
    muted: "border-white/10 bg-white/5 text-white/60",
  };

  const dotStyles = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    emergency: "bg-red-500",
    muted: "bg-white/40",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-1.5 backdrop-blur-xl transition-colors",
        variantStyles[variant],
      )}
    >
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            dotStyles[variant],
            pulse && "animate-pulse",
          )}
        />
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium leading-none">{value}</span>
        {subValue && (
          <span className="text-[9px] leading-none opacity-70">{subValue}</span>
        )}
      </div>
    </div>
  );
}
