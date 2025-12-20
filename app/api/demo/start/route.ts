import { auth } from "@/auth";
import { serverEnv } from "@/lib/env.server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  const accessToken = session?.accessToken;

  console.log("Demo incident proxy auth debug", {
    hasToken: !!accessToken,
    sub: session?.user?.id,
    accessTokenPreview: accessToken
      ? `${accessToken.slice(0, 10)}...`
      : undefined,
    cookieNames: request.cookies.getAll().map((c) => c.name),
    authHeaderPresent: !!request.headers.get("authorization"),
    host: request.headers.get("host"),
    origin: request.headers.get("origin"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    nextauthUrl: serverEnv.NEXTAUTH_URL,
  });

  if (!accessToken) {
    console.warn("Demo incident proxy blocked: no access token in JWT");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const route = `${serverEnv.API_URL}/incidents/new`;
  const payload = await request.json();

  try {
    const upstream = await fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (upstream.status === 401) {
      return NextResponse.json(
        { error: "Unauthorized to create incident" },
        { status: 401 },
      );
    }

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Failed to create incident" },
        { status: upstream.status || 502 },
      );
    }

    return NextResponse.json(
      { message: "Incident created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating demo incident", error);
    return NextResponse.json(
      { error: "Error while creating demo incident" },
      { status: 502 },
    );
  }
}
