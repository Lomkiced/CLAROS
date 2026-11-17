import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { Layers3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/workspace/user-menu";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/supabase/server";

async function DashboardUserNav() {
  const user = await getOptionalUser();
  let plan: "FREE" | "PRO" = "FREE";

  if (user && process.env.DATABASE_URL) {
    try {
      const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { plan: true },
      });
      if (profile?.plan === "PRO") {
        plan = "PRO";
      }
    } catch {
      plan = "FREE";
    }
  }

  return <UserMenu email={user?.email ?? null} plan={plan} />;
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Layers3 className="size-4" />
              </span>
              <span>Claros</span>
            </Link>

            <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
              <Link
                href="/dashboard"
                className="font-medium text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/kits"
                className="hover:text-foreground transition-colors"
              >
                Public Kits
              </Link>
              <Link
                href="/pricing"
                className="hover:text-foreground transition-colors"
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
