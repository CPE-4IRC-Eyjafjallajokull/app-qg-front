import { proxyAdminRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

const withPath = async (context: RouteContext) => {
  const params = await context.params;
  return params.path ?? [];
};

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyAdminRequest(request, await withPath(context));
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyAdminRequest(request, await withPath(context));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyAdminRequest(request, await withPath(context));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyAdminRequest(request, await withPath(context));
}
