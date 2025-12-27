"use client";

import { CommandDock } from "@/components/qg/command-dock";
import MapView from "@/components/qg/map-view";
import { SidePanel } from "@/components/qg/side-panel";
import { TopBar } from "@/components/qg/top-bar";
import { qgIncidents, qgVehicles } from "@/lib/qg-data";

export function HomeScreen() {
  return (
    <div className="relative h-screen w-screen bg-slate-950">
      <MapView incidents={qgIncidents} vehicles={qgVehicles} />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.12),transparent_35%)]" />

        <div className="absolute inset-x-4 top-4 z-20 sm:inset-x-6 sm:top-6">
          <div className="pointer-events-auto">
            <TopBar incidents={qgIncidents} vehicles={qgVehicles} />
          </div>
        </div>

        <div className="absolute inset-x-4 bottom-24 top-[5.5rem] z-20 sm:bottom-6 sm:right-6 sm:left-auto sm:top-28 sm:w-80 lg:w-96">
          <div className="pointer-events-auto h-full">
            <SidePanel incidents={qgIncidents} vehicles={qgVehicles} />
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2">
          <div className="pointer-events-auto">
            <CommandDock />
          </div>
        </div>
      </div>
    </div>
  );
}
