import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export const GET = (request: NextRequest) =>
  proxyApiRequest(request, "qg/vehicles", "vehicles");
