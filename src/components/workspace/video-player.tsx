"use client";

import { Clock, ExternalLink, PlaySquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTimestamp } from "@/lib/youtube";
import type { KitMode, SourceType } from "@/types/kit";

interface VideoPlayerProps {
  videoId: string | null;
  sourceUrl: string;
  sourceType: SourceType;
  title: string;
  channelName: string | null;
  durationSeconds: number | null;
  mode: KitMode;
  activeTimestamp: number | null;
}

export function VideoPlayer({
  videoId,
  sourceUrl,
  sourceType,
  title,
  channelName,
  durationSeconds,
  mode,
  activeTimestamp,
}: VideoPlayerProps) {
  const startParam =
    activeTimestamp !== null && activeTimestamp > 0
      ? `?start=${Math.floor(activeTimestamp)}&autoplay=1&rel=0`
      : "?rel=0";

  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}${startParam}`
    : null;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border bg-neutral-950 shadow-sm">
        {embedUrl ? (
          <div className="relative aspect-video w-full">
            <iframe
              key={`${videoId}-${activeTimestamp ?? "init"}`}
              src={embedUrl}
              title={title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 p-6 text-center text-neutral-300">
            <PlaySquare className="size-10 text-neutral-500" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{sourceType} Source</p>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 underline underline-offset-4 hover:text-white"
              >
                Open original source
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="uppercase tracking-wider text-[11px]">
            {mode}
          </Badge>
          <Badge variant="outline" className="text-[11px]">
            {sourceType}
          </Badge>
          {durationSeconds ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {formatTimestamp(durationSeconds)}
            </span>
          ) : null}
          {activeTimestamp !== null ? (
            <Badge variant="default" className="text-[11px] font-mono">
              Synced @ {formatTimestamp(activeTimestamp)}
            </Badge>
          ) : null}
        </div>
        <h1 className="text-xl font-semibold tracking-tight leading-snug">
          {title}
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>{channelName ?? "Claros Source"}</span>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors"
          >
            Original Link
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
