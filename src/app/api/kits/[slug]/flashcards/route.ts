import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  authorizeKitMutation,
  isPrismaRecordNotFound,
} from "@/lib/kit-auth";
import { prisma } from "@/lib/prisma";

const FlashcardPatchSchema = z.object({
  cardId: z.string().min(1),
  mastered: z.boolean(),
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

  const parsed = FlashcardPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid flashcard update payload." },
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

  const { cardId, mastered } = parsed.data;

  try {
    const card = await prisma.flashcard.update({
      where: {
        id: cardId,
        kitId: auth.kitId,
      },
      data: {
        mastered,
      },
    });

    return NextResponse.json({ card }, { status: 200 });
  } catch (error) {
    if (isPrismaRecordNotFound(error)) {
      return NextResponse.json(
        { error: "Flashcard not found for this kit." },
        { status: 404 }
      );
    }

    console.error("[PATCH /api/kits/[slug]/flashcards] Error:", error);
    return NextResponse.json(
      { error: "Failed to update flashcard mastery." },
      { status: 500 }
    );
  }
}
