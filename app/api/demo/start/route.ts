import { serverEnv } from "@/lib/env.server";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: serverEnv.NEXTAUTH_SECRET,
    secureCookie: true,
  });

  console.log("Demo incident proxy auth debug", {
    hasToken: !!token,
    sub: token?.sub,
    accessTokenPreview: token?.accessToken
      ? `${token.accessToken.slice(0, 10)}...`
      : undefined,
    cookieNames: request.cookies.getAll().map((c) => c.name),
    authHeaderPresent: !!request.headers.get("authorization"),
    host: request.headers.get("host"),
    origin: request.headers.get("origin"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    nextauthUrl: serverEnv.NEXTAUTH_URL,
  });

  if (!token?.accessToken) {
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
        Authorization: `Bearer ${token.accessToken}`,
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
