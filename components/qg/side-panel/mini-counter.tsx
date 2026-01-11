import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MiniCounterProps = {
  count: number;
  variant: "emergency" | "warning" | "success" | "info" | "muted";
  icon: ReactNode;
  title: string;
};

export function MiniCounter({ count, variant, icon, title }: MiniCounterProps) {
  const styles = {
    emergency: "bg-red-500/20 text-red-400 border-red-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    muted: "bg-white/10 text-white/50 border-white/10",
  };

  return (
    <div
      className={cn(
        "flex h-9 w-9 flex-col items-center justify-center rounded-lg border",
        styles[variant],
      )}
      title={title}
    >
      {icon}
      <span className="mt-0.5 text-[10px] font-bold leading-none">{count}</span>
    </div>
  );
}
