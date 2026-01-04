const isBrowser = typeof window !== "undefined";

const isAuthRoute = (pathname: string) =>
  pathname === "/auth/signin" || pathname.startsWith("/auth/error");

export const redirectToSignIn = (): void => {
  if (!isBrowser) {
    return;
  }

  const { pathname, href, origin } = window.location;
  if (isAuthRoute(pathname)) {
    return;
  }

  const signInUrl = new URL("/auth/signin", origin);
  signInUrl.searchParams.set("callbackUrl", href);
  window.location.replace(signInUrl.toString());
};

export const fetchWithAuth = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const response = await fetch(input, init);

  if (response.status === 401) {
    redirectToSignIn();
  }

  return response;
};
