import type { ChangeEvent, ReactNode } from "react";
import { Input } from "@/components/ui/input";

type FiltersPanelProps = {
  placeholder?: string;
  query?: string;
  onQueryChange?: (value: string) => void;
  children?: ReactNode;
};

export function FiltersPanel({
  query,
  onQueryChange,
  placeholder,
  children,
}: FiltersPanelProps) {
  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-2 mb-3">
      {onQueryChange ? (
        <Input
          value={query}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onQueryChange(event.target.value)
          }
          placeholder={placeholder}
          className="h-8 border-white/10 bg-white/10 text-xs text-white placeholder:text-white/40"
        />
      ) : null}
      {children}
    </div>
  );
}
