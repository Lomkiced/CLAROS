import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import {
  ActionKitSchema,
  type ActionKit,
  type KitMode,
} from "@/types/kit";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  appName: "Claros",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

const DEFAULT_MODEL =
  process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

const MODE_INSTRUCTIONS: Record<KitMode, string> = {
  STUDY:
    "Focus on deep comprehension, active recall, conceptual relationships, clear definitions, and exam-ready flashcards and quiz questions.",
  TUTORIAL:
    "Focus on step-by-step execution, chronological setup instructions, commands, code/tool snippets, and verifiable checkpoints.",
  EXECUTIVE:
    "Focus on strategic takeaways, decision frameworks, ROI/trade-offs, high-level action plans, and concise briefing bullets.",
};

export interface GenerateActionKitParams {
  title: string;
  channelName?: string | null;
  sourceUrl: string;
  mode: KitMode;
  transcriptOrContent?: string;
}

/**
 * Generates a strictly schema-validated Action Kit via OpenRouter and Vercel AI SDK.
 */
export async function generateActionKitFromSource({
  title,
  channelName,
  sourceUrl,
  mode,
  transcriptOrContent,
}: GenerateActionKitParams): Promise<ActionKit> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Add it to your environment variables."
    );
  }

  const contextSection = transcriptOrContent?.trim()
    ? `Source Transcript / Notes:\n${transcriptOrContent.slice(0, 24000)}`
    : `No raw transcript was provided. Infer a structured, high-signal action kit from the source title, creator, and URL while avoiding fabricated private specifics.`;

  const result = await generateText({
    model: openrouter.chat(DEFAULT_MODEL),
    output: Output.object({
      schema: ActionKitSchema,
      name: "claros_action_kit",
      description:
        "Structured Claros Action Kit containing executive summary, mind map, action checklist items, flashcards, and quiz questions.",
    }),
    system: [
      "You are Claros, an expert AI learning and execution architect.",
      "Transform videos, lectures, and documents into crisp, structured Action Kits.",
      `Mode directive (${mode}): ${MODE_INSTRUCTIONS[mode]}`,
      "Ensure orderIndex starts at 0 and increments sequentially for actionItems, flashcards, and quizQuestions.",
      "Ensure every QuizQuestion has exactly 4 distinct options and a valid correctIndex between 0 and 3.",
      "Ensure timestampSeconds are realistic non-negative integer offsets.",
    ].join(" "),
    prompt: [
      `Target Mode: ${mode}`,
      `Source Title: ${title}`,
      `Creator / Channel: ${channelName ?? "Unknown"}`,
      `Source URL: ${sourceUrl}`,
      "",
      contextSection,
      "",
      "Generate a complete Action Kit with:",
      "- 5 to 8 actionable checklist steps (include codeOrToolSnippet whenever a command, shortcut, formula, or prompt is helpful, otherwise null)",
      "- 5 to 8 high-retention flashcards",
      "- 4 to 6 multiple-choice quiz questions with clear explanations",
      "- A cohesive summaryJson including tldr, keyTakeaways, prerequisites, toolsAndResources, and a structured mindMap tree.",
    ].join("\n"),
  });

  return ActionKitSchema.parse(result.output);
}
