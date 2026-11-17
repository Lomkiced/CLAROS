import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckSquare, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_KITS } from "@/lib/demo-kit";
import { prisma } from "@/lib/prisma";
import type { KitSummary } from "@/types/kit";

interface PublicKitSummaryCard {
  id: string;
  slug: string;
  title: string;
  channelName: string | null;
  mode: string;
  tldr: string;
  actionCount: number;
  flashcardCount: number;
  quizCount: number;
}

async function fetchPublicKits(): Promise<PublicKitSummaryCard[]> {
  if (!process.env.DATABASE_URL) {
    return DEMO_KITS.map((kit) => ({
      id: kit.id,
      slug: kit.slug,
      title: kit.title,
      channelName: kit.channelName,
      mode: kit.mode,
      tldr: kit.summaryJson.tldr,
      actionCount: kit.actionItems.length,
      flashcardCount: kit.flashcards.length,
      quizCount: kit.quizQuestions.length,
    }));
  }

  try {
    const dbKits = await prisma.kit.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      take: 24,
      include: {
        _count: {
          select: {
            actionItems: true,
            flashcards: true,
            quizQuestions: true,
          },
        },
      },
    });

    if (dbKits.length === 0) {
      return DEMO_KITS.map((kit) => ({
        id: kit.id,
        slug: kit.slug,
        title: kit.title,
        channelName: kit.channelName,
        mode: kit.mode,
        tldr: kit.summaryJson.tldr,
        actionCount: kit.actionItems.length,
        flashcardCount: kit.flashcards.length,
        quizCount: kit.quizQuestions.length,
      }));
    }

    return dbKits.map((kit) => {
      const summary = kit.summaryJson as Partial<KitSummary> | null;
      return {
        id: kit.id,
        slug: kit.slug,
        title: kit.title,
        channelName: kit.channelName,
        mode: kit.mode,
        tldr: summary?.tldr ?? "Structured Claros Action Kit.",
        actionCount: kit._count.actionItems,
        flashcardCount: kit._count.flashcards,
        quizCount: kit._count.quizQuestions,
      };
    });
  } catch {
    return DEMO_KITS.map((kit) => ({
      id: kit.id,
      slug: kit.slug,
      title: kit.title,
      channelName: kit.channelName,
      mode: kit.mode,
      tldr: kit.summaryJson.tldr,
      actionCount: kit.actionItems.length,
      flashcardCount: kit.flashcards.length,
      quizCount: kit.quizQuestions.length,
    }));
  }
}

async function PublicKitsGrid() {
  const kits = await fetchPublicKits();

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {kits.map((kit) => (
        <Card key={kit.id} className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary">{kit.mode}</Badge>
              <span className="text-xs text-muted-foreground truncate">
                {kit.channelName ?? "Claros"}
              </span>
            </div>
            <CardTitle className="mt-2 line-clamp-2 text-base">
              {kit.title}
            </CardTitle>
            <CardDescription className="line-clamp-3 text-xs leading-relaxed">
              {kit.tldr}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CheckSquare className="size-3.5" />
                {kit.actionCount} steps
              </span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="size-3.5" />
                {kit.flashcardCount} cards
              </span>
              <span className="inline-flex items-center gap-1">
                <HelpCircle className="size-3.5" />
                {kit.quizCount} quiz
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={<Link href={`/kit/${kit.slug}`} />}
              nativeButton={false}
            >
              Open Kit
              <ArrowRight className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PublicKitsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((idx) => (
        <Card key={idx}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PublicKitsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Public Action Kits Directory
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Community-shared breakdowns with interactive checklists, flashcards,
            quizzes, and mind maps.
          </p>
        </div>
        <Button
          size="sm"
          render={<Link href="/" />}
          nativeButton={false}
        >
          Create Your Own Kit
        </Button>
      </div>

      <Suspense fallback={<PublicKitsSkeleton />}>
        <PublicKitsGrid />
      </Suspense>
    </div>
  );
}
