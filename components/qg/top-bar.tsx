"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, LogOut, ShieldCheck, User } from "lucide-react";
import type { Incident, Vehicle } from "@/types/qg";

type TopBarProps = {
  incidents: Incident[];
  vehicles: Vehicle[];
};

export function TopBar({ incidents, vehicles }: TopBarProps) {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);
  const activeIncidents = incidents.filter(
    (incident) => incident.status !== "resolved",
  ).length;
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "available",
  ).length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
            QG
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">QG Lyon</p>
            <p className="text-xs text-slate-600">SDMIS - Poste operateur</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Badge
            className={
              isAuthenticated
                ? "bg-emerald-600 text-white transition-none"
                : "bg-slate-200 text-slate-700 transition-none"
            }
          >
            {isAuthenticated ? "Keycloak OK" : "Keycloak hors ligne"}
          </Badge>
          <Badge
            variant="outline"
            className="border-slate-300 text-slate-700 transition-none"
          >
            <Activity className="h-3 w-3" />
            {activeIncidents} incidents actifs
          </Badge>
          <Badge
            variant="outline"
            className="border-slate-300 text-slate-700 transition-none"
          >
            {availableVehicles} moyens disponibles
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" className="transition-none">
          <Link href="/admin" className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" />
            Admin
          </Link>
        </Button>
        {session?.user ? (
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-slate-900">
                {session.user.name ?? "Operateur"}
              </p>
              {session.user.email ? (
                <p className="text-[11px] text-slate-600">
                  {session.user.email}
                </p>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              aria-label="Sign out"
              className="transition-none"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Sign in"
            className="transition-none"
          >
            <Link href="/auth/signin">
              <User className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
