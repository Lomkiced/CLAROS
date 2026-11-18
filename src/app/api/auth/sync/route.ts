import { NextResponse } from "next/server";
import { z } from "zod";
import { syncUserProfileAndClaimKit } from "@/lib/profile";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const SyncAuthBodySchema = z
  .object({
    fullName: z.string().trim().max(120).optional(),
    claimSlug: z.string().trim().max(160).nullable().optional(),
  })
  .optional();

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase Auth is not configured." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  let rawBody: unknown = undefined;
  const contentLength = request.headers.get("content-length");
  if (contentLength !== "0") {
    try {
      const text = await request.text();
      if (text.trim().length > 0) {
        rawBody = JSON.parse(text);
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload." },
        { status: 400 }
      );
    }
  }

  const parsed = SyncAuthBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid sync parameters." },
      { status: 400 }
    );
  }

  const fullName = parsed.data?.fullName;
  const claimSlug = parsed.data?.claimSlug ?? undefined;

  try {
    const { claimedSlug } = await syncUserProfileAndClaimKit({
      user,
      fullName,
      claimSlug,
    });

    const redirectSlug = claimedSlug ?? (claimSlug || null);

    return NextResponse.json(
      {
        ok: true,
        redirectTo: redirectSlug ? `/kit/${redirectSlug}` : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/auth/sync] Sync failed:", error);
    return NextResponse.json(
      { error: "Failed to synchronize profile." },
      { status: 500 }
    );
  }
}
