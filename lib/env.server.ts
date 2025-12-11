import "server-only";

type ServerEnv = {
  API_URL: string;
  KEYCLOAK_ISSUER: string;
  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_CLIENT_SECRET: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  AUTH_TRUST_HOST: boolean;
};

// Avoid failing Docker/CI builds that do not inject runtime secrets; still enforce at runtime.
const isBuildTime = () =>
  process.env["npm_lifecycle_event"] === "build" ||
  process.env["NEXT_PHASE"] === "phase-production-build";

const requiredServerEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    if (isBuildTime()) {
      return `__MISSING_${key}__`;
    }

    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const toBooleanEnv = (key: string, fallback = false) => {
  const value = process.env[key];
  if (value === undefined || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

const normalizeUrl = (value: string) => value.replace(/\/+$/, "");

export const serverEnv: ServerEnv = {
  API_URL: normalizeUrl(requiredServerEnv("API_URL")),
  KEYCLOAK_ISSUER: normalizeUrl(requiredServerEnv("KEYCLOAK_ISSUER")),
  KEYCLOAK_CLIENT_ID: requiredServerEnv("KEYCLOAK_CLIENT_ID"),
  KEYCLOAK_CLIENT_SECRET: requiredServerEnv("KEYCLOAK_CLIENT_SECRET"),
  NEXTAUTH_SECRET: requiredServerEnv("NEXTAUTH_SECRET"),
  NEXTAUTH_URL: normalizeUrl(requiredServerEnv("NEXTAUTH_URL")),
  AUTH_TRUST_HOST: toBooleanEnv("AUTH_TRUST_HOST", false),
};

process.env.NEXTAUTH_URL = serverEnv.NEXTAUTH_URL;
process.env.AUTH_URL = serverEnv.NEXTAUTH_URL;
process.env.NEXTAUTH_SECRET = serverEnv.NEXTAUTH_SECRET;
if (serverEnv.AUTH_TRUST_HOST) {
  process.env.AUTH_TRUST_HOST = "true";
}
