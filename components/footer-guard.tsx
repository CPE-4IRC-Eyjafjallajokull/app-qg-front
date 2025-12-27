"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

export function FooterGuard() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return <Footer />;
}
