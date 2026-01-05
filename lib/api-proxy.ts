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

async function proxyRequest(
  request: NextRequest,
  targetPath: string,
  errorContext: string,
) {
  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const targetUrl = new URL(`${serverEnv.API_URL}/${targetPath}`);
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
    `Proxying ${errorContext} to: ${targetUrl.toString()} [${request.method}]`,
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
    const upstreamContentType = upstream.headers.get("content-type");

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: { "Content-Type": upstreamContentType ?? "application/json" },
    });
  } catch (error) {
    console.error(`${errorContext} proxy error`, error);
    return NextResponse.json(
      { error: `Error while reaching ${errorContext}` },
      { status: 502 },
    );
  }
}

export async function proxyApiRequest(
  request: NextRequest,
  apiPath: string,
  errorContext?: string,
) {
  return proxyRequest(request, apiPath, errorContext ?? apiPath);
}

export async function proxyAdminRequest(
  request: NextRequest,
  pathSegments: string[],
) {
  if (!pathSegments.length) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const targetPath = pathSegments.map(encodeURIComponent).join("/");
  return proxyRequest(request, targetPath, "admin");
}
