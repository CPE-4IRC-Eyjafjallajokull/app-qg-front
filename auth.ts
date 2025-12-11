import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { serverEnv } from "@/lib/env.server";
import type { JWT } from "next-auth/jwt";

// Fonction utilitaire pour rafraîchir le token
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    // Build URL encoded body without passing undefined values
    const body = new URLSearchParams();
    body.set("client_id", serverEnv.KEYCLOAK_CLIENT_ID);
    body.set("client_secret", serverEnv.KEYCLOAK_CLIENT_SECRET);
    body.set("grant_type", "refresh_token");
    if (token.refreshToken) {
      body.set("refresh_token", token.refreshToken);
    }

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
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fallback à l'ancien si le nouveau n'est pas renvoyé
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
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
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // 1. Première connexion
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at, // OIDC renvoie souvent ceci
          id: user.id,
        };
      }

      // 2. Token encore valide
      if (token.expiresAt && Date.now() < token.expiresAt * 1000) {
        return token;
      }

      // 3. Token expiré, on tente de le rafraîchir
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      // On passe les infos du token à la session
      session.accessToken = token.accessToken;
      session.error = token.error;

      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
});
