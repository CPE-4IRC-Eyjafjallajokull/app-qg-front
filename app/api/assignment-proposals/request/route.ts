import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export const POST = (request: NextRequest) =>
  proxyApiRequest(
    request,
    "qg/assignment-proposals/request",
    "assignment proposal request",
  );
