import { NextResponse } from "next/server";
import { generateActionKitFromSource } from "@/lib/ai";
import { DEMO_KITS } from "@/lib/demo-kit";
import { prisma } from "@/lib/prisma";
import { FREE_WEEKLY_CREDIT_LIMIT, ONE_WEEK_MS } from "@/lib/profile";
import { getOptionalUser } from "@/lib/supabase/server";
import {
  extractYouTubeId,
  fetchYouTubeMetadata,
  slugifyTitle,
} from "@/lib/youtube";
import { GenerateKitRequestSchema } from "@/types/kit";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const parsed = GenerateKitRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request parameters.",
        issues: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { sourceType, sourceUrl, mode, isPublic, transcriptOrNotes } =
    parsed.data;

  const videoId =
    sourceType === "YOUTUBE" ? extractYouTubeId(sourceUrl) : null;

  if (sourceType === "YOUTUBE" && !videoId) {
    return NextResponse.json(
      { error: "Please enter a valid YouTube video URL." },
      { status: 400 }
    );
  }

  // If the URL matches a built-in demo video and AI keys are not yet set,
  // allow instant preview without requiring external credentials.
  if (!process.env.OPENROUTER_API_KEY) {
    const matchingDemo = DEMO_KITS.find((kit) => kit.videoId === videoId);
    if (matchingDemo) {
      return NextResponse.json({
        kitId: matchingDemo.id,
        slug: matchingDemo.slug,
        kit: matchingDemo,
      });
    }

    return NextResponse.json(
      {
        error:
          "OPENROUTER_API_KEY is not configured. Add it to .env to generate new Action Kits, or preview the featured demo kit.",
      },
      { status: 503 }
    );
  }

  const user = await getOptionalUser();
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  if (user && hasDatabase) {
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    if (profile && profile.plan === "FREE") {
      const now = new Date();
      const windowExpired = now.getTime() >= profile.creditsResetAt.getTime();

      if (windowExpired) {
        await prisma.profile.update({
          where: { id: user.id },
          data: {
            weeklyCreditsUsed: 0,
            creditsResetAt: new Date(now.getTime() + ONE_WEEK_MS),
          },
        });
      } else if (profile.weeklyCreditsUsed >= FREE_WEEKLY_CREDIT_LIMIT) {
        return NextResponse.json(
          {
            error: `Weekly Free plan limit reached (${FREE_WEEKLY_CREDIT_LIMIT} Action Kits/week). Upgrade to Pro for unlimited kits.`,
          },
          { status: 429 }
        );
      }
    }
  }

  const metadata =
    sourceType === "YOUTUBE"
      ? await fetchYouTubeMetadata(sourceUrl)
      : {
          videoId: null,
          title: "Document Action Kit",
          channelName: null,
          thumbnailUrl: "",
          durationSeconds: null,
        };

  try {
    const generatedKit = await generateActionKitFromSource({
      title: metadata.title,
      channelName: metadata.channelName,
      sourceUrl,
      mode,
      transcriptOrContent: transcriptOrNotes,
    });

    const slug = slugifyTitle(generatedKit.title);

    if (!hasDatabase) {
      return NextResponse.json({
        kitId: `ephemeral-${slug}`,
        slug,
        kit: {
          ...generatedKit,
          slug,
          sourceType,
          sourceUrl,
          videoId,
          channelName: metadata.channelName,
          durationSeconds: metadata.durationSeconds,
          isPublic,
        },
      });
    }

    const createdKit = await prisma.$transaction(async (tx) => {
      if (user) {
        await tx.profile.upsert({
          where: { id: user.id },
          create: {
            id: user.id,
            email: user.email ?? `${user.id}@users.claros.local`,
            weeklyCreditsUsed: 1,
            creditsResetAt: new Date(Date.now() + ONE_WEEK_MS),
          },
          update: {
            weeklyCreditsUsed: { increment: 1 },
          },
        });
      }

      return tx.kit.create({
        data: {
          slug,
          userId: user?.id ?? null,
          sourceType,
          sourceUrl,
          videoId,
          title: generatedKit.title,
          channelName: metadata.channelName,
          durationSeconds: metadata.durationSeconds,
          mode: generatedKit.mode,
          summaryJson: generatedKit.summaryJson,
          isPublic,
          actionItems: {
            create: generatedKit.actionItems.map((item, idx) => ({
              orderIndex: item.orderIndex ?? idx,
              timestampSeconds: item.timestampSeconds,
              title: item.title,
              description: item.description,
              codeOrToolSnippet: item.codeOrToolSnippet ?? null,
              isCompleted: false,
            })),
          },
          flashcards: {
            create: generatedKit.flashcards.map((card, idx) => ({
              orderIndex: card.orderIndex ?? idx,
              front: card.front,
              back: card.back,
              mastered: false,
            })),
          },
          quizQuestions: {
            create: generatedKit.quizQuestions.map((q, idx) => ({
              orderIndex: q.orderIndex ?? idx,
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
              explanation: q.explanation,
            })),
          },
        },
        include: {
          actionItems: { orderBy: { orderIndex: "asc" } },
          flashcards: { orderBy: { orderIndex: "asc" } },
          quizQuestions: { orderBy: { orderIndex: "asc" } },
        },
      });
    });

    return NextResponse.json(
      {
        kitId: createdKit.id,
        slug: createdKit.slug,
        kit: createdKit,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[/api/generate] Failed to generate Action Kit:", error);
    return NextResponse.json(
      { error: "Failed to generate Action Kit. Please try again." },
      { status: 500 }
    );
  }
}
