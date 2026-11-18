import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  authorizeKitMutation,
  isPrismaRecordNotFound,
} from "@/lib/kit-auth";
import { prisma } from "@/lib/prisma";

const ChecklistPatchSchema = z.object({
  itemId: z.string().min(1),
  isCompleted: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const parsed = ChecklistPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checklist update payload." },
      { status: 400 }
    );
  }

  const { slug } = await context.params;
  const auth = await authorizeKitMutation(slug);

  if (auth.kind === "demo") {
    return NextResponse.json({ ok: true, demo: true });
  }

  if (auth.kind === "error") {
    return auth.response;
  }

  const { itemId, isCompleted } = parsed.data;

  try {
    const item = await prisma.actionItem.update({
      where: {
        id: itemId,
        kitId: auth.kitId,
      },
      data: {
        isCompleted,
      },
    });

    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    if (isPrismaRecordNotFound(error)) {
      return NextResponse.json(
        { error: "Checklist item not found for this kit." },
        { status: 404 }
      );
    }

    console.error("[PATCH /api/kits/[slug]/checklist] Error:", error);
    return NextResponse.json(
      { error: "Failed to update checklist item." },
      { status: 500 }
    );
  }
}
