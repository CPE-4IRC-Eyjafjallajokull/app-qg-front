import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function Header() {
  return (
    <header className="border-b sticky top-0 z-40 bg-background">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
          QG
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm hover:text-muted-foreground transition-colors">
            Home
          </Link>
          <Link href="/events" className="text-sm hover:text-muted-foreground transition-colors">
            Events
          </Link>
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
