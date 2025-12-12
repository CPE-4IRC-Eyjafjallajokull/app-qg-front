import { getToken } from "next-auth/jwt";
import { serverEnv } from "@/lib/env.server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: serverEnv.NEXTAUTH_SECRET,
  });

  if (!token?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const target = `${serverEnv.API_URL}/events`;

  try {
    const upstream = await fetch(target, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
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
