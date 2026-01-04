import { auth } from "@/auth";
import { serverEnv } from "@/lib/env.server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const targetUrl = new URL(`${serverEnv.API_URL}/incidents`);
  targetUrl.search = requestUrl.search;

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const responseBody = await upstream.text();
    const contentType =
      upstream.headers.get("content-type") ?? "application/json";

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("Incidents proxy error", error);
    return NextResponse.json(
      { error: "Error while reaching incidents" },
      { status: 502 },
    );
  }
}
