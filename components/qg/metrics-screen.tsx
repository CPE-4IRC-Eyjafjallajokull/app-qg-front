"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  Radio,
  Shield,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import { TopBar } from "@/components/qg/top-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  fetchIncidentsDetailed,
  mapIncidentToUi,
  type ApiIncidentRead,
} from "@/lib/incidents/service";
import {
  fetchVehicles,
  fetchVehicleTypeMapping,
  type VehicleTypeMapping,
} from "@/lib/vehicles/service";
import { fetchAssignmentProposalsAll } from "@/lib/assignment-proposals/service";
import type { AssignmentProposal, Incident, Vehicle } from "@/types/qg";
import { cn } from "@/lib/utils";

type TimeRange = "24h" | "7d";

const responseChartConfig = {
  assigned: { label: "Affectation", color: "var(--chart-2)" },
  validated: { label: "Validation", color: "var(--chart-3)" },
} satisfies ChartConfig;

const severityChartConfig = {
  critical: { label: "Critique", color: "oklch(0.6 0.2 25)" },
  high: { label: "Eleve", color: "oklch(0.78 0.16 70)" },
  medium: { label: "Moyen", color: "oklch(0.6 0.16 260)" },
  low: { label: "Faible", color: "oklch(0.65 0.14 155)" },
} satisfies ChartConfig;

const statusChartConfig = {
  available: { label: "Disponible", color: "oklch(0.65 0.14 155)" },
  engaged: { label: "Engage", color: "oklch(0.78 0.16 70)" },
  on_intervention: { label: "Intervention", color: "oklch(0.6 0.2 25)" },
  returning: { label: "Retour", color: "oklch(0.6 0.16 260)" },
  out_of_service: { label: "Hors service", color: "oklch(0.5 0.05 260)" },
} satisfies ChartConfig;

export function MetricsScreen() {
  const [incidents, setIncidents] = useState<ApiIncidentRead[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assignments, setAssignments] = useState<AssignmentProposal[]>([]);
  const [vehicleTypeMapping, setVehicleTypeMapping] =
    useState<VehicleTypeMapping>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [incidentsData, vehiclesData, assignmentData, typeMapping] =
          await Promise.all([
            fetchIncidentsDetailed(),
            fetchVehicles(),
            fetchAssignmentProposalsAll(),
            fetchVehicleTypeMapping(),
          ]);
        if (!active) return;
        setIncidents(incidentsData);
        setVehicles(vehiclesData);
        setAssignments(assignmentData);
        setVehicleTypeMapping(typeMapping);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const incidentSummary = useMemo<Incident[]>(() => {
    return incidents
      .map((incident) => mapIncidentToUi(incident))
      .filter((item): item is Incident => Boolean(item));
  }, [incidents]);

  const metrics = useMemo(() => {
    const now = Date.now();
    const rangeHours = timeRange === "24h" ? 24 : 24 * 7;
    const rangeMs = rangeHours * 60 * 60 * 1000;
    const rangeStart = now - rangeMs;

    // Filter incidents in time range
    const incidentsInRange = incidents.filter((i) => {
      const createdAt = toDateMs(i.created_at);
      return createdAt && createdAt >= rangeStart;
    });

    // Response time analysis
    const responseTimes: { assigned: number[]; validated: number[] } = {
      assigned: [],
      validated: [],
    };

    for (const incident of incidentsInRange) {
      const createdAt = toDateMs(incident.created_at);
      if (!createdAt) continue;

      const allAssignments = incident.phases.flatMap(
        (phase) => phase.vehicle_assignments ?? [],
      );

      const firstAssignedAt = findEarliest(
        allAssignments.map((a) => a.assigned_at),
      );
      const firstValidatedAt = findEarliest(
        allAssignments.map((a) => a.validated_at ?? null),
      );

      if (firstAssignedAt) {
        const delta = minutesBetween(createdAt, firstAssignedAt);
        if (delta !== null) {
          responseTimes.assigned.push(delta);
        }
      }
      if (firstValidatedAt) {
        const delta = minutesBetween(createdAt, firstValidatedAt);
        if (delta !== null) {
          responseTimes.validated.push(delta);
        }
      }
    }

    // Build time series for response chart
    const responseSeries = buildResponseSeries(
      incidentsInRange,
      rangeStart,
      rangeMs,
      timeRange,
    );

    // Severity distribution
    const severityDist = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const incident of incidentSummary) {
      const createdAt = toDateMs(
        incidents.find((i) => i.incident_id === incident.id)?.created_at ??
          null,
      );
      if (createdAt && createdAt >= rangeStart) {
        severityDist[incident.severity]++;
      }
    }

    // Vehicle status distribution
    const vehicleStatusDist: Record<string, number> = {};
    for (const vehicle of vehicles) {
      const status = vehicle.status;
      vehicleStatusDist[status] = (vehicleStatusDist[status] ?? 0) + 1;
    }

    // Fleet metrics
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(
      (v) => v.status === "available",
    ).length;
    const engagedVehicles = vehicles.filter(
      (v) => v.status === "engaged" || v.status === "on_intervention",
    ).length;

    // Incident status metrics
    const activeIncidents = incidentSummary.filter(
      (i) => i.status !== "resolved",
    );
    const newIncidents = activeIncidents.filter((i) => i.status === "new");
    const assignedIncidents = activeIncidents.filter(
      (i) => i.status === "assigned",
    );
    const criticalActive = activeIncidents.filter(
      (i) => i.severity === "critical",
    );

    // Assignment proposal acceptance rate
    const proposalsInRange = assignments.filter((p) => {
      const generatedAt = toDateMs(p.generated_at);
      return generatedAt && generatedAt >= rangeStart;
    });
    const validatedProposals = proposalsInRange.filter((p) => p.validated_at);
    const rejectedProposals = proposalsInRange.filter((p) => p.rejected_at);
    const acceptanceRate =
      validatedProposals.length + rejectedProposals.length > 0
        ? Math.round(
            (validatedProposals.length /
              (validatedProposals.length + rejectedProposals.length)) *
              100,
          )
        : null;

    // Missing vehicle types
    const missingByType = buildMissingByType(
      assignments,
      rangeStart,
      vehicleTypeMapping,
    );

    return {
      // Response times
      avgAssignmentTime: average(responseTimes.assigned),
      p90AssignmentTime: percentile(responseTimes.assigned, 0.9),
      avgValidationTime: average(responseTimes.validated),
      p90ValidationTime: percentile(responseTimes.validated, 0.9),

      // Average incident duration (for resolved incidents)
      avgIncidentDuration: (() => {
        const durations: number[] = [];
        for (const incident of incidentsInRange) {
          const createdAt = toDateMs(incident.created_at);
          const endedAt = toDateMs(incident.ended_at);
          if (createdAt && endedAt) {
            const delta = minutesBetween(createdAt, endedAt);
            if (delta !== null) {
              durations.push(delta);
            }
          }
        }
        return average(durations);
      })(),

      // Average time before arrival on scene
      avgArrivalTime: (() => {
        const arrivalTimes: number[] = [];
        for (const incident of incidentsInRange) {
          const createdAt = toDateMs(incident.created_at);
          if (!createdAt) continue;

          const allAssignments = incident.phases.flatMap(
            (phase) => phase.vehicle_assignments ?? [],
          );
          const firstArrivedAt = findEarliest(
            allAssignments.map((a) => a.arrived_at ?? null),
          );

          if (firstArrivedAt) {
            const delta = minutesBetween(createdAt, firstArrivedAt);
            if (delta !== null) {
              arrivalTimes.push(delta);
            }
          }
        }
        return average(arrivalTimes);
      })(),

      responseSeries,

      // Severity distribution
      severityData: [
        {
          name: "critical",
          value: severityDist.critical,
          fill: "var(--color-critical)",
        },
        { name: "high", value: severityDist.high, fill: "var(--color-high)" },
        {
          name: "medium",
          value: severityDist.medium,
          fill: "var(--color-medium)",
        },
        { name: "low", value: severityDist.low, fill: "var(--color-low)" },
      ].filter((d) => d.value > 0),
      totalIncidentsInRange: incidentsInRange.length,

      // Vehicle fleet
      totalVehicles,
      availableVehicles,
      engagedVehicles,
      availabilityRate:
        totalVehicles > 0
          ? Math.round((availableVehicles / totalVehicles) * 100)
          : 0,
      vehicleStatusData: Object.entries(vehicleStatusDist)
        .map(([status, count]) => ({
          name: status,
          value: count,
          fill: `var(--color-${status})`,
        }))
        .filter((d) => d.value > 0),

      // Current operations
      activeIncidentsCount: activeIncidents.length,
      newIncidentsCount: newIncidents.length,
      assignedIncidentsCount: assignedIncidents.length,
      criticalActiveCount: criticalActive.length,

      // Assignment efficiency
      acceptanceRate,
      totalProposals: proposalsInRange.length,

      // Resource gaps
      missingByType,
    };
  }, [
    assignments,
    incidents,
    incidentSummary,
    timeRange,
    vehicles,
    vehicleTypeMapping,
  ]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0a0a0f]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(220,38,38,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.06),transparent_50%)]" />
      </div>

      <div className="relative z-10">
        <div className="sticky top-0 z-30 border-b border-white/5 bg-black/60 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <TopBar incidents={incidentSummary} vehicles={vehicles} />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h1 className="text-xl font-semibold text-white sm:text-2xl">
                    Tableau de bord operationnel
                  </h1>
                </div>
                <p className="mt-0.5 text-sm text-white/50">
                  Indicateurs de performance et etat des operations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50">
                <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
                <span>Live</span>
              </div>
              <Tabs
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as TimeRange)}
              >
                <TabsList className="h-9 border border-white/10 bg-white/5 p-1">
                  <TabsTrigger
                    value="24h"
                    className="h-7 px-3 text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    24h
                  </TabsTrigger>
                  <TabsTrigger
                    value="7d"
                    className="h-7 px-3 text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    7 jours
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Current Operations Status */}
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Zap className="h-4 w-4" />}
              label="Incidents en cours"
              value={metrics.activeIncidentsCount.toString()}
              details={[
                { label: "Nouveaux", value: metrics.newIncidentsCount },
                { label: "Assignes", value: metrics.assignedIncidentsCount },
              ]}
              variant={
                metrics.criticalActiveCount > 0
                  ? "emergency"
                  : metrics.activeIncidentsCount > 5
                    ? "warning"
                    : "default"
              }
              isLoading={isLoading}
            />
            <StatCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Incidents critiques"
              value={metrics.criticalActiveCount.toString()}
              variant={
                metrics.criticalActiveCount > 0 ? "emergency" : "success"
              }
              isLoading={isLoading}
            />
            <StatCard
              icon={<Truck className="h-4 w-4" />}
              label="Vehicules disponibles"
              value={`${metrics.availableVehicles}/${metrics.totalVehicles}`}
              details={[
                {
                  label: "Taux disponibilite",
                  value: `${metrics.availabilityRate}%`,
                },
              ]}
              variant={
                metrics.availabilityRate < 30
                  ? "emergency"
                  : metrics.availabilityRate < 50
                    ? "warning"
                    : "success"
              }
              isLoading={isLoading}
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              label="Delai moyen affectation"
              value={formatMinutes(metrics.avgAssignmentTime)}
              details={[
                {
                  label: "P90",
                  value: formatMinutes(metrics.p90AssignmentTime),
                },
              ]}
              variant={
                metrics.avgAssignmentTime > 20
                  ? "warning"
                  : metrics.avgAssignmentTime > 0
                    ? "success"
                    : "default"
              }
              isLoading={isLoading}
            />
          </div>

          {/* Response Time Evolution */}
          <div className="mb-6 grid gap-4 lg:grid-cols-3">
            <ChartCard
              title="Evolution des temps de reponse"
              description="Delai moyen entre declaration et premiere affectation"
              className="lg:col-span-2"
              isLoading={isLoading}
              isEmpty={!metrics.responseSeries.length}
            >
              <ChartContainer
                config={responseChartConfig}
                className="h-[260px] w-full"
              >
                <AreaChart
                  data={metrics.responseSeries}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="assignedGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--color-assigned)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--color-assigned)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="validatedGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--color-validated)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--color-validated)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    tickFormatter={(value) => `${value}m`}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend
                    content={<ChartLegendContent className="text-white/70" />}
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 10 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="assigned"
                    stroke="var(--color-assigned)"
                    strokeWidth={2}
                    fill="url(#assignedGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="validated"
                    stroke="var(--color-validated)"
                    strokeWidth={2}
                    fill="url(#validatedGradient)"
                  />
                </AreaChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard
              title="Repartition par gravite"
              description={`${metrics.totalIncidentsInRange} incidents sur la periode`}
              isLoading={isLoading}
              isEmpty={metrics.severityData.length === 0}
            >
              <ChartContainer
                config={severityChartConfig}
                className="h-[260px] w-full"
              >
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="name" />}
                  />
                  <Pie
                    data={metrics.severityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    strokeWidth={2}
                    stroke="rgba(0,0,0,0.3)"
                  >
                    {metrics.severityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={
                      <ChartLegendContent
                        nameKey="name"
                        className="text-white/70"
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>
            </ChartCard>
          </div>

          {/* Fleet & Operations */}
          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Etat de la flotte"
              description={`${metrics.totalVehicles} vehicules au total`}
              isLoading={isLoading}
              isEmpty={metrics.vehicleStatusData.length === 0}
            >
              <ChartContainer
                config={statusChartConfig}
                className="h-[240px] w-full"
              >
                <BarChart
                  data={metrics.vehicleStatusData}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    horizontal={false}
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    width={100}
                    tickFormatter={(value) => statusLabels[value] ?? value}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {metrics.vehicleStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </ChartCard>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MiniStatCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Taux d'acceptation"
                value={
                  metrics.acceptanceRate !== null
                    ? `${metrics.acceptanceRate}%`
                    : "N/A"
                }
                subValue={`${metrics.totalProposals} propositions`}
                variant={
                  metrics.acceptanceRate === null
                    ? "default"
                    : metrics.acceptanceRate >= 80
                      ? "success"
                      : metrics.acceptanceRate >= 50
                        ? "warning"
                        : "emergency"
                }
                isLoading={isLoading}
              />
              <MiniStatCard
                icon={<Users className="h-4 w-4" />}
                label="Vehicules engages"
                value={metrics.engagedVehicles.toString()}
                subValue={`sur ${metrics.totalVehicles} vehicules`}
                variant={
                  metrics.engagedVehicles > metrics.totalVehicles * 0.7
                    ? "warning"
                    : "default"
                }
                isLoading={isLoading}
              />
              <MiniStatCard
                icon={<Clock className="h-4 w-4" />}
                label="Delai validation"
                value={formatMinutes(metrics.avgValidationTime)}
                subValue={`P90: ${formatMinutes(metrics.p90ValidationTime)}`}
                variant={
                  metrics.avgValidationTime > 30
                    ? "warning"
                    : metrics.avgValidationTime > 0
                      ? "success"
                      : "default"
                }
                isLoading={isLoading}
              />
              <MiniStatCard
                icon={<Shield className="h-4 w-4" />}
                label="Charge operationnelle"
                value={
                  metrics.availableVehicles > 0
                    ? (
                        metrics.activeIncidentsCount / metrics.availableVehicles
                      ).toFixed(1)
                    : "N/A"
                }
                subValue="incidents / vehicule dispo"
                variant={
                  metrics.availableVehicles === 0
                    ? "emergency"
                    : metrics.activeIncidentsCount / metrics.availableVehicles >
                        2
                      ? "warning"
                      : "success"
                }
                isLoading={isLoading}
              />
              <MiniStatCard
                icon={<Clock className="h-4 w-4" />}
                label="Duree moy. incident"
                value={formatMinutes(metrics.avgIncidentDuration)}
                subValue="incidents resolus"
                variant={
                  metrics.avgIncidentDuration > 120
                    ? "warning"
                    : metrics.avgIncidentDuration > 0
                      ? "success"
                      : "default"
                }
                isLoading={isLoading}
              />
              <MiniStatCard
                icon={<Truck className="h-4 w-4" />}
                label="Delai arrivee"
                value={formatMinutes(metrics.avgArrivalTime)}
                subValue="avant arrivee sur lieux"
                variant={
                  metrics.avgArrivalTime > 30
                    ? "warning"
                    : metrics.avgArrivalTime > 0
                      ? "success"
                      : "default"
                }
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Resource Gaps */}
          {metrics.missingByType.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Manques de ressources detectes
                  </h3>
                  <p className="mt-0.5 text-xs text-white/50">
                    Types de vehicules manquants lors des affectations
                  </p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.missingByType.map((item) => (
                  <MissingTypeCard
                    key={item.type}
                    type={item.type}
                    count={item.count}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const statusLabels: Record<string, string> = {
  available: "Disponible",
  engaged: "Engage",
  on_intervention: "Intervention",
  returning: "Retour",
  out_of_service: "Hors service",
  unavailable: "Indisponible",
  transport: "Transport",
};

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  details?: { label: string; value: string | number }[];
  variant?: "default" | "success" | "warning" | "emergency";
  isLoading: boolean;
};

function StatCard({
  icon,
  label,
  value,
  details,
  variant = "default",
  isLoading,
}: StatCardProps) {
  const variantStyles = {
    default: {
      border: "border-white/10",
      iconBg: "bg-white/10",
      iconColor: "text-white/60",
    },
    success: {
      border: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    warning: {
      border: "border-amber-500/20",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
    },
    emergency: {
      border: "border-red-500/20",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-400",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-xl border bg-white/[0.02] p-4 backdrop-blur-sm",
        styles.border,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            styles.iconBg,
          )}
        >
          <span className={styles.iconColor}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="mt-1 h-7 w-16 bg-white/5" />
          ) : (
            <p className="text-2xl font-semibold tabular-nums text-white">
              {value}
            </p>
          )}
        </div>
      </div>
      {details && details.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/5 pt-3">
          {details.map((d) => (
            <div
              key={d.label}
              className="flex items-center gap-1.5 text-xs text-white/50"
            >
              <span>{d.label}:</span>
              <span className="font-medium text-white/70">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type MiniStatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
  variant?: "default" | "success" | "warning" | "emergency";
  isLoading: boolean;
};

function MiniStatCard({
  icon,
  label,
  value,
  subValue,
  variant = "default",
  isLoading,
}: MiniStatCardProps) {
  const variantStyles = {
    default: { border: "border-white/10", iconColor: "text-white/50" },
    success: { border: "border-emerald-500/20", iconColor: "text-emerald-400" },
    warning: { border: "border-amber-500/20", iconColor: "text-amber-400" },
    emergency: { border: "border-red-500/20", iconColor: "text-red-400" },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-xl border bg-white/[0.02] p-3 backdrop-blur-sm",
        styles.border,
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={styles.iconColor}>{icon}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          {label}
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="h-6 w-12 bg-white/5" />
      ) : (
        <>
          <p className="text-xl font-semibold tabular-nums text-white">
            {value}
          </p>
          <p className="text-[10px] text-white/40 mt-0.5">{subValue}</p>
        </>
      )}
    </div>
  );
}

type ChartCardProps = {
  title: string;
  description: string;
  className?: string;
  isLoading: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
};

function ChartCard({
  title,
  description,
  className,
  isLoading,
  isEmpty,
  children,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm",
        className,
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-0.5 text-xs text-white/50">{description}</p>
      </div>
      {isLoading ? (
        <Skeleton className="h-[240px] w-full bg-white/5" />
      ) : isEmpty ? (
        <EmptyChartState />
      ) : (
        children
      )}
    </div>
  );
}

function MissingTypeCard({
  type,
  count,
  isLoading,
}: {
  type: string;
  count: number;
  isLoading: boolean;
}) {
  const severity = count > 10 ? "high" : count > 5 ? "medium" : "low";
  const severityStyles = {
    high: "border-red-500/30 bg-red-500/5",
    medium: "border-amber-500/30 bg-amber-500/5",
    low: "border-white/10 bg-white/5",
  };
  const countStyles = {
    high: "text-red-400",
    medium: "text-amber-400",
    low: "text-white",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border px-3 py-2.5",
        severityStyles[severity],
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <Truck className="h-4 w-4 text-white/60" />
        </div>
        <div>
          {isLoading ? (
            <Skeleton className="h-4 w-16 bg-white/5" />
          ) : (
            <p className="text-sm font-medium text-white">{type}</p>
          )}
          <p className="text-[10px] text-white/40">manquants</p>
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="h-6 w-8 bg-white/5" />
      ) : (
        <span
          className={cn(
            "text-lg font-semibold tabular-nums",
            countStyles[severity],
          )}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function EmptyChartState() {
  return (
    <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-white/10">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
          <BarChart3 className="h-5 w-5 text-white/30" />
        </div>
        <p className="text-sm text-white/40">
          Aucune donnee pour cette periode
        </p>
      </div>
    </div>
  );
}

// Utility functions

function toDateMs(value?: string | null) {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return parsed;

  const normalized = value.replace(" ", "T");
  const normalizedParsed = Date.parse(normalized);
  if (!Number.isNaN(normalizedParsed)) return normalizedParsed;

  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized);
  if (!hasTimezone) {
    const utcParsed = Date.parse(`${normalized}Z`);
    if (!Number.isNaN(utcParsed)) return utcParsed;
  }

  return null;
}

function findEarliest(values: Array<string | null | undefined>) {
  const timestamps = values
    .map((value) => toDateMs(value ?? null))
    .filter((value): value is number => Boolean(value));
  if (!timestamps.length) return null;
  return Math.min(...timestamps);
}

function minutesBetween(start: number, end: number) {
  const diff = end - start;
  if (diff < 0) return null;
  return Math.round(diff / 60000);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function percentile(values: number[], p: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor((sorted.length - 1) * p);
  return Math.round(sorted[index] ?? 0);
}

function formatMinutes(value: number) {
  if (!value) return "N/A";
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

function buildResponseSeries(
  incidents: ApiIncidentRead[],
  rangeStart: number,
  rangeMs: number,
  timeRange: TimeRange,
) {
  const bucketCount = timeRange === "24h" ? 6 : 7;
  const bucketSize = rangeMs / bucketCount;

  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const start = rangeStart + i * bucketSize;
    return {
      start,
      end: start + bucketSize,
      label: formatBucketLabel(start, start + bucketSize, timeRange),
      assignedValues: [] as number[],
      validatedValues: [] as number[],
    };
  });

  for (const incident of incidents) {
    const createdAt = toDateMs(incident.created_at);
    if (!createdAt) continue;

    const bucketIndex = Math.min(
      buckets.length - 1,
      Math.max(0, Math.floor((createdAt - rangeStart) / bucketSize)),
    );

    const allAssignments = incident.phases.flatMap(
      (p) => p.vehicle_assignments ?? [],
    );
    const firstAssignedAt = findEarliest(
      allAssignments.map((a) => a.assigned_at),
    );
    const firstValidatedAt = findEarliest(
      allAssignments.map((a) => a.validated_at ?? null),
    );

    if (firstAssignedAt) {
      const delta = minutesBetween(createdAt, firstAssignedAt);
      if (delta !== null) {
        buckets[bucketIndex].assignedValues.push(delta);
      }
    }
    if (firstValidatedAt) {
      const delta = minutesBetween(createdAt, firstValidatedAt);
      if (delta !== null) {
        buckets[bucketIndex].validatedValues.push(delta);
      }
    }
  }

  return buckets.map((b) => ({
    label: b.label,
    assigned: b.assignedValues.length ? average(b.assignedValues) : null,
    validated: b.validatedValues.length ? average(b.validatedValues) : null,
  }));
}

function formatBucketLabel(start: number, end: number, timeRange: TimeRange) {
  if (timeRange === "7d") {
    return new Date(start).toLocaleDateString("fr-FR", { weekday: "short" });
  }
  const fmt = (d: number) =>
    new Date(d).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return `${fmt(start)}-${fmt(end)}`;
}

function buildMissingByType(
  assignments: AssignmentProposal[],
  rangeStart: number,
  typeMapping: VehicleTypeMapping,
) {
  const map = new Map<string, number>();
  for (const p of assignments) {
    const generatedAt = toDateMs(p.generated_at);
    if (generatedAt && generatedAt < rangeStart) continue;
    for (const missing of p.missing) {
      const typeName =
        typeMapping[missing.vehicle_type_id] ?? missing.vehicle_type_id;
      map.set(typeName, (map.get(typeName) ?? 0) + missing.missing_quantity);
    }
  }
  return Array.from(map.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}
