type PublicEnv = {
  NEXT_PUBLIC_API_URL: string;
};

export const publicEnv: PublicEnv = {
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
};
