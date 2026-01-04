"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { Menu, LogOut, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/admin", label: "Administration" },
];

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;
  const navLinkClass =
    "text-sm hover:text-muted-foreground transition-colors font-medium";

  return (
    <header className="border-b sticky top-0 z-40 bg-background">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold hover:opacity-80 transition-opacity"
        >
          QG
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-6">
            {navItems.map(({ href, label }) => (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink asChild>
                  <Link href={href} className={navLinkClass}>
                    {label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="text-sm text-right hidden sm:block">
                <p className="font-medium">{user.name}</p>
                {user.email ? (
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="text-sm"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button variant="default" size="sm">
                <User className="w-4 h-4 mr-1" />
                Sign In
              </Button>
            </Link>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <NavigationMenu className="w-full px-4 pb-6">
                <NavigationMenuList className="flex-col items-start gap-3">
                  {navItems.map(({ href, label }) => (
                    <NavigationMenuItem key={href} className="w-full">
                      <SheetClose asChild>
                        <NavigationMenuLink asChild>
                          <Link
                            href={href}
                            className="text-base font-medium hover:text-muted-foreground transition-colors"
                          >
                            {label}
                          </Link>
                        </NavigationMenuLink>
                      </SheetClose>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
