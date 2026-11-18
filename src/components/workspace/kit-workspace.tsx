"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActionChecklist } from "@/components/workspace/action-checklist";
import { FlashcardDeck } from "@/components/workspace/flashcard-deck";
import { MindMap } from "@/components/workspace/mind-map";
import { QuizPanel } from "@/components/workspace/quiz-panel";
import { VideoPlayer } from "@/components/workspace/video-player";
import type { FullKitData } from "@/types/kit";

interface KitWorkspaceProps {
  kit: FullKitData;
  canEdit: boolean;
  isAuthenticated: boolean;
}

export function KitWorkspace({
  kit,
  canEdit,
  isAuthenticated,
}: KitWorkspaceProps) {
  const [activeTimestamp, setActiveTimestamp] = useState<number | null>(null);
  const [actionItems, setActionItems] = useState(kit.actionItems);
  const [flashcards, setFlashcards] = useState(kit.flashcards);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Action kit link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleToggleActionItem = async (itemId: string) => {
    const target = actionItems.find((item) => item.id === itemId);
    if (!target) {
      return;
    }

    const previousState = target.isCompleted;
    const nextCompleted = !previousState;

    setActionItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isCompleted: nextCompleted } : item
      )
    );

    if (!canEdit) {
      return;
    }

    try {
      const response = await fetch(
        `/api/kits/${encodeURIComponent(kit.slug)}/checklist`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId,
            isCompleted: nextCompleted,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Checklist update failed");
      }
    } catch {
      setActionItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, isCompleted: previousState } : item
        )
      );
      toast.error("Failed to save progress. Please try again.");
    }
  };

  const handleToggleFlashcardMastered = async (cardId: string) => {
    const target = flashcards.find((card) => card.id === cardId);
    if (!target) {
      return;
    }

    const previousState = target.mastered;
    const nextMastered = !previousState;

    setFlashcards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, mastered: nextMastered } : card
      )
    );

    if (!canEdit) {
      return;
    }

    try {
      const response = await fetch(
        `/api/kits/${encodeURIComponent(kit.slug)}/flashcards`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardId,
            mastered: nextMastered,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Flashcard update failed");
      }
    } catch {
      setFlashcards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, mastered: previousState } : card
        )
      );
      toast.error("Failed to save progress. Please try again.");
    }
  };

  const showClaimBanner = kit.userId === null && !isAuthenticated;
  const showReadOnlyNote = !canEdit;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={isAuthenticated ? "/dashboard" : "/"}
              className="shrink-0 text-sm font-semibold tracking-tight text-foreground"
            >
              Claros
            </Link>
            <span className="hidden text-border sm:inline">/</span>
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">
              {kit.title}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="secondary">
              {kit.isPublic ? "Public" : "Private"}
            </Badge>
            <Button size="sm" variant="outline" onClick={handleShare}>
              <Copy className="size-3.5" aria-hidden="true" />
              Copy link
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {showClaimBanner ? (
          <div className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                Viewing an unsaved guest action kit
              </p>
              <p className="text-xs text-muted-foreground">
                Sign in to save this checklist, flashcard deck, and quiz to your
                account.
              </p>
            </div>
            <Button
              size="sm"
              className="shrink-0"
              render={
                <Link
                  href={`/login?claimSlug=${encodeURIComponent(kit.slug)}`}
                />
              }
              nativeButton={false}
            >
              Save this Action Kit to your Dashboard
            </Button>
          </div>
        ) : null}

        {showReadOnlyNote ? (
          <div className="mb-6 flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              You are viewing a shared kit in read-only mode. Checklist and
              flashcard updates stay local to this session.
            </p>
            {!isAuthenticated ? (
              <Link
                href={`/login?next=${encodeURIComponent(`/kit/${kit.slug}`)}`}
                className="shrink-0 text-xs font-medium text-foreground underline underline-offset-4"
              >
                Sign in to create your own
              </Link>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Left Pane: Media Player & Executive TL;DR */}
          <section className="space-y-4 lg:sticky lg:top-20 lg:col-span-5">
            <VideoPlayer
              videoId={kit.videoId}
              sourceUrl={kit.sourceUrl}
              sourceType={kit.sourceType}
              title={kit.title}
              channelName={kit.channelName}
              durationSeconds={kit.durationSeconds}
              mode={kit.mode}
              activeTimestamp={activeTimestamp}
            />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {kit.summaryJson.tldr}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Right Pane: Interactive Action Kit Tabs */}
          <section className="lg:col-span-7">
            <Tabs defaultValue="checklist" className="w-full">
              <TabsList
                variant="line"
                className="grid h-10 w-full grid-cols-4 border-b border-border"
              >
                <TabsTrigger
                  value="checklist"
                  className="text-xs tabular-nums sm:text-sm"
                >
                  Checklist ({actionItems.length})
                </TabsTrigger>
                <TabsTrigger
                  value="flashcards"
                  className="text-xs tabular-nums sm:text-sm"
                >
                  Flashcards ({flashcards.length})
                </TabsTrigger>
                <TabsTrigger
                  value="quiz"
                  className="text-xs tabular-nums sm:text-sm"
                >
                  Quiz ({kit.quizQuestions.length})
                </TabsTrigger>
                <TabsTrigger value="mindmap" className="text-xs sm:text-sm">
                  Mind Map
                </TabsTrigger>
              </TabsList>

              <TabsContent value="checklist" className="mt-4">
                <ActionChecklist
                  items={actionItems}
                  onToggleItem={handleToggleActionItem}
                  onSeekTimestamp={(seconds) => setActiveTimestamp(seconds)}
                  canEdit={canEdit}
                />
              </TabsContent>

              <TabsContent value="flashcards" className="mt-4">
                <FlashcardDeck
                  cards={flashcards}
                  onToggleMastered={handleToggleFlashcardMastered}
                  canEdit={canEdit}
                />
              </TabsContent>

              <TabsContent value="quiz" className="mt-4">
                <QuizPanel questions={kit.quizQuestions} />
              </TabsContent>

              <TabsContent value="mindmap" className="mt-4">
                <MindMap summary={kit.summaryJson} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  );
}
