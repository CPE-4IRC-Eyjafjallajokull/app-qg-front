import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ incidentId: string; phaseId: string }> },
) => {
  const { incidentId, phaseId } = await params;
  return proxyApiRequest(
    request,
    `qg/incidents/${incidentId}/${phaseId}/request-assignment`,
    "phase assignment request",
  );
};
