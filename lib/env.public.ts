type PublicEnv = {
  NEXT_PUBLIC_APP_VERSION: string;
};

const requiredPublicEnv = (key: string, fallback?: string) => {
  const value = process.env[key];

  if (!value) {
    if (fallback !== undefined) {
      return fallback;
    }

    throw new Error(`Missing required public environment variable: ${key}`);
  }

  return value;
};

export const publicEnv: PublicEnv = {
  NEXT_PUBLIC_APP_VERSION: requiredPublicEnv("NEXT_PUBLIC_APP_VERSION", "dev"),
};
