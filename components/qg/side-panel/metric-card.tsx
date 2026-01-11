import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: number;
  subLabel: string;
  variant: "emergency" | "warning" | "success" | "info" | "muted";
  icon: ReactNode;
};

export function MetricCard({
  label,
  value,
  subLabel,
  variant,
  icon,
}: MetricCardProps) {
  const styles = {
    emergency: "border-red-500/20 bg-red-500/10",
    warning: "border-amber-500/20 bg-amber-500/10",
    success: "border-emerald-500/20 bg-emerald-500/10",
    info: "border-blue-500/20 bg-blue-500/10",
    muted: "border-white/10 bg-white/5",
  };

  const textStyles = {
    emergency: "text-red-400",
    warning: "text-amber-400",
    success: "text-emerald-400",
    info: "text-blue-400",
    muted: "text-white/50",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border p-2",
        styles[variant],
      )}
    >
      <div className={cn("mb-1", textStyles[variant])}>{icon}</div>
      <span
        className={cn("text-xl font-bold leading-none", textStyles[variant])}
      >
        {value}
      </span>
      <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-white/40">
        {label}
      </span>
      <span className="text-[8px] text-white/30">{subLabel}</span>
    </div>
  );
}
