import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/workspace/user-menu";
import { getProfileForUser } from "@/lib/profile";
import { getOptionalUser } from "@/lib/supabase/server";

const NAV_LINKS = [
  { href: "/kits", label: "Public kits" },
  { href: "/pricing", label: "Pricing" },
] as const;

async function NavbarAuthControls() {
  const user = await getOptionalUser();

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
        >
          Sign In
        </Link>
        <Button
          size="sm"
          className="whitespace-nowrap"
          render={<Link href="/login?next=/dashboard" />}
          nativeButton={false}
        >
          Start Free
        </Button>
      </div>
    );
  }

  const profile = await getProfileForUser(user.id);
  const plan = profile?.plan ?? "FREE";

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
      >
        Dashboard
      </Link>
      <UserMenu email={user.email ?? null} plan={plan} />
    </div>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            Claros
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-5 text-sm sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Suspense fallback={<Skeleton className="h-8 w-36 rounded-lg" />}>
          <NavbarAuthControls />
        </Suspense>
      </div>
    </header>
  );
}
