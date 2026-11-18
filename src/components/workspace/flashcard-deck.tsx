"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { FullKitData } from "@/types/kit";

interface FlashcardDeckProps {
  cards: FullKitData["flashcards"];
  onToggleMastered: (cardId: string) => void;
  canEdit?: boolean;
}

export function FlashcardDeck({
  cards,
  onToggleMastered,
  canEdit = true,
}: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No flashcards available in this action kit.
        </CardContent>
      </Card>
    );
  }

  const safeIndex = Math.min(currentIndex, cards.length - 1);
  const activeCard = cards[safeIndex];
  const masteredCount = cards.filter((card) => card.mastered).length;
  const masteryPct = Math.round((masteredCount / cards.length) * 100);
  const isCurrentMastered = activeCard.mastered;

  const goTo = (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    setIsFlipped(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs tabular-nums">
            <span className="font-medium text-foreground">
              Card {safeIndex + 1} of {cards.length}
              {!canEdit ? " · Local preview" : ""}
            </span>
            <span className="text-muted-foreground">
              {masteredCount} mastered ({masteryPct}%)
            </span>
          </div>
          <Progress value={masteryPct} indicatorClassName="bg-success" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsFlipped((prev) => !prev)}
        className="w-full cursor-pointer text-left rounded-lg"
      >
        <Card className="flex min-h-64 flex-col justify-between transition-colors hover:border-input">
          <CardContent className="flex flex-1 flex-col justify-between p-6">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary">
                {isFlipped ? "Answer" : "Prompt"}
              </Badge>
              {isCurrentMastered ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <span className="inline-flex size-4 items-center justify-center rounded-full bg-success text-success-foreground">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  Mastered
                </span>
              ) : null}
            </div>

            <div className="my-6 text-center">
              <p className="text-base font-medium leading-relaxed text-foreground sm:text-lg">
                {isFlipped ? activeCard.back : activeCard.front}
              </p>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Click card to flip to {isFlipped ? "prompt" : "answer"}
            </p>
          </CardContent>
        </Card>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safeIndex === 0}
            onClick={() => goTo(safeIndex - 1)}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safeIndex === cards.length - 1}
            onClick={() => goTo(safeIndex + 1)}
          >
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <Button
          type="button"
          size="sm"
          variant={isCurrentMastered ? "secondary" : "default"}
          onClick={() => onToggleMastered(activeCard.id)}
        >
          {isCurrentMastered ? (
            <>
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-success text-success-foreground">
                <Check className="size-2.5" aria-hidden="true" />
              </span>
              Mastered
            </>
          ) : (
            "Mark as mastered"
          )}
        </Button>
      </div>
    </div>
  );
}
