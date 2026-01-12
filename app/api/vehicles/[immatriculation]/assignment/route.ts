import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ immatriculation: string }>;
};

export const GET = async (request: NextRequest, { params }: RouteParams) => {
  const { immatriculation } = await params;
  return proxyApiRequest(
    request,
    `qg/vehicles/${encodeURIComponent(immatriculation)}/assignment`,
    "vehicle assignment",
  );
};
