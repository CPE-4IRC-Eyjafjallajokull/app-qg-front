import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 text-white/20">{icon}</div>
      <p className="text-sm font-medium text-white/50">{title}</p>
      <p className="text-xs text-white/30">{description}</p>
    </div>
  );
}
