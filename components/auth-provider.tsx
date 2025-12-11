"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export function AuthProvider({ children }: RootLayoutProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
