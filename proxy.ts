import { auth } from "@/auth";
import { NextResponse } from "next/server";

const isPublicPath = (pathname: string) =>
  pathname === "/auth/signin" || pathname.startsWith("/auth/error");

export const proxy = auth((req) => {
  const { nextUrl } = req;
  if (!req.auth && !isPublicPath(nextUrl.pathname)) {
    const signInUrl = new URL("/auth/signin", nextUrl);
    signInUrl.searchParams.set("callbackUrl", nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
