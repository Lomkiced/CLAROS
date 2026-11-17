import Link from "next/link";
import { HeroInputBox } from "@/components/marketing/HeroInputBox";
import { DEMO_KITS } from "@/lib/demo-kit";
import type { KitMode } from "@/types/kit";

const MODE_LABEL: Record<KitMode, string> = {
  STUDY: "Study",
  TUTORIAL: "Tutorial",
  EXECUTIVE: "Executive",
};

const OUTPUTS = [
  {
    title: "A checklist tied to the video",
    description: (
      <>
        Every step links to its moment in the video, like{" "}
        <span className="font-mono text-foreground">04:12</span>, with the
        commands and snippets you need ready to copy.
      </>
    ),
  },
  {
    title: "Flashcards",
    description:
      "Front and back cards that pull out the definitions, syntax and mental models worth remembering.",
  },
  {
    title: "A short quiz",
    description:
      "Multiple-choice questions with an explanation for each answer, so you find gaps while the video is fresh.",
  },
  {
    title: "A mind map",
    description:
      "The structure of the whole talk on one page, from the big idea down to the details.",
  },
] as const;

export default function LandingPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Turn any video or lecture into an action kit.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Paste a YouTube link. Claros returns a timestamped checklist,
            flashcards, a quiz and a mind map beside the video.
          </p>

          <div className="mt-10 max-w-2xl">
            <HeroInputBox />
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No account needed to look around.{" "}
            <Link
              href="/kit/demo-nextjs-saas-architecture"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Open an example kit
            </Link>
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight">
            One video, four ways to keep what it taught you
          </h2>
          <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {OUTPUTS.map((output) => (
              <div key={output.title} className="border-t border-border pt-4">
                <dt className="text-base font-semibold">{output.title}</dt>
                <dd className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {output.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Example kits
            </h2>
            <Link
              href="/kits"
              className="text-sm font-medium text-foreground underline underline-offset-4"
            >
              Browse all kits
            </Link>
          </div>

          <ul className="mt-8 divide-y divide-border border-y border-border">
            {DEMO_KITS.map((kit) => (
              <li key={kit.id}>
                <Link
                  href={`/kit/${kit.slug}`}
                  className="group block py-5 transition-colors"
                >
                  <span className="block text-base font-semibold group-hover:underline group-hover:underline-offset-4">
                    {kit.title}
                  </span>
                  <span className="mt-1 block max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {kit.summaryJson.tldr}
                  </span>
                  <span className="mt-2 block text-xs text-muted-foreground tabular-nums">
                    {MODE_LABEL[kit.mode]} · {kit.actionItems.length} steps ·{" "}
                    {kit.flashcards.length} cards · {kit.quizQuestions.length}{" "}
                    questions
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
