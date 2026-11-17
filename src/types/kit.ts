import { z } from "zod";

export const PlanSchema = z.enum(["FREE", "PRO"]);
export type Plan = z.infer<typeof PlanSchema>;

export const SourceTypeSchema = z.enum(["YOUTUBE", "PDF", "AUDIO"]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const KitModeSchema = z.enum(["STUDY", "TUTORIAL", "EXECUTIVE"]);
export type KitMode = z.infer<typeof KitModeSchema>;

export interface MindMapNode {
  id: string;
  label: string;
  details?: string;
  children?: MindMapNode[];
}

export const MindMapLeafNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  details: z.string().optional(),
});

export const MindMapBranchNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  details: z.string().optional(),
  children: z.array(MindMapLeafNodeSchema).default([]),
});

export const MindMapRootNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  details: z.string().optional(),
  children: z.array(MindMapBranchNodeSchema).min(1),
});

export const ToolResourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().optional(),
  category: z.string().optional(),
});
export type ToolResource = z.infer<typeof ToolResourceSchema>;

export const KitSummarySchema = z.object({
  tldr: z.string().min(1),
  keyTakeaways: z.array(z.string().min(1)).min(1),
  prerequisites: z.array(z.string().min(1)).default([]),
  toolsAndResources: z.array(ToolResourceSchema).default([]),
  mindMap: MindMapRootNodeSchema,
});
export type KitSummary = z.infer<typeof KitSummarySchema>;

export const ActionItemSchema = z.object({
  id: z.string().optional(),
  orderIndex: z.number().int().nonnegative(),
  timestampSeconds: z.number().int().nonnegative(),
  title: z.string().min(1),
  description: z.string().min(1),
  codeOrToolSnippet: z.string().nullable().optional(),
  isCompleted: z.boolean().default(false),
});
export type ActionItemInput = z.infer<typeof ActionItemSchema>;

export const FlashcardSchema = z.object({
  id: z.string().optional(),
  orderIndex: z.number().int().nonnegative(),
  front: z.string().min(1),
  back: z.string().min(1),
  mastered: z.boolean().default(false),
});
export type FlashcardInput = z.infer<typeof FlashcardSchema>;

export const QuizQuestionSchema = z.object({
  id: z.string().optional(),
  orderIndex: z.number().int().nonnegative(),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
});
export type QuizQuestionInput = z.infer<typeof QuizQuestionSchema>;

/**
 * Primary Zod schema validated against AI structured generation output
 * and mapped directly to Prisma Kit + child models.
 */
export const ActionKitSchema = z.object({
  title: z.string().min(3),
  mode: KitModeSchema,
  summaryJson: KitSummarySchema,
  actionItems: z.array(ActionItemSchema).min(1),
  flashcards: z.array(FlashcardSchema).min(1),
  quizQuestions: z.array(QuizQuestionSchema).min(1),
});
export type ActionKit = z.infer<typeof ActionKitSchema>;

export const GenerateKitRequestSchema = z.object({
  sourceType: SourceTypeSchema.default("YOUTUBE"),
  sourceUrl: z.string().url("Please provide a valid URL."),
  mode: KitModeSchema.default("TUTORIAL"),
  isPublic: z.boolean().default(false),
  transcriptOrNotes: z.string().optional(),
});
export type GenerateKitRequest = z.infer<typeof GenerateKitRequestSchema>;

export interface FullKitData {
  id: string;
  slug: string;
  userId: string | null;
  sourceType: SourceType;
  sourceUrl: string;
  videoId: string | null;
  title: string;
  channelName: string | null;
  durationSeconds: number | null;
  mode: KitMode;
  summaryJson: KitSummary;
  isPublic: boolean;
  createdAt: string;
  actionItems: Array<Required<Pick<ActionItemInput, "id">> & ActionItemInput>;
  flashcards: Array<Required<Pick<FlashcardInput, "id">> & FlashcardInput>;
  quizQuestions: Array<Required<Pick<QuizQuestionInput, "id">> & QuizQuestionInput>;
}
