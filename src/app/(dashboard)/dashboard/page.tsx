import { Suspense } from "react";
import Link from "next/link";
import { HeroInputBox } from "@/components/marketing/HeroInputBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";
import { FREE_WEEKLY_CREDIT_LIMIT, getProfileForUser } from "@/lib/profile";
import { getOptionalUser } from "@/lib/supabase/server";
import type { KitMode, KitSummary } from "@/types/kit";

const MODE_LABEL: Record<KitMode, string> = {
  STUDY: "Study",
  TUTORIAL: "Tutorial",
  EXECUTIVE: "Executive",
};

interface DashboardKitItem {
  id: string;
  slug: string;
  title: string;
  channelName: string | null;
  mode: KitMode;
  isPublic: boolean;
  tldr: string;
  actionCount: number;
  flashcardCount: number;
  quizCount: number;
}

async function DashboardContent() {
  const user = await getOptionalUser();
  let plan: "FREE" | "PRO" = "FREE";
  let weeklyCreditsUsed = 0;
  let kits: DashboardKitItem[] = [];

  if (user) {
    const [profile, userKits] = await Promise.all([
      getProfileForUser(user.id),
      process.env.DATABASE_URL
        ? prisma.kit
            .findMany({
              where: { userId: user.id },
              orderBy: { createdAt: "desc" },
              include: {
                _count: {
                  select: {
                    actionItems: true,
                    flashcards: true,
                    quizQuestions: true,
                  },
                },
              },
            })
            .catch(() => [])
        : Promise.resolve([]),
    ]);

    if (profile) {
      plan = profile.plan;
      weeklyCreditsUsed = profile.weeklyCreditsUsed;
    }

    kits = userKits.map((kit) => {
      const summary = kit.summaryJson as Partial<KitSummary> | null;
      return {
        id: kit.id,
        slug: kit.slug,
        title: kit.title,
        channelName: kit.channelName,
        mode: kit.mode,
        isPublic: kit.isPublic,
        tldr: summary?.tldr ?? "Structured action kit.",
        actionCount: kit._count.actionItems,
        flashcardCount: kit._count.flashcards,
        quizCount: kit._count.quizQuestions,
      };
    });
  }

  const creditPct =
    plan === "PRO"
      ? 100
      : Math.min(
          100,
          Math.round((weeklyCreditsUsed / FREE_WEEKLY_CREDIT_LIMIT) * 100)
        );

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Generate an action kit</CardTitle>
            <CardDescription>
              Paste a YouTube link and pick the output mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HeroInputBox compact />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Weekly credits</CardTitle>
              <Badge variant="secondary">{plan}</Badge>
            </div>
            <CardDescription className="tabular-nums">
              {plan === "PRO"
                ? "Unlimited action kit generations"
                : `${weeklyCreditsUsed} / ${FREE_WEEKLY_CREDIT_LIMIT} weekly kits used`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={creditPct} />
            {plan === "FREE" ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                render={<Link href="/pricing" />}
                nativeButton={false}
              >
                Upgrade to Pro
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Saved action kits
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
              {kits.length === 0
                ? "No saved kits in your workspace yet."
                : `${kits.length} saved ${kits.length === 1 ? "kit" : "kits"}`}
            </p>
          </div>
          <Link
            href="/kits"
            className="text-sm font-medium text-foreground underline underline-offset-4"
          >
            Browse public kits
          </Link>
        </div>

        {kits.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center space-y-3">
              <p className="text-base font-semibold text-foreground">
                Your workspace is empty
              </p>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                Paste any YouTube video or lecture above to create your first
                action kit, or inspect an example kit from the public directory.
              </p>
              <div className="pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href="/kit/demo-nextjs-saas-architecture" />}
                  nativeButton={false}
                >
                  Open example kit
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {kits.map((kit) => (
              <li key={kit.id}>
                <Link
                  href={`/kit/${kit.slug}`}
                  className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-foreground group-hover:underline group-hover:underline-offset-4">
                        {kit.title}
                      </span>
                      <Badge variant="secondary">{MODE_LABEL[kit.mode]}</Badge>
                    </div>
                    <p className="max-w-2xl line-clamp-2 text-sm text-muted-foreground">
                      {kit.tldr}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {kit.channelName ?? "Claros"} · {kit.actionCount} steps ·{" "}
                      {kit.flashcardCount} cards · {kit.quizCount} questions
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-foreground underline underline-offset-4">
                    Open kit
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-44 rounded-lg lg:col-span-2" />
        <Skeleton className="h-44 rounded-lg" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Workspace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your saved checklists, flashcards, quizzes, and weekly credits.
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
