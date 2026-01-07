import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  resolveIds,
  VALID_RESOLVER_TYPES,
  type ResolverType,
} from "@/lib/resolver.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const idsParam = searchParams.get("ids");

    if (!type) {
      return NextResponse.json(
        { error: "Le paramètre 'type' est requis" },
        { status: 400 },
      );
    }

    if (!idsParam) {
      return NextResponse.json(
        { error: "Le paramètre 'ids' est requis" },
        { status: 400 },
      );
    }

    if (!VALID_RESOLVER_TYPES.includes(type as ResolverType)) {
      return NextResponse.json(
        {
          error: `Type invalide. Types valides: ${VALID_RESOLVER_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "Au moins un ID est requis" },
        { status: 400 },
      );
    }

    const result = await resolveIds(
      type as ResolverType,
      ids,
      session.accessToken,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de la résolution:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 },
    );
  }
}
