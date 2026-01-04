import { auth } from "@/auth";
import { serverEnv } from "@/lib/env.server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetUrl = `${serverEnv.API_URL}/qg/incidents/new`;
  const body = await request.text();
  const contentType = request.headers.get("content-type");

  try {
    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
      body: body.length ? body : undefined,
      cache: "no-store",
    });

    const responseBody = await upstream.text();
    const responseContentType =
      upstream.headers.get("content-type") ?? "application/json";

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: { "Content-Type": responseContentType },
    });
  } catch (error) {
    console.error("Incident declaration proxy error", error);
    return NextResponse.json(
      { error: "Error while declaring incident" },
      { status: 502 },
    );
  }
}
