import { auth } from "@/auth";
import { serverEnv } from "@/lib/env.server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  const accessToken = session?.accessToken;

  console.log("Events proxy auth debug", {
    hasToken: !!accessToken,
    sub: session?.user?.id,
    accessTokenPreview: accessToken
      ? `${accessToken.slice(0, 10)}...`
      : undefined,
    authHeaderPresent: !!request.headers.get("authorization"),
    host: request.headers.get("host"),
    origin: request.headers.get("origin"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    nextauthUrl: serverEnv.NEXTAUTH_URL,
  });

  if (!accessToken) {
    console.warn("Events proxy blocked: no access token in JWT");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const target = `${serverEnv.API_URL}/qg/live`;

  try {
    const upstream = await fetch(target, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "text/event-stream",
      },
      cache: "no-store",
    });

    if (upstream.status === 401) {
      return NextResponse.json(
        { error: "Unauthorized to access upstream events" },
        { status: 401 },
      );
    }

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: "Failed to reach upstream events stream" },
        { status: upstream.status || 502 },
      );
    }

    const headers = new Headers(upstream.headers);
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  } catch (error) {
    console.error("SSE proxy error", error);
    return NextResponse.json(
      { error: "Error while proxying events stream" },
      { status: 502 },
    );
  }
}
