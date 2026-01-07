import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> },
) => {
  const { proposalId } = await params;
  return proxyApiRequest(
    request,
    `qg/assignment-proposals/${proposalId}`,
    "assignment proposal",
  );
};
