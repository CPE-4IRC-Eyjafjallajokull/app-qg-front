type PublicEnv = {
  NEXT_PUBLIC_APP_VERSION: string;
};

// Avoid failing Docker/CI builds that do not inject runtime envs; still enforce at runtime.
const isBuildTime = () =>
  process.env["npm_lifecycle_event"] === "build" ||
  process.env["NEXT_PHASE"] === "phase-production-build";

const requiredPublicEnv = (key: string, fallback?: string) => {
  const value = process.env[key];

  if (!value) {
    if (fallback !== undefined) {
      return fallback;
    }

    if (isBuildTime()) {
      return `__MISSING_${key}__`;
    }

    throw new Error(`Missing required public environment variable: ${key}`);
  }

  return value;
};

export const publicEnv: PublicEnv = {
  NEXT_PUBLIC_APP_VERSION: requiredPublicEnv("NEXT_PUBLIC_APP_VERSION", "dev"),
};
