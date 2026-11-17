import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  HelpCircle,
  Sparkles,
} from "lucide-react";
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
import { HeroInputBox } from "@/components/marketing/HeroInputBox";
import { DEMO_KITS } from "@/lib/demo-kit";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/supabase/server";
import type { KitSummary } from "@/types/kit";

const FREE_WEEKLY_CREDIT_LIMIT = 5;

interface DashboardKitItem {
  id: string;
  slug: string;
  title: string;
  channelName: string | null;
  mode: string;
  isPublic: boolean;
  tldr: string;
  actionCount: number;
  flashcardCount: number;
  quizCount: number;
  isDemo?: boolean;
}

async function DashboardContent() {
  const user = await getOptionalUser();
  let plan: "FREE" | "PRO" = "FREE";
  let weeklyCreditsUsed = 0;
  let kits: DashboardKitItem[] = [];

  if (user && process.env.DATABASE_URL) {
    try {
      const [profile, userKits] = await Promise.all([
        prisma.profile.findUnique({
          where: { id: user.id },
          select: { plan: true, weeklyCreditsUsed: true },
        }),
        prisma.kit.findMany({
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
        }),
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
          tldr: summary?.tldr ?? "Structured Action Kit.",
          actionCount: kit._count.actionItems,
          flashcardCount: kit._count.flashcards,
          quizCount: kit._count.quizQuestions,
        };
      });
    } catch {
      kits = [];
    }
  }

  const showingDemoFallback = kits.length === 0;
  const displayedKits: DashboardKitItem[] = showingDemoFallback
    ? DEMO_KITS.map((kit) => ({
        id: kit.id,
        slug: kit.slug,
        title: kit.title,
        channelName: kit.channelName,
        mode: kit.mode,
        isPublic: kit.isPublic,
        tldr: kit.summaryJson.tldr,
        actionCount: kit.actionItems.length,
        flashcardCount: kit.flashcards.length,
        quizCount: kit.quizQuestions.length,
        isDemo: true,
      }))
    : kits;

  const creditPct =
    plan === "PRO"
      ? 100
      : Math.min(100, Math.round((weeklyCreditsUsed / FREE_WEEKLY_CREDIT_LIMIT) * 100));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Create a New Action Kit</CardTitle>
            <CardDescription>
              Paste any YouTube URL and choose your learning or execution mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HeroInputBox compact />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Weekly Usage</CardTitle>
              <Badge variant={plan === "PRO" ? "default" : "secondary"}>
                {plan} PLAN
              </Badge>
            </div>
            <CardDescription>
              {plan === "PRO"
                ? "Unlimited Action Kit generations enabled."
                : `${weeklyCreditsUsed} of ${FREE_WEEKLY_CREDIT_LIMIT} weekly kits used`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={creditPct} />
            {plan === "FREE" ? (
              <Button
                size="sm"
                className="w-full"
                render={<Link href="/pricing" />}
                nativeButton={false}
              >
                <Sparkles className="size-3.5" />
                Upgrade to Pro
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {showingDemoFallback ? "Starter & Sample Action Kits" : "Your Saved Action Kits"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {showingDemoFallback
                ? "Connect Supabase Auth & PostgreSQL or generate a new kit to populate your personal workspace."
                : `${displayedKits.length} saved Action Kits`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/kits" />}
            nativeButton={false}
          >
            Explore Public Kits
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayedKits.map((kit) => (
            <Card key={kit.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary">{kit.mode}</Badge>
                    {kit.isDemo ? (
                      <Badge variant="outline" className="text-[10px]">
                        Sample
                      </Badge>
                    ) : null}
                  </div>
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
                  size="sm"
                  variant="outline"
                  className="w-full"
                  render={<Link href={`/kit/${kit.slug}`} />}
                  nativeButton={false}
                >
                  Open Workspace
                  <ArrowRight className="size-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-44 rounded-xl lg:col-span-2" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Action Kit Workspace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your generated video playbooks, study decks, and checklists.
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
