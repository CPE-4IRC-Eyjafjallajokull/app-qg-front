import * as React from "react";
import {
  Legend,
  ResponsiveContainer,
  Tooltip,
  type LegendProps,
  type TooltipProps,
} from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
    theme?: {
      light: string;
      dark: string;
    };
  }
>;

type ChartContainerProps = {
  config?: ChartConfig;
} & React.ComponentProps<"div">;

const ChartContext = React.createContext<ChartConfig | null>(null);

function useChartConfig() {
  return React.useContext(ChartContext);
}

function getChartColor(config: ChartConfig | null, key: string) {
  const entry = config?.[key];
  if (!entry) return undefined;
  return entry.color ?? entry.theme?.light;
}

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: ChartContainerProps) {
  const style = React.useMemo<React.CSSProperties | undefined>(() => {
    if (!config) return undefined;
    const entries = Object.entries(config);
    if (!entries.length) return undefined;
    const cssVars: React.CSSProperties = {};
    for (const [key, entry] of entries) {
      if (entry.color) {
        cssVars[`--color-${key}` as keyof React.CSSProperties] = entry.color;
      } else if (entry.theme) {
        cssVars[`--color-${key}` as keyof React.CSSProperties] =
          entry.theme.light;
      }
    }
    return cssVars;
  }, [config]);

  return (
    <ChartContext.Provider value={config ?? null}>
      <div className={cn("w-full", className)} style={style} {...props}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip(props: React.ComponentProps<typeof Tooltip>) {
  return (
    <Tooltip
      cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "4 4" }}
      {...props}
    />
  );
}

type ChartTooltipContentProps = TooltipProps<number, string> & {
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "dot" | "line" | "dashed";
  labelKey?: string;
  nameKey?: string;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel,
  hideIndicator,
  indicator = "dot",
  labelKey,
  nameKey,
}: ChartTooltipContentProps) {
  const config = useChartConfig();

  if (!active || !payload?.length) {
    return null;
  }

  const firstPayload = payload[0];
  const labelValue =
    labelKey && firstPayload?.payload
      ? String(firstPayload.payload[labelKey] ?? label)
      : String(label ?? "");

  return (
    <div className="rounded-lg border border-white/10 bg-black/80 px-3 py-2 text-xs text-white shadow-lg backdrop-blur">
      {!hideLabel && (
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-white/60">
          {labelValue}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {payload.map((entry) => {
          const dataKey = String(entry.dataKey ?? entry.name ?? "");
          const entryConfig = config?.[dataKey];
          const Icon = entryConfig?.icon;
          const nameValue =
            nameKey && entry.payload
              ? String(entry.payload[nameKey] ?? entry.name ?? dataKey)
              : String(entryConfig?.label ?? entry.name ?? dataKey);
          const indicatorColor =
            entry.color ?? getChartColor(config, dataKey) ?? "currentColor";
          return (
            <div key={dataKey} className="flex items-center gap-2">
              {!hideIndicator && (
                <span
                  className={cn(
                    "inline-flex shrink-0",
                    indicator === "dot" && "h-2.5 w-2.5 rounded-full",
                    indicator === "line" && "h-3 w-0.5 rounded-full",
                    indicator === "dashed" &&
                      "h-3 w-0.5 rounded-full border border-dashed",
                  )}
                  style={{
                    backgroundColor:
                      indicator !== "dashed" ? indicatorColor : undefined,
                    borderColor:
                      indicator === "dashed" ? indicatorColor : undefined,
                  }}
                />
              )}
              {Icon ? <Icon className="h-3 w-3 text-white/70" /> : null}
              <span className="flex-1 text-white/70">{nameValue}</span>
              <span className="font-semibold text-white">
                {typeof entry.value === "number"
                  ? entry.value.toLocaleString()
                  : String(entry.value ?? "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartLegend(props: LegendProps) {
  return <Legend {...props} />;
}

type ChartLegendContentProps = LegendProps & {
  nameKey?: string;
};

export function ChartLegendContent({
  payload,
  nameKey,
}: ChartLegendContentProps) {
  const config = useChartConfig();
  if (!payload?.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
      {payload.map((entry) => {
        const dataKey = String(entry.dataKey ?? entry.value ?? "");
        const entryConfig = config?.[dataKey];
        const labelValue =
          nameKey && entry.payload
            ? String(entry.payload[nameKey] ?? entry.value ?? dataKey)
            : String(entryConfig?.label ?? entry.value ?? dataKey);
        const colorValue =
          entry.color ?? getChartColor(config, dataKey) ?? "currentColor";
        return (
          <div key={dataKey} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colorValue }}
            />
            <span>{labelValue}</span>
          </div>
        );
      })}
    </div>
  );
}
