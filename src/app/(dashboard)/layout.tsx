import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/workspace/user-menu";
import { getProfileForUser } from "@/lib/profile";
import { getOptionalUser } from "@/lib/supabase/server";

async function DashboardUserNav() {
  const user = await getOptionalUser();
  if (!user) {
    return (
      <Link
        href="/login?next=/dashboard"
        className="text-sm font-medium text-foreground underline underline-offset-4"
      >
        Sign In
      </Link>
    );
  }

  const profile = await getProfileForUser(user.id);
  const plan = profile?.plan ?? "FREE";

  return <UserMenu email={user.email ?? null} plan={plan} />;
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-base font-semibold tracking-tight text-foreground"
            >
              Claros
            </Link>

            <nav
              aria-label="Workspace navigation"
              className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex"
            >
              <Link
                href="/dashboard"
                className="font-medium text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/kits"
                className="transition-colors hover:text-foreground"
              >
                Public kits
              </Link>
              <Link
                href="/pricing"
                className="transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
            </nav>
          </div>

          <Suspense fallback={<Skeleton className="h-8 w-36 rounded-lg" />}>
            <DashboardUserNav />
          </Suspense>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
