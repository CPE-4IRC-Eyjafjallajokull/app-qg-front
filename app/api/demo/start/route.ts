import { getToken } from "next-auth/jwt";
import { serverEnv } from "@/lib/env.server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: serverEnv.NEXTAUTH_SECRET,
  });

  if (!token?.accessToken) {
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
