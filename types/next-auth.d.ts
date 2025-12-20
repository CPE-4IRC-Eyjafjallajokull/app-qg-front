// types/next-auth.d.ts
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    error?: string;
    accessToken?: string;
    expiresAt?: number;
    user: {
      id: string;
      // Ajoutez ici d'autres propriétés si nécessaire (ex: role)
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
    id?: string;
  }
}
