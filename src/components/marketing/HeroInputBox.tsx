"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { KitMode } from "@/types/kit";

const MODES: Array<{ value: KitMode; label: string; hint: string }> = [
  {
    value: "TUTORIAL",
    label: "Tutorial",
    hint: "Step-by-step commands and a checklist you can follow along.",
  },
  {
    value: "STUDY",
    label: "Study",
    hint: "Flashcards, a recall quiz and the core concepts.",
  },
  {
    value: "EXECUTIVE",
    label: "Executive",
    hint: "A strategic brief and an action plan.",
  },
];

interface HeroInputBoxProps {
  compact?: boolean;
}

export function HeroInputBox({ compact = false }: HeroInputBoxProps) {
  const router = useRouter();
  const inputId = useId();
  const modeLabelId = useId();
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<KitMode>("TUTORIAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeHint = MODES.find((item) => item.value === mode)?.hint;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Paste a YouTube link to generate a kit.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "YOUTUBE",
          sourceUrl: trimmed,
          mode,
          isPublic: false,
        }),
      });

      const payload = (await response.json()) as {
        slug?: string;
        error?: string;
      };

      if (!response.ok || !payload.slug) {
        toast.error(payload.error ?? "Could not generate the kit. Try again.");
        return;
      }

      router.push(`/kit/${payload.slug}`);
    } catch {
      toast.error("Network error. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const controlHeight = compact ? "h-10" : "h-11";

  return (
    <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">
          YouTube video link
        </label>
        <Input
          id={inputId}
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          disabled={isSubmitting}
          className={cn("flex-1", controlHeight, "text-base sm:text-sm")}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(controlHeight, "px-5 text-sm")}
        >
          {isSubmitting ? "Generating…" : "Generate action kit"}
        </Button>
      </div>

      <div className="space-y-2">
        <div
          role="radiogroup"
          aria-labelledby={modeLabelId}
          className="flex flex-wrap items-center gap-2"
        >
          <span
            id={modeLabelId}
            className="mr-1 text-sm font-medium text-foreground"
          >
            Mode
          </span>
          {MODES.map((item) => (
            <label
              key={item.value}
              className="cursor-pointer rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground has-checked:border-primary has-checked:bg-secondary has-checked:text-foreground has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring has-disabled:cursor-not-allowed has-disabled:opacity-50"
            >
              <input
                type="radio"
                name="kit-mode"
                value={item.value}
                checked={mode === item.value}
                onChange={() => setMode(item.value)}
                disabled={isSubmitting}
                className="sr-only"
              />
              {item.label}
            </label>
          ))}
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {activeHint}
        </p>
      </div>
    </form>
  );
}
