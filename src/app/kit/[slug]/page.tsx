import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { KitWorkspace } from "@/components/workspace/kit-workspace";
import { getDemoKitBySlug } from "@/lib/demo-kit";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/supabase/server";
import { KitSummarySchema, type FullKitData } from "@/types/kit";

export const metadata: Metadata = {
  title: "Action Kit Workspace",
  description:
    "Interactive split-screen Claros Action Kit with timestamped checklist, flashcards, quiz, and mind map.",
};

async function loadKitBySlug(slug: string): Promise<FullKitData | null> {
  if (process.env.DATABASE_URL) {
    try {
      const dbKit = await prisma.kit.findUnique({
        where: { slug },
        include: {
          actionItems: { orderBy: { orderIndex: "asc" } },
          flashcards: { orderBy: { orderIndex: "asc" } },
          quizQuestions: { orderBy: { orderIndex: "asc" } },
        },
      });

      if (dbKit) {
        const parsedSummary = KitSummarySchema.safeParse(dbKit.summaryJson);
        const summaryJson = parsedSummary.success
          ? parsedSummary.data
          : {
              tldr: "Action Kit summary",
              keyTakeaways: ["Review checklist items below."],
              prerequisites: [],
              toolsAndResources: [],
              mindMap: {
                id: "root",
                label: dbKit.title,
                children: [{ id: "overview", label: "Overview", children: [] }],
              },
            };

        return {
          id: dbKit.id,
          slug: dbKit.slug,
          userId: dbKit.userId,
          sourceType: dbKit.sourceType,
          sourceUrl: dbKit.sourceUrl,
          videoId: dbKit.videoId,
          title: dbKit.title,
          channelName: dbKit.channelName,
          durationSeconds: dbKit.durationSeconds,
          mode: dbKit.mode,
          summaryJson,
          isPublic: dbKit.isPublic,
          createdAt: dbKit.createdAt.toISOString(),
          actionItems: dbKit.actionItems.map((item) => ({
            id: item.id,
            orderIndex: item.orderIndex,
            timestampSeconds: item.timestampSeconds,
            title: item.title,
            description: item.description,
            codeOrToolSnippet: item.codeOrToolSnippet,
            isCompleted: item.isCompleted,
          })),
          flashcards: dbKit.flashcards.map((card) => ({
            id: card.id,
            orderIndex: card.orderIndex,
            front: card.front,
            back: card.back,
            mastered: card.mastered,
          })),
          quizQuestions: dbKit.quizQuestions.map((q) => ({
            id: q.id,
            orderIndex: q.orderIndex,
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          })),
        };
      }
    } catch {
      // Fall through to demo kit lookup when DB is offline or unseeded
    }
  }

  return getDemoKitBySlug(slug) ?? null;
}

async function KitViewerContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, user] = await Promise.all([params, getOptionalUser()]);
  const kit = await loadKitBySlug(slug);

  if (!kit) {
    notFound();
  }

  const canEdit = kit.userId === null || kit.userId === user?.id;

  return (
    <KitWorkspace
      kit={kit}
      canEdit={canEdit}
      isAuthenticated={Boolean(user)}
    />
  );
}

function KitViewerSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div className="space-y-4 lg:col-span-7">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function KitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<KitViewerSkeleton />}>
      <KitViewerContent params={params} />
    </Suspense>
  );
}
