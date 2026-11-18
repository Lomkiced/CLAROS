"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

const ERROR_MESSAGES: Record<string, string> = {
  missing_code:
    "Your sign-in link expired or was invalid. Please sign in or request a new link below.",
  auth_callback_failed:
    "Your sign-in link expired or was invalid. Please sign in or request a new link below.",
  access_denied: "Sign-in was cancelled or denied. Please try again below.",
};

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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fullNameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectingGoogle, setIsRedirectingGoogle] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const next = searchParams.get("next");
  const safeNext = sanitizeNextPath(next);
  const claimSlug = searchParams.get("claimSlug")?.trim() || null;
  const urlErrorCode = searchParams.get("error");
  const urlErrorDescription = searchParams.get("error_description");

  const urlErrorMessage = urlErrorCode
    ? ERROR_MESSAGES[urlErrorCode] ??
      urlErrorDescription ??
      "Authentication could not be completed. Please try again."
    : null;

  const displayedError = formError ?? urlErrorMessage;

  const buildCallbackUrl = () => {
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (safeNext) {
      callbackUrl.searchParams.set("next", safeNext);
    }
    if (claimSlug) {
      callbackUrl.searchParams.set("claimSlug", claimSlug);
    }
    return callbackUrl.toString();
  };

  const reportError = (message: string) => {
    setNoticeMessage(null);
    setFormError(message);
    toast.error(message);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFormError(null);
    setNoticeMessage(null);
  };

  const syncProfileAndNavigate = async (optionalFullName?: string) => {
    let syncRedirect: string | null = null;

    try {
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(optionalFullName ? { fullName: optionalFullName } : {}),
          ...(claimSlug ? { claimSlug } : {}),
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as {
          redirectTo?: string | null;
        };
        syncRedirect = payload.redirectTo ?? null;
      }
    } catch {
      // Proceed with fallback route if sync fails transiently
    }

    const destination =
      syncRedirect ??
      safeNext ??
      (claimSlug ? `/kit/${claimSlug}` : "/dashboard");

    router.refresh();
    router.push(destination);
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setNoticeMessage(null);

    if (!isSupabaseConfigured()) {
      reportError(
        "Supabase Auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to your environment."
      );
      return;
    }

    setIsRedirectingGoogle(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: buildCallbackUrl(),
        },
      });
      if (error) {
        reportError(error.message);
        setIsRedirectingGoogle(false);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not start Google sign-in. Please try again.";
      reportError(message);
      setIsRedirectingGoogle(false);
    }
  };

  const handleForgotPassword = async () => {
    setFormError(null);
    setNoticeMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      reportError("Enter your email address above first to reset your password.");
      return;
    }

    if (!isSupabaseConfigured()) {
      reportError(
        "Supabase Auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to your environment."
      );
      return;
    }

    setIsSendingReset(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      });

      if (error) {
        reportError(error.message);
        return;
      }

      const confirmation = `Password reset instructions sent to ${trimmedEmail}.`;
      setNoticeMessage(confirmation);
      toast.success(confirmation);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not send password reset email. Please try again.";
      reportError(message);
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setNoticeMessage(null);

    const trimmedEmail = email.trim();
    const trimmedFullName = fullName.trim();

    if (!trimmedEmail) {
      reportError("Enter your email address.");
      return;
    }

    if (password.length < 6) {
      reportError("Password must be at least 6 characters.");
      return;
    }

    if (!isSupabaseConfigured()) {
      reportError(
        "Supabase Auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to your environment."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          reportError(error.message);
          return;
        }

        await syncProfileAndNavigate();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: buildCallbackUrl(),
          data: {
            full_name: trimmedFullName || undefined,
          },
        },
      });

      if (error) {
        reportError(error.message);
        return;
      }

      if (data.session) {
        await syncProfileAndNavigate(trimmedFullName || undefined);
        return;
      }

      setNoticeMessage(
        `Check ${trimmedEmail} to confirm your email address before signing in.`
      );
      toast.success("Account created. Confirm your email to continue.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again.";
      reportError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isRedirectingGoogle || isSendingReset;

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 sm:p-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {claimSlug
            ? "Save your action kit"
            : mode === "signin"
              ? "Sign in to Claros"
              : "Create your Claros account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {claimSlug
            ? "Sign in or create an account to save this action kit to your dashboard."
            : "Continue with Google or use your email and password."}
        </p>
      </div>

      {displayedError ? (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-border bg-secondary p-3 text-sm text-destructive"
        >
          {displayedError}
        </div>
      ) : null}

      {noticeMessage ? (
        <div
          role="status"
          className="mt-5 rounded-lg border border-border bg-secondary p-3 text-sm text-foreground"
        >
          {noticeMessage}
        </div>
      ) : null}

      <div className="mt-6 space-y-5">
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={handleGoogleSignIn}
          className="h-10 w-full text-sm font-medium"
        >
          {isRedirectingGoogle
            ? "Redirecting to Google..."
            : "Continue with Google"}
        </Button>

        <div className="relative flex items-center">
          <div className="flex-1 border-t border-border" />
          <span className="px-3 text-xs text-muted-foreground">
            or continue with email
          </span>
          <div className="flex-1 border-t border-border" />
        </div>

        <div
          role="tablist"
          aria-label="Authentication mode"
          className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-secondary p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            disabled={isBusy}
            onClick={() => switchMode("signin")}
            className={cn(
              "h-8 cursor-pointer rounded-md text-sm font-medium transition-colors",
              mode === "signin"
                ? "border border-border bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            disabled={isBusy}
            onClick={() => switchMode("signup")}
            className={cn(
              "h-8 cursor-pointer rounded-md text-sm font-medium transition-colors",
              mode === "signup"
                ? "border border-border bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {mode === "signup" ? (
            <div className="space-y-1.5">
              <label
                htmlFor={fullNameId}
                className="block text-sm font-medium text-foreground"
              >
                Full Name
              </label>
              <Input
                id={fullNameId}
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Alex Rivera"
                disabled={isBusy}
                className="h-10"
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label
              htmlFor={emailId}
              className="block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <Input
              id={emailId}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              disabled={isBusy}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={passwordId}
              className="block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id={passwordId}
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 characters"
                disabled={isBusy}
                className="h-10 pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isBusy}
                className="absolute inset-y-0 right-0 cursor-pointer px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {mode === "signin" ? (
            <div className="flex justify-end">
              <button
                type="button"
                disabled={isBusy}
                onClick={handleForgotPassword}
                className="cursor-pointer text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                {isSendingReset ? "Sending reset link..." : "Forgot password?"}
              </button>
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isBusy}
            className="h-10 w-full text-sm font-medium"
          >
            {isSubmitting
              ? mode === "signin"
                ? "Signing in..."
                : "Creating account..."
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
