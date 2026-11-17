"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FullKitData } from "@/types/kit";

interface QuizPanelProps {
  questions: FullKitData["quizQuestions"];
}

export function QuizPanel({ questions }: QuizPanelProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No quiz questions available in this Action Kit.
        </CardContent>
      </Card>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correctIndex
  ).length;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => {
      if (prev[questionId] !== undefined) {
        return prev;
      }
      return { ...prev, [questionId]: optionIndex };
    });
  };

  const resetQuiz = () => {
    setAnswers({});
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Active Recall Quiz</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Score: {correctCount} / {questions.length} correct ({answeredCount} answered)
              </p>
            </div>
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={resetQuiz}
              disabled={answeredCount === 0}
            >
              <RotateCcw className="size-3" />
              Reset Quiz
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {questions.map((q) => {
          const selectedIndex = answers[q.id];
          const isAnswered = selectedIndex !== undefined;
          const isCorrect = selectedIndex === q.correctIndex;

          return (
            <Card key={q.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">
                    {q.orderIndex + 1}. {q.question}
                  </p>
                  {isAnswered ? (
                    <Badge
                      variant={isCorrect ? "default" : "destructive"}
                      className="shrink-0"
                    >
                      {isCorrect ? "Correct" : "Review"}
                    </Badge>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  {q.options.map((option, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isRightOption = idx === q.correctIndex;

                    let optionStyle =
                      "border-border hover:bg-muted/60 text-foreground";
                    if (isAnswered) {
                      if (isRightOption) {
                        optionStyle =
                          "border-emerald-500/60 bg-emerald-500/10 text-foreground";
                      } else if (isSelected) {
                        optionStyle =
                          "border-destructive/60 bg-destructive/10 text-destructive";
                      } else {
                        optionStyle = "border-border opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(q.id, idx)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs sm:text-sm transition-colors",
                          !isAnswered && "cursor-pointer",
                          optionStyle
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </span>
                        {isAnswered && isRightOption ? (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : null}
                        {isAnswered && isSelected && !isRightOption ? (
                          <XCircle className="size-4 shrink-0 text-destructive" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {isAnswered ? (
                  <div className="rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Explanation:{" "}
                    </span>
                    {q.explanation}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
