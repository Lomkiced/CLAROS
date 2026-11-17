"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckSquare,
  GitBranch,
  HelpCircle,
  Share2,
} from "lucide-react";
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
}

export function KitWorkspace({ kit }: KitWorkspaceProps) {
  const [activeTimestamp, setActiveTimestamp] = useState<number | null>(null);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Action Kit URL copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/dashboard" />}
              nativeButton={false}
            >
              <ArrowLeft className="size-4" />
              Workspace
            </Button>
            <span className="text-border hidden sm:inline">/</span>
            <span className="truncate text-sm font-medium hidden sm:inline">
              {kit.title}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={kit.isPublic ? "secondary" : "outline"}>
              {kit.isPublic ? "Public Kit" : "Private Kit"}
            </Badge>
            <Button size="sm" variant="outline" onClick={handleShare}>
              <Share2 className="size-3.5" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Left Pane: Media Player & Executive TL;DR */}
          <section className="space-y-4 lg:col-span-5 lg:sticky lg:top-20">
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
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Executive TL;DR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {kit.summaryJson.tldr}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Right Pane: Interactive Action Kit Tabs */}
          <section className="lg:col-span-7">
            <Tabs defaultValue="checklist" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-10">
                <TabsTrigger value="checklist" className="gap-1.5 text-xs sm:text-sm">
                  <CheckSquare className="size-3.5" />
                  <span>Checklist ({kit.actionItems.length})</span>
                </TabsTrigger>
                <TabsTrigger value="flashcards" className="gap-1.5 text-xs sm:text-sm">
                  <BookOpen className="size-3.5" />
                  <span>Flashcards ({kit.flashcards.length})</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="gap-1.5 text-xs sm:text-sm">
                  <HelpCircle className="size-3.5" />
                  <span>Quiz ({kit.quizQuestions.length})</span>
                </TabsTrigger>
                <TabsTrigger value="mindmap" className="gap-1.5 text-xs sm:text-sm">
                  <GitBranch className="size-3.5" />
                  <span>Mind Map</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="checklist" className="mt-4">
                <ActionChecklist
                  items={kit.actionItems}
                  onSeekTimestamp={(seconds) => setActiveTimestamp(seconds)}
                />
              </TabsContent>

              <TabsContent value="flashcards" className="mt-4">
                <FlashcardDeck cards={kit.flashcards} />
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
