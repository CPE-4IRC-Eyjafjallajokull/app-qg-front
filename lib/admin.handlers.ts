import { auth } from "@/auth";
import { serverEnv } from "@/lib/env.server";
import { NextRequest, NextResponse } from "next/server";

const extractBody = async (request: NextRequest) => {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD") {
    return undefined;
  }

  const text = await request.text();
  return text.length > 0 ? text : undefined;
};

export async function proxyAdminRequest(
  request: NextRequest,
  pathSegments: string[],
) {
  if (!pathSegments.length) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const targetUrl = new URL(
    `${serverEnv.API_URL}/${pathSegments.map(encodeURIComponent).join("/")}`,
  );
  targetUrl.search = requestUrl.search;

  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  });
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const body = await extractBody(request);

  console.debug(
    `Proxying admin request to: ${targetUrl.toString()} using method ${request.method} and token ${accessToken.substring(0, 10)}...`,
  );

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const responseBody = await upstream.text();
    console.log("Upstream response body:", responseBody);
    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get("content-type");
    responseHeaders.set(
      "Content-Type",
      upstreamContentType ?? "application/json",
    );

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Admin proxy error", error);
    return NextResponse.json(
      { error: "Error while reaching API" },
      { status: 502 },
    );
  }
}
