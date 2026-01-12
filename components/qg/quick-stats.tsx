"use client";

export function QuickStats() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateString = now.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex items-end gap-3">
      <div className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur-xl">
        <p className="text-2xl font-bold tabular-nums text-white">
          {timeString}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          {dateString}
        </p>
      </div>
      <div className="flex flex-col gap-1.5 text-[10px] font-medium text-white/30">
        <span>Lyon Metropole</span>
        <span>Secteur operationnel</span>
      </div>
    </div>
  );
}
