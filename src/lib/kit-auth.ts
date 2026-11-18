import { NextResponse } from "next/server";
import { getDemoKitBySlug } from "@/lib/demo-kit";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/supabase/server";

export type KitMutationAuthResult =
  | { kind: "demo" }
  | { kind: "authorized"; kitId: string }
  | { kind: "error"; response: NextResponse };

export async function authorizeKitMutation(
  slug: string
): Promise<KitMutationAuthResult> {
  if (getDemoKitBySlug(slug)) {
    return { kind: "demo" };
  }

  if (!process.env.DATABASE_URL) {
    return {
      kind: "error",
      response: NextResponse.json(
        { error: "Database is not configured." },
        { status: 503 }
      ),
    };
  }

  const kit = await prisma.kit.findUnique({
    where: { slug },
    select: { id: true, userId: true },
  });

  if (!kit) {
    return {
      kind: "error",
      response: NextResponse.json({ error: "Kit not found." }, { status: 404 }),
    };
  }

  if (kit.userId !== null) {
    const user = await getOptionalUser();
    if (!user) {
      return {
        kind: "error",
        response: NextResponse.json(
          { error: "Authentication required to update this kit." },
          { status: 401 }
        ),
      };
    }

    if (kit.userId !== user.id) {
      return {
        kind: "error",
        response: NextResponse.json(
          { error: "You do not have permission to update this kit." },
          { status: 403 }
        ),
      };
    }
  }

  return { kind: "authorized", kitId: kit.id };
}

export function isPrismaRecordNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2025"
  );
}
