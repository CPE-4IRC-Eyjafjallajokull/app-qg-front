import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { serverEnv } from "@/lib/env.server";
import type { JWT } from "next-auth/jwt";

async function refreshAccessToken(token: JWT): Promise<JWT | null> {
  try {
    if (!token.refreshToken) {
      return null;
    }

    const body = new URLSearchParams();
    body.set("client_id", serverEnv.KEYCLOAK_CLIENT_ID);
    body.set("client_secret", serverEnv.KEYCLOAK_CLIENT_SECRET);
    body.set("grant_type", "refresh_token");
    body.set("refresh_token", token.refreshToken);

    const response = await fetch(
      `${serverEnv.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error("Error refreshing access token", refreshedTokens);
      return null;
    }

    if (!refreshedTokens.access_token) {
      return null;
    }

    const expiresAt = refreshedTokens.expires_in
      ? Math.floor(Date.now() / 1000) + refreshedTokens.expires_in
      : (token.expiresAt ?? 0);

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fallback à l'ancien si le nouveau n'est pas renvoyé
      error: undefined,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Keycloak({
      clientId: serverEnv.KEYCLOAK_CLIENT_ID,
      clientSecret: serverEnv.KEYCLOAK_CLIENT_SECRET,
      issuer: serverEnv.KEYCLOAK_ISSUER,
    }),
  ],
  secret: serverEnv.NEXTAUTH_SECRET,
  trustHost: serverEnv.AUTH_TRUST_HOST,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        const expiresAt =
          account.expires_at ??
          Math.floor(Date.now() / 1000 + (account.expires_in ?? 0));

        console.log("Initial token", {
          accessToken: account.access_token?.slice(0, 10) + "..." || "N/A",
          refreshToken: account.refresh_token?.slice(0, 10) + "..." || "N/A",
          expiresAt,
        });

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt,
          id: user.id,
          error: undefined,
        };
      }

      if (token.expiresAt && token.accessToken) {
        const refreshBufferSeconds = 60;
        const now = Math.floor(Date.now() / 1000);
        if (now < token.expiresAt - refreshBufferSeconds) {
          return token;
        }
      }

      const refreshedToken = await refreshAccessToken(token);
      if (!refreshedToken) {
        return null;
      }

      return refreshedToken;
    },

    async session({ session, token }) {
      session.error = token.error;
      session.accessToken = token.accessToken;
      session.expiresAt = token.expiresAt;

      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
});
