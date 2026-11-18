import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { syncUserProfileAndClaimKit } from "@/lib/profile";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function sanitizeNextPath(rawNext: string | null): string | null {
  if (!rawNext) {
    return null;
  }
  const trimmed = rawNext.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }
  return trimmed;
}

function redirectToLoginError(origin: string) {
  return NextResponse.redirect(
    new URL("/login?error=auth_callback_failed", origin)
  );
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const rawNext = searchParams.get("next");
  const claimSlug = searchParams.get("claimSlug")?.trim() || null;

  if (!isSupabaseConfigured()) {
    return redirectToLoginError(origin);
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return redirectToLoginError(origin);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    if (error) {
      return redirectToLoginError(origin);
    }
  } else {
    return redirectToLoginError(origin);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirectToLoginError(origin);
  }

  let claimedSlug: string | null = null;

  try {
    const syncResult = await syncUserProfileAndClaimKit({
      user,
      claimSlug,
    });
    claimedSlug = syncResult.claimedSlug;
  } catch (err) {
    console.error("[/auth/callback] Profile or kit claim sync failed:", err);
  }

  const safeNext = claimedSlug
    ? `/kit/${claimedSlug}`
    : sanitizeNextPath(rawNext) ?? "/dashboard";

  return NextResponse.redirect(new URL(safeNext, origin));
}
