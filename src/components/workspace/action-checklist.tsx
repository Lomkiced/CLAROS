"use client";

import { useState } from "react";
import { Check, CheckCircle2, Circle, Copy, Play } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatTimestamp } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import type { FullKitData } from "@/types/kit";

interface ActionChecklistProps {
  items: FullKitData["actionItems"];
  onSeekTimestamp: (seconds: number) => void;
}

export function ActionChecklist({
  items,
  onSeekTimestamp,
}: ActionChecklistProps) {
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.isCompleted]))
  );
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const completedCount = items.filter((item) => completedIds[item.id]).length;
  const completionPct =
    items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const visibleItems =
    filter === "pending"
      ? items.filter((item) => !completedIds[item.id])
      : items;

  const toggleItem = (id: string) => {
    setCompletedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopySnippet = async (id: string, snippet: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedId(id);
      toast.success("Snippet copied to clipboard");
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
              <CardTitle className="text-base">Execution Checklist</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedCount} of {items.length} action steps completed ({completionPct}%)
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="xs"
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                All ({items.length})
              </Button>
              <Button
                type="button"
                size="xs"
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
              >
                Remaining ({items.length - completedCount})
              </Button>
            </div>
          </div>
          <Progress value={completionPct} className="mt-3" />
        </CardHeader>
      </Card>

      <div className="space-y-2.5">
        {visibleItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              All action steps completed. Great execution!
            </CardContent>
          </Card>
        ) : (
          visibleItems.map((item) => {
            const done = Boolean(completedIds[item.id]);
            return (
              <Card
                key={item.id}
                className={cn(
                  "transition-colors",
                  done ? "bg-muted/40 opacity-85" : "bg-card"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      aria-label={
                        done ? `Mark "${item.title}" incomplete` : `Mark "${item.title}" complete`
                      }
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      {done ? (
                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="size-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3
                          className={cn(
                            "text-sm font-medium leading-snug",
                            done && "line-through text-muted-foreground"
                          )}
                        >
                          {item.orderIndex + 1}. {item.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onSeekTimestamp(item.timestampSeconds)}
                          className="cursor-pointer"
                          title="Jump video to this step"
                        >
                          <Badge
                            variant="secondary"
                            className="gap-1 font-mono text-[11px] hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Play className="size-2.5 fill-current" />
                            {formatTimestamp(item.timestampSeconds)}
                          </Badge>
                        </button>
                      </div>

                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>

                      {item.codeOrToolSnippet ? (
                        <div className="relative rounded-lg border bg-muted/60 p-2.5 pr-10 font-mono text-xs overflow-x-auto">
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
                              <Check className="size-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="size-3.5" />
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
