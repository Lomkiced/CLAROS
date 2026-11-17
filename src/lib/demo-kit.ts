import type { FullKitData } from "@/types/kit";

export const DEMO_KITS: FullKitData[] = [
  {
    id: "demo-kit-nextjs-saas",
    slug: "demo-nextjs-saas-architecture",
    userId: null,
    sourceType: "YOUTUBE",
    sourceUrl: "https://www.youtube.com/watch?v=dCLhUialKPQ",
    videoId: "dCLhUialKPQ",
    title: "Production Next.js App Router Architecture & AI SaaS Blueprint",
    channelName: "Claros Featured",
    durationSeconds: 1840,
    mode: "TUTORIAL",
    isPublic: true,
    createdAt: "2026-11-15T10:00:00.000Z",
    summaryJson: {
      tldr: "Design a resilient Next.js App Router SaaS stack by combining strict Zod contracts for AI structured outputs, pooled Prisma + Supabase PostgreSQL connections, and split-screen interactive execution workspaces.",
      keyTakeaways: [
        "Separate Marketing, Authenticated Dashboard, and Public Kit Viewer into clean App Router route groups.",
        "Use a singleton Prisma client with Supabase transaction pooler URLs (port 6543) to prevent connection exhaustion.",
        "Validate every LLM response through Zod schemas before persisting Action Items, Flashcards, and Quizzes.",
        "Verify Lemon Squeezy webhook signatures using timing-safe HMAC-SHA256 digests before mutating user plans.",
      ],
      prerequisites: [
        "Node.js 20.9+ and npm",
        "Supabase project with PostgreSQL database",
        "OpenRouter API key for multi-model AI generation",
      ],
      toolsAndResources: [
        { name: "Next.js App Router", category: "Framework", url: "https://nextjs.org/docs" },
        { name: "Prisma ORM", category: "Database", url: "https://www.prisma.io/docs" },
        { name: "Vercel AI SDK", category: "AI", url: "https://ai-sdk.dev" },
        { name: "Supabase SSR", category: "Auth", url: "https://supabase.com/docs" },
      ],
      mindMap: {
        id: "root",
        label: "Claros SaaS Architecture",
        details: "End-to-end pipeline from video URL to interactive workspace",
        children: [
          {
            id: "ingestion",
            label: "1. Source Ingestion",
            details: "Normalize YouTube, PDF, and Audio inputs",
            children: [
              { id: "yt-id", label: "Extract Video ID & oEmbed Metadata" },
              { id: "mode-select", label: "Select Mode: Study, Tutorial, Executive" },
            ],
          },
          {
            id: "ai-pipeline",
            label: "2. AI Structuring",
            details: "Deterministic schema enforcement via Zod",
            children: [
              { id: "openrouter", label: "OpenRouter + Vercel AI SDK Output.object" },
              { id: "zod-check", label: "ActionKitSchema Validation" },
            ],
          },
          {
            id: "persistence",
            label: "3. Data & Billing",
            details: "PostgreSQL relational persistence & SaaS plans",
            children: [
              { id: "prisma-db", label: "Kit -> ActionItem / Flashcard / QuizQuestion" },
              { id: "lemonsqueezy", label: "HMAC-verified Webhook Plan Sync" },
            ],
          },
        ],
      },
    },
    actionItems: [
      {
        id: "act-1",
        orderIndex: 0,
        timestampSeconds: 95,
        title: "Configure Supabase pooled & direct connection URLs",
        description:
          "Use port 6543 with ?pgbouncer=true for DATABASE_URL at runtime and port 5432 for DIRECT_URL migrations.",
        codeOrToolSnippet:
          'DATABASE_URL="postgresql://postgres.[REF]:[PW]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"',
        isCompleted: true,
      },
      {
        id: "act-2",
        orderIndex: 1,
        timestampSeconds: 340,
        title: "Define the ActionKit Zod contract",
        description:
          "Mirror Prisma models in src/types/kit.ts so AI structured generation maps 1:1 to database tables.",
        codeOrToolSnippet:
          "const result = await generateText({ model, output: Output.object({ schema: ActionKitSchema }) });",
        isCompleted: true,
      },
      {
        id: "act-3",
        orderIndex: 2,
        timestampSeconds: 685,
        title: "Implement Next.js global Prisma singleton",
        description:
          "Cache the PrismaClient instance on globalThis during development to avoid exhausting pool connections across hot reloads.",
        codeOrToolSnippet: "npx prisma generate && npx prisma db push",
        isCompleted: false,
      },
      {
        id: "act-4",
        orderIndex: 3,
        timestampSeconds: 1120,
        title: "Secure Lemon Squeezy billing webhooks",
        description:
          "Validate the X-Signature header against the raw request body using crypto.timingSafeEqual before upgrading profiles to PRO.",
        codeOrToolSnippet:
          'const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");',
        isCompleted: false,
      },
      {
        id: "act-5",
        orderIndex: 4,
        timestampSeconds: 1490,
        title: "Build the split-screen Action Kit workspace",
        description:
          "Pair the embedded video player on the left with interactive checklist timestamps, flashcard decks, and active recall quizzes on the right.",
        codeOrToolSnippet: null,
        isCompleted: false,
      },
    ],
    flashcards: [
      {
        id: "fc-1",
        orderIndex: 0,
        front: "Why does Supabase + Prisma require both DATABASE_URL and DIRECT_URL?",
        back: "DATABASE_URL routes runtime queries through Supavisor/PgBouncer transaction pooling (port 6543), while DIRECT_URL bypasses the pooler (port 5432) for schema migrations.",
        mastered: true,
      },
      {
        id: "fc-2",
        orderIndex: 1,
        front: "How do you prevent PrismaClient connection leaks during Next.js dev HMR?",
        back: "Store the PrismaClient instance on globalThis when NODE_ENV !== 'production' so hot reloads reuse a single client.",
        mastered: false,
      },
      {
        id: "fc-3",
        orderIndex: 2,
        front: "What makes ActionKitSchema essential in an AI SaaS?",
        back: "It enforces deterministic JSON shapes at both compile time (TypeScript) and runtime (Zod) before persisting nested ActionItem, Flashcard, and QuizQuestion records.",
        mastered: false,
      },
      {
        id: "fc-4",
        orderIndex: 3,
        front: "How should webhook signatures from Lemon Squeezy be verified?",
        back: "Compute an HMAC-SHA256 hex digest of the raw text body with LEMONSQUEEZY_WEBHOOK_SECRET and compare it using crypto.timingSafeEqual.",
        mastered: false,
      },
    ],
    quizQuestions: [
      {
        id: "qq-1",
        orderIndex: 0,
        question:
          "Why is Kit.userId nullable in the Claros Prisma schema?",
        options: [
          "To allow anonymous guest Action Kit generation on the landing page before sign-up",
          "Because PostgreSQL does not support foreign keys to UUID columns",
          "To disable authentication across the dashboard",
          "Because Lemon Squeezy requires guest user records",
        ],
        correctIndex: 0,
        explanation:
          "Making Kit.userId nullable enables zero-friction instant generation for homepage visitors, who can later sign up and claim or save their kits.",
      },
      {
        id: "qq-2",
        orderIndex: 1,
        question:
          "Which function guarantees constant-time comparison when verifying webhook HMAC signatures?",
        options: [
          "JSON.stringify equality check",
          "crypto.timingSafeEqual",
          "Array.prototype.every",
          "Buffer.toString",
        ],
        correctIndex: 1,
        explanation:
          "crypto.timingSafeEqual prevents timing side-channel attacks when comparing cryptographic HMAC digests.",
      },
      {
        id: "qq-3",
        orderIndex: 2,
        question:
          "What happens in Prisma when a parent Kit is deleted if child models declare onDelete: Cascade?",
        options: [
          "Child ActionItem, Flashcard, and QuizQuestion rows are automatically deleted",
          "Child rows remain orphaned in PostgreSQL",
          "Prisma throws a foreign key violation error",
          "Only Flashcard rows are deleted",
        ],
        correctIndex: 0,
        explanation:
          "onDelete: Cascade ensures PostgreSQL automatically cleans up all dependent checklist items, flashcards, and quiz questions when a Kit is deleted.",
      },
    ],
  },
  {
    id: "demo-kit-systems-design",
    slug: "distributed-caching-deep-dive",
    userId: null,
    sourceType: "YOUTUBE",
    sourceUrl: "https://www.youtube.com/watch?v=U3RkDLtS7uY",
    videoId: "U3RkDLtS7uY",
    title: "Distributed Caching Patterns & Cache Invalidation Strategies",
    channelName: "Systems Engineering Lab",
    durationSeconds: 1420,
    mode: "STUDY",
    isPublic: true,
    createdAt: "2026-11-12T15:30:00.000Z",
    summaryJson: {
      tldr: "Master cache-aside, write-through, and write-behind patterns alongside stampede mitigation using request coalescing and jittered TTLs.",
      keyTakeaways: [
        "Cache-aside keeps application logic explicit and avoids caching rarely-read records.",
        "Always add randomized jitter to TTLs to prevent synchronized cache expiration storms.",
        "Use singleflight / request coalescing for hot keys under high concurrency.",
      ],
      prerequisites: ["HTTP caching fundamentals", "Basic Redis or key-value store familiarity"],
      toolsAndResources: [
        { name: "Redis", category: "Cache", url: "https://redis.io/docs" },
      ],
      mindMap: {
        id: "cache-root",
        label: "Distributed Caching",
        children: [
          {
            id: "patterns",
            label: "Read / Write Patterns",
            children: [
              { id: "cache-aside", label: "Cache-Aside (Lazy Loading)" },
              { id: "write-through", label: "Write-Through Consistency" },
            ],
          },
          {
            id: "resilience",
            label: "Failure Protection",
            children: [
              { id: "jitter", label: "TTL Jitter" },
              { id: "singleflight", label: "Request Coalescing" },
            ],
          },
        ],
      },
    },
    actionItems: [
      {
        id: "sd-act-1",
        orderIndex: 0,
        timestampSeconds: 180,
        title: "Audit read/write ratio before adding Redis",
        description: "Measure p95 database latency and identify read-heavy endpoints exceeding 80% read share.",
        codeOrToolSnippet: null,
        isCompleted: false,
      },
      {
        id: "sd-act-2",
        orderIndex: 1,
        timestampSeconds: 510,
        title: "Add 10-20% jitter to cache TTLs",
        description: "Randomize key expiration windows so thousands of keys never expire simultaneously.",
        codeOrToolSnippet: "const ttl = baseSeconds + Math.floor(Math.random() * 60);",
        isCompleted: false,
      },
    ],
    flashcards: [
      {
        id: "sd-fc-1",
        orderIndex: 0,
        front: "What is a cache stampede (thundering herd)?",
        back: "A spike in database load when a popular cached key expires and many concurrent requests simultaneously miss the cache and recompute the value.",
        mastered: false,
      },
    ],
    quizQuestions: [
      {
        id: "sd-qq-1",
        orderIndex: 0,
        question: "Which technique prevents multiple concurrent requests from recomputing the exact same expired cache key?",
        options: [
          "Request coalescing (singleflight)",
          "Disabling TTLs completely",
          "Increasing SQL connection timeouts",
          "Switching from JSON to XML",
        ],
        correctIndex: 0,
        explanation: "Request coalescing deduplicates concurrent in-flight misses for the same key so only one upstream fetch executes.",
      },
    ],
  },
  {
    id: "demo-kit-executive-ai",
    slug: "ai-product-strategy-2026",
    userId: null,
    sourceType: "YOUTUBE",
    sourceUrl: "https://www.youtube.com/watch?v=5p248yoa3oE",
    videoId: "5p248yoa3oE",
    title: "AI Product Moats, Eval Loops & Unit Economics",
    channelName: "Founder Briefing",
    durationSeconds: 980,
    mode: "EXECUTIVE",
    isPublic: true,
    createdAt: "2026-11-10T09:15:00.000Z",
    summaryJson: {
      tldr: "Durable AI SaaS moats come from proprietary workflow state, deterministic eval pipelines, and margin-aware model routing rather than raw prompt wrappers.",
      keyTakeaways: [
        "Route structured extraction tasks to fast, low-cost models while reserving frontier models for complex synthesis.",
        "Track gross margin per generated artifact alongside user retention.",
      ],
      prerequisites: ["SaaS pricing fundamentals"],
      toolsAndResources: [
        { name: "OpenRouter", category: "Model Routing", url: "https://openrouter.ai" },
      ],
      mindMap: {
        id: "exec-root",
        label: "AI SaaS Moats",
        children: [
          {
            id: "economics",
            label: "Unit Economics",
            children: [
              { id: "routing", label: "Tiered Model Routing" },
              { id: "credits", label: "Weekly Credit Guardrails" },
            ],
          },
        ],
      },
    },
    actionItems: [
      {
        id: "ex-act-1",
        orderIndex: 0,
        timestampSeconds: 120,
        title: "Instrument cost-per-kit telemetry",
        description: "Log prompt + completion tokens per Action Kit to validate FREE vs PRO unit economics.",
        codeOrToolSnippet: null,
        isCompleted: false,
      },
    ],
    flashcards: [
      {
        id: "ex-fc-1",
        orderIndex: 0,
        front: "Why pair weekly credits with a PRO subscription tier?",
        back: "Weekly caps let free visitors experience immediate value while bounding token exposure and creating a natural upgrade trigger for power learners.",
        mastered: false,
      },
    ],
    quizQuestions: [
      {
        id: "ex-qq-1",
        orderIndex: 0,
        question: "What creates the strongest defensibility for an AI workspace SaaS?",
        options: [
          "Persistent structured user artifacts and closed-loop workflows",
          "Hiding the system prompt",
          "Using only the most expensive model for every request",
          "Removing user authentication",
        ],
        correctIndex: 0,
        explanation: "Workflow lock-in, accumulated structured knowledge (kits, mastered flashcards, progress), and eval-driven reliability create real switching costs.",
      },
    ],
  },
];

export function getDemoKitBySlug(slug: string): FullKitData | undefined {
  return DEMO_KITS.find((kit) => kit.slug === slug);
}
