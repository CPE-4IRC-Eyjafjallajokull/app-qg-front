export const formatErrorMessage = (
  fallback: string,
  error: unknown,
): string => {
  if (error instanceof Error && error.message) {
    return `${fallback} (${error.message})`;
  }
  return fallback;
};
