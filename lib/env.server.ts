import "server-only";

type ServerEnv = {
  KEYCLOAK_ISSUER: string;
  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_CLIENT_SECRET: string;
  AUTH_SECRET: string;
};

const requiredServerEnv = (key: keyof ServerEnv) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const serverEnv: ServerEnv = {
  KEYCLOAK_ISSUER: requiredServerEnv("KEYCLOAK_ISSUER"),
  KEYCLOAK_CLIENT_ID: requiredServerEnv("KEYCLOAK_CLIENT_ID"),
  KEYCLOAK_CLIENT_SECRET: requiredServerEnv("KEYCLOAK_CLIENT_SECRET"),
  AUTH_SECRET: requiredServerEnv("AUTH_SECRET"),
};
