import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ incidentId: string }> },
) => {
  const { incidentId } = await params;
  return proxyApiRequest(
    request,
    `qg/incidents/${incidentId}/request-assignment`,
    "assignment request",
  );
};
