"use client";

import { useState } from "react";
import { Check, Copy, Play } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/youtube";
import type { FullKitData } from "@/types/kit";

interface ActionChecklistProps {
  items: FullKitData["actionItems"];
  onToggleItem: (itemId: string) => void;
  onSeekTimestamp: (seconds: number) => void;
  canEdit?: boolean;
}

export function ActionChecklist({
  items,
  onToggleItem,
  onSeekTimestamp,
  canEdit = true,
}: ActionChecklistProps) {
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const completedCount = items.filter((item) => item.isCompleted).length;
  const completionPct =
    items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const visibleItems =
    filter === "pending" ? items.filter((item) => !item.isCompleted) : items;

  const handleCopySnippet = async (id: string, snippet: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedId(id);
      toast.success("Snippet copied");
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1800);
    } catch {
      toast.error("Unable to copy snippet");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Execution checklist</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                {completedCount} of {items.length} completed ({completionPct}%)
                {!canEdit ? " · Local preview" : ""}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="xs"
                variant={filter === "all" ? "secondary" : "outline"}
                onClick={() => setFilter("all")}
              >
                All ({items.length})
              </Button>
              <Button
                type="button"
                size="xs"
                variant={filter === "pending" ? "secondary" : "outline"}
                onClick={() => setFilter("pending")}
              >
                Remaining ({items.length - completedCount})
              </Button>
            </div>
          </div>
          <Progress
            value={completionPct}
            indicatorClassName="bg-success"
            className="mt-3"
          />
        </CardHeader>
      </Card>

      <div className="space-y-2.5">
        {visibleItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              All action steps completed.
            </CardContent>
          </Card>
        ) : (
          visibleItems.map((item) => {
            const done = item.isCompleted;
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleItem(item.id)}
                      aria-pressed={done}
                      aria-label={
                        done
                          ? `Mark "${item.title}" incomplete`
                          : `Mark "${item.title}" complete`
                      }
                      className="mt-0.5 shrink-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {done ? (
                        <span className="inline-flex size-5 items-center justify-center rounded-full bg-success text-success-foreground">
                          <Check className="size-3.5" aria-hidden="true" />
                        </span>
                      ) : (
                        <span className="inline-block size-5 rounded-full border border-input bg-card transition-colors hover:border-foreground" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3
                          className={cn(
                            "text-sm font-medium leading-snug",
                            done
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          )}
                        >
                          {item.orderIndex + 1}. {item.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onSeekTimestamp(item.timestampSeconds)}
                          className="cursor-pointer rounded-md"
                          title="Jump video to this step"
                          aria-label={`Jump video to ${formatTimestamp(item.timestampSeconds)}`}
                        >
                          <Badge
                            variant="secondary"
                            className="gap-1 font-mono text-[11px] transition-colors hover:bg-accent"
                          >
                            <Play className="size-2.5 fill-current" aria-hidden="true" />
                            {formatTimestamp(item.timestampSeconds)}
                          </Badge>
                        </button>
                      </div>

                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>

                      {item.codeOrToolSnippet ? (
                        <div className="relative overflow-x-auto rounded-lg border border-border bg-secondary p-2.5 pr-10 font-mono text-xs">
                          <code className="whitespace-pre-wrap break-all text-foreground">
                            {item.codeOrToolSnippet}
                          </code>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            onClick={() =>
                              handleCopySnippet(item.id, item.codeOrToolSnippet!)
                            }
                            aria-label="Copy code snippet"
                            className="absolute right-1.5 top-1.5"
                          >
                            {copiedId === item.id ? (
                              <span className="inline-flex size-4 items-center justify-center rounded-full bg-success text-success-foreground">
                                <Check className="size-2.5" aria-hidden="true" />
                              </span>
                            ) : (
                              <Copy className="size-3.5" aria-hidden="true" />
                            )}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
