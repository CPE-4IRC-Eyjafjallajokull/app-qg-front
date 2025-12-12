import { publicEnv } from "@/lib/env.public";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
        <span>App QG Front</span>
        <span>Version : {publicEnv.NEXT_PUBLIC_APP_VERSION}</span>
      </div>
    </footer>
  );
}
