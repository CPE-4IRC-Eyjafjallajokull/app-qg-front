import { auth } from "@/auth";
import { serverEnv } from "@/lib/env.server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const target = `${serverEnv.API_URL}/interest-points`;

  try {
    const upstream = await fetch(target, {
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
    console.error("Interest points proxy error", error);
    return NextResponse.json(
      { error: "Error while reaching interest points" },
      { status: 502 },
    );
  }
}
