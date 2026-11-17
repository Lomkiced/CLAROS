"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { FullKitData } from "@/types/kit";

interface FlashcardDeckProps {
  cards: FullKitData["flashcards"];
}

export function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredMap, setMasteredMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(cards.map((card) => [card.id, card.mastered]))
  );

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No flashcards available in this Action Kit.
        </CardContent>
      </Card>
    );
  }

  const activeCard = cards[currentIndex];
  const masteredCount = cards.filter((c) => masteredMap[c.id]).length;
  const masteryPct = Math.round((masteredCount / cards.length) * 100);
  const isCurrentMastered = Boolean(masteredMap[activeCard.id]);

  const goTo = (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    setIsFlipped(false);
  };

  const toggleMastered = () => {
    setMasteredMap((prev) => ({
      ...prev,
      [activeCard.id]: !prev[activeCard.id],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span className="text-muted-foreground">
              {masteredCount} mastered ({masteryPct}%)
            </span>
          </div>
          <Progress value={masteryPct} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsFlipped((prev) => !prev)}
        className="w-full text-left cursor-pointer group"
      >
        <Card
          className={cn(
            "min-h-64 flex flex-col justify-between transition-all border-2",
            isFlipped
              ? "border-primary/40 bg-muted/30"
              : "border-border hover:border-primary/30"
          )}
        >
          <CardContent className="flex flex-1 flex-col justify-between p-6">
            <div className="flex items-center justify-between">
              <Badge variant={isFlipped ? "default" : "secondary"}>
                {isFlipped ? "Answer" : "Prompt"}
              </Badge>
              {isCurrentMastered ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                >
                  <Sparkles className="size-3" />
                  Mastered
                </Badge>
              ) : null}
            </div>

            <div className="my-6 text-center">
              <p className="text-base sm:text-lg font-medium leading-relaxed">
                {isFlipped ? activeCard.back : activeCard.front}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <RotateCw className="size-3.5 transition-transform group-hover:rotate-45" />
              Click card to flip to {isFlipped ? "prompt" : "answer"}
            </div>
          </CardContent>
        </Card>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => goTo(currentIndex - 1)}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentIndex === cards.length - 1}
            onClick={() => goTo(currentIndex + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <Button
          type="button"
          size="sm"
          variant={isCurrentMastered ? "secondary" : "default"}
          onClick={toggleMastered}
        >
          {isCurrentMastered ? "Unmark Mastered" : "Mark as Mastered"}
        </Button>
      </div>
    </div>
  );
}
